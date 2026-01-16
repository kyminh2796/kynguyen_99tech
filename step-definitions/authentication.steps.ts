// @ts-nocheck
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../page-objects/LoginPage.ts');
const InventoryPage = require('../page-objects/InventoryPage.ts');
const DataHelper = require('../lib/utils/data-helper.ts');


let loginPage;
let inventoryPage;
let testSiteData;
let errorMessages;
let usersData;

// signup steps
Given('I am on the Demoblaze sign up page', async function () {
  // Load test site data and error messages
  testSiteData = DataHelper.loadTestData('testSite.json');
  errorMessages = DataHelper.loadTestData('errorMessages.json');
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  loginPage = new LoginPage(this.page);
  await loginPage.navigateTo(baseUrl);
  await loginPage.clickSignUpLink();
});

When('I generate a random username', async function () {
  // Generate a random username with timestamp to ensure uniqueness
  const timestamp = Date.now();
  generatedUsername = `test_${timestamp}_${Math.floor(Math.random() * 1000)}`;
  this.currentUsername = generatedUsername;
});

When('I enter the username in the sign up form', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  const username = this.currentUsername || generatedUsername;
  await loginPage.enterSignUpUsername(username);
});

When('I enter a valid password {string}', async function (password) {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterSignUpPassword(password);
  this.currentPassword = password;
});

When('I enter a weak password {string}', async function (password) {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterSignUpPassword(password);
});

When('I enter a username {string}', async function (username) {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterSignUpUsername(username);
  
  this.currentUsername = username;
});

When('I enter a username with special characters {string}', async function (username) {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  
  await loginPage.enterSignUpUsername(username);
  await loginPage.enterSignUpUsername(username);
  
  this.currentUsername = username;
});

When('I enter an existing username {string}', async function (username) {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterSignUpUsername(username);
  await loginPage.enterSignUpUsername(username);
  this.currentUsername = username;
});

When('I leave the username field empty', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.clearSignUpUsername();
});

When('I leave the password field empty', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.clearSignUpPassword();
});

When('I click the sign up button', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  // Listen for the browser alert and store its message
  this.lastDialogMessage = '';
  this.page.once('dialog', async (dialog) => {
    this.lastDialogMessage = dialog.message();
    await dialog.accept();
  });
  await loginPage.clickSignUpButton();
  // Wait a moment to ensure the alert is handled
  await this.page.waitForTimeout(1500);
});

Then('I should see the success message {string}', async function (messageType) {
  // Assert the alert message captured in the previous step
  expect(this.lastDialogMessage.toLowerCase()).toContain(messageType.toLowerCase());
});

Then('the new account should be created and ready to use', async function () {
  await this.page.waitForTimeout(1000);
  await loginPage.clickLoginLink();
  await loginPage.enterUsername(this.currentUsername);
  await loginPage.enterPassword(this.currentPassword);

  let loginAlert = '';
  const dialogPromise = new Promise(resolve => {
    this.page.once('dialog', async (dialog) => {
      loginAlert = dialog.message();
      await dialog.accept();
      resolve('dialog');
    });
  });
  const greetingPromise = loginPage.waitForUserGreeting(10000).then(() => 'greeting');
  await loginPage.clickLoginButton();
  const outcome = await Promise.race([dialogPromise, greetingPromise]);
  if (outcome !== 'greeting') {
    throw new Error(`Login failed after signup${loginAlert ? `: ${loginAlert}` : ''}`);
  }
});

Then('I should remain on the sign up page', async function () {
  const labelVisible = await loginPage.isSignUpModalVisible();
  expect(labelVisible).toBeTruthy();
});

When('I navigate to the login page', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.closeSignUpModal();
  await loginPage.clickLoginLink();
});

When('I login with the newly created account', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterUsername(this.currentUsername);
  await loginPage.enterPassword(this.currentPassword);
  await loginPage.clickLoginButton();
});

// Login Steps
Given('I am on the Demoblaze login page', async function () {
  // Load test site data and error messages
  testSiteData = DataHelper.loadTestData('testSite.json');
  errorMessages = DataHelper.loadTestData('errorMessages.json');
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  
  logAction(`Navigate to login page: ${baseUrl}`);
  loginPage = new LoginPage(this.page);
  await loginPage.navigateTo(baseUrl);
  await loginPage.clickLoginLink();
  await expect(this.page).toHaveURL(baseUrl);

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
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.enterUsername(user.username);
  logAction(`Entered username: ${user.username}`);
  
  await loginPage.enterPassword(user.password);
  logAction('Entered password: ************');
  
  await loginPage.clickLoginButton();
  logAction('Clicked login button');
});

Then('I should be redirected to the inventory page', async function () {
  // For Demoblaze, successful login is indicated by the user greeting
  await loginPage.waitForUserGreeting(10000);
  const greetingVisible = await loginPage.isUserGreetingVisible();
  expect(greetingVisible).toBeTruthy();
});

Then('I should see the error message {string}', async function (errorType) {
  // If we captured an alert (signup flow), use that message
  if (this.lastDialogMessage && this.lastDialogMessage.trim()) {
    const actual = this.lastDialogMessage.trim().toLowerCase();
    let expected = (errorType || '').trim().toLowerCase();
    // Normalize common Demoblaze messages
    if (expected.includes('username') || expected.includes('password')) {
      expected = 'please fill out username and password.';
    }
    if (expected.includes('already exists')) {
      expected = 'this user already exist.'; // Demoblaze uses singular "exist"
    }
    expect(actual).toContain(expected);
    return;
  }

  // Fallback to inline error (login flow)
  const actualErrorMessage = await loginPage.getErrorMessage();
  const expectedErrorMessage = errorMessages.loginErrors[errorType] || errorMessages.signUpErrors[errorType] || errorType;
  expect((actualErrorMessage || '').toLowerCase()).toContain((expectedErrorMessage || '').toLowerCase());
});

Then('I should remain on the login page', async function () {
  const currentURL = this.page.url();
  const expectedURL = testSiteData.environments.testEnv.baseUrl;
  await expect(this.page).toHaveURL(expectedURL);
});
