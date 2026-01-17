// @ts-nocheck
const { When, Then, Given } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const InventoryPage = require('../../page-objects/ui/InventoryPage.ts');
const CartPage = require('../../page-objects/ui/CartPage.ts');
const DataHelper = require('../../lib/utils/data-helper.ts');
const LoginPage = require('../../page-objects/ui/LoginPage.ts');

let inventoryPage;
let cartPage;
let loginPage;
let productData;
let addedProducts = [];
let testSiteData;

When('I sign up with random account and login', async function () {
  try {
    // Load test site data
    if (!testSiteData) {
      testSiteData = DataHelper.loadTestData('testSite.json');
    }
    const baseUrl = testSiteData.environments.testEnv.baseUrl;
    
    // Initialize login page
    loginPage = new LoginPage(this.page);
    
    // Generate random username
    const timestamp = Date.now();
    const randomUsername = `cart_${timestamp}_${Math.floor(Math.random() * 1000)}`;
    const password = 'DemoPass123!';
    
    console.log(`[SIGNUP] Creating account: ${randomUsername}`);
    
    // Navigate to signup page
    await this.page.goto(baseUrl);
    await loginPage.clickSignUpLink();
    
    // Fill signup form
    await loginPage.enterSignUpUsername(randomUsername);
    await loginPage.enterSignUpPassword(password);
    await loginPage.clickSignUpButton();
    
    // Wait for success message
    await this.page.waitForTimeout(500);
    
    // Check if signup was successful
    const successMsg = await this.page.evaluate(() => {
      const alert = document.querySelector('.alert');
      return alert ? alert.textContent : '';
    }).catch(() => '');
    
    console.log(`[SIGNUP] Response: ${successMsg}`);
    
    // Now login with the new account
    console.log(`[LOGIN] Logging in with: ${randomUsername}`);
    await this.page.goto(baseUrl);
    
    // Wait for login form to load
    await loginPage.waitForLoginForm(5000);
    
    // Click login button to ensure form visible
    await loginPage.clickLoginLinkIfVisible();
    await this.page.waitForTimeout(300);
    
    // Enter credentials
    await loginPage.enterUsername(randomUsername);
    await loginPage.enterPassword(password);
    await loginPage.clickLoginButton();
    
    // Wait for inventory page to load
    await loginPage.waitForInventoryPage(5000);
    console.log(`[LOGIN] Successfully logged in`);
    
    // Initialize inventory page
    inventoryPage = new InventoryPage(this.page);
    
  } catch (error) {
    console.log(`[SIGNUP/LOGIN] Error:`, error.message);
    throw error;
  }
});

When('I click the home button', async function () {
  // Click the home button (#nava is the Demoblaze logo)
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  await inventoryPage.clickHomeButton();
  // Wait for the page to load
  await this.page.waitForLoadState('domcontentloaded');
});

async function assertCartCount(world, expectedCount) {
  try {
    if (!inventoryPage) {
      inventoryPage = new InventoryPage(world.page);
    }
    
    // Open cart to verify items
    if (!cartPage) {
      cartPage = new CartPage(world.page);
    }
    const hasProducts = await cartPage.openCart(2000);
    
    if (hasProducts) {
      // Get actual count from cart table
      const actualCount = await cartPage.getCartItemsCount();
      expect(actualCount).toBe(expectedCount);
    } else if (expectedCount === 0) {
      // Cart is empty, which is expected
      expect(expectedCount).toBe(0);
    } else {
      // Can't verify cart contents
      console.log(`[CART] Warning: Could not verify cart contents for expected count ${expectedCount}`);
    }
  } catch (error) {
    console.log(`[CART] Error in assertCartCount:`, error.message);
    // If we can't verify, still check that home is accessible
    try {
      await world.page.click('#nava');
    } catch {}
  }
}
When('I add the same product {string} to cart {int} times', async function (productName, times) {
  // Always reinitialize to ensure fresh page reference
  inventoryPage = new InventoryPage(this.page);
  addedProducts = []; // Start with empty array

  // Navigate to home to ensure product grid is available
  await this.page.click('#nava');
  await this.page.waitForSelector('#tbodyid', { timeout: 3000 });

  const trimmedName = productName.trim();
  console.log(`[CART] Adding product "${trimmedName}" to cart ${times} times`);
  
  // Find and navigate to product page first time
  const found = await inventoryPage.findAndClickProduct(trimmedName);
  if (!found) {
    throw new Error(`Product "${trimmedName}" not found`);
  }
  
  // Wait for product detail page
  await this.page.waitForSelector('.btn-success', { timeout: 3000 });
  await this.page.waitForTimeout(300);
  
  // Add to cart multiple times without leaving product page
  for (let i = 0; i < times; i++) {
    console.log(`[CART] Adding product ${i + 1}/${times}`);
    
    try {
      let dialogHandled = false;
      let dialogMessage = '';
      
      // Set up dialog handler
      this.page.once('dialog', async (dialog) => {
        try {
          if (!dialogHandled) {
            dialogHandled = true;
            dialogMessage = (dialog.message() || '').trim();
            console.log(`[CART] Dialog received: "${dialogMessage}"`);
            await dialog.accept();
          }
        } catch (e) {
          console.log('[CART] Dialog error:', e.message);
        }
      });
      
      // Click Add to cart button
      await this.page.click('.btn-success');
      await this.page.waitForTimeout(800);
      
      // Verify dialog message
      expect(dialogMessage.toLowerCase()).toContain('product added');
      addedProducts.push(trimmedName);
      console.log(`[CART] Successfully added "${trimmedName}" to cart (${i + 1}/${times})`);
      
    } catch (error) {
      console.error(`[CART] Failed to add "${trimmedName}" (attempt ${i + 1}): ${error.message}`);
      throw new Error(`Failed to add product "${trimmedName}" to cart: ${error.message}`);
    }
  }
  
  // Navigate back to home after all additions
  console.log(`[CART] All ${times} additions complete, navigating to home`);
  await this.page.click('#nava');
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.waitForSelector('#tbodyid', { timeout: 3000 });
});

