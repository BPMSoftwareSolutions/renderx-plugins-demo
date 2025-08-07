# 🚀 MusicalConductor E2E Testing - Quick Start Guide

Get up and running with MusicalConductor E2E tests in 5 minutes!

## ⚡ One-Command Setup

```bash
cd e2e-tests && npm run setup && npm test
```

That's it! This will:
1. Install all dependencies
2. Install Playwright browsers  
3. Install musical-conductor from Git
4. Run the complete test suite

## 📋 Step-by-Step Setup

### 1. Prerequisites Check

```bash
# Check Node.js version (need 16+)
node --version

# Check Git access to repository
git ls-remote https://github.com/BPMSoftwareSolutions/MusicalConductor.git
```

### 2. Install Dependencies

```bash
cd e2e-tests
npm install
```

### 3. Install Playwright Browsers

```bash
npm run test:install
```

### 4. Run Your First Test

```bash
# Run all tests (headless)
npm test

# Or run with visible browser
npm run test:headed
```

## 🎯 Quick Test Commands

```bash
# Development
npm run test:headed          # Run with browser UI visible
npm run test:debug          # Run in debug mode with inspector
npm run test:ui             # Run with Playwright UI

# Specific tests
npx playwright test react-spa-integration.spec.ts
npx playwright test plugin-validation.spec.ts
npx playwright test console-logging.spec.ts

# Specific browsers
npx playwright test --project=chromium
npx playwright test --project=firefox

# Reports
npm run test:report         # View HTML report
```

## 🔍 What Gets Tested

### ✅ React SPA Integration
- Package loading from Git repository
- Communication system initialization
- EventBus functionality in browser
- Musical sequence execution
- Plugin system integration

### ✅ Plugin Validation  
- SPA compliance checking
- Architectural boundary enforcement
- Plugin mounting validation
- Code compliance testing

### ✅ Console Logging
- Time-stamped log capture
- Log categorization and analysis
- High-frequency logging performance
- Cross-browser console API support

## 📊 Understanding Test Results

### Success Output
```bash
✓ should load MusicalConductor package from Git repository (5.2s)
✓ should initialize communication system components (3.8s)
✓ should validate SPA compliance during plugin mounting (4.1s)

24 passed (2m 15s)
```

### Test Artifacts
After running tests, check these locations:

```
test-results/
├── index.html              # Interactive HTML report
├── results.json            # Machine-readable results
├── console-logs/           # Time-stamped console logs
├── screenshots/            # Failure screenshots
└── videos/                 # Test execution videos
```

## 🛠️ Manual Testing

Want to see the test app in action?

```bash
# Start the test server
npm run serve:test

# Visit http://localhost:3000
# Click buttons to test MusicalConductor functionality manually
```

## 🚨 Common Issues & Solutions

### Issue: Package Installation Fails
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Browser Installation Fails
```bash
# Solution: Reinstall Playwright browsers
npx playwright install --with-deps
```

### Issue: Tests Timeout
```bash
# Solution: Increase timeout in playwright.config.ts
timeout: 60 * 1000  // 60 seconds
```

### Issue: Port 3000 Already in Use
```bash
# Solution: Kill existing process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run serve:test
```

## 🎯 Next Steps

### Run Specific Test Categories

```bash
# Test only React SPA integration
npx playwright test react-spa-integration

# Test only plugin validation
npx playwright test plugin-validation

# Test only console logging
npx playwright test console-logging
```

### Debug Failed Tests

```bash
# Run in debug mode
npm run test:debug

# Run specific failing test
npx playwright test --debug react-spa-integration.spec.ts
```

### View Detailed Reports

```bash
# Open HTML report
npm run test:report

# View console logs
cat test-results/console-logs/*.log

# View JSON results
cat test-results/results.json | jq
```

## 📚 Learn More

- **Full Documentation**: [README.md](./README.md)
- **Test Utilities**: [utils/](./utils/)
- **Test Specifications**: [tests/](./tests/)
- **Configuration**: [playwright.config.ts](./playwright.config.ts)

## 🎉 Success Checklist

- [ ] Node.js 16+ installed
- [ ] Git access to MusicalConductor repository
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npm run test:install`)
- [ ] Tests pass (`npm test`)
- [ ] HTML report viewable (`npm run test:report`)
- [ ] Console logs captured in `test-results/console-logs/`

## 💡 Pro Tips

1. **Use headed mode** during development: `npm run test:headed`
2. **Debug specific tests** with: `npx playwright test --debug <test-file>`
3. **Check console logs** for detailed MusicalConductor activity
4. **Use test:ui** for interactive test development: `npm run test:ui`
5. **Run tests in parallel** by default for faster execution

## 🤝 Need Help?

1. Check the [full documentation](./README.md)
2. Review [test examples](./tests/)
3. Examine [console logs](./test-results/console-logs/)
4. Use debug mode: `npm run test:debug`

Happy testing! 🎼✨
