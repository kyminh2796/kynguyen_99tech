const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../features',
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true, // Enable parallel execution across browsers
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 3, // Maximum 3 parallel workers (browsers)
  reporter: [],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    headless: true, // Run in headed mode for demos/recording
    slowMo: 800, // Slow down actions by milliseconds (0 = no delay, 500 = slow, 1000 = very slow)
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    actionTimeout: 15000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        channel: 'chrome'
      }
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        browserName: 'firefox'
      }
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        browserName: 'webkit'
      }
    }
  ],
  outputDir: 'test-results/',
  globalSetup: require.resolve('../support/global-setup.ts'),
  globalTeardown: require.resolve('../support/global-teardown.ts')
});
