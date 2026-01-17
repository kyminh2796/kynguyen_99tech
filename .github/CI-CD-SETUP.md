# GitHub Actions CI/CD Setup

## Overview

This framework includes GitHub Actions workflows for continuous integration and testing automation.

## 📋 Workflows

### 1. **Main Test Workflow** (`.github/workflows/tests.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via GitHub Actions UI

**Features:**
- ✅ Multi-browser testing (Chromium, Firefox, WebKit) in parallel
- ✅ Automatic report generation
- ✅ Screenshot capture on failures
- ✅ Artifact upload for retention
- ✅ Pull request comments with results
- ✅ Failure notifications

**Jobs:**
1. **Test** - Runs tests on each browser in parallel
2. **Report** - Aggregates results and generates summary
3. **Notification** - Sends alerts on failures

### 2. **Scheduled Tests Workflow** (`.github/workflows/scheduled-tests.yml`)

**Triggers:**
- Daily at 2 AM UTC
- Manual trigger via GitHub Actions UI

**Features:**
- ✅ Scheduled regression testing
- ✅ Extended artifact retention (60 days)
- ✅ Success/failure notifications
- ✅ Multi-browser execution

---

## 🔧 Setup Instructions

### Step 1: Ensure Files Are in Place

The following files should already exist:
```
.github/
  └── workflows/
      ├── tests.yml              # Main CI/CD workflow
      └── scheduled-tests.yml    # Scheduled tests
```

### Step 2: Configure Environment Variables (Optional)

You can set the `BASE_URL` secret for your deployment environment:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   ```
   Name: BASE_URL
   Value: https://your-test-environment.com
   ```

If not set, defaults to: `https://www.demoblaze.com`

### Step 3: Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Select **Allow all actions and reusable workflows**
3. Click **Save**

### Step 4: Verify Workflow Files

Check that workflows are enabled:
1. Go to **Actions** tab
2. You should see:
   - `E2E Tests` workflow
   - `Scheduled Tests` workflow

---

## 📊 Workflow Details

### Main Workflow (`tests.yml`)

#### Job: Test
```yaml
Matrix Strategy:
  - browser: [chromium, firefox, webkit]
  - runs-on: ubuntu-latest
  
Steps:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Install Playwright browsers
  5. Run tests on each browser
  6. Upload results and screenshots
```

**Environment Variables:**
- `BASE_URL` - Test environment URL (optional, defaults to Demoblaze)
- `CI` - Set to `true` to enable CI mode (retries, timeouts)

#### Job: Report
```yaml
Steps:
  1. Download all test artifacts
  2. Create workflow summary
  3. Comment on PR with results
```

#### Job: Notification
```yaml
Triggered on: Test failure
Outputs:
  - Failure alert
  - Repository link
  - Run details
```

### Scheduled Workflow (`scheduled-tests.yml`)

```yaml
Schedule: Daily at 2 AM UTC (0 2 * * *)

Jobs:
  - scheduled-tests: Run regression tests
  - notify: Send success/failure notifications

Retention: 60 days (extended for scheduled runs)
```

---

## 🚀 Usage

### Automatic Triggers

1. **On Push:**
   ```bash
   git push origin main
   # → Workflow automatically starts
   ```

2. **On Pull Request:**
   - Create PR to `main` or `develop`
   - Workflow starts automatically
   - Results commented on PR

3. **Scheduled:**
   - Runs daily at 2 AM UTC
   - Check **Actions** tab to see results

### Manual Trigger

1. Go to **Actions** tab
2. Select workflow:
   - `E2E Tests` or `Scheduled Tests`
3. Click **Run workflow**
4. Select branch (main/develop)
5. Click **Run workflow**

---

## 📦 Artifacts

### Available Artifacts

After each run, artifacts are automatically uploaded:

```
test-results-chromium/
  ├── reports/
  │   ├── chromium/
  │   │   ├── html-report/
  │   │   ├── cucumber-report.json
  │   │   └── screenshots/
  │   ├── firefox/
  │   ├── webkit/
  └── test-results/

screenshots-chromium/
  └── (captured on failures)
```

### Retention Policy

- **Regular tests**: 30 days
- **Scheduled tests**: 60 days
- **Screenshots**: 7 days (on failures only)

