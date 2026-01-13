// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class CartPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      // Get cart item by product name
      cartItemByName: (productName) => `//div[@data-test="inventory-item"]//div[@class="inventory_item_name" and text()="${productName}"]`,
      // Get quantity by product name (dynamic)
      quantityByProductName: (productName) => `//div[@data-test="inventory-item"][.//div[@class="inventory_item_name" and text()="${productName}"]]//div[@data-test="item-quantity"]`,
      // Get description by product name (dynamic)
      descriptionByProductName: (productName) => `//div[@data-test="inventory-item"][.//div[@class="inventory_item_name" and text()="${productName}"]]//div[@data-test="inventory-item-desc"]`,
      // Get remove button by product name (dynamic)
      removeButtonByProductName: (productName) => {
        const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `//button[@data-test="remove-${slug}"]`;
      },
      // Cart page buttons
      checkoutButton: '//button[@data-test="checkout"]',
      continueShoppingButton: '//button[@data-test="continue-shopping"]'
    };
  }

  // Get quantity of a specific product in cart
  async getProductQuantityInCart(productName) {
    const selector = this.selectors.quantityByProductName(productName);
    const text = await this.getText(selector);
    return parseInt(text);
  }

  // Get description of a specific product in cart
  async getProductDescriptionInCart(productName) {
    const selector = this.selectors.descriptionByProductName(productName);
    return await this.getText(selector);
  }

  // Check if product exists in cart
  async isProductInCart(productName) {
    const selector = this.selectors.cartItemByName(productName);
    return await this.isElementVisible(selector);
  }

  // Check if remove button is enabled for a specific product
  async isRemoveButtonEnabled(productName) {
    const selector = this.selectors.removeButtonByProductName(productName);
    return await this.isElementEnabled(selector);
  }

  // Check if remove button is visible for a specific product
  async isRemoveButtonVisible(productName) {
    const selector = this.selectors.removeButtonByProductName(productName);
    return await this.isElementVisible(selector);
  }

  // Get remove button text
  async getRemoveButtonText(productName) {
    const selector = this.selectors.removeButtonByProductName(productName);
    return await this.getText(selector);
  }

  // Check if checkout button is enabled
  async isCheckoutButtonEnabled() {
    return await this.isElementEnabled(this.selectors.checkoutButton);
  }

  // Check if checkout button is visible
  async isCheckoutButtonVisible() {
    return await this.isElementVisible(this.selectors.checkoutButton);
  }

  // Get checkout button text
  async getCheckoutButtonText() {
    return await this.getText(this.selectors.checkoutButton);
  }

  // Check if continue shopping button is enabled
  async isContinueShoppingButtonEnabled() {
    return await this.isElementEnabled(this.selectors.continueShoppingButton);
  }

  // Check if continue shopping button is visible
  async isContinueShoppingButtonVisible() {
    return await this.isElementVisible(this.selectors.continueShoppingButton);
  }

  // Get continue shopping button text
  async getContinueShoppingButtonText() {
    return await this.getText(this.selectors.continueShoppingButton);
  }

  // Remove product from cart by product name
  async removeProductFromCart(productName) {
    const selector = this.selectors.removeButtonByProductName(productName);
    await this.clickElement(selector);
  }
}

module.exports = CartPage;
