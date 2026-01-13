// @ts-nocheck
const { Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');
const { logVerify, logInfo } = require('../lib/log.ts');

let inventoryPage;
let productData;

Then('I get all products with their name and price', async function () {
  // Initialize inventory page if not already done
  if (!inventoryPage) {
    inventoryPage = new InventoryPage(this.page);
  }
  
  // Load product data
  productData = DataHelper.loadTestData('product.json');
  
  logVerify('Get all products with their ProductName and Price');
  
  // Loop through expected products and verify each one
  for (let i = 0; i < productData.products.length; i++) {
    const expectedProduct = productData.products[i];
    
    // Get actual product name and price using BaseLib methods (1-based index)
    const actualName = await inventoryPage.getProductNameByIndex(i + 1);
    const actualPrice = await inventoryPage.getProductPriceByIndex(i + 1);
    
    logInfo(`Product ${i + 1}:`);
    logInfo(`  Expected Name: ${expectedProduct.name}`);
    logInfo(`  Actual Name: ${actualName}`);
    logInfo(`  Expected Price: ${expectedProduct.price}`);
    logInfo(`  Actual Price: ${actualPrice}`);
    
    // Verify name and price
    expect(actualName).toBe(expectedProduct.name);
    expect(actualPrice).toBe(expectedProduct.price);
    
    logInfo(`  ✓ PASS`);
  }
  
  logVerify(`Successfully verified all products ✓`);
});
