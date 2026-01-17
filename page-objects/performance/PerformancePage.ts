// @ts-nocheck
const PerformanceUtils = require('../../lib/utils/performance-utils.ts');

/**
 * PerformancePage - Page Object for Performance Testing
 */
class PerformancePage {
  constructor(page, apiRequest = null) {
    this.page = page;
    this.apiRequest = apiRequest;
    this.performanceUtils = new PerformanceUtils();
  }

  /**
   * Set custom performance thresholds
   */
  setThresholds(thresholds) {
    this.performanceUtils.setThresholds(thresholds);
  }

  /**
   * Get current thresholds
   */
  getThresholds() {
    return this.performanceUtils.getThresholds();
  }

  /**
   * Test page load performance
   */
  async testPageLoadPerformance(url) {
    const metrics = await this.performanceUtils.measurePageLoadTime(this.page);
    this.performanceUtils.logMetrics('Page Load Performance');
    return metrics;
  }

  /**
   * Test navigation performance
   */
  async testNavigationPerformance(url) {
    const navigationTime = await this.performanceUtils.measureNavigationTime(this.page, url);
    this.performanceUtils.logMetrics('Navigation Performance');
    return navigationTime;
  }

  /**
   * Test click response performance
   */
  async testClickPerformance(selector, actionName = 'Click') {
    const responseTime = await this.performanceUtils.measureClickResponseTime(this.page, selector);
    console.log(`\n⏱️  ${actionName} Response Time: ${responseTime}ms\n`);
    return responseTime;
  }

  /**
   * Test form submission performance
   */
  async testFormSubmissionPerformance(formSelector, submitButtonSelector, formName = 'Form') {
    const submissionTime = await this.performanceUtils.measureFormSubmissionTime(
      this.page,
      formSelector,
      submitButtonSelector
    );
    console.log(`\n⏱️  ${formName} Submission Time: ${submissionTime}ms\n`);
    return submissionTime;
  }

  /**
   * Test API call performance
   */
  async testAPIPerformance(method, url, data = null, apiName = 'API Call') {
    if (!this.apiRequest) {
      throw new Error('API Request context not available');
    }

    const result = await this.performanceUtils.measureAPIResponseTime(
      this.apiRequest,
      method,
      url,
      data
    );
    console.log(`\n🔌 ${apiName} Response Time: ${result.responseTime}ms\n`);
    return result;
  }

  /**
   * Test DOM content loaded time
   */
  async testDOMContentLoadedPerformance() {
    const domTime = await this.performanceUtils.measureDOMContentLoaded(this.page);
    console.log(`\n📄 DOM Content Loaded Time: ${domTime}ms\n`);
    return domTime;
  }

  /**
   * Test first paint and first contentful paint
   */
  async testPaintMetrics() {
    const firstPaint = await this.performanceUtils.measureFirstPaint(this.page);
    const fcpTime = await this.performanceUtils.measureFirstContentfulPaint(this.page);

    console.log(`\n🎨 First Paint: ${firstPaint || 'N/A'}ms`);
    console.log(`✨ First Contentful Paint: ${fcpTime || 'N/A'}ms\n`);

    return { firstPaint, fcpTime };
  }

  /**
   * Test resource loading performance
   */
  async testResourceLoadPerformance() {
    const resources = await this.performanceUtils.getResourceLoadTimes(this.page);

    console.log(`\n📦 Resource Loading Performance`);
    console.log(`Total Resources: ${resources.length}`);

    const slowResources = resources.filter(r => r.duration > this.performanceUtils.getThresholds().resourceLoad);
    if (slowResources.length > 0) {
      console.log(`⚠️  Slow Resources (>${this.performanceUtils.getThresholds().resourceLoad}ms):`);
      slowResources.forEach(r => {
        console.log(`   - ${r.name}: ${r.duration.toFixed(2)}ms`);
      });
    }
    console.log();

    return resources;
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    const memory = await this.performanceUtils.getMemoryUsage(this.page);

    if (memory) {
      const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`\n💾 Memory Usage`);
      console.log(`Used: ${usedMB}MB / ${totalMB}MB\n`);
    }

    return memory;
  }

  /**
   * Verify metric is within threshold
   */
  verifyMetricWithinThreshold(metricName, actualValue, thresholdKey = null) {
    const result = this.performanceUtils.verifyMetricWithinThreshold(
      metricName,
      actualValue,
      thresholdKey
    );
    console.log(result.message);
    return result;
  }

  /**
   * Run comprehensive performance test
   */
  async runComprehensivePerformanceTest(url) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`COMPREHENSIVE PERFORMANCE TEST`);
    console.log(`URL: ${url}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`${'='.repeat(70)}\n`);

    const results = {};

    try {
      console.log('📊 Measuring page metrics...');
      results.pageLoad = await this.testPageLoadPerformance(url);
      
      console.log('🎨 Measuring paint metrics...');
      results.paint = await this.testPaintMetrics();
      
      console.log('📦 Measuring resource loading...');
      results.resources = await this.testResourceLoadPerformance();
      
      console.log('💾 Measuring memory usage...');
      results.memory = await this.testMemoryUsage();

      console.log(`${'='.repeat(70)}`);
      console.log('Performance Report Generated Successfully');
      console.log(`${'='.repeat(70)}\n`);
    } catch (error) {
      console.error('Error during performance test:', error);
      throw error;
    }

    return results;
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics() {
    return this.performanceUtils.getAllMetrics();
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.performanceUtils.resetMetrics();
  }

  /**
   * Generate performance report
   */
  generateReport() {
    return this.performanceUtils.generateReport();
  }
}

module.exports = PerformancePage;
