const playwrightConfig = require('./playwright.config');

// Common configuration
const commonConfig = {
  requireModule: [
    'ts-node/register'
  ],
  require: [
    'step-definitions/**/*.ts',
    'step-definitions/**/**/*.ts',
    'support/**/*.ts',
    'hooks/**/*.ts'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  dryRun: false,
  failFast: false,
  strict: true,
  parallel: playwrightConfig.workers  // Auto sync with playwright.config.js workers
};

// Export profiles for each browser
module.exports = {
  default: {
    ...commonConfig,
    format: [
      'summary',
      'json:reports/chromium/cucumber-report.json'
    ],
    worldParameters: {
      browser: 'chromium',
      baseUrl: playwrightConfig.use.baseURL,  // Read from playwright.config.js
      timeout: playwrightConfig.timeout       // Read from playwright.config.js
    }
  },
  chromium: {
    ...commonConfig,
    format: [
      'summary',
      'json:reports/chromium/cucumber-report.json'
    ],
    worldParameters: {
      browser: 'chromium',
      baseUrl: playwrightConfig.use.baseURL,  // Read from playwright.config.js
      timeout: playwrightConfig.timeout       // Read from playwright.config.js
    }
  },
  firefox: {
    ...commonConfig,
    format: [
      'summary',
      'json:reports/firefox/cucumber-report.json'
    ],
    worldParameters: {
      browser: 'firefox',
      baseUrl: playwrightConfig.use.baseURL,  // Read from playwright.config.js
      timeout: playwrightConfig.timeout       // Read from playwright.config.js
    }
  },
  webkit: {
    ...commonConfig,
    format: [
      'summary',
      'json:reports/webkit/cucumber-report.json'
    ],
    worldParameters: {
      browser: 'webkit',
      baseUrl: playwrightConfig.use.baseURL,  // Read from playwright.config.js
      timeout: playwrightConfig.timeout       // Read from playwright.config.js
    }
  }
};
