// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class CartPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      // Demoblaze cart table rows
      cartRows: '#tbodyid > tr',
      deleteLinksXPath: `//*[@id="tbodyid"]/tr/td[4]/a`,
      homeLink: '#nava',
      cartItemByName: (productName) => `//*[@id="tbodyid"]//tr[.//td[contains(text(), "${productName}")]]`,
      removeButtonByProductName: (productName) => `//*[@id="tbodyid"]//tr[.//td[contains(text(), "${productName}")]]//a[contains(text(), 'Delete')]`,
      quantityByProductName: (productName) => `//*[@id="tbodyid"]//tr[.//td[contains(text(), "${productName}")]]//td[3]`,
      priceByProductName: (productName) => `//*[@id="tbodyid"]//tr[.//td[contains(text(), "${productName}")]]//td[3]`,
      checkoutButton: `//button[contains(., 'Place Order')]`,
      continueShoppingButton: `//a[contains(., 'Continue Shopping')]`
    };
  }

  // Get quantity of a specific product in cart
  async getProductQuantityInCart(productName) {
    const isInCart = await this.isProductInCart(productName);
    return isInCart ? 1 : 0;
  }



  async getProductPriceInCart(productName) {
    const selector = this.selectors.priceByProductName(productName);
    const text = await this.getText(selector);
    return (text || '').trim();
  }

  // Check if product exists in cart
  async isProductInCart(productName) {
    const trimmed = (productName || '').trim();
    // Try multiple strategies to find the product
    
    // Strategy 1: Exact match with normalized spaces
    let selector = this.selectors.cartItemByName(trimmed);
    let isVisible = await this.isElementVisible(selector).catch(() => false);
    
    if (!isVisible) {
      // Strategy 2: Case-insensitive substring match using XPath
      selector = `//*[@id="tbodyid"]//tr[.//td[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmed.toLowerCase()}')]]`;
      isVisible = await this.isElementVisible(selector).catch(() => false);
    }
    
    if (!isVisible) {
      // Strategy 3: Check all cart rows and search in text
      const rows = this.page.locator(this.selectors.cartRows);
      const count = await rows.count();
      for (let i = 0; i < count; i++) {
        const text = await rows.nth(i).textContent();
        if (text && text.toLowerCase().includes(trimmed.toLowerCase())) {
          return true;
        }
      }
    }
    
    return isVisible;
  }



  // Check if remove button is visible for a specific product
  async isRemoveButtonVisible(productName) {
    const selector = this.selectors.removeButtonByProductName(productName);
    return await this.isElementVisible(selector);
  }


  // Check if checkout button is visible
  async isCheckoutButtonVisible() {
    return await this.isElementVisible(this.selectors.checkoutButton);
  }

  // Get checkout button text
  async getCheckoutButtonText() {
    return await this.getText(this.selectors.checkoutButton);
  }

  // Check if continue shopping button is enabled
  async isContinueShoppingButtonEnabled() {
    return await this.isElementEnabled(this.selectors.continueShoppingButton);
  }

  // Check if continue shopping button is visible
  async isContinueShoppingButtonVisible() {
    return await this.isElementVisible(this.selectors.continueShoppingButton);
  }

  // Get continue shopping button text
  async getContinueShoppingButtonText() {
    return await this.getText(this.selectors.continueShoppingButton);
  }

  // Get number of items listed in Demoblaze cart table
  async getCartItemsCount() {
    let count = 0;
    try {
      await this.page.waitForSelector(this.selectors.cartRows, { timeout: 3000 });
      count = await this.getElementCount(this.selectors.cartRows);
    } catch (e) {
      count = 0;
    }
    console.log(`[Cart] Items in cart: ${count}`);
    return count;
  }

  // Remove product from cart by product name
  async removeProductFromCart(productName) {
    try {
      const trimmed = (productName || '').trim();
      console.log(`[Cart] Removing product: "${trimmed}"`);
      
      // Wait a moment for page to stabilize
      await this.page.waitForTimeout(500);
      
      // Use case-insensitive search for the delete button
      const caseInsensitiveSelector = `//*[@id="tbodyid"]//tr[.//td[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmed.toLowerCase()}')]]//a[contains(text(), 'Delete')]`;
      const deleteButton = this.page.locator(caseInsensitiveSelector);
      
      // Wait for button to be visible
      await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
      
      // Click the delete button
      await deleteButton.click({ force: true });
      
      // Wait for the row to disappear
      try {
        await this.page.waitForSelector(caseInsensitiveSelector, { state: 'hidden', timeout: 3000 });
      } catch (e) {
        // Product might already be removed
        await this.page.waitForTimeout(300);
      }
      
      console.log(`[Cart] Product "${trimmed}" removed successfully`);
    } catch (error) {
      console.log(`[Cart] Error removing product "${productName}":`, error.message);
      throw error;
    }
  }

  async removeAllProductsFromCart() {
    try {
      await this.page.waitForSelector(this.selectors.cartRows, { timeout: 3000 });
    } catch {
      // No items in cart
      return 0;
    }

    // Keep deleting products one by one until cart is empty
    let iterations = 0;
    const maxIterations = 20; // Safety limit
    let hasMoreProducts = true;

    while (hasMoreProducts && iterations < maxIterations) {
      iterations++;
      
      try {
        // Check if there are any delete buttons (products) in cart
        const deleteLinks = this.page.locator(this.selectors.deleteLinksXPath);
        const deleteCount = await deleteLinks.count();
        
        if (deleteCount === 0) {
          hasMoreProducts = false;
          break;
        }
        
        // Click the first delete button
        console.log(`Deleting product ${iterations}, remaining delete buttons: ${deleteCount}`);
        await deleteLinks.first().click();
        
        // Wait for deletion to process
        await this.page.waitForTimeout(1000);
        
        // Wait for DOM to update
        try {
          await this.page.waitForFunction(
            async () => {
              const updated = this.page.locator(this.selectors.deleteLinksXPath);
              const count = await updated.count();
              return count < deleteCount; // Wait until count decreases
            },
            { timeout: 3000 }
          );
        } catch {}
        
        // Additional wait for page stabilization
        await this.page.waitForTimeout(500);
      } catch (e) {
        console.log('Error during deletion:', e);
        hasMoreProducts = false;
      }
    }

    // Verify final state - should have 0 delete buttons/products
    try {
      const finalDeleteLinks = this.page.locator(this.selectors.deleteLinksXPath);
      const finalCount = await finalDeleteLinks.count();
      console.log(`Final cart state: ${finalCount} products remaining`);
      return finalCount;
    } catch {
      return 0;
    }
  }

  // Get total price from cart UI
  async getTotalPrice() {
    try {
      // Demoblaze shows total in a specific location
      // Usually it's in the footer or below the table
      // Try to find text that shows "Total: $XXX"
      const totalText = await this.page.evaluate(() => {
        // Look for total price in various possible locations
        const possibleSelectors = [
          'tfoot tr td:last-child',  // footer row
          '.total',  // class "total"
          '[id*="total"]',  // id containing "total"
          'h3'  // Sometimes shown in h3
        ];
        
        // Search the page for total price pattern
        const bodyText = document.body.innerText;
        const match = bodyText.match(/Total\s*[\:\$]*\s*\$?\s*([\d,]+\.?\d*)/i);
        
        if (match) {
          return match[1];
        }
        
        // Alternative: look for tfoot with price
        const tfoot = document.querySelector('tfoot');
        if (tfoot) {
          const lastCell = tfoot.querySelector('td:last-child');
          if (lastCell) {
            return lastCell.innerText;
          }
        }
        
        return null;
      });
      
      if (totalText) {
        // Parse the price from string
        const priceStr = totalText.toString().replace(/[^\d.]/g, '');
        const price = parseFloat(priceStr);
        console.log(`[Cart] Total price from UI: $${price}`);
        return price;
      }
      
      // Fallback: calculate by summing all prices in cart rows
      console.log(`[Cart] Could not find total price in UI, calculating from rows...`);
      const rows = this.page.locator(this.selectors.cartRows);
      const count = await rows.count();
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        // Price is in the 3rd cell (td[3])
        const priceText = await rows.nth(i).locator('td:nth-child(3)').textContent();
        const price = parseFloat(priceText?.replace(/[^\d.]/g, '') || '0');
        total += price;
      }
      
      console.log(`[Cart] Calculated total from rows: $${total}`);
      return total;
      
    } catch (error) {
      console.log(`[Cart] Error getting total price:`, error.message);
      return 0;
    }
  }

  // Open cart page
  async openCart(timeout = 2000) {
    await this.page.click('#cartur');
    await this.page.waitForTimeout(300);
    const hasProducts = await this.page.waitForSelector('#tbodyid', { timeout }).catch(() => false);
    return hasProducts;
  }

  // Wait for cart table to be visible
  async waitForCartTable(timeout = 5000) {
    await this.page.waitForSelector(this.selectors.cartRows, { timeout });
  }
}

module.exports = CartPage;
