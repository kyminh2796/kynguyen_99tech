# Playwright BDD + Cucumber + TypeScript Framework

A modern, scalable test automation framework combining **Playwright** with **Behavior-Driven Development (BDD)** using **Cucumber** and **TypeScript**.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/playwright-1.39.0-blue)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/cucumber-9.6.0-green)](https://cucumber.io/)
[![TypeScript](https://img.shields.io/badge/typescript-5.1.6-blue)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [Running Tests](#-running-tests)
- [Viewing Reports](#-viewing-reports)
- [Configuration](#-configuration)
- [Writing Tests](#-writing-tests)
- [Advanced Features](#-advanced-features)
- [Troubleshooting](#-troubleshooting)
- [Steps to Execute Demo Scripts](#-steps-to-execute-demo-scripts)

---

## ✨ Features

- 🎭 **Multi-Browser Support** - Chromium, Firefox, WebKit (Safari)
- 🚀 **Parallel Execution** - Run multiple scenarios concurrently
- 📊 **Browser-Specific Reports** - Separate reports for each browser (no overwriting)
- 🥒 **BDD with Cucumber** - Write tests in natural Gherkin language
- 📸 **Auto Screenshots** - Captures screenshots on test failures
- 🎨 **Custom HTML Reports** - Beautiful, detailed test reports with custom styling
- 🔧 **Single Config Source** - Centralized worker/parallel configuration
- 🌐 **Cross-Platform** - Works on macOS, Windows, Linux
- 📝 **Structured Logging** - Color-coded console output with timestamps
- 🏗️ **Page Object Model** - Clean, maintainable test architecture
- ⚡ **BaseLib** - Reusable Playwright utility functions with element highlighting
- 🔷 **TypeScript Support** - Type-safe development with modern JavaScript features
- 🧪 **Three Test Types** - UI, API, and Performance testing in one framework
- 🎯 **Tag-Based Execution** - Run specific test groups (@regression, @api, @performance)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** `v18.0.0` or higher ([Download](https://nodejs.org/))
- **npm** `v9.0.0` or higher (comes with Node.js)
- **Git** (for cloning the repository)

Check your versions:
```bash
node --version   # Should be v18.0.0 or higher
npm --version    # Should be v9.0.0 or higher
```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npm run install:browsers
```

This will download Chromium, Firefox, and WebKit browsers.

### 3. Verify Installation
```bash
# Run a quick test
npm test
```

If everything is set up correctly, you'll see tests running and a report will be generated.

---

## 📁 Project Structure

```
.
├── config/                          # Configuration files
│   ├── cucumber.config.js          # Cucumber test runner config
│   ├── playwright.config.js        # Playwright browser config (MAIN CONFIG)
│   └── report/                     # Report generation
│       ├── multiple-cucumber-html-reporter.js
│       └── custom-styles.css       # Custom report styling
│
├── features/                        # Gherkin feature files
│   ├── ui/                         # UI test scenarios
│   │   ├── authentication.feature # Login/auth scenarios
│   │   ├── cart.feature          # Shopping cart scenarios
│   │   └── signUp.feature        # User registration scenarios
│   ├── api/                        # API test scenarios
│   ├── ui/                         # UI step definitions
│   │   ├── authentication.steps.ts
│   │   ├── cart.steps.ts
│   │   └── products.steps.ts
│   ├── api/                        # API step definiti
│   ├── ui/                         # UI page objects
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   └── CartPage.ts
│   ├── api/                        # API page objects
│   │   └── APIPts                 # Base Playwright functions with highlighting
│   └── utils/
│       ├── browser-manager.ts     # Browser lifecycle management
│       ├── data-helper.ts         # Test data loading
│       └── performance-utils.ts   # Performance measurement utilitiesions
│   ├── authentication.steps.js
│   ├── cart.steps.js
│   ├── world.ts                   # Custom World (context)
│   ├── global-setup.ts            # Global before all tests
│   └── global-teardown.t           # Page Object Model
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   └── hooks.te.js
│
├── lib/                            # Utilities and helpers
│   ├── baseLib.js                 # Base Playwright functions

│   └── utils/
│       ├── browser-manager.js     # Browser lifecycle management
│       └── data-helper.js         # Test data loading
│
├── support/                        # Test lifecycle
│   ├── world.js                   # Custom World (context)
│   ├── users.json                 # User credentials
│   ├── api.json                   # API endpoints and data
│   └── performance.json           # Performance threshold tests
│   └── global-teardown.js         # Global after all tests
│
├── hooks/                          # Cucumber hooks
│   └── hooks.js                   # Before/After/BeforeAll/AfterAll
│
├── test-data/                      # Test data (JSON)
│   ├── testSite.json              # URLs and site config
│   ├── errorMessages.json         # Expected error messages
│   ├── product.json               # Product information
│   └── cartPage.json              # Cart page elements
│
├── reports/                        # Generated reports (auto-created)
│   ├── chromium/                  # Chromium browser reports
│   │   ├── cucumber-report.json
│   │   ├── html-report/
│   │   │   └── index.html        # 📊 View this in browser
│   │   └── screenshots/          # Failed test screenshots
│   ├── firefox/                   # Firefox browser reports
│   │   ├── cucumber-report.json
│   │   ├── html-report/
│   │   │   └── index.html
│   │   └── screenshots/
│   └── webkit/                    # WebKit browser reports
│       ├── cucumber-report.json
│       ├── html-report/
│       │   └── index.html
│       └── screenshots/
│
├── cucumber.js                     # Cucumber config entry point
├── package.json                    # Dependencies and NPM scripts
└── README.md                       # This file
```

---

## 🏃 Running Tests

### Run All Tests (Default Browser: Chromium)
```bash
npm test
```

**WebKit (Safari)**on Specific Browser

**Chromium (Chrome)**
```bash
npm run test:chromium
```

**Firefox**
```bash
npm run test:firefox
```

│   └── utils/
```bash
npm run test:webkit
```
UI Tests Only
```bash
npm run test:ui                    # UI tests on Chromium
npm run test:ui:all-browsers       # UI tests on all browsers
```

### Run API Tests Only
```bash
npm run test:api                   # API tests on Chromium
npm run test:api:all-browsers      # API tests on all browsers
```

### Run Performance Tests Only
```bash
npm run test:performance           # Performance tests on Chromium
```

### Run Specific Tag
```bash
npm test -- --tags "@regression"
npm test -- --tags "@P0
npm run test:all-browsers
```

### Run with Parallel Execution
```bash
npm run test:parallel
```
This runs up to **3 scenarios concurrently** (configured in `playwright.config.js`).

### Run Specific Tag
```bash
npm test -- --tags "@demo"
```

### Clean Reports Before Running
```bash
npm run clean && npm test
```

---

## 📊 Viewing Reports

After running tests, reports are automatically generated in browser-specific folders.

### HTML Reports

Each browser has its own HTML report:

**Chromium Report:**
```bash
open reports/chromium/html-report/index.html
```

**Firefox Report:**
```bash
open reports/firefox/html-report/index.html
```

**WebKit Report:**
```bash
open reports/webkit/html-report/index.html
```

### Report Contents

Each report includes:tru
- ✅ **Test Results** - Pass/Fail status for each scenario
- 📊 **Execution Time** - Duration of each step and scenario
- 🏷️ **Tags** - Scenario tags (e.g., @demo, @smoke)
- 📸 **Screenshots** - Attached for failed scenarios
- 🖥️ **System Info** - Browser version, OS, platform
- ⏰ **Timestamps** - Execution start and end times

### Screenshots

Failed test sctrue, ots are saved in:
```
reports/{browser}/screenshots/failed-{scenario-name}-{timestamp}.png
```

Example:
```
reports/chromium/screenshots/failed-Login-with-invalid-credentials-2025-10-03T10-30-45-123Z.png
```

---

## ⚙️ Configuration

### Main Configuration: `config/playwright.config.js`

This is the **single source of truth** for all test configuration:

**📍 Key Configuration Lines:**
- **Line 12**: `workers: 3` - Number of parallel scenarios
- **Line 18**: `headless: false` - Browser visibility 
- **Line 19**: `slowMo: 800` - Test execution speed
- **Line 20**: `viewport: { width: 1280, height: 720 }` - Browser window size

**🔧 Configuration Parameters Explained:**

```javascripttrue`** - Browser window visibility
  - `false` = Browser window visible (debugging, recording)
  - `true` = Browser runs in background (faster, CI/CD) - Current settingarios (1-10)
  use: {
    headless: false,       // ⬅️ Line 18: Browser visibility
    slowMo: 800,           // ⬅️ Line 19: Speed delay (0-1000+)
    viewport: { width: 1280, height: 720 }, // ⬅️ Line 20: Window size
    screenshot: 'only-on-failure',
    baseURL: process.env.BASE_URL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

**📊 Parameter Meanings:**

- **`workers: 3`** - Run 3 test scenarios simultaneously
  - `1` = Sequential (one at a time)
  - `3` = Current setting (3 parallel)
  - `5+` = More parallel (needs more CPU/RAM)

- **`headless: false`** - Browser window visibility
  - `false` = Browser window visible (debugging)
  - `true` = Browser runs in background (faster, CI/CD)

- **`slowMo: 800`** - Delay between actions (milliseconds)
  - `0` = No delay (fastest)
  - `500` = Slow (good for watching)
  - `800` = Current setting (very slow, good for demo)
  - `1000+` = Very slow (detailed observation)

- **`viewport: { width: 1280, height: 720 }`** - Browser window size
  - `1280x720` = HD resolution (current)
  - `1920x1080` = Full HD (larger, more detailed)
  - `800x600` = Smaller window (faster, less detailed)

### How to Modify Configuration

1. Open file: `config/playwright.config.js`
3. Change to: `headless: true,` (for headless mode)
4. Save file and run tests: `npm run test:all-browsers`

**🎯 Purpose:** Control whether browser window is visible during test execution

1. Open file: `config/playwright.config.js`
2. Go to line 19: `slowMo: 800,`
3. Change to desired value:
   - `slowMo: 0,` (fastest - no delay)
   - `slowMo: 1000,` (very slow - for detailed demo)
4. Save file and run tests: `npm run test:all-browsers`

**📁 File location:** `config/playwright.config.js` - Line 19

1. Open file: `config/playwright.config.js`
2. Go to line 12: `workers: 3,`
3. Change to desired value:
   - `workers: 1,` (sequential - one at a time)
   - `workers: 3,` (current - 3 parallel)
   - `workers: 5,` (more parallel - needs more resources)
4. Save file and run tests: `npm run test:all-browsers`

**📁 File location:** `config/playwright.config.js` - Line 12
**🎯 Purpose:** Control number of parallel test scenarios

**🔧 To change browser window size:**
1. Open file: `config/playwright.config.js`
2. Go to line 20: `viewport: { width: 1280, height: 720 },`
3. Change to desired size:
   - `viewport: { width: 1920, height: 1080 },` (Full HD)
   - `viewport: { width: 800, height: 600 },` (Smaller)
   - `viewport: { width: 1366, height: 768 },` (Laptop size)
4. Save file and run tests: `npm run test:all-browsers`

**📁 File location:** `config/playwright.config.js` - Line 20
**🎯 Purpose:** Control browser window size during test execution

### Cucumber Configuration: `config/cucumber.config.js`

This automatically syncs with Playwright config:
```javascript
const playwrightConfig = require('./playwright.config');

module.exports = {
  default: {
    parallel: playwrightConfig.workers,  // Auto-synced!
  }
};
```

---

## ✍️ Writing Tests

### 1. Create a Feature File

`features/example.feature`
```gherkin
Feature: User Login
  As a user
  I want to login to the application
  So that I can access my account

  @demo
  Scenario: Successful login
    When I enter username "standard_user" and password "secret_sauce"
    And I click the login button
    Then I should be redirected to the inventory page
```

```javascript
const { expect } = require('@playwright/test');
const LoginPagui/LoginPage.ts`
```typescript
const BaseLib = require('../../lib/baseLib');

class LoginPage extends BaseLib {
  constructor(page) {
    super(page);
    
    this.selectors = {
      loginButton: '#login2',
      usernameInput: '#loginusername',
      passwordInput: '#loginpassword',
      loginSubmitButton: "//button[text()='Log in']",
      logoutButton: '#logout2',
    };
  }

  async login(username: string, password: string) {
    await this.clickElement(this.selectors.loginButton);
    await this.fillInput(this.selectors.usernameInput, username);
    await this.fillInput(this.selectors.passwordInput, password);
    await this.clickElement(this.selectors.loginSubmitButton);
  }

  async clickLogout() {
    await this.clickElement(this.selectors.logoutButton);
  }
}

module.exports = LoginPage;
```

### 4. Create Test Data`page-objects/LoginPage.js`
```javascript
const BaseLib = require('../lib/baseLib');
standardUser": {
    "username": "testuser123",
    "password": "TestPass123!"
  },
  "invalidUser": {
    "username": "nonexistentuser999",
    "password": "WrongPassword!"
  }
}
```

---

## 🔥 Advanced Features

### Framework Architecture & Rationale

This framework is designed with the following principles:

1. **Separation of Concerns**: Tests are organized by that automatically highlight elements:

```typescript
await this.navigateTo(url);                    // Navigate to URL with networkidle
await this.clickElement(selector);             // Click with highlight + wait
await this.fillInput(selector, text);          // Fill input with highlight + wait
await this.getText(selector);                  // Get text with highlight + wait
await this.isElementVisible(selector);         // Check visibility
await this.isElementEnabled(selector);         // Check if enabled
await this.getElementCount(selector);          // Count matching elements
await this.waitForElement(selector, options);  // Explicit wait for element
await this.highlightElement(selector);         // Highlight element with green border and "AutomationTest" label
```

**Etypescript
const DataHelper = require('../lib/utils/data-helper');

// Load user credentials
const users = DataHelper.loadTestData('users.json');
const user = users.standardUser;

// Load product data
const productData = DataHelper.loadTestData('product.json');
const product = productData.productsByName['Samsung Galaxy S6'];

/regression @functional @P0
Scenario: Login with valid credentials
  # Tags appear as colored badges in the report
  # Priority tags: @P0 (Critical), @P1 (High), @P2 (Medium)
  # Type tags: @functional, @negative, @edge, @api, @performance
```

### Test Organization

Tests are organized by priority and type:
- **@P0**: Critical tests (blockers)
- **@P1**: High priority tests
- **@P2**: Medium priority tests
- **@regression**: All regression tests
- **@functional**: Positive test cases
- **@negative**: Negative test cases
- **@api**: API tests
- **@performance**: Performance tests
- **@ui**: UI tests

### Performance Testing

The framework includes built-in performance testing capabilities:

```typescript
const PerformanceUtils = require('../lib/utils/performance-utils');

// Measure page load time
const loadTime = await PerformanceUtils.measurePageLoadTime(page);

// Measure navigation timing
const navTiming = await PerformanceUtils.getNavigationTiming(page);

// Check performance thresholds
const thresholds = DataHelper.loadTestData('performance.json');
expect(loadTime).toBeLessThan(thresholds.pageLoadTime);
```

### API Testing

Test REST APIs using Playwright's API context:

```typescript
// API request context is automatically available in CustomWorld
const response = await this.apiRequest.get('/api/products');
expect(response.status()).toBe(200);

const data = await response.json();
expect(data).toHaveLength(9)
  async clickLogin() {
    await this.clickElement(this.selectors.loginButton);
  }


`test-data/users.json`
```json
{
  "validUser": {
    "username": "standard_user",
    "password": "secret_sauce"
  },
  "lockedUser": {
    "username": "locked_out_user",
    "password": "secret_sauce"
  }
}

---

## 🔥 Advanced Features




### BaseLib Utilities

All Page Objects extend `BaseLib` with common methods:
```javascript
await this.navigateTo(url);
await this.clickElement(selector);
await this.fillInput(selector, text);
await this.getText(selector);
await this.isElementVisible(selector);
await this.isElementEnabled(selector);
await this.getElementCount(selector);
```

### Data Helper

Load test data from JSON files:
```javascript
const DataHelper = require('../lib/utils/data-helper');

const productData = DataHelper.loadTestData('product.json');
const product = productData.productsByName['Sauce Labs Backpack'];
```
Ky Nguyen
### Dynamic Tags in Reports

Tags are automatically displayed in HTML reports with custom styling:
```gherkin
@demo @smoke @critical
Scenario: Important test case
  # Tags appear as purple badges in the report
```

---

## 🐛 Troubleshooting

### Tests Not Found
**Problem:** `cucumber-js` can't find step definitions

**Solution:**
```bash
# Check that cucumber.js exists in root
cat cucumber.js

# Should show:
# module.exports = require('./config/cucumber.config.js');
```

### No Report Generated
**Problem:** HTML report not created after test run

**Solution:**
```bash
# Manually generate report
npm run report:html

# Check if JSON report exists
ls -la reports/chromium/cucumber-report.json
```

### Browsers Not Opening (Headless Issue)
**Problem:** Browser windows not visible during test

**Solution:**
1. Open `config/playwright.config.js`
2. Change `headless: true` to `headless: false`
3. Save and run tests again

### Node.js Version Error
**Problem:** `Error: Playwright requires Node.js 18 or higher`

**Solution:**
```bash
# Check version
node --version

# If < v18, install Node.js 18+
# Using nvm (recommended):
nvm install 18
nvm use 18
```

### Parallel Tests Not Working
**Problem:** Only 1 scenario runs at a time

**Solution:**
1. Check `config/playwright.config.js` → `workers: 3`
2. Ensure you have 3+ scenarios with `@demo` tag
3. Run: `npm run test:parallel`

---

## 📚 Resources

- **Playwright Documentation:** https://playwright.dev/
- **Cucumber.js Documentation:** https://github.com/cucumber/cucumber-js
- **Gherkin Reference:** https://cucumber.io/docs/gherkin/
- **BDD Best Practices:** https://cucumber.io/docs/bdd/

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests following BDD principles
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## 📄 License

This project is for educational and practice purposes.

---

## 👨‍💻 Author

**Cuong Huynh**

---

## 🎯 Quick Start Summary

```bash
# 1. Install dependencies
npm install && npm run install:browsers

# 2. Run all tests (Chromium)
npm test

# 3. Run UI tests only
npm run test:ui

# 4. Run API tests only
npm run test:api

# 5. Run performance tests
npm run test:performance

# 6. Run on all browsers
npm run test:all-browsers

# 7. View report (opens in browser)
open reports/chromium/html-report/index.html
```

---

## 🚀 Steps to Execute Demo Scripts

### Option 1: Run Complete Test Suite

Execute all tests (UI, API, and Performance) on Chromium:

```bash
npm test
```

**What happens:**
1. Launches Chromium browser
2. Executes all feature files from UI, API, and Performance tests
3. Runs up to 3 scenarios in parallel
4. Generates HTML report automatically
5. Saves screenshots for failed tests

**Expected output:**
```
> playwright-bdd-cucumber-framework@1.0.0 test
> cucumber-js --require-module ts-node/register --profile chromium

✅ Scenario: L-01 Login with valid username and password
✅ Scenario: C-01 Add single product to cart
✅ Scenario: API-01 Verify API is healthy
...

XX scenarios (XX passed)
XX steps (XX passed)
```

### Option 2: Run Specific Test Types

**UI Tests Only:**
```bash
npm run test:ui
```
Executes only UI scenarios (authentication, cart, sign-up features)

**API Tests Only:**
```bash
npm run test:api
```
Executes only API scenarios (REST API testing)

**Performance Tests Only:**
```bash
npm run test:performance
```
Executes only performance scenarios (load time, metrics)

### Option 3: Run on All Browsers

Execute tests on Chromium, Firefox, and WebKit sequentially:

```bash
npm run test:all-browsers
```

**What happens:**
1. Runs all tests on Chromium → generates reports/chromium/
2. Runs all tests on Firefox → generates reports/firefox/
3. Runs all tests on WebKit → generates reports/webkit/
4. Each browser gets separate reports and screenshots

### Option 4: Run Specific Priority Tests

**Critical Tests Only (P0):**
```bash
npm test -- --tags "@P0"
```

**High Priority Tests (P1):**
```bash
npm test -- --tags "@P1"
```

**Regression Suite:**
```bash
npm run test:regression
```

### Option 5: Run Single Feature File

```bash
npm run test:feature features/ui/authentication.feature
```

### Viewing Test Results

After running tests, view the HTML report:

**Chromium Report:**
```bash
open reports/chromium/html-report/index.html
```

**Firefox Report:**
```bash
open reports/firefox/html-report/index.html
```

**WebKit Report:**
```bash
open reports/webkit/html-report/index.html
```

**Or manually navigate to:**
```
automationCode/reports/{browser}/html-report/index.html
```

### Clean Up Before Running

Remove old reports and start fresh:

```bash
npm run clean && npm test
```

### Troubleshooting Demo Execution

**Issue: Tests fail with "browser not found"**
```bash
# Solution: Install browsers
npm run install:browsers
```

**Issue: TypeScript compilation errors**
```bash
# Solution: Ensure TypeScript is installed
npm install
```

**Issue: No report generated**
```bash
# Solution: Manually generate report
npm run report:html
```

**Issue: Want to see browser during execution**
```bash
# Solution: Edit config/playwright.config.js
# Change: headless: true → headless: false
```

---

**Happy Testing! 🎭🥒✨**
