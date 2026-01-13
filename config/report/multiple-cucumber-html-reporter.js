const report = require('multiple-cucumber-html-reporter');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Auto-detect all browsers that have reports
const detectBrowsersWithReports = () => {
    const reportsDir = 'reports';
    const browsers = [];
    
    if (!fs.existsSync(reportsDir)) {
        console.log('⚠️ No reports directory found');
        return browsers;
    }
    
    const items = fs.readdirSync(reportsDir);
    
    items.forEach(item => {
        const itemPath = path.join(reportsDir, item);
        const jsonPath = path.join(itemPath, 'cucumber-report.json');
        
        // Check if it's a directory and has cucumber-report.json
        if (fs.statSync(itemPath).isDirectory() && fs.existsSync(jsonPath)) {
            browsers.push(item);
        }
    });
    
    return browsers;
};

// Get dynamic system information
const getSystemInfo = () => {
    const platform = os.platform();
    const release = os.release();
    const arch = os.arch();
    const hostname = os.hostname();
    const userInfo = os.userInfo();
    
    return {
        platform: platform,
        release: release,
        arch: arch,
        hostname: hostname,
        username: userInfo.username
    };
};

// Get platform name and version for display
const getPlatformInfo = () => {
    const platform = os.platform();
    const release = os.release();
    
    switch (platform) {
        case 'darwin':
            // Get macOS version
            try {
                const { execSync } = require('child_process');
                const version = execSync('sw_vers -productVersion', { encoding: 'utf8' }).trim();
                return `macOS ${version}`;
            } catch (error) {
                return 'macOS';
            }
        case 'win32':
            // Get Windows version
            try {
                const { execSync } = require('child_process');
                const version = execSync('ver', { encoding: 'utf8' });
                if (version.includes('10.0.22000') || version.includes('10.0.22621')) {
                    return 'Windows 11';
                } else if (version.includes('10.0.19041') || version.includes('10.0.19042') || version.includes('10.0.19043') || version.includes('10.0.19044')) {
                    return 'Windows 10';
                } else {
                    return 'Windows';
                }
            } catch (error) {
                return 'Windows';
            }
        case 'linux':
            // Get Linux distribution
            try {
                const { execSync } = require('child_process');
                const version = execSync('lsb_release -d', { encoding: 'utf8' });
                if (version.includes('Ubuntu')) {
                    const ubuntuVersion = version.match(/Ubuntu (\d+\.\d+)/);
                    return ubuntuVersion ? `Ubuntu ${ubuntuVersion[1]}` : 'Ubuntu';
                }
                return 'Linux';
            } catch (error) {
                return 'Linux';
            }
        default:
            return platform;
    }
};

// Get standard platform name for multiple-cucumber-html-reporter icons
const getStandardPlatformName = (platform) => {
    switch (platform) {
        case 'darwin':
            return 'osx'; // multiple-cucumber-html-reporter uses 'osx' for macOS logo
        case 'win32':
            return 'windows'; // multiple-cucumber-html-reporter uses 'windows' for Windows logo
        case 'linux':
            return 'linux'; // multiple-cucumber-html-reporter uses 'linux' for Linux logo
        default:
            return 'linux'; // fallback
    }
};

// Get browser info from environment or default
const getBrowserInfo = () => {
    const browser = process.env.BROWSER || 'chromium';
    let browserName = browser;
    
    // Map browser names
    if (browser === 'chromium') browserName = 'chrome';
    if (browser === 'webkit') browserName = 'safari';
    
    return {
        name: browserName,
        version: 'latest'
    };
};

// Get browser info with version in format "Chrome 114.0"
const getBrowserWithVersion = (browserName) => {
    try {
        const { execSync } = require('child_process');
        
        switch (browserName) {
            case 'chrome':
                if (process.platform === 'darwin') {
                    const version = execSync('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version', { encoding: 'utf8' });
                    const versionNumber = version.replace('Google Chrome ', '').trim();
                    const majorVersion = versionNumber.split('.')[0];
                    return `Chrome ${majorVersion}.0`;
                } else if (process.platform === 'linux') {
                    const version = execSync('google-chrome --version', { encoding: 'utf8' });
                    const versionNumber = version.replace('Google Chrome ', '').trim();
                    const majorVersion = versionNumber.split('.')[0];
                    return `Chrome ${majorVersion}.0`;
                } else if (process.platform === 'win32') {
                    const version = execSync('reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version', { encoding: 'utf8' });
                    const match = version.match(/(\d+\.\d+)/);
                    return match ? `Chrome ${match[1]}` : 'Chrome';
                }
                break;
            case 'firefox':
                if (process.platform === 'darwin') {
                    const version = execSync('/Applications/Firefox.app/Contents/MacOS/firefox --version', { encoding: 'utf8' });
                    const versionNumber = version.replace('Mozilla Firefox ', '').trim();
                    const majorVersion = versionNumber.split('.')[0];
                    return `Firefox ${majorVersion}.0`;
                } else if (process.platform === 'linux') {
                    const version = execSync('firefox --version', { encoding: 'utf8' });
                    const versionNumber = version.replace('Mozilla Firefox ', '').trim();
                    const majorVersion = versionNumber.split('.')[0];
                    return `Firefox ${majorVersion}.0`;
                }
                break;
            case 'safari':
                if (process.platform === 'darwin') {
                    try {
                        const version = execSync('defaults read /Applications/Safari.app/Contents/Info CFBundleShortVersionString', { encoding: 'utf8' }).trim();
                        const majorVersion = version.split('.')[0];
                        return `Safari ${majorVersion}.0`;
                    } catch {
                        return 'Safari';
                    }
                }
                break;
        }
        return browserName.charAt(0).toUpperCase() + browserName.slice(1);
    } catch (error) {
        return browserName.charAt(0).toUpperCase() + browserName.slice(1);
    }
};

