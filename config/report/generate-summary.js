#!/usr/bin/env node

/**
 * Generate Test Summary Report
 * Parses Cucumber JSON reports to extract:
 * - Pass/Fail/Skipped counts
 * - Total execution time
 * - Browser-specific results
 * - Feature and scenario breakdown
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a single Cucumber JSON report file
 * @param {string} jsonPath - Path to the cucumber-report.json file
 * @returns {Object} Parsed test statistics
 */
function parseReport(jsonPath) {
    try {
        const reportData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        let totalScenarios = 0;
        let passedScenarios = 0;
        let failedScenarios = 0;
        let skippedScenarios = 0;
        let totalSteps = 0;
        let passedSteps = 0;
        let failedSteps = 0;
        let skippedSteps = 0;
        let totalDuration = 0;
        const featureResults = [];

        // Process all features
        reportData.forEach(feature => {
            const featureStat = {
                name: feature.name,
                scenarios: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0
            };

            // Process all scenarios/elements
            feature.elements.forEach(scenario => {
                totalScenarios++;
                featureStat.scenarios++;
                
                let scenarioPassed = true;
                let scenarioSkipped = false;
                let scenarioDuration = 0;

                // Process all steps
                scenario.steps.forEach(step => {
                    if (step.hidden) return; // Skip hooks
                    
                    totalSteps++;
                    
                    if (step.result) {
                        const status = step.result.status;
                        const duration = step.result.duration || 0;
                        
                        scenarioDuration += duration;
                        
                        if (status === 'passed') {
                            passedSteps++;
                        } else if (status === 'failed') {
                            failedSteps++;
                            scenarioPassed = false;
                        } else if (status === 'skipped' || status === 'undefined') {
                            skippedSteps++;
                            scenarioSkipped = true;
                        }
                    }
                });

                // Categorize scenario
                if (!scenarioPassed) {
                    failedScenarios++;
                    featureStat.failed++;
                } else if (scenarioSkipped) {
                    skippedScenarios++;
                    featureStat.skipped++;
                } else {
                    passedScenarios++;
                    featureStat.passed++;
                }

                totalDuration += scenarioDuration;
                featureStat.duration += scenarioDuration;
            });

            featureResults.push(featureStat);
        });

        return {
            totalScenarios,
            passedScenarios,
            failedScenarios,
            skippedScenarios,
            totalSteps,
            passedSteps,
            failedSteps,
            skippedSteps,
            totalDuration,
            featureResults
        };
    } catch (error) {
        console.error(`Error parsing report ${jsonPath}:`, error.message);
        return null;
    }
}

/**
 * Format duration from nanoseconds to human-readable format
 * @param {number} nanoseconds - Duration in nanoseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(nanoseconds) {
    const milliseconds = nanoseconds / 1000000;
    const seconds = milliseconds / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;

    if (hours >= 1) {
        return `${hours.toFixed(2)}h`;
    } else if (minutes >= 1) {
        return `${minutes.toFixed(2)}m`;
    } else if (seconds >= 1) {
        return `${seconds.toFixed(2)}s`;
    } else {
        return `${milliseconds.toFixed(0)}ms`;
    }
}

/**
 * Calculate percentage
 * @param {number} value 
 * @param {number} total 
 * @returns {string} Formatted percentage
 */
