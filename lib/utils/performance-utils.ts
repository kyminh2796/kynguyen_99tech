// @ts-nocheck
/**
 * Performance Utilities - Measure page load times, response times, and resource metrics
 */

class PerformanceUtils {
  constructor() {
    this.metrics = {};
    this.thresholds = {
      pageLoad: 3000,        // 3 seconds
      navigationTime: 2000,  // 2 seconds
      domContentLoaded: 1500, // 1.5 seconds
      resourceLoad: 1000,    // 1 second per resource
      apiResponse: 2000      // 2 seconds for API calls
    };
  }

  /**
   * Set custom performance thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get current performance thresholds
   */
  getThresholds() {
    return this.thresholds;
  }

  /**
   * Measure page load time from navigation start
   */
  async measurePageLoadTime(page) {
    const navigationTiming = await page.evaluate(() => {
      return JSON.stringify(window.performance.timing);
    });

    const timing = JSON.parse(navigationTiming);
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

    this.metrics.pageLoadTime = pageLoadTime;
    return {
      pageLoadTime,
      navigationTime: timing.responseEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      resourceLoad: timing.loadEventEnd - timing.responseEnd
    };
  }

  /**
   * Measure navigation time
   */
  async measureNavigationTime(page, url) {
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    const navigationTime = Date.now() - startTime;

    this.metrics.navigationTime = navigationTime;
    return navigationTime;
  }

  /**
   * Measure DOM content loaded time
   */
  async measureDOMContentLoaded(page) {
    const domContentLoadedTime = await page.evaluate(() => {
      return performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    });

    this.metrics.domContentLoadedTime = domContentLoadedTime;
    return domContentLoadedTime;
  }

  /**
   * Measure click response time
   */
  async measureClickResponseTime(page, selector) {
    const startTime = Date.now();
    await page.click(selector);
    await page.waitForLoadState('networkidle');
    const responseTime = Date.now() - startTime;

    this.metrics.clickResponseTime = responseTime;
    return responseTime;
  }

  /**
   * Measure form submission time
   */
  async measureFormSubmissionTime(page, formSelector, submitButtonSelector) {
    const startTime = Date.now();
    await page.click(submitButtonSelector);
    await page.waitForLoadState('networkidle');
    const submissionTime = Date.now() - startTime;

    this.metrics.formSubmissionTime = submissionTime;
    return submissionTime;
  }

  /**
   * Measure API call response time
   */
  async measureAPIResponseTime(apiContext, method, url, data = null) {
    const startTime = Date.now();

    let response;
    if (method === 'GET') {
      response = await apiContext.get(url);
    } else if (method === 'POST') {
      response = await apiContext.post(url, { data });
    } else if (method === 'DELETE') {
      response = await apiContext.delete(url);
    } else if (method === 'PUT') {
      response = await apiContext.put(url, { data });
    }

    const responseTime = Date.now() - startTime;

    this.metrics.apiResponseTime = responseTime;
    return {
      responseTime,
      status: response.status(),
      url
    };
  }

  /**
   * Measure time to first paint
   */
  async measureFirstPaint(page) {
    const firstPaint = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaintEntry = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaintEntry ? firstPaintEntry.startTime : null;
    });

    this.metrics.firstPaint = firstPaint;
    return firstPaint;
  }

  /**
   * Measure time to first contentful paint
   */
  async measureFirstContentfulPaint(page) {
    const fcpTime = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : null;
    });

    this.metrics.firstContentfulPaint = fcpTime;
    return fcpTime;
  }

  /**
   * Get resource load times
   */
  async getResourceLoadTimes(page) {
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType
      }));
    });

    this.metrics.resources = resources;
    return resources;
  }

  /**
   * Get memory usage (if available)
   */
  async getMemoryUsage(page) {
    try {
      const memory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      this.metrics.memory = memory;
      return memory;
    } catch (error) {
      console.warn('Memory API not available:', error.message);
      return null;
    }
  }

  /**
   * Verify metric is within threshold
   */
  verifyMetricWithinThreshold(metricName, actualValue, thresholdKey = null) {
    const threshold = this.thresholds[thresholdKey || metricName];
    
    if (!threshold) {
      throw new Error(`No threshold defined for ${thresholdKey || metricName}`);
    }

    const isWithinThreshold = actualValue <= threshold;
    
    return {
      metricName,
      actualValue,
      threshold,
      isWithinThreshold,
      message: isWithinThreshold 
        ? `✅ ${metricName}: ${actualValue}ms (within ${threshold}ms threshold)`
        : `❌ ${metricName}: ${actualValue}ms (exceeds ${threshold}ms threshold)`
    };
  }

  /**
   * Get all collected metrics
   */
  getAllMetrics() {
    return this.metrics;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {};
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      summary: {
        pageLoadTime: this.metrics.pageLoadTime,
        navigationTime: this.metrics.navigationTime,
        domContentLoadedTime: this.metrics.domContentLoadedTime,
        firstPaint: this.metrics.firstPaint,
        firstContentfulPaint: this.metrics.firstContentfulPaint,
        resourceCount: this.metrics.resources ? this.metrics.resources.length : 0,
        totalResourceSize: this.metrics.resources 
          ? this.metrics.resources.reduce((sum, r) => sum + (r.size || 0), 0) 
          : 0
      }
    };

    return report;
  }

  /**
   * Log performance metrics
   */
  logMetrics(label = 'Performance Metrics') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${label}`);
    console.log(`${'='.repeat(60)}`);
    
    if (this.metrics.pageLoadTime) {
      console.log(`⏱️  Page Load Time: ${this.metrics.pageLoadTime}ms`);
    }
    if (this.metrics.navigationTime) {
      console.log(`🔄 Navigation Time: ${this.metrics.navigationTime}ms`);
    }
    if (this.metrics.domContentLoadedTime) {
      console.log(`📄 DOM Content Loaded: ${this.metrics.domContentLoadedTime}ms`);
    }
    if (this.metrics.firstPaint) {
      console.log(`🎨 First Paint: ${this.metrics.firstPaint}ms`);
    }
    if (this.metrics.firstContentfulPaint) {
      console.log(`✨ First Contentful Paint: ${this.metrics.firstContentfulPaint}ms`);
    }
    if (this.metrics.clickResponseTime) {
      console.log(`👆 Click Response Time: ${this.metrics.clickResponseTime}ms`);
    }
    if (this.metrics.formSubmissionTime) {
      console.log(`📝 Form Submission Time: ${this.metrics.formSubmissionTime}ms`);
    }
    if (this.metrics.apiResponseTime) {
      console.log(`🔌 API Response Time: ${this.metrics.apiResponseTime}ms`);
    }
    if (this.metrics.memory) {
      const memoryMB = (this.metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
      console.log(`💾 Memory Used: ${memoryMB}MB`);
    }
    if (this.metrics.resources) {
      console.log(`📦 Resources Loaded: ${this.metrics.resources.length}`);
    }
    
    console.log(`${'='.repeat(60)}\n`);
  }
}

module.exports = PerformanceUtils;
