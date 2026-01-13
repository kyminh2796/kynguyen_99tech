// @ts-nocheck
class BaseLib {
  constructor(page) {
    this.page = page;
    // Timeout is set from playwright.config.js via page.setDefaultTimeout() in world.js
    // This is just a fallback for waitForElement
    const playwrightConfig = require('../config/playwright.config');
    this.timeout = playwrightConfig.timeout;
  }

  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForElement(selector, options = {}) {
    return await this.page.waitForSelector(selector, {
      timeout: this.timeout,
      ...options
    });
  }

  /**
   * Highlight element with green border and label "AutomationTest"
   * @param {string} selector - Element selector
   */
  async highlightElement(selector) {
    try {
      await this.page.evaluate((sel) => {
        const element = document.evaluate(
          sel,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue || document.querySelector(sel);

        if (element) {
          // Store original styles
          const originalBorder = element.style.border;
          const originalBoxShadow = element.style.boxShadow;
          
          // Apply highlight
          element.style.border = '3px solid rgb(29, 59, 34)';
          element.style.boxShadow = '0 0 10px rgba(29, 59, 34, 0.5)';
          
          // Create label OUTSIDE the element
          const label = document.createElement('div');
          label.textContent = 'AutomationTest';
          label.className = 'automation-highlight-label';
          label.style.cssText = `
            position: fixed;
            background: rgb(29, 59, 34);
            color: #fff;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 3px;
            z-index: 999999;
            font-family: Arial, sans-serif;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `;
          
          // Position label above element
          const rect = element.getBoundingClientRect();
          label.style.top = `${rect.top - 25}px`;
          label.style.left = `${rect.left}px`;
          
          // Append label to body (NOT to element)
          document.body.appendChild(label);
          
          // Remove highlight after 500ms
          setTimeout(() => {
            element.style.border = originalBorder;
            element.style.boxShadow = originalBoxShadow;
            if (label.parentNode) {
              label.remove();
            }
          }, 500);
        }
      }, selector);
      
      // Wait a bit to see the highlight
      await this.page.waitForTimeout(300);
    } catch (error) {
      // Silently fail if highlight doesn't work
      // Note: Highlight failed for selector (debug only)
    }
  }

  async clickElement(selector) {
    await this.waitForElement(selector);
    await this.highlightElement(selector);
    await this.page.click(selector);
  }

  async fillInput(selector, text) {
    await this.waitForElement(selector);
    await this.highlightElement(selector);
    await this.page.fill(selector, text);
  }

  async getText(selector) {
    await this.waitForElement(selector);
    await this.highlightElement(selector);
    return await this.page.textContent(selector);
  }

  async isElementVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return await this.page.isVisible(selector);
    } catch {
      return false;
    }
  }

  async isElementEnabled(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      const element = await this.page.locator(selector);
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }
}

module.exports = BaseLib;
