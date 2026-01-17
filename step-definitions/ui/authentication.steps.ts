// @ts-nocheck
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const LoginPage = require('../../page-objects/ui/LoginPage.ts');
const InventoryPage = require('../../page-objects/ui/InventoryPage.ts');
const DataHelper = require('../../lib/utils/data-helper.ts');

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
  const successMsg = await loginPage.getSignUpSuccessMessage();
  this.lastDialogMessage = successMsg || this.lastDialogMessage;
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
  loginPage = new LoginPage(this.page);
  await loginPage.navigateTo(baseUrl);
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
  await loginPage.clickLoginLink();
  await loginPage.enterUsername(user.username);
  await loginPage.enterPassword(user.password);
  
  // Capture potential browser alert (e.g., wrong password / invalid user)
  this.lastDialogMessage = '';
  const dialogHandler = (dialog) => {
    this.lastDialogMessage = dialog.message();
    return dialog.accept();
  };
  this.page.once('dialog', dialogHandler);
  
  await loginPage.clickLoginButton();
  
  // Brief wait for dialog if it appears
  await this.page.waitForTimeout(1500).catch(() => {});
  // Verify we got the login response
  try {
    await loginPage.waitForInventoryPage(5000);
  } catch (e) {
    // Dialog may have appeared instead
  }
});

Then('I should be redirected to the inventory page', async function () {
  // For Demoblaze, successful login is indicated by the user greeting
  await loginPage.waitForUserGreeting(10000);
  const greetingVisible = await loginPage.isUserGreetingVisible();
  expect(greetingVisible).toBeTruthy();
});

When('I click the logout button', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  await loginPage.clickLogout();
});

Then('I should see the login button visible', async function () {
  const visible = await loginPage.isLoginLinkVisible();
  expect(visible).toBeTruthy();
});

When('I refresh the page', async function () {
  await this.page.reload({ waitUntil: 'domcontentloaded' });
});

Then('I should remain logged in', async function () {
  const greetingVisible = await loginPage.isUserGreetingVisible();
  expect(greetingVisible).toBeTruthy();
});

When('I click the login link repeatedly', async function () {
  if (!loginPage) {
    loginPage = new LoginPage(this.page);
  }
  for (let i = 0; i < 3; i++) {
    await loginPage.clickLoginLink();
    await this.page.waitForTimeout(200);
  }
});

Then('I should see a single login modal open', async function () {
  const count = await loginPage.getLoginModalCount();
  expect(count).toBe(1);
});

Then('I should see the error message {string}', async function (errorType) {
  // If we captured an alert (login/signup flow), use that message
  if (this.lastDialogMessage && this.lastDialogMessage.trim()) {
    const actual = this.lastDialogMessage.trim().toLowerCase();
    // Map token to configured message first, then normalize
    let expected =
      (errorMessages.loginErrors && errorMessages.loginErrors[errorType]) ||
      (errorMessages.signUpErrors && errorMessages.signUpErrors[errorType]) ||
      errorType;
    expected = (expected || '').trim().toLowerCase();
    // Demoblaze normalizes empty-field alerts to a single message
    if (
      errorType.toLowerCase() === 'emptyusername' ||
      errorType.toLowerCase() === 'emptypassword' ||
      expected.includes('please enter a username') ||
      expected.includes('please enter a password') ||
      errorType.toLowerCase().includes('empty')
    ) {
      expected = 'please fill out username and password.';
    }
    if (expected.includes('already exists')) {
      expected = 'this user already exist.';
    }
    expect(actual).toContain(expected);
    return;
  }

  const actualErrorMessage = await loginPage.getErrorMessage();
  const expectedErrorMessage = (errorMessages.loginErrors && errorMessages.loginErrors[errorType]) ||
    (errorMessages.signUpErrors && errorMessages.signUpErrors[errorType]) ||
    errorType;
  expect((actualErrorMessage || '').toLowerCase()).toContain((expectedErrorMessage || '').toLowerCase());
});

Then('I should remain on the login page', async function () {
  const currentURL = this.page.url();
  const expectedURL = testSiteData.environments.testEnv.baseUrl;
  await expect(this.page).toHaveURL(expectedURL);
});
