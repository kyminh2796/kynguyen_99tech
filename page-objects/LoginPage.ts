import { log } from "console";

// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class LoginPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors for Demoblaze (CSS selectors only - faster and more reliable)
    this.selectors = {
      loginLink: '#login2',
      signUpLink: '#signin2',
      usernameInput: '#loginusername',
      passwordInput: '#loginpassword',
      loginButton: '//*[@id="logInModal"]/div/div/div[3]/button[2]',
      signUpUsername: '#sign-username',
      signUpPassword: '#sign-password',
      signUpButton: '//*[@id="signInModal"]/div/div/div[3]/button[2]',
      errorMessage: '.alert-danger, .alert',
      closeButton: '//*[@id="signInModal"]/div/div/div[1]/button',
      signUpLabel: '//*[@id="signInModalLabel"]',
      loginLabel: '//*[@id="logInModalLabel"]',
      welcomeUser: '#nameofuser'
    };
  }

  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async clickLoginLink() {
    await this.page.waitForSelector(this.selectors.loginLink, { state: 'visible' });
    await this.page.click(this.selectors.loginLink, { force: true });
  }

  async clickSignUpLink() {
    await this.page.waitForSelector(this.selectors.signUpLink, { state: 'visible' });
    await this.page.click(this.selectors.signUpLink, { force: true });
    await this.page.waitForSelector(this.selectors.signUpLabel, { timeout: 7000 });
  }

  async enterUsername(username) {
    await this.page.waitForSelector(this.selectors.usernameInput);
    await this.page.fill(this.selectors.usernameInput, username);
  }

  async enterPassword(password) {
    await this.page.waitForSelector(this.selectors.passwordInput);
    await this.page.fill(this.selectors.passwordInput, password);
  }

  async enterSignUpUsername(username) {
    await this.page.waitForSelector(this.selectors.signUpUsername);
    await this.page.fill(this.selectors.signUpUsername, username);
  }

  async enterSignUpPassword(password) {
    await this.page.waitForSelector(this.selectors.signUpPassword);
    await this.page.fill(this.selectors.signUpPassword, password);
  }

  async clickLoginButton() {
    // Wait for login button to be visible and enabled
    await this.page.waitForSelector(this.selectors.loginButton, { state: 'visible', timeout: 7000 });
    const button = this.page.locator(this.selectors.loginButton);
    await button.waitFor({ state: 'visible', timeout: 7000 });
    // Optionally highlight for debug
    if (this.highlightElement) {
      await this.highlightElement(this.selectors.loginButton);
    }
    // Ensure button is enabled
    if (await button.isEnabled()) {
      await button.click({ force: true });
    } else {
      throw new Error('Login button is not enabled');
    }
  }

  async clickSignUpButton() {
    await this.page.waitForSelector(this.selectors.signUpButton);
    await this.page.click(this.selectors.signUpButton);
  }

  async getErrorMessage() {
    try {
      const errorText = await this.page.textContent(this.selectors.errorMessage);
      return errorText ? errorText.trim() : '';
    } catch (e) {
      return '';
    }
  }
  async closeSignUpModal() {
    const modal = this.page.locator('#signInModal');
    if (await modal.isVisible()) {
      await this.page.click(this.selectors.closeButton, { force: true });
      await this.page.waitForSelector('#signInModal', { state: 'hidden', timeout: 5000 });
    }
  }
  async isErrorDisplayed() {
    return await this.page.isVisible(this.selectors.errorMessage);
  }

  async isSignUpModalVisible() {
    return await this.isElementVisible(this.selectors.signUpLabel);
  }

  async waitForUserGreeting(timeout = 10000) {
    await this.page.waitForSelector(this.selectors.welcomeUser, { timeout });
  }

  async isUserGreetingVisible() {
    return await this.page.isVisible(this.selectors.welcomeUser);
  }

  async clearSignUpUsername() {
    await this.page.fill(this.selectors.signUpUsername, '');
  }

  async clearSignUpPassword() {
    await this.page.fill(this.selectors.signUpPassword, '');
  }

  async loginWithRetry(username, password, attempts = 3, greetingTimeout = 8000) {
    let loginAlert = '';
    for (let attempt = 1; attempt <= attempts; attempt++) {
      await this.enterUsername(username);
      await this.enterPassword(password);

      const dialogPromise = new Promise(resolve => {
        this.page.once('dialog', async (dialog) => {
          loginAlert = dialog.message();
          await dialog.accept();
          resolve('dialog');
        });
      });
      const greetingPromise = this.waitForUserGreeting(greetingTimeout).then(() => 'greeting');

      await this.clickLoginButton();
      const outcome = await Promise.race([dialogPromise, greetingPromise]);
      const success = outcome === 'greeting' || await this.isUserGreetingVisible();
      if (success) {
        return { success: true };
      }
      if (attempt < attempts) {
        await this.page.waitForTimeout(1500);
        await this.clickLoginLink();
      }
    }
    return { success: false, alert: loginAlert };
  }
}

module.exports = LoginPage;
