// @ts-nocheck
const BaseLib = require('../lib/baseLib.ts');

class InventoryPage extends BaseLib {
  constructor(page) {
    super(page);
    
    // Selectors
    this.selectors = {
      productTitle: '//span[@data-test="title"]',
      productName: '//div[@data-test="inventory-item-name"]',
      productPrice: '//div[@data-test="inventory-item-price"]',
      // Cart selectors
      shoppingCartLink: '//a[@data-test="shopping-cart-link"]',
      shoppingCartBadge: '//span[@data-test="shopping-cart-badge"]',
      // Dynamic add to cart button by product name
      addToCartButton: (productName) => {
        const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `//button[@data-test="add-to-cart-${slug}"]`;
      }
    };
  }

  async getPageTitle() {
    return await this.getText(this.selectors.productTitle);
  }

  // Get product name by index (1-based)
  async getProductNameByIndex(index) {
    const selector = `(${this.selectors.productName})[${index}]`;
    return await this.getText(selector);
  }

  // Get product price by index (1-based)
  async getProductPriceByIndex(index) {
    const selector = `(${this.selectors.productPrice})[${index}]`;
    return await this.getText(selector);
  }

  // Add product to cart by product name
  async addProductToCart(productName) {
    const selector = this.selectors.addToCartButton(productName);
    await this.clickElement(selector);
  }

  // Get shopping cart badge count (number of items in cart)
  async getCartItemCount() {
    const isVisible = await this.isElementVisible(this.selectors.shoppingCartBadge);
    if (!isVisible) {
      return 0;
    }
    const text = await this.getText(this.selectors.shoppingCartBadge);
    return parseInt(text);
  }

  // Click shopping cart icon
  async clickShoppingCart() {
    await this.clickElement(this.selectors.shoppingCartLink);
  }
}

module.exports = InventoryPage;
