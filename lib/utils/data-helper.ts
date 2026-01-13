// @ts-nocheck
const fs = require('fs');
const path = require('path');

class DataHelper {
  static loadTestData(fileName) {
    const filePath = path.join(process.cwd(), 'test-data', fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Test data file not found: ${filePath}`);
    }

    const fileExtension = path.extname(fileName).toLowerCase();
    const fileContent = fs.readFileSync(filePath, 'utf8');

    switch (fileExtension) {
      case '.json':
        return JSON.parse(fileContent);
      case '.csv':
        return this.parseCsv(fileContent);
      case '.txt':
        return fileContent.split('\n').filter(line => line.trim());
      default:
        return fileContent;
    }
  }

  static parseCsv(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  }

  static saveTestData(fileName, data) {
    const filePath = path.join(process.cwd(), 'test-data', fileName);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const fileExtension = path.extname(fileName).toLowerCase();
    let content;

    switch (fileExtension) {
      case '.json':
        content = JSON.stringify(data, null, 2);
        break;
      case '.csv':
        content = this.convertToCsv(data);
        break;
      default:
        content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }

  static convertToCsv(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header] || '').join(','))
    ];

    return csvContent.join('\n');
  }

  static getEnvironmentData() {
    // Get config from playwright.config.js (single source of truth)
    const playwrightConfig = require('../../config/playwright.config');
    return {
      baseUrl: process.env.BASE_URL,
      browser: process.env.BROWSER || 'chromium',
      headless: playwrightConfig.use.headless,
      timeout: playwrightConfig.timeout,
      retries: playwrightConfig.retries,
      parallel: playwrightConfig.workers
    };
  }

}

module.exports = DataHelper;