### Download Artifacts

1. Go to **Actions** → **Workflow run**
2. Scroll to **Artifacts** section
3. Click to download

---

## 📈 Reports

### HTML Reports

After each run, HTML reports are generated and uploaded:

```
reports/chromium/html-report/index.html
reports/firefox/html-report/index.html
reports/webkit/html-report/index.html
```

### Report Contents

- Test execution summary
- Pass/fail statistics
- Detailed scenario results
- Screenshots on failures
- Execution time
- Browser information

### View Reports

1. Download artifacts from GitHub Actions
2. Extract and open:
   ```
   reports/{browser}/html-report/index.html
   ```
3. Or merge all reports:
   ```bash
   npm run report:html
   ```

---

## 🔔 Notifications

### Pull Request Comments

On PR completion, a comment is automatically added:
```
✅ E2E Tests Executed

📊 Test results and reports are available in the workflow artifacts.

🔗 [View Artifacts](https://github.com/.../actions/runs/...)
```

### Failure Alerts

On test failure:
- Workflow shows red ❌
- Email notification (if enabled)
- Can integrate with Slack/Teams (see Advanced)

---

## ⚙️ Advanced Configuration

### Run Specific Tests on Commit

To run only specific tests on commit:

1. Create `.github/workflows/specific-tests.yml`:

```yaml
name: Specific Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run install:browsers
      - run: npm run test:regression
```

### Slack Integration

Add Slack notification on failure:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "❌ E2E Tests Failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Test Failure*\n${{ github.repository }}\nBranch: ${{ github.ref_name }}"
            }
          }
        ]
      }
```

### Email Notifications

1. Go to **Settings** → **Notifications**
2. Select **Email** notifications for:
   - Workflow run failures
   - Workflow run completions

### Matrix Tests with Specific Tags

Run different test suites per browser:

```yaml
strategy:
  matrix:
    include:
      - browser: chromium
        tags: "@critical"
      - browser: firefox
        tags: "@regression"
      - browser: webkit
        tags: ""
steps:
  - run: npm run test:${{ matrix.browser }} -- --tags "${{ matrix.tags }}"
```

---

## 🐛 Troubleshooting

### Workflow Doesn't Start

**Solution:**
1. Check **Settings** → **Actions** → **General**
2. Ensure **Allow all actions** is enabled
3. Verify files in `.github/workflows/`

### Tests Timeout

**Solution:**
- Increase timeout in `config/playwright.config.js`
- Check `timeout: 30000` (in milliseconds)
- Increase `workers` in parallel execution

### Reports Not Generated

**Solution:**
```bash
# Manually generate reports
npm run report:html

# Check if cucumber-report.json exists
find reports -name "cucumber-report.json"
```

### Browser Installation Issues

**Solution:**
```bash
# Reinstall browsers
npm run install:browsers

# Or in workflow, ensure step runs:
npm run install:browsers
```

---

## 📝 Maintenance

### Update Workflow

To modify workflows:

1. Edit `.github/workflows/*.yml`
2. Commit and push
3. GitHub automatically uses updated workflow

### Monitor Workflow Health

1. Go to **Actions** tab
2. Check recent runs
3. Review logs for issues
4. Check run duration trends

### Cleanup Old Artifacts

Artifacts automatically cleanup based on retention policy:
- Regular tests: 30 days
- Scheduled: 60 days

To manually delete:
1. Go to **Actions** → specific run
2. Click **Remove all artifacts**

---

## ✅ Best Practices

1. ✅ **Keep workflows updated** - Update Node version regularly
2. ✅ **Monitor artifacts** - Check disk usage
3. ✅ **Review logs** - Debug failed runs immediately
4. ✅ **Test locally first** - Run `npm test` before pushing
5. ✅ **Use semantic commits** - Better tracking in actions
6. ✅ **Configure secrets** - Store sensitive data securely
7. ✅ **Schedule tests** - Run regression tests regularly
8. ✅ **Archive old results** - Keep recent reports only

---

## 📞 Support

For issues:
- Check GitHub Actions logs
- Review workflow syntax: https://docs.github.com/actions
- Test workflow locally: https://github.com/nektos/act

---

**Workflow Status**: ✅ Ready for Production
