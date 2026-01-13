// @ts-nocheck
const { setWorldConstructor, World } = require('@cucumber/cucumber');
const BrowserManager = require('../lib/utils/browser-manager.ts');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    
    this.browserManager = new BrowserManager();
    this.browser = null;
    this.context = null;
    this.page = null;
    
    // Configuration from world parameters (passed from cucumber.config.js → playwright.config.js)
    this.config = {
      browser: options.parameters.browser || 'chromium',
      baseUrl: options.parameters.baseUrl,  // From playwright.config.js
      timeout: options.parameters.timeout   // From playwright.config.js
    };
  }

  async init() {
    // Launch browser (headless config from playwright.config.js)
    this.browser = await this.browserManager.launchBrowser(this.config.browser);
    
    this.context = await this.browserManager.createContext();
    this.page = await this.browserManager.createPage();
    
    // Set default timeout
    this.page.setDefaultTimeout(this.config.timeout);
    
    return this.page;
  }

  async cleanup() {
    await this.browserManager.closeBrowser();
  }

  // Take screenshot for failed scenarios (save to browser-specific folder)
  async takeScreenshot(name) {
    if (this.page) {
      const fs = require('fs');
      const path = require('path');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Save screenshot to reports/{browserName}/screenshots/
      const screenshotDir = path.join('reports', this.config.browser, 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      const screenshotPath = path.join(screenshotDir, `${name}-${timestamp}.png`);
      await this.page.screenshot({ 
        path: screenshotPath, 
        fullPage: true 
      });
      return screenshotPath;
    }
  }
}

setWorldConstructor(CustomWorld);
