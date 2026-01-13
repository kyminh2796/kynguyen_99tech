// @ts-nocheck
const { Before, After } = require('@cucumber/cucumber');

Before(async function () {
  // Initialize world/browser before each scenario
  if (this.init) {
    await this.init();
  }
});

After(async function (scenario) {
  // On failure, take screenshot and attach to report
  if (scenario.result && scenario.result.status === 'FAILED') {
    try {
      const screenshotPath = await this.takeScreenshot(scenario.pickle.name || 'failure');
      if (screenshotPath && this.attach) {
        const fs = require('fs');
        const content = fs.readFileSync(screenshotPath);
        await this.attach(content, 'image/png');
      }
    } catch (e) {
      // ignore screenshot failures
    }
  }

  if (this.cleanup) {
    await this.cleanup();
  }
});
