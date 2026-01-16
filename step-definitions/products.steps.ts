// @ts-nocheck
const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');
// Removed log.ts imports

let inventoryPage;
let productData;

Then('I get all products with their name and price', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Load product data
  productData = DataHelper.loadTestData('product.json');
  
// Removed logVerify usage
  
  // Loop through expected products and verify each one
  for (let i = 0; i < productData.products.length; i++) {
    const expectedProduct = productData.products[i];
    
    // Get actual product name and price using BaseLib methods (1-based index)
    const actualName = await inventoryPage.getProductNameByIndex(i + 1);
    const actualPrice = await inventoryPage.getProductPriceByIndex(i + 1);
    
// Removed logInfo usages
    
    // Verify name and price
    expect(actualName).toBe(expectedProduct.name);
    expect(actualPrice).toBe(expectedProduct.price);
    
// Removed logInfo usage
  }
  
// Removed logVerify usage
});