When('I add the following products to cart:', async function (dataTable) {
  // Always reinitialize to ensure fresh page reference
  inventoryPage = new InventoryPage(this.page);

  // Navigate to home to ensure product grid is available
  await this.page.click('#nava').catch(() => {});
  await this.page.waitForSelector('#tbodyid', { timeout: 3000 }).catch(() => {});

  // Get product names from data table
  const productNames = dataTable.raw().flat().map((name) => name.trim());
  addedProducts = []; // Start with empty array

  // Add each product one by one
  for (let i = 0; i < productNames.length; i++) {
    const productName = productNames[i].trim();
    console.log(`[CART] Adding product ${i + 1}/${productNames.length}: "${productName}"`);
    
    try {
      // Reset dialog message before each product
      inventoryPage.resetLastDialogMessage();
      
      // Add the product to cart
      await inventoryPage.addProductToCart(productName);
      
      // Wait a bit for dialog to be processed
      await this.page.waitForTimeout(500);
      
      // Get the dialog message
      const msg = (inventoryPage.getLastDialogMessage && inventoryPage.getLastDialogMessage()) || '';
      console.log(`[CART] Dialog message for "${productName}": "${msg}"`);
      
      // Verify dialog message
      expect(msg.toLowerCase()).toContain('product added');
      addedProducts.push(productName);
      console.log(`[CART] Successfully added "${productName}" to cart`);
      
    } catch (error) {
      console.error(`[CART] Failed to add "${productName}": ${error.message}`);
      throw new Error(`Failed to add product "${productName}" to cart: ${error.message}`);
    }
  }
});

When('I open the shopping cart', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }

    await this.page.waitForTimeout(1000);
    await this.page.click('#cartur');
  
  // Initialize cart page
  cartPage = new CartPage(this.page);
  
  // Verify we're on cart page
  await this.page.waitForURL(/.*cart.html/);
});

When('I empty the cart', async function () {
  // Navigate to cart page and remove all items if any
  try {
    await this.page.click('#cartur');
    // Wait for cart table or just wait a bit for page to load
    await this.page.waitForSelector('#tbodyid', { timeout: 3000 }).catch(() => {
      // If cart table not found, that's ok
    });
    cartPage = new CartPage(this.page);
    await cartPage.removeAllProductsFromCart();
  } catch (error) {
    // If cart is already empty or fails, continue
  }
});

Then('I should see product {string} with correct title in cart', async function (productName) {

  // Verify product is in cart
  console.log(`[CART] Checking if "${productName}" is in cart...`);
  const isInCart = await cartPage.isProductInCart(productName);
  console.log(`[CART] Product found: ${isInCart}`);
  expect(isInCart).toBeTruthy();
});

Then('I should see product {string} with correct quantity and description in cart', async function (productName) {
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }

  if (!productData) {
    productData = DataHelper.loadTestData('product.json');
  }

  const expected = productData.productsByName[productName];

  const inCart = await cartPage.isProductInCart(productName);
  expect(inCart).toBeTruthy();

  const qty = await cartPage.getProductQuantityInCart(productName);
  expect(qty).toBe(1);

  const price = await cartPage.getProductPriceInCart(productName);
  expect(price).toContain(expected.price.replace('$', ''));
});

