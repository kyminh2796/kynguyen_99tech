// @ts-nocheck
const BaseLib = require('../../lib/baseLib.ts');

class LoginPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors for Demoblaze (CSS selectors only - faster and more reliable)
    this.selectors = {
      loginLink: '#login2',
      logoutLink: '#logout2',
      signUpLink: '#signin2',
      usernameInput: '#loginusername',
      passwordInput: '#loginpassword',
      loginButton: '//*[@id="logInModal"]/div/div/div[3]/button[2]',
      loginModal: '#logInModal',
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

  async clickLogout() {
    await this.page.waitForSelector(this.selectors.logoutLink, { state: 'visible' });
    await this.page.click(this.selectors.logoutLink, { force: true });
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
    const button = this.page.locator(this.selectors.loginButton);
    await button.waitFor({ state: 'visible', timeout: 5000 });
    
    // Ensure button is enabled before clicking
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

  async isLoginLinkVisible() {
    return await this.page.isVisible(this.selectors.loginLink);
  }

  async getLoginModalCount() {
    return await this.getElementCount(this.selectors.loginModal);
  }

  async clearSignUpUsername() {
    await this.page.fill(this.selectors.signUpUsername, '');
  }

  async clearSignUpPassword() {
    await this.page.fill(this.selectors.signUpPassword, '');
  }

  async waitForLoginForm(timeout = 5000) {
    await this.page.waitForSelector(this.selectors.loginLink, { timeout });
  }

  async clickLoginLinkIfVisible() {
    await this.page.click(this.selectors.loginLink).catch(() => {});
  }

  async waitForInventoryPage(timeout = 5000) {
    await this.page.waitForSelector('#tbodyid', { timeout });
  }

  async getSignUpSuccessMessage() {
    const alert = await this.page.evaluate(() => {
      const el = document.querySelector('.alert');
      return el ? el.textContent : '';
    }).catch(() => '');
    return alert;
  }
}

module.exports = LoginPage;
