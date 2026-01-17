// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class InventoryPage extends BaseLib {
  constructor(page) {
    super(page);
    this.lastDialogMessage = '';
    // Selectors for Demoblaze Inventory Page
    this.selectors = {
      addToCartLink: `//a[contains(text(),'Add to cart')]`,
      shoppingCartLink: '#cartur',
      categoryLink: (name) => `//a[contains(@class,'list-group-item') and normalize-space(text())='${name}']`,
      nextButton: `//button[contains(text(),'Next')]`
    };
  }

  // Find and click a product, navigating through pages if necessary
  async findAndClickProduct(productName) {
    const trimmedName = (productName || '').trim();
    
    // Create case-insensitive selector
    const productLink = `//a[@class='hrefch' and contains(translate(normalize-space(text()), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${trimmedName.toLowerCase()}')]`;
    
    // Try to find product on current page
    let maxPages = 10; // Prevent infinite loops
    let pageNum = 0;
    
    while (pageNum < maxPages) {
      console.log(`[SEARCH] Looking for "${trimmedName}" on page ${pageNum + 1}...`);
      
      // Wait for product grid to load
      await this.page.waitForSelector('#tbodyid', { timeout: 2000 }).catch(() => {});
      
      // Check if product is visible on current page
      const isVisible = await this.page.isVisible(productLink).catch(() => false);
      
      if (isVisible) {
        console.log(`[SEARCH] Found "${trimmedName}" on page ${pageNum + 1}`);
        await this.page.click(productLink);
        return true;
      }
      
      // Try to go to next page
      const hasNextButton = await this.page.isVisible(this.selectors.nextButton).catch(() => false);
      
      if (!hasNextButton) {
        console.log(`[SEARCH] No more pages. Product "${trimmedName}" not found.`);
        return false;
      }
      
      // Click next button
      await this.page.click(this.selectors.nextButton);
      await this.page.waitForTimeout(500); // Wait for page transition
      pageNum++;
    }
    
    console.log(`[SEARCH] Exceeded max pages (${maxPages}). Product "${trimmedName}" not found.`);
    return false;
  }
  // Add product to cart by product name
  async addProductToCart(productName) {
    try {
      await this.page.waitForSelector('#tbodyid', { timeout: 3000 });
      
      const trimmedName = (productName || '').trim();
      
      // Determine category and switch if needed
      let category = 'Laptops';
      const lower = trimmedName.toLowerCase();
      if (lower.includes('samsung') || lower.includes('nokia')) category = 'Phones';
      else if (lower.includes('monitor')) category = 'Monitors';
      
      try {
        await this.page.click(this.selectors.categoryLink(category), { timeout: 5000 });
        await this.page.waitForSelector('#tbodyid', { timeout: 2000 });
        await this.page.waitForTimeout(300);
      } catch {
        console.log(`[ADD] Category "${category}" not found or already selected`);
      }
      
      // Find and click product (handles pagination)
      let found = await this.findAndClickProduct(trimmedName);
      
      // If not found in category, try Phones and Monitors
      if (!found && category !== 'Phones') {
        console.log(`[ADD] Not found in ${category}, trying Phones...`);
        try {
          await this.page.click(this.selectors.categoryLink('Phones'), { timeout: 5000 });
          await this.page.waitForSelector('#tbodyid', { timeout: 2000 });
          await this.page.waitForTimeout(300);
          found = await this.findAndClickProduct(trimmedName);
        } catch {
          console.log(`[ADD] Phones category not accessible`);
        }
      }
      
      if (!found && category !== 'Monitors') {
        console.log(`[ADD] Still not found, trying Monitors...`);
        try {
          await this.page.click(this.selectors.categoryLink('Monitors'), { timeout: 5000 });
          await this.page.waitForSelector('#tbodyid', { timeout: 2000 });
          await this.page.waitForTimeout(300);
          found = await this.findAndClickProduct(trimmedName);
        } catch {
          console.log(`[ADD] Monitors category not accessible`);
        }
      }
      
      if (!found) {
        throw new Error(`Product "${trimmedName}" not found in any category`);
      }
      
      // Wait for product detail page and add to cart link
      await this.page.waitForSelector(this.selectors.addToCartLink, { timeout: 3000 });
      await this.page.waitForTimeout(300);
      
      // Set up dialog handler before clicking
      this.lastDialogMessage = '';
      let dialogHandled = false;
      
      this.page.once('dialog', async (dialog) => {
        try {
          if (!dialogHandled) {
            dialogHandled = true;
            this.lastDialogMessage = (dialog.message() || '').trim();
            console.log(`[ADD] Dialog received: "${this.lastDialogMessage}"`);
            await dialog.accept();
          }
        } catch (e) {
          console.log('[ADD] Dialog error:', e.message);
        }
      });
      
      // Click add to cart button
      console.log(`[ADD] Clicking "Add to cart" for "${trimmedName}"`);
      await this.page.click(this.selectors.addToCartLink);
      
      // Wait for dialog to be processed
      await this.page.waitForTimeout(800);
      
      // Navigate back to home/product listing
      console.log(`[ADD] Navigating back to home`);
      await this.page.click('#nava');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForSelector('#tbodyid', { timeout: 3000 });
      await this.page.waitForTimeout(500);
      
    } catch (error) {
      console.log(`[ADD] Error adding product ${productName}:`, error.message);
      throw error;
    }
  }

  getLastDialogMessage() {
    return (this.lastDialogMessage || '').trim();
  }

  resetLastDialogMessage() {
    this.lastDialogMessage = '';
  }

  // Get shopping cart badge count (number of items in cart)
  // Demoblaze does not show a cart badge count; this method is not applicable.
  async getCartItemCount() {
    return 0;
  }
  
  // Click shopping cart icon
  async clickShoppingCart() {
    await this.clickElement(this.selectors.shoppingCartLink);
  }

  // Click home/logo button
  async clickHomeButton() {
    await this.page.click(this.selectors.shoppingCartLink.split('#')[0] + '#nava');
  }

  // Wait for product table to load
  async waitForProductTable(timeout = 5000) {
    await this.page.waitForSelector('#tbodyid', { timeout }).catch(() => {});
  }
}

module.exports = InventoryPage;