// Get execution times from JSON report
const getExecutionTimes = () => {
    try {
        const reportData = JSON.parse(fs.readFileSync('./reports/cucumber-report.json', 'utf8'));
        
        let startTime = null;
        let endTime = null;
        
        // Find earliest start time and latest end time
        reportData.forEach(feature => {
            feature.elements.forEach(scenario => {
                scenario.steps.forEach(step => {
                    if (step.result && step.result.duration) {
                        const stepStartTime = new Date(step.result.timestamp || Date.now());
                        const stepEndTime = new Date(stepStartTime.getTime() + (step.result.duration / 1000000));
                        
                        if (!startTime || stepStartTime < startTime) {
                            startTime = stepStartTime;
                        }
                        if (!endTime || stepEndTime > endTime) {
                            endTime = stepEndTime;
                        }
                    }
                });
            });
        });
        
        // If no timestamps found, use current time
        if (!startTime) startTime = new Date();
        if (!endTime) endTime = new Date();
        
        return {
            start: startTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            }),
            end: endTime.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            })
        };
    } catch (error) {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });
        
        return {
            start: timeString,
            end: timeString
        };
    }
};

// Clean up old HTML reports only, keep JSON
const cleanupOldReports = () => {
    try {
        // Only remove HTML report directory
        if (fs.existsSync('./reports/html-report')) {
            fs.rmSync('./reports/html-report', { recursive: true, force: true });
            // Silent cleanup
        }
        
        // Clean any temp files
        if (fs.existsSync('./reports/cucumber-report-clean.json')) {
            fs.unlinkSync('./reports/cucumber-report-clean.json');
        }
        
        // Silent processing
        
    } catch (error) {
        console.log('⚠️ Warning: Could not clean old reports:', error.message);
    }
};

// Clean old reports first
cleanupOldReports();

const systemInfo = getSystemInfo();
const browserInfo = getBrowserInfo();
const executionTimes = getExecutionTimes();
const platformInfo = getPlatformInfo();
const browserWithVersion = getBrowserWithVersion(browserInfo.name);

// Get browser info from metadata in JSON report
const getBrowserInfoFromJson = (browserName) => {
    try {
        const jsonPath = path.join('reports', browserName, 'cucumber-report.json');
        const reportData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        // Try to extract browser info from metadata if available
        if (reportData[0] && reportData[0].metadata) {
            return reportData[0].metadata.browser || { name: browserName };
        }
        
        return { name: browserName };
    } catch (error) {
        return { name: browserName };
    }
};

// Process JSON and keep all features with tags
const processJsonForReport = (browserName) => {
    const reportPath = path.join('reports', browserName);  // Relative to project root (CWD)
    const jsonFilePath = path.join(reportPath, 'cucumber-report.json');
    
    try {
        const reportData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        
        // Keep ALL features (not just the first one)
        const allFeatures = Array.isArray(reportData) ? reportData : [reportData];
        
        // Keep tags from feature file for dynamic display in HTML report
        // Tags are automatically captured by Cucumber from the .feature file
        allFeatures.forEach(feature => {
            // Preserve feature.tags if they exist
            if (feature.tags) {
                // Silent processing - no console output
            }
            
            feature.elements.forEach(scenario => {
                // Preserve scenario.tags if they exist
                if (scenario.tags) {
                    // Silent processing - no console output
                }
            });
        });
        
        // Write back all features with tags preserved
        fs.unlinkSync(jsonFilePath);
        fs.writeFileSync(jsonFilePath, JSON.stringify(allFeatures, null, 2));
        
        return reportPath;
    } catch (error) {
        // Silent error handling
        return reportPath;
    }
};

// Auto-detect all browsers with reports and generate HTML for each
const browsersWithReports = detectBrowsersWithReports();

if (browsersWithReports.length === 0) {
    console.log('⚠️ No browser reports found. Please run tests first.');
    process.exit(0);
}

// Silent detection - no console output

