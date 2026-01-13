// @ts-nocheck
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage.ts');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');
const { logAction, logVerify, logInfo } = require('../lib/log.ts');

let loginPage;
let inventoryPage;
let testSiteData;
let errorMessages;
let usersData;

Given('I am on the SauceDemo login page', async function () {
  // Load test site data and error messages
  testSiteData = DataHelper.loadTestData('testSite.json');
  errorMessages = DataHelper.loadTestData('errorMessages.json');
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  
  logAction(`Navigate to login page: ${baseUrl}`);
  loginPage = new LoginPage(this.page);
  await loginPage.navigateTo(baseUrl);
  
  // Verify we're on the login page
  await expect(this.page).toHaveURL(baseUrl);
  logVerify(`Successfully navigated to login page`);
});

// Login with user type from users.json (ALL features use this now)
When('I login as {string}', async function (userType) {
  // Load users data if not already loaded
  if (!usersData) {
    usersData = DataHelper.loadTestData('users.json');
  }
  
  const user = usersData[userType];
  
  if (!user) {
    throw new Error(`User type "${userType}" not found in users.json`);
  }
  
  logAction(`Login as: ${userType} (${user.username})`);
  logInfo(`Description: ${user.description}`);
  
  await loginPage.enterUsername(user.username);
  logAction(`Entered username: ${user.username}`);
  
  await loginPage.enterPassword(user.password);
  logAction('Entered password: ************');
  
  await loginPage.clickLoginButton();
  logAction('Clicked login button');
});

Then('I should be redirected to the inventory page', async function () {
  const currentURL = this.page.url();
  const expectedPattern = /.*inventory.html/;
  
  // Verify URL
  logVerify(`URL matches pattern ${expectedPattern}`);
  logInfo(`Current URL: ${currentURL}`);
  logInfo(`Match Result: ${expectedPattern.test(currentURL) ? '✓ PASS' : '✗ FAIL'}`);
  await expect(this.page).toHaveURL(expectedPattern);
  
  // Initialize inventory page
  inventoryPage = new InventoryPage(this.page);
  
  // Verify page title
  const actualTitle = await inventoryPage.getPageTitle();
  const expectedTitle = 'Products';
  
  logVerify(`Page title should be "${expectedTitle}"`);
  logInfo(`Expected: "${expectedTitle}"`);
  logInfo(`Actual: "${actualTitle}"`);
  logInfo(`Match Result: ${actualTitle === expectedTitle ? '✓ PASS' : '✗ FAIL'}`);
  expect(actualTitle).toBe(expectedTitle);
});

Then('I should see the error message {string}', async function (errorType) {
  const actualErrorMessage = await loginPage.getErrorMessage();
  const expectedErrorMessage = errorMessages.loginErrors[errorType];
  
  logVerify(`Error message should match "${errorType}"`);
  logInfo(`Expected: "${expectedErrorMessage}"`);
  logInfo(`Actual: "${actualErrorMessage}"`);
  logInfo(`Match Result: ${actualErrorMessage === expectedErrorMessage ? '✓ PASS' : '✗ FAIL'}`);
  
  expect(actualErrorMessage).toBe(expectedErrorMessage);
});

Then('I should remain on the login page', async function () {
  const currentURL = this.page.url();
  const expectedURL = testSiteData.environments.testEnv.baseUrl;
  
  logVerify(`Should remain on login page`);
  logInfo(`Expected URL: ${expectedURL}`);
  logInfo(`Current URL: ${currentURL}`);
  logInfo(`Match Result: ${currentURL === expectedURL ? '✓ PASS' : '✗ FAIL'}`);
  
  await expect(this.page).toHaveURL(expectedURL);
});
