// @ts-nocheck
const config = require('../config/playwright.config');

const getBrowserType = () => {
    const BrowserType = config.use?.browserName || 'chromium';
    return BrowserType;
};

function logAction(message) {
    console.log(
        `[${getBrowserType()}] - ${new Date().toLocaleString()} - Action       --- ${message}`
    );
}

function logVerify(message) {
    console.log(
        '\x1b[94m%s\x1b[0m',
        `[${getBrowserType()}] - ${new Date().toLocaleString()} - Verify       --- ${message}`
    );
}

function logInfo(message) {
    console.info(
        '\x1b[35m%s\x1b[0m',
        `[${getBrowserType()}] - ${new Date().toLocaleString()} - Info         --- ${message}`
    );
}

module.exports = {
    logAction,
    logVerify,
    logInfo
};
