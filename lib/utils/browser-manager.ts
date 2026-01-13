// @ts-nocheck
const { chromium, firefox, webkit } = require('playwright');
const playwrightConfig = require('../../config/playwright.config');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async launchBrowser(browserType = 'chromium', options = {}) {
    // Get headless and slowMo config from playwright.config.js
    const defaultOptions = {
      headless: playwrightConfig.use.headless,
      slowMo: playwrightConfig.use.slowMo || 0, // Read from playwright.config.js
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };

    const launchOptions = { ...defaultOptions, ...options };

    switch (browserType.toLowerCase()) {
      case 'firefox':
        this.browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
      case 'safari':
        this.browser = await webkit.launch(launchOptions);
        break;
      case 'chromium':
      case 'chrome':
      default:
        this.browser = await chromium.launch(launchOptions);
        break;
    }

    return this.browser;
  }

  async createContext(options = {}) {
    const defaultContextOptions = {
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
      acceptDownloads: true
    };

    const contextOptions = { ...defaultContextOptions, ...options };
    this.context = await this.browser.newContext(contextOptions);
    return this.context;
  }

  async createPage() {
    if (!this.context) {
      await this.createContext();
    }
    this.page = await this.context.newPage();
    return this.page;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  async closeContext() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
    }
  }

  async closePage() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }
}

module.exports = BrowserManager;
