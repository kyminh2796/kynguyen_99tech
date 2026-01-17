#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   CI/CD Verification Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Counter for checks
PASSED=0
FAILED=0
WARNING=0

# Function to print results
check_pass() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNING++))
}

# 1. Check workflow files exist
echo -e "${BLUE}1️⃣  Checking Workflow Files...${NC}"
if [ -f ".github/workflows/tests.yml" ]; then
  check_pass "tests.yml exists"
else
  check_fail "tests.yml missing"
fi

if [ -f ".github/workflows/scheduled-tests.yml" ]; then
  check_pass "scheduled-tests.yml exists"
else
  check_fail "scheduled-tests.yml missing"
fi

echo ""

# 2. Check YAML syntax
echo -e "${BLUE}2️⃣  Checking YAML Syntax...${NC}"
if command -v js-yaml &> /dev/null; then
  if js-yaml .github/workflows/tests.yml > /dev/null 2>&1; then
    check_pass "tests.yml YAML syntax valid"
  else
    check_fail "tests.yml has YAML syntax errors"
  fi
  
  if js-yaml .github/workflows/scheduled-tests.yml > /dev/null 2>&1; then
    check_pass "scheduled-tests.yml YAML syntax valid"
  else
    check_fail "scheduled-tests.yml has YAML syntax errors"
  fi
else
  check_warn "js-yaml not installed (cannot verify syntax)"
  echo "   Install: npm install -g js-yaml"
fi

echo ""

# 3. Check npm scripts
echo -e "${BLUE}3️⃣  Checking NPM Scripts...${NC}"
if grep -q '"test"' package.json; then
  check_pass "test script exists"
else
  check_fail "test script missing"
fi

if grep -q '"test:chromium"' package.json; then
  check_pass "test:chromium script exists"
else
  check_fail "test:chromium script missing"
fi

if grep -q '"test:firefox"' package.json; then
  check_pass "test:firefox script exists"
else
  check_fail "test:firefox script missing"
fi

if grep -q '"test:webkit"' package.json; then
  check_pass "test:webkit script exists"
else
  check_fail "test:webkit script missing"
fi

if grep -q '"test:regression"' package.json; then
  check_pass "test:regression script exists"
else
  check_fail "test:regression script missing"
fi

if grep -q '"report:html"' package.json; then
  check_pass "report:html script exists"
else
  check_fail "report:html script missing"
fi

echo ""

# 4. Check configuration files
echo -e "${BLUE}4️⃣  Checking Configuration Files...${NC}"
if [ -f "config/playwright.config.js" ]; then
  check_pass "playwright.config.js exists"
  
  if grep -q "fullyParallel: true" config/playwright.config.js; then
    check_pass "Parallel execution enabled"
  else
    check_fail "Parallel execution not enabled"
  fi
  
  if grep -q "chromium" config/playwright.config.js; then
    check_pass "Chromium browser configured"
  else
    check_fail "Chromium browser not configured"
  fi
  
  if grep -q "firefox" config/playwright.config.js; then
    check_pass "Firefox browser configured"
  else
    check_fail "Firefox browser not configured"
  fi
  
  if grep -q "webkit" config/playwright.config.js; then
    check_pass "WebKit browser configured"
  else
    check_fail "WebKit browser not configured"
  fi
else
  check_fail "playwright.config.js missing"
fi

echo ""

# 5. Check git repository
echo -e "${BLUE}5️⃣  Checking Git Repository...${NC}"
if [ -d ".git" ]; then
  check_pass "Git repository initialized"
  
  REMOTE=$(git config --get remote.origin.url)
  if [ -n "$REMOTE" ]; then
    check_pass "Remote origin configured: $REMOTE"
  else
    check_fail "Remote origin not configured"
  fi
else
  check_fail "Not a git repository"
fi

echo ""

# 6. Check test data files
echo -e "${BLUE}6️⃣  Checking Test Data Files...${NC}"
if [ -f "test-data/users.json" ]; then
  check_pass "test-data/users.json exists"
else
  check_fail "test-data/users.json missing"
fi

if [ -f "test-data/product.json" ]; then
  check_pass "test-data/product.json exists"
else
  check_fail "test-data/product.json missing"
fi

if [ -f "test-data/testSite.json" ]; then
  check_pass "test-data/testSite.json exists"
else
  check_fail "test-data/testSite.json missing"
fi

if [ -f "test-data/errorMessages.json" ]; then
  check_pass "test-data/errorMessages.json exists"
else
  check_fail "test-data/errorMessages.json missing"
fi

echo ""

# 7. Check page objects
echo -e "${BLUE}7️⃣  Checking Page Objects...${NC}"
if [ -f "page-objects/LoginPage.ts" ]; then
  check_pass "LoginPage.ts exists"
else
  check_fail "LoginPage.ts missing"
fi

if [ -f "page-objects/CartPage.ts" ]; then
  check_pass "CartPage.ts exists"
else
  check_fail "CartPage.ts missing"
fi

if [ -f "page-objects/InventoryPage.ts" ]; then
  check_pass "InventoryPage.ts exists"
else
  check_fail "InventoryPage.ts missing"
fi

echo ""

# 8. Check features
echo -e "${BLUE}8️⃣  Checking Feature Files...${NC}"
if [ -f "features/authentication.feature" ]; then
  check_pass "authentication.feature exists"
else
  check_fail "authentication.feature missing"
fi

if [ -f "features/cart.feature" ]; then
  check_pass "cart.feature exists"
else
  check_fail "cart.feature missing"
fi

echo ""

# 9. Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
fi
if [ $WARNING -gt 0 ]; then
  echo -e "${YELLOW}Warnings: $WARNING${NC}"
fi
echo ""

# 10. Next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: add CI/CD verification'"
echo "   git push origin main"
echo ""
echo "2. Monitor Workflows:"
echo "   - Go to GitHub repository"
echo "   - Click 'Actions' tab"
echo "   - Watch workflow execution"
echo ""
echo "3. Check Results:"
echo "   - Verify all 3 browsers executed"
echo "   - Download artifacts"
echo "   - Check HTML reports"
echo ""
echo "4. Using GitHub CLI:"
echo "   gh workflow list"
echo "   gh run list"
echo "   gh run watch"
echo ""

# Final status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! CI/CD is ready.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please fix issues above.${NC}"
  exit 1
fi
