// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class LoginPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      usernameInput: '//*[@id="user-name"]',
      passwordInput: '//*[@id="password"]',
      loginButton: '//*[@id="login-button"]',
      errorMessage: '//h3[@data-test="error"]'
    };
  }

  async enterUsername(username) {
    await this.fillInput(this.selectors.usernameInput, username);
  }

  async enterPassword(password) {
    await this.fillInput(this.selectors.passwordInput, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.selectors.loginButton);
  }

  async getErrorMessage() {
    return await this.getText(this.selectors.errorMessage);
  }

  async isErrorDisplayed() {
    return await this.isElementVisible(this.selectors.errorMessage);
  }
}

module.exports = LoginPage;
