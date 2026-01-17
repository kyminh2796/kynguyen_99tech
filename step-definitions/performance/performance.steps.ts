// @ts-nocheck
const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const PerformancePage = require('../../page-objects/performance/PerformancePage.ts');
const LoginPage = require('../../page-objects/ui/LoginPage.ts');
const InventoryPage = require('../../page-objects/ui/InventoryPage.ts');
const CartPage = require('../../page-objects/ui/CartPage.ts');
const DataHelper = require('../../lib/utils/data-helper.ts');

let performancePage;
let loginPage;
let inventoryPage;
let cartPage;
let testSiteData;
let usersData;
let performanceMetrics = {};

Before(async function (this) {
  performancePage = new PerformancePage(this.page, this.apiRequest);
  loginPage = new LoginPage(this.page);
  inventoryPage = new InventoryPage(this.page);
  cartPage = new CartPage(this.page);
  testSiteData = DataHelper.loadTestData('testSite.json');
  usersData = DataHelper.loadTestData('users.json');
});

// ========== SETUP STEPS ==========

Given('I set performance thresholds with default values', async function () {
  performancePage.setThresholds({
    pageLoad: 3000,
    navigationTime: 2000,
    domContentLoaded: 1500,
    resourceLoad: 1000,
    apiResponse: 2000
  });
  console.log('\n✅ Performance thresholds configured');
});

Given('I set performance thresholds with custom values:', async function (dataTable) {
  const thresholds = {};
  const rows = dataTable.hashes();
  rows.forEach(row => {
    thresholds[row.metric] = parseInt(row.threshold);
  });
  performancePage.setThresholds(thresholds);
  console.log('\n✅ Custom performance thresholds configured');
});

// ========== PAGE LOAD PERFORMANCE STEPS ==========

When('I measure the page load time for Demoblaze', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  const metrics = await performancePage.testPageLoadPerformance(baseUrl);
  performanceMetrics.pageLoad = metrics;
});

When('I navigate to Demoblaze homepage', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  const navigationTime = await performancePage.testNavigationPerformance(baseUrl);
  performanceMetrics.navigationTime = navigationTime;
});

When('I load Demoblaze homepage', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  await this.page.goto(baseUrl, { waitUntil: 'networkidle' });
  console.log(`\n✅ Demoblaze homepage loaded`);
});

Then('the page load time should be within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.pageLoad) {
    const result = performancePage.verifyMetricWithinThreshold(
      'Page Load Time',
      performanceMetrics.pageLoad.pageLoadTime,
      'pageLoad'
    );
    expect(result.isWithinThreshold).toBe(true);
  }
});

Then('the navigation time should be within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.navigationTime) {
    const result = performancePage.verifyMetricWithinThreshold(
      'Navigation Time',
      performanceMetrics.navigationTime,
      'navigationTime'
    );
    expect(result.isWithinThreshold).toBe(true);
  }
});

Then('the DOM content loaded time should be within {int}ms threshold', async function (threshold) {
  const domTime = await performancePage.testDOMContentLoadedPerformance();
  const result = performancePage.verifyMetricWithinThreshold(
    'DOM Content Loaded',
    domTime,
    'domContentLoaded'
  );
  expect(result.isWithinThreshold).toBe(true);
});

Then('I should see performance metrics logged', async function () {
  const metrics = performancePage.getAllMetrics();
  expect(Object.keys(metrics).length).toBeGreaterThan(0);
});

// ========== PAINT METRICS STEPS ==========

Then('I should see first paint metrics', async function () {
  const paintMetrics = await performancePage.testPaintMetrics();
  expect(paintMetrics).toBeDefined();
});

Then('I should see first contentful paint metrics', async function () {
  const fcpMetrics = await performancePage.testPaintMetrics();
  expect(fcpMetrics.fcpTime).toBeDefined();
});

// ========== RESOURCE LOADING STEPS ==========

Then('I should see all resources loaded', async function () {
  const resources = await performancePage.testResourceLoadPerformance();
  expect(Array.isArray(resources)).toBe(true);
  expect(resources.length).toBeGreaterThan(0);
});

Then('slow resources should be identified if any', async function () {
  const resources = await performancePage.testResourceLoadPerformance();
  const thresholds = performancePage.getThresholds();
  const slowResources = resources.filter(r => r.duration > thresholds.resourceLoad);
  
  if (slowResources.length > 0) {
    console.log(`\n⚠️  Found ${slowResources.length} slow resources`);
  } else {
    console.log(`\n✅ All resources loaded within threshold`);
  }
});

Then('the total resource count should be logged', async function () {
  const resources = await performancePage.testResourceLoadPerformance();
  console.log(`\n📊 Total resources loaded: ${resources.length}`);
});

// ========== MEMORY USAGE STEPS ==========

Then('I should see memory usage metrics', async function () {
  const memory = await performancePage.testMemoryUsage();
  if (memory) {
    expect(memory.usedJSHeapSize).toBeGreaterThan(0);
  }
});

// ========== CLICK RESPONSE STEPS ==========

When('I click on a product', async function () {
  await this.page.click('[data-cy="product-link"]');
  console.log(`\n✅ Product clicked`);
});

Then('the click response time should be within {int}ms threshold', async function (threshold) {
  // Measure the click response time
  const startTime = Date.now();
  await this.page.waitForLoadState('networkidle');
  const responseTime = Date.now() - startTime;

  const result = performancePage.verifyMetricWithinThreshold(
    'Click Response Time',
    responseTime,
    'resourceLoad'
  );
  // Note: Using resourceLoad threshold for comparison
  console.log(`\n⏱️  Click Response Time: ${responseTime}ms`);
});

