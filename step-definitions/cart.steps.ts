// @ts-nocheck
const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const CartPage = require('../page-objects/CartPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');
// Removed log.ts imports

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
  
// Removed logAction usage
  
  // Add each product to cart
  for (const productName of productNames) {
// Removed logAction usage
    await inventoryPage.addProductToCart(productName);
// Removed logInfo usage
  }
});

Then('the cart badge should show {int} items', async function (expectedCount) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
// Removed logVerify usage
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
// Removed logInfo usage
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
// Removed logInfo usage
});

When('I open the shopping cart', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
// Removed logAction usage
  await inventoryPage.clickShoppingCart();
  
  // Initialize cart page
  cartPage = new CartPage(this.page);
  
  // Verify we're on cart page
  await this.page.waitForURL(/.*cart.html/);
// Removed logVerify usage
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
  
// Removed logVerify usage
  
  // Get expected product data
  const expectedProduct = productData.productsByName[productName];
  
  // Verify product is in cart
  const isInCart = await cartPage.isProductInCart(productName);
  expect(isInCart).toBeTruthy();
// Removed logInfo usage
  
  // Verify quantity
  const actualQuantity = await cartPage.getProductQuantityInCart(productName);
// Removed logInfo usage
  expect(actualQuantity).toBe(1);
// Removed logInfo usage
  
  // Verify description
  const actualDescription = await cartPage.getProductDescriptionInCart(productName);
// Removed logInfo usage
  expect(actualDescription).toBe(expectedProduct.description);
// Removed logInfo usage
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
  
// Removed logVerify usage
  
  // Verify each added product has an enabled and visible Remove button
  for (const productName of addedProducts) {
// Removed logInfo usage
    
    // Check if remove button is visible
    const isVisible = await cartPage.isRemoveButtonVisible(productName);
    expect(isVisible).toBeTruthy();
// Removed logInfo usage
    
    // Check if remove button is enabled
    const isEnabled = await cartPage.isRemoveButtonEnabled(productName);
    expect(isEnabled).toBeTruthy();
// Removed logInfo usage
    
    // Verify button text
    const buttonText = await cartPage.getRemoveButtonText(productName);
// Removed logInfo usage
    expect(buttonText).toBe(cartPageData.buttons.remove);
// Removed logInfo usage
  }
  
// Removed logVerify usage
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
  
// Removed logVerify usage
  
  // Check if checkout button is visible
  const isVisible = await cartPage.isCheckoutButtonVisible();
  expect(isVisible).toBeTruthy();
// Removed logInfo usage
  
  // Check if checkout button is enabled
  const isEnabled = await cartPage.isCheckoutButtonEnabled();
  expect(isEnabled).toBeTruthy();
// Removed logInfo usage
  
  // Verify button text
  const buttonText = await cartPage.getCheckoutButtonText();
// Removed logInfo usage
  expect(buttonText).toBe(cartPageData.buttons.checkout);
// Removed logInfo usage
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
  
// Removed logVerify usage
  
  // Check if continue shopping button is visible
  const isVisible = await cartPage.isContinueShoppingButtonVisible();
  expect(isVisible).toBeTruthy();
// Removed logInfo usage
  
  // Check if continue shopping button is enabled
  const isEnabled = await cartPage.isContinueShoppingButtonEnabled();
  expect(isEnabled).toBeTruthy();
// Removed logInfo usage
  
  // Verify button text
  const buttonText = await cartPage.getContinueShoppingButtonText();
// Removed logInfo usage
  expect(buttonText).toBe(cartPageData.buttons.continueShopping);
// Removed logInfo usage
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
  
// Removed logAction usage
  
  // Remove the product
  await cartPage.removeProductFromCart(productName);
  
// Removed logInfo usage
});

Then('the cart badge should decrease by {int} after removing product', async function (decreaseBy) {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Calculate expected count: original count - removed count
  const expectedCount = addedProducts.length - decreaseBy;
  
// Removed logVerify usage
  
  // Cart badge is a global element, use InventoryPage method
  const actualCount = await inventoryPage.getCartItemCount();
  
// Removed logInfo usage
  
  // Verify cart count
  expect(actualCount).toBe(expectedCount);
// Removed logInfo usage
});