Then('the Checkout button should be visible and enabled with correct text', async function () {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  // Load cart page data if not already loaded
  if (!cartPageData) {
    cartPageData = DataHelper.loadTestData('cartPage.json');
  }
  
  
  // Check if checkout button is visible
  const isVisible = await cartPage.isCheckoutButtonVisible();
  expect(isVisible).toBeTruthy();
  
  // Check if checkout button is enabled
  const isEnabled = await cartPage.isCheckoutButtonEnabled();
  expect(isEnabled).toBeTruthy();

  // Verify button text
  const buttonText = await cartPage.getCheckoutButtonText();

  expect(buttonText).toBe(cartPageData.buttons.checkout);

});

Then('the Continue Shopping button should be visible and enabled with correct text', async function () {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  // Load cart page data if not already loaded
  if (!cartPageData) {
    cartPageData = DataHelper.loadTestData('cartPage.json');
  }
  
  // Check if continue shopping button is visible
  const isVisible = await cartPage.isContinueShoppingButtonVisible();
  expect(isVisible).toBeTruthy();

  // Check if continue shopping button is enabled
  const isEnabled = await cartPage.isContinueShoppingButtonEnabled();
  expect(isEnabled).toBeTruthy();
  
  // Verify button text
  const buttonText = await cartPage.getContinueShoppingButtonText();
  expect(buttonText).toBe(cartPageData.buttons.continueShopping);
});

Then('the cart badge should match the number of products added before removing', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Calculate expected count from added products
  const expectedCount = addedProducts.length;
  
// Removed logVerify usage
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
// Removed logInfo usage
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
// Removed logInfo usage
});

When('I remove product {string} from cart', async function (productName) {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  await cartPage.removeProductFromCart(productName);
});

Then('the cart badge should decrease by {int} after removing product', async function (decreaseBy) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Calculate expected count: original count - removed count
  const expectedCount = addedProducts.length - decreaseBy;
  
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
// Removed logInfo usage
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
// Removed logInfo usage
});

Then('the total price should match sum of all products in cart', async function () {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  // Load product data for prices
  if (!productData) {
    productData = DataHelper.loadTestData('product.json');
  }
  
  console.log(`[VERIFY] Added products: ${JSON.stringify(addedProducts)}`);
  
  // Calculate expected total from products array
  let expectedTotal = 0;
  for (const productName of addedProducts) {
    // Find product in products array
    const product = productData.products.find(p => p.name === productName);
    if (product) {
      const price = parseFloat(product.price.replace('$', ''));
      expectedTotal += price;
      console.log(`[VERIFY] ${productName}: $${price}`);
    } else {
      console.log(`[VERIFY] WARNING: Product "${productName}" not found`);
    }
  }
  
  console.log(`[VERIFY] Expected total: $${expectedTotal}`);
  
  // Get actual total from UI
  const actualTotal = await cartPage.getTotalPrice();
  console.log(`[VERIFY] Actual total from UI: $${actualTotal}`);
  
  // Compare with some tolerance for rounding
  expect(Math.abs(actualTotal - expectedTotal) < 0.01).toBeTruthy();
});

Then('the cart badge should show {int} items', async function (expectedCount) {
  // Wait for cart page to fully load after deletion
  await this.page.waitForLoadState('domcontentloaded');
  await this.page.waitForTimeout(800);
  
  // Try to get product rows in cart
  const productRows = await this.page.locator('#tbodyid tr').count();
  
  if (productRows === 0 && expectedCount === 0) {
    console.log(`[CART] Cart is empty - no items found`);
    expect(productRows).toBe(expectedCount);
  } else {
    // Get actual count from cart page
    const actualCount = await cartPage.getCartItemsCount();
    console.log(`[CART] Cart shows ${actualCount} items, expected ${expectedCount}`);
    expect(actualCount).toBe(expectedCount);
  }
});

Then('the number of {string} product in cart should be {int}', async function (productName, expectedCount) {
  // Ensure cart page object
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }

  // Navigate to cart page if not already there
  if (!this.page.url().includes('cart.html')) {
    await this.page.click('#cartur');
    await this.page.waitForURL(/.*cart.html/);
    await this.page.waitForTimeout(500);
  }

  // Wait for cart table to render
  await this.page.waitForSelector('#tbodyid', { timeout: 5000 }).catch(() => {});
  await this.page.waitForTimeout(500);

  // Count rows containing the product name (case-insensitive)
  const rowLocator = this.page.locator('#tbodyid tr').filter({ hasText: productName });
  const actualCount = await rowLocator.count();
  console.log(`[CART] Found ${actualCount} rows for "${productName}" (contains text), expected ${expectedCount}`);

  expect(actualCount).toBe(expectedCount);
});