function percentage(value, total) {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Detect all browsers with reports
 * @returns {Array} List of browser names
 */
function detectBrowsers() {
    const reportsDir = path.join(process.cwd(), 'reports');
    const browsers = [];
    
    if (!fs.existsSync(reportsDir)) {
        return browsers;
    }
    
    const items = fs.readdirSync(reportsDir);
    
    items.forEach(item => {
        const itemPath = path.join(reportsDir, item);
        const jsonPath = path.join(itemPath, 'cucumber-report.json');
        
        if (fs.statSync(itemPath).isDirectory() && fs.existsSync(jsonPath)) {
            browsers.push(item);
        }
    });
    
    return browsers;
}

/**
 * Generate summary for all browsers
 */
function generateSummary() {
    const browsers = detectBrowsers();
    
    if (browsers.length === 0) {
        console.log('⚠️  No test reports found in reports/ directory');
        process.exit(0);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 E2E TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n🗓️  Execution Date: ${new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    })}`);
    console.log(`🌐 Browsers Tested: ${browsers.join(', ')}`);

    let grandTotal = {
        totalScenarios: 0,
        passedScenarios: 0,
        failedScenarios: 0,
        skippedScenarios: 0,
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalDuration: 0
    };

    const allBrowserResults = [];

    // Parse results for each browser
    browsers.forEach(browser => {
        const jsonPath = path.join(process.cwd(), 'reports', browser, 'cucumber-report.json');
        const result = parseReport(jsonPath);
        
        if (result) {
            allBrowserResults.push({
                browser,
                ...result
            });

            // Aggregate totals
            grandTotal.totalScenarios += result.totalScenarios;
            grandTotal.passedScenarios += result.passedScenarios;
            grandTotal.failedScenarios += result.failedScenarios;
            grandTotal.skippedScenarios += result.skippedScenarios;
            grandTotal.totalSteps += result.totalSteps;
            grandTotal.passedSteps += result.passedSteps;
            grandTotal.failedSteps += result.failedSteps;
            grandTotal.skippedSteps += result.skippedSteps;
            grandTotal.totalDuration += result.totalDuration;
        }
    });

    // Display overall summary
    console.log('\n' + '-'.repeat(80));
    console.log('📈 OVERALL RESULTS');
    console.log('-'.repeat(80));
    console.log(`Total Scenarios:   ${grandTotal.totalScenarios}`);
    console.log(`  ✅ Passed:       ${grandTotal.passedScenarios} (${percentage(grandTotal.passedScenarios, grandTotal.totalScenarios)})`);
    console.log(`  ❌ Failed:       ${grandTotal.failedScenarios} (${percentage(grandTotal.failedScenarios, grandTotal.totalScenarios)})`);
    console.log(`  ⏭️  Skipped:      ${grandTotal.skippedScenarios} (${percentage(grandTotal.skippedScenarios, grandTotal.totalScenarios)})`);
    console.log('');
    console.log(`Total Steps:       ${grandTotal.totalSteps}`);
    console.log(`  ✅ Passed:       ${grandTotal.passedSteps} (${percentage(grandTotal.passedSteps, grandTotal.totalSteps)})`);
    console.log(`  ❌ Failed:       ${grandTotal.failedSteps} (${percentage(grandTotal.failedSteps, grandTotal.totalSteps)})`);
    console.log(`  ⏭️  Skipped:      ${grandTotal.skippedSteps} (${percentage(grandTotal.skippedSteps, grandTotal.totalSteps)})`);
    console.log('');
    console.log(`⏱️  Total Execution Time: ${formatDuration(grandTotal.totalDuration)}`);

    // Display browser-specific results
    console.log('\n' + '-'.repeat(80));
    console.log('🌐 BROWSER-SPECIFIC RESULTS');
    console.log('-'.repeat(80));
    
    allBrowserResults.forEach(result => {
        const browserIcon = {
            'chromium': '🌐',
            'firefox': '🦊',
            'webkit': '🧭'
        }[result.browser.toLowerCase()] || '🌐';

        console.log(`\n${browserIcon} ${result.browser.toUpperCase()}`);
        console.log(`  Scenarios: ${result.passedScenarios}✅ / ${result.failedScenarios}❌ / ${result.skippedScenarios}⏭️  (Total: ${result.totalScenarios})`);
        console.log(`  Steps:     ${result.passedSteps}✅ / ${result.failedSteps}❌ / ${result.skippedSteps}⏭️  (Total: ${result.totalSteps})`);
        console.log(`  Duration:  ${formatDuration(result.totalDuration)}`);
        console.log(`  Pass Rate: ${percentage(result.passedScenarios, result.totalScenarios)}`);
    });

    // Display feature breakdown
    if (allBrowserResults.length > 0 && allBrowserResults[0].featureResults.length > 0) {
        console.log('\n' + '-'.repeat(80));
        console.log('📋 FEATURE BREAKDOWN');
        console.log('-'.repeat(80));
        
        // Use first browser's feature results as reference
        const features = allBrowserResults[0].featureResults;
        
        features.forEach(feature => {
            console.log(`\n📄 ${feature.name}`);
            console.log(`  Scenarios: ${feature.passed}✅ / ${feature.failed}❌ / ${feature.skipped}⏭️  (Total: ${feature.scenarios})`);
            console.log(`  Duration:  ${formatDuration(feature.duration)}`);
        });
    }

    console.log('\n' + '='.repeat(80));
    
    // Final status
    const status = grandTotal.failedScenarios === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED';
    const statusIcon = grandTotal.failedScenarios === 0 ? '🎉' : '⚠️';
    console.log(`${statusIcon} ${status}`);
    console.log('='.repeat(80) + '\n');

    // Exit with appropriate code
    process.exit(grandTotal.failedScenarios > 0 ? 1 : 0);
}

/**
 * Generate GitHub Actions summary (when running in CI)
 */
function generateGitHubSummary() {
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (!summaryFile) {
        // Not running in GitHub Actions
        generateSummary();
        return;
    }

    const browsers = detectBrowsers();
    
    if (browsers.length === 0) {
        fs.appendFileSync(summaryFile, '⚠️ No test reports found\n');
        process.exit(0);
    }

    let grandTotal = {
        totalScenarios: 0,
        passedScenarios: 0,
        failedScenarios: 0,
        skippedScenarios: 0,
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0,
        totalDuration: 0
    };

    const allBrowserResults = [];

    // Parse results for each browser
    browsers.forEach(browser => {
        const jsonPath = path.join(process.cwd(), 'reports', browser, 'cucumber-report.json');
        const result = parseReport(jsonPath);
        
        if (result) {
            allBrowserResults.push({
                browser,
                ...result
            });

            grandTotal.totalScenarios += result.totalScenarios;
            grandTotal.passedScenarios += result.passedScenarios;
            grandTotal.failedScenarios += result.failedScenarios;
            grandTotal.skippedScenarios += result.skippedScenarios;
            grandTotal.totalSteps += result.totalSteps;
            grandTotal.passedSteps += result.passedSteps;
            grandTotal.failedSteps += result.failedSteps;
            grandTotal.skippedSteps += result.skippedSteps;
            grandTotal.totalDuration += result.totalDuration;
        }
    });

    // Build GitHub summary markdown
    let summary = '## 📊 E2E Test Results\n\n';
    
    // Overall status badge
    const statusEmoji = grandTotal.failedScenarios === 0 ? '✅' : '❌';
    const statusText = grandTotal.failedScenarios === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';
    summary += `### ${statusEmoji} ${statusText}\n\n`;

    // Test Execution Summary
    summary += '### Test Execution Summary\n\n';
    summary += `- **Browsers Tested**: ${browsers.join(', ')}\n`;
    summary += `- **Execution Date**: ${new Date().toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    })}\n`;
    summary += `- **Total Execution Time**: ${formatDuration(grandTotal.totalDuration)}\n\n`;

    // Overall Results Table
    summary += '### 📈 Overall Results\n\n';
    summary += '| Metric | Passed ✅ | Failed ❌ | Skipped ⏭️ | Total |\n';
    summary += '|--------|-----------|-----------|------------|-------|\n';
    summary += `| **Scenarios** | ${grandTotal.passedScenarios} (${percentage(grandTotal.passedScenarios, grandTotal.totalScenarios)}) | ${grandTotal.failedScenarios} (${percentage(grandTotal.failedScenarios, grandTotal.totalScenarios)}) | ${grandTotal.skippedScenarios} (${percentage(grandTotal.skippedScenarios, grandTotal.totalScenarios)}) | ${grandTotal.totalScenarios} |\n`;
    summary += `| **Steps** | ${grandTotal.passedSteps} (${percentage(grandTotal.passedSteps, grandTotal.totalSteps)}) | ${grandTotal.failedSteps} (${percentage(grandTotal.failedSteps, grandTotal.totalSteps)}) | ${grandTotal.skippedSteps} (${percentage(grandTotal.skippedSteps, grandTotal.totalSteps)}) | ${grandTotal.totalSteps} |\n\n`;

    // Browser-specific results
    summary += '### 🌐 Browser-Specific Results\n\n';
    summary += '| Browser | Scenarios | Pass Rate | Duration |\n';
    summary += '|---------|-----------|-----------|----------|\n';
    
    allBrowserResults.forEach(result => {
        const browserIcon = {
            'chromium': '🌐',
            'firefox': '🦊',
            'webkit': '🧭'
        }[result.browser.toLowerCase()] || '🌐';
        
        summary += `| ${browserIcon} **${result.browser}** | ${result.passedScenarios}✅ / ${result.failedScenarios}❌ / ${result.skippedScenarios}⏭️ | ${percentage(result.passedScenarios, result.totalScenarios)} | ${formatDuration(result.totalDuration)} |\n`;
    });

    // Feature breakdown
    if (allBrowserResults.length > 0 && allBrowserResults[0].featureResults.length > 0) {
        summary += '\n### 📋 Feature Breakdown\n\n';
        summary += '| Feature | Scenarios | Duration |\n';
        summary += '|---------|-----------|----------|\n';
        
        const features = allBrowserResults[0].featureResults;
        features.forEach(feature => {
            summary += `| ${feature.name} | ${feature.passed}✅ / ${feature.failed}❌ / ${feature.skipped}⏭️ | ${formatDuration(feature.duration)} |\n`;
        });
    }

    summary += '\n### 📁 Artifacts\n\n';
    summary += '- Test results and reports available in workflow artifacts\n';
    summary += '- Screenshots captured on failures\n';
    summary += '- HTML reports generated for each browser\n';

    // Write to GitHub summary
    fs.appendFileSync(summaryFile, summary);

    // Also output to console
    console.log('\n' + summary);

    // Exit with appropriate code
    process.exit(grandTotal.failedScenarios > 0 ? 1 : 0);
}

// Main execution
if (require.main === module) {
    generateGitHubSummary();
}

module.exports = {
    parseReport,
    formatDuration,
    percentage,
    detectBrowsers
};