// Generate HTML report for each browser
browsersWithReports.forEach(browserName => {
    // Process JSON for this browser
    const processedJsonPath = processJsonForReport(browserName);
    
    // Get browser-specific info
    const browserSpecificInfo = getBrowserInfoFromJson(browserName);
    
    // Generate HTML report
    report.generate({
        jsonDir: processedJsonPath,
        reportPath: path.join(processedJsonPath, 'html-report'),
        pageTitle: 'Automation Report',
        metadata: {
            device: 'Desktop',
            platform: {
                name: getStandardPlatformName(systemInfo.platform),
                version: platformInfo
            }
        },
        customData: {
            title: 'Run info',
            data: [
                {label: 'Project', value: 'Automation Test'},
                {label: 'Release', value: '1.0.0'},
                {label: 'Cycle', value: 'Automation Test'},
                {label: 'Execution Start Time', value: executionTimes.start},
                {label: 'Execution End Time', value: executionTimes.end}
            ]
        },
        customStyle: path.join(__dirname, 'custom-styles.css'),
        displayDuration: true,
        displayReportTime: true,
        useCDN: false
    });
    
    // Inject custom JavaScript inline into the HTML report
    const reportHtmlPath = path.join(processedJsonPath, 'html-report', 'index.html');
    try {
        let htmlContent = fs.readFileSync(reportHtmlPath, 'utf8');
        
        // Custom JavaScript to fix browser icons and title - inject browser name from config
        const customJs = `
// Automation: Custom Report Script
// Browser: ${browserName}
(function() {
    'use strict';
    
    // Get browser name from config (injected during report generation)
    const BROWSER_NAME = '${browserName}';
    
    // Browser display names and icons
    const BROWSER_CONFIG = {
        'chromium': { icon: '🌐', name: 'Chromium' },
        'firefox': { icon: '🦊', name: 'Firefox' },
        'webkit': { icon: '🧭', name: 'WebKit' }
    };
    
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }
    
    ready(function() {
        console.log('Automation: Customizing report for ' + BROWSER_NAME);
        
        const config = BROWSER_CONFIG[BROWSER_NAME.toLowerCase()];
        if (!config) {
            console.warn('Unknown browser: ' + BROWSER_NAME);
            return;
        }
        
        // 1. Replace browser icons and text
        // ONLY target Browser column (7th column, NOT 6th!) - avoid affecting other columns
        const browserIcons = document.querySelectorAll('table.table tbody tr td:nth-child(7) i[class*="fa-"]');
        console.log('Found ' + browserIcons.length + ' browser icons');
        
        browserIcons.forEach(function(icon) {
            // Add icon class
            icon.classList.add('browser-' + BROWSER_NAME.toLowerCase());
            
            // Replace span text with browser name
            const span = icon.querySelector('span');
            if (span) {
                span.textContent = config.name;
                span.style.display = 'inline-block';
                span.style.marginLeft = '8px';
            }
            
            // Hide the version text after icon (e.g., "Chrome 141.0")
            const parent = icon.parentNode;
            if (parent) {
                // Get all child nodes
                const childNodes = Array.from(parent.childNodes);
                childNodes.forEach(function(node) {
                    // If it's a text node and contains version info, hide it
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        // Wrap text node in span to hide it
                        const wrapper = document.createElement('span');
                        wrapper.style.display = 'none';
                        wrapper.textContent = node.textContent;
                        parent.replaceChild(wrapper, node);
                    }
                });
            }
        });
        
        // 2. Add dynamic CSS for browser icons (ONLY Browser column - 7th column)
        const style = document.createElement('style');
        style.textContent = 
            'table.table tbody tr td:nth-child(7) i.browser-' + BROWSER_NAME.toLowerCase() + ':before {' +
            '    content: "' + config.icon + '" !important;' +
            '    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important;' +
            '    font-size: 18px !important;' +
            '}' +
            'table.table tbody tr td:nth-child(7) i[class*="fa-"] span {' +
            '    display: inline-block !important;' +
            '    margin-left: 8px !important;' +
            '    font-size: 13px !important;' +
            '    font-weight: normal !important;' +
            '}';
        document.head.appendChild(style);
        
        // 3. Fix navbar title - only replace "Multiple Cucumber HTML Reporter"
        const navbarTexts = document.querySelectorAll('p.navbar-text');
        console.log('Found ' + navbarTexts.length + ' navbar texts');
        
        navbarTexts.forEach(function(text) {
            if (text.textContent.trim() === 'Multiple Cucumber HTML Reporter') {
                text.textContent = 'Automation Test';
                console.log('✅ Title replaced');
            }
        });
        
        console.log('✅ Report customization complete! Browser: ' + config.icon + ' ' + config.name);
    });
})();
        `;
        
        // Inject before closing body tag
        const scriptTag = `\n<script>${customJs}</script>\n</body>`;
        htmlContent = htmlContent.replace('</body>', scriptTag);
        
        // Write back
        fs.writeFileSync(reportHtmlPath, htmlContent, 'utf8');
    } catch (error) {
        // Silent error handling
    }
});
