// @ts-nocheck
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const CartPage = require('../page-objects/CartPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');
const { logAction, logVerify, logInfo } = require('../lib/log.ts');

let inventoryPage;
let cartPage;
let productData;
let cartPageData;
let addedProducts = [];

When('I add the following products to cart:', async function (dataTable) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Get product names from data table
  const productNames = dataTable.raw().flat();
  
  // Store added products for later verification
  addedProducts = productNames;
  
  logAction(`Adding ${productNames.length} products to cart`);
  
  // Add each product to cart
  for (const productName of productNames) {
    logAction(`Add to cart: ${productName}`);
    await inventoryPage.addProductToCart(productName);
    logInfo(`✓ Added "${productName}" to cart`);
  }
});

Then('the cart badge should show {int} items', async function (expectedCount) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  logVerify(`Verify cart badge shows ${expectedCount} items`);
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
  logInfo(`Expected cart count: ${expectedCount}`);
  logInfo(`Actual cart count: ${actualCount}`);
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
  logInfo(`Cart badge count: ✓ PASS`);
});

When('I open the shopping cart', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  logAction('Click shopping cart icon');
  await inventoryPage.clickShoppingCart();
  
  // Initialize cart page
  cartPage = new CartPage(this.page);
  
  // Verify we're on cart page
  await this.page.waitForURL(/.*cart.html/);
  logVerify('Successfully navigated to cart page');
});

Then('I should see product {string} with correct quantity and description in cart', async function (productName) {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  // Load product data if not already loaded
  if (!productData) {
    productData = DataHelper.loadTestData('product.json');
  }
  
  logVerify(`Verify product "${productName}" with quantity and description`);
  
  // Get expected product data
  const expectedProduct = productData.productsByName[productName];
  
  // Verify product is in cart
  const isInCart = await cartPage.isProductInCart(productName);
  expect(isInCart).toBeTruthy();
  logInfo(`Product "${productName}" found in cart: ✓ PASS`);
  
  // Verify quantity
  const actualQuantity = await cartPage.getProductQuantityInCart(productName);
  logInfo(`Expected quantity: 1`);
  logInfo(`Actual quantity: ${actualQuantity}`);
  expect(actualQuantity).toBe(1);
  logInfo(`Quantity match: ✓ PASS`);
  
  // Verify description
  const actualDescription = await cartPage.getProductDescriptionInCart(productName);
  logInfo(`Expected description: ${expectedProduct.description}`);
  logInfo(`Actual description: ${actualDescription}`);
  expect(actualDescription).toBe(expectedProduct.description);
  logInfo(`Description match: ✓ PASS`);
});

Then('the Remove button should be visible and enabled for all products in cart', async function () {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  // Load cart page data if not already loaded
  if (!cartPageData) {
    cartPageData = DataHelper.loadTestData('cartPage.json');
  }
  
  logVerify('Verify Remove button is visible and enabled for all products in cart');
  
  // Verify each added product has an enabled and visible Remove button
  for (const productName of addedProducts) {
    logInfo(`Checking Remove button for: ${productName}`);
    
    // Check if remove button is visible
    const isVisible = await cartPage.isRemoveButtonVisible(productName);
    expect(isVisible).toBeTruthy();
    logInfo(`Remove button visible: ✓ PASS`);
    
    // Check if remove button is enabled
    const isEnabled = await cartPage.isRemoveButtonEnabled(productName);
    expect(isEnabled).toBeTruthy();
    logInfo(`Remove button enabled: ✓ PASS`);
    
    // Verify button text
    const buttonText = await cartPage.getRemoveButtonText(productName);
    logInfo(`Expected button text: ${cartPageData.buttons.remove}`);
    logInfo(`Actual button text: ${buttonText}`);
    expect(buttonText).toBe(cartPageData.buttons.remove);
    logInfo(`Button text match: ✓ PASS`);
  }
  
  logVerify('All Remove buttons verified successfully ✓');
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
  
  logVerify('Verify Checkout button is visible, enabled with correct text');
  
  // Check if checkout button is visible
  const isVisible = await cartPage.isCheckoutButtonVisible();
  expect(isVisible).toBeTruthy();
  logInfo(`Checkout button visible: ✓ PASS`);
  
  // Check if checkout button is enabled
  const isEnabled = await cartPage.isCheckoutButtonEnabled();
  expect(isEnabled).toBeTruthy();
  logInfo(`Checkout button enabled: ✓ PASS`);
  
  // Verify button text
  const buttonText = await cartPage.getCheckoutButtonText();
  logInfo(`Expected button text: ${cartPageData.buttons.checkout}`);
  logInfo(`Actual button text: ${buttonText}`);
  expect(buttonText).toBe(cartPageData.buttons.checkout);
  logInfo(`Button text match: ✓ PASS`);
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
  
  logVerify('Verify Continue Shopping button is visible, enabled with correct text');
  
  // Check if continue shopping button is visible
  const isVisible = await cartPage.isContinueShoppingButtonVisible();
  expect(isVisible).toBeTruthy();
  logInfo(`Continue Shopping button visible: ✓ PASS`);
  
  // Check if continue shopping button is enabled
  const isEnabled = await cartPage.isContinueShoppingButtonEnabled();
  expect(isEnabled).toBeTruthy();
  logInfo(`Continue Shopping button enabled: ✓ PASS`);
  
  // Verify button text
  const buttonText = await cartPage.getContinueShoppingButtonText();
  logInfo(`Expected button text: ${cartPageData.buttons.continueShopping}`);
  logInfo(`Actual button text: ${buttonText}`);
  expect(buttonText).toBe(cartPageData.buttons.continueShopping);
  logInfo(`Button text match: ✓ PASS`);
});

Then('the cart badge should match the number of products added before removing', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Calculate expected count from added products
  const expectedCount = addedProducts.length;
  
  logVerify(`Verify cart badge shows ${expectedCount} items BEFORE removing product`);
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
  logInfo(`Number of products added: ${expectedCount}`);
  logInfo(`Expected cart count (before remove): ${expectedCount}`);
  logInfo(`Actual cart count (before remove): ${actualCount}`);
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
  logInfo(`Cart badge count before remove: ✓ PASS`);
});

When('I remove product {string} from cart', async function (productName) {
  // Initialize cart page if not already done
  if (!cartPage) {
    cartPage = new CartPage(this.page);
  }
  
  logAction(`Remove product "${productName}" from cart`);
  
  // Remove the product
  await cartPage.removeProductFromCart(productName);
  
  logInfo(`✓ Product "${productName}" removed from cart`);
});

Then('the cart badge should decrease by {int} after removing product', async function (decreaseBy) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Calculate expected count: original count - removed count
  const expectedCount = addedProducts.length - decreaseBy;
  
  logVerify(`Verify cart badge decreased by ${decreaseBy} after removing product`);
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
  logInfo(`Original product count: ${addedProducts.length}`);
  logInfo(`Products removed: ${decreaseBy}`);
  logInfo(`Expected cart count (after remove): ${expectedCount}`);
  logInfo(`Actual cart count (after remove): ${actualCount}`);
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
  logInfo(`Cart badge count after remove: ✓ PASS`);
});