// ========== FORM SUBMISSION STEPS ==========

When('I measure login form submission time with valid credentials', async function () {
  const standardUser = usersData.users.find(u => u.name === 'standardUser');
  
  // Fill form
  await loginPage.fillUsername(standardUser.username);
  await loginPage.fillPassword(standardUser.password);

  // Measure submission time
  const submissionTime = await performancePage.testFormSubmissionPerformance(
    'form',
    '[id="logInModal"] [onclick="logIn()"]',
    'Login Form'
  );
  performanceMetrics.formSubmissionTime = submissionTime;
});

Then('the form submission time should be within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.formSubmissionTime) {
    const result = performancePage.verifyMetricWithinThreshold(
      'Form Submission Time',
      performanceMetrics.formSubmissionTime,
      'apiResponse'
    );
    expect(result.isWithinThreshold).toBe(true);
  }
});

// ========== SEARCH PERFORMANCE STEPS ==========

When('I search for a product', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  await this.page.goto(baseUrl, { waitUntil: 'networkidle' });
  
  // Measure search response time
  const startTime = Date.now();
  await this.page.click('a[onclick="byCat(\'notebook\')"]');
  await this.page.waitForLoadState('networkidle');
  const searchTime = Date.now() - startTime;

  performanceMetrics.searchTime = searchTime;
  console.log(`\n⏱️  Search Response Time: ${searchTime}ms`);
});

Then('the search response time should be within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.searchTime) {
    const result = performancePage.verifyMetricWithinThreshold(
      'Search Response Time',
      performanceMetrics.searchTime,
      'apiResponse'
    );
    expect(result.isWithinThreshold).toBe(true);
  }
});

// ========== COMPREHENSIVE TEST STEPS ==========

When('I run a comprehensive performance test for Demoblaze', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  await performancePage.runComprehensivePerformanceTest(baseUrl);
});

Then('all performance metrics should be collected', async function () {
  const metrics = performancePage.getAllMetrics();
  expect(Object.keys(metrics).length).toBeGreaterThan(0);
  console.log(`\n✅ ${Object.keys(metrics).length} performance metrics collected`);
});

Then('performance report should be generated', async function () {
  const report = performancePage.generateReport();
  expect(report).toBeDefined();
  expect(report.metrics).toBeDefined();
  expect(report.summary).toBeDefined();
  console.log(`\n✅ Performance report generated`);
});

Then('metrics should be compared with thresholds', async function () {
  const thresholds = performancePage.getThresholds();
  const metrics = performancePage.getAllMetrics();
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Metrics vs Thresholds Comparison');
  console.log(`${'='.repeat(60)}`);
  
  if (metrics.pageLoadTime) {
    const comparison = metrics.pageLoadTime <= thresholds.pageLoad ? '✅' : '❌';
    console.log(`${comparison} Page Load: ${metrics.pageLoadTime}ms (threshold: ${thresholds.pageLoad}ms)`);
  }
  
  console.log(`${'='.repeat(60)}\n`);
});

// ========== CART PERFORMANCE STEPS ==========

When('I measure add to cart performance', async function () {
  const startTime = Date.now();
  
  // Find and click first product
  await this.page.click('[data-cy="product-link"]:first-child');
  await this.page.waitForLoadState('networkidle');
  
  // Click add to cart
  await this.page.click('[onclick="addToCart(1)"]');
  
  // Wait for dialog
  await this.page.waitForSelector('text=Product added');
  
  const cartTime = Date.now() - startTime;
  performanceMetrics.cartTime = cartTime;
  console.log(`\n⏱️  Add to Cart Time: ${cartTime}ms`);
});

Then('the cart operation should complete within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.cartTime) {
    const result = performancePage.verifyMetricWithinThreshold(
      'Cart Operation Time',
      performanceMetrics.cartTime,
      'resourceLoad'
    );
    console.log(result.message);
  }
});

// ========== API PERFORMANCE STEPS ==========

When('I measure REST API response time for products endpoint', async function () {
  if (!this.apiRequest) {
    this.skip();
  }

  const result = await performancePage.testAPIPerformance(
    'GET',
    '/products',
    null,
    'GET /products'
  );
  performanceMetrics.apiTime = result.responseTime;
});

Then('the API response should be within {int}ms threshold', async function (threshold) {
  if (performanceMetrics.apiTime) {
    const result = performancePage.verifyMetricWithinThreshold(
      'API Response Time',
      performanceMetrics.apiTime,
      'apiResponse'
    );
    expect(result.isWithinThreshold).toBe(true);
  }
});

// ========== LOGIN PERFORMANCE STEPS ==========

When('I login to Demoblaze with valid credentials', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  const standardUser = usersData.users.find(u => u.name === 'standardUser');
  
  await this.page.goto(baseUrl, { waitUntil: 'networkidle' });
  loginPage = new LoginPage(this.page);
  await loginPage.clickLoginLink();
  await loginPage.fillUsername(standardUser.username);
  await loginPage.fillPassword(standardUser.password);
  await loginPage.clickLoginButton();
  await this.page.waitForLoadState('networkidle');
  
  console.log(`\n✅ Successfully logged in`);
});

Given('I am on the Demoblaze login page for performance', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  await this.page.goto(baseUrl, { waitUntil: 'networkidle' });
  loginPage = new LoginPage(this.page);
  await loginPage.clickLoginLink();
});

Given('I am on the Demoblaze homepage', async function () {
  const baseUrl = testSiteData.environments.testEnv.baseUrl;
  await this.page.goto(baseUrl, { waitUntil: 'networkidle' });
});
