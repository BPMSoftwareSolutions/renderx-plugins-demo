# MusicalConductor E2E Testing Suite

This directory contains comprehensive End-to-End (E2E) tests for the MusicalConductor system using Playwright. The tests validate MusicalConductor integration with React SPAs in real browser environments, using the musical-conductor package from Git repository.

## 🎯 Overview

The E2E testing suite provides:

- **Real Browser Testing**: Tests run in actual browsers (Chrome, Firefox, Safari, Edge)
- **Git Package Integration**: Uses musical-conductor as external package from Git repository
- **Console Logging**: Time-date stamped console message capture and analysis
- **SPA Validation**: Architectural boundary compliance testing
- **Plugin System Testing**: Comprehensive plugin mounting and validation
- **Performance Monitoring**: Load testing and performance metrics

## 🏗️ Architecture

```
e2e-tests/
├── tests/                          # Test specifications
│   ├── react-spa-integration.spec.ts    # React SPA integration tests
│   ├── plugin-validation.spec.ts        # Plugin validation tests
│   └── console-logging.spec.ts          # Console logging tests
├── utils/                          # Test utilities
│   ├── console-logger.ts               # Console logging utilities
│   ├── test-helpers.ts                 # Common test helpers
│   ├── global-setup.ts                 # Global test setup
│   └── global-teardown.ts              # Global test cleanup
├── test-app/                       # Test application
│   ├── index.html                      # Test HTML page
│   ├── app.js                          # Test application logic
│   └── server.js                       # Development server
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Git access to MusicalConductor repository
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Installation

```bash
# Navigate to e2e-tests directory
cd e2e-tests

# Install dependencies and setup
npm run setup
```

This will:

1. Install npm dependencies
2. Install Playwright browsers
3. Install musical-conductor from Git repository

### Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with Playwright UI
npm run test:ui

# View test report
npm run test:report
```

### Development Server

```bash
# Start test application server
npm run serve:test

# Then visit http://localhost:3000 to interact with test app manually
```

## 📋 Test Suites

### 1. React SPA Integration Tests (`react-spa-integration.spec.ts`)

Tests MusicalConductor integration with React Single Page Applications:

- **Package Loading**: Verifies musical-conductor loads from Git repository
- **Communication System**: Tests EventBus and Conductor initialization
- **Browser Environment**: Validates pub/sub functionality in browser
- **Sequence Execution**: Tests musical sequence execution in browser
- **SPA Architecture**: Ensures proper SPA compliance
- **Plugin Mounting**: Tests plugin system in browser environment
- **Console Logging**: Validates time-stamped console capture
- **Error Handling**: Tests graceful error handling
- **Performance**: Monitors initialization and operation performance

### 2. Plugin Validation Tests (`plugin-validation.spec.ts`)

Tests architectural boundary compliance and SPA validation:

- **SPA Compliance**: Validates plugin mounting with SPA compliance
- **EventBus Violations**: Detects direct EventBus access violations
- **Code Validation**: Tests plugin code for architectural compliance
- **Conductor Pattern**: Enforces conductor.play() usage pattern
- **Plugin Structure**: Validates plugin metadata and structure
- **Lifecycle Events**: Tests plugin lifecycle management
- **Load Testing**: Tests architectural boundaries under load

### 3. Console Logging Tests (`console-logging.spec.ts`)

Tests time-date stamped console logging capabilities:

- **Timestamp Accuracy**: Verifies accurate timestamp capture
- **Log Categorization**: Tests MusicalConductor log message categorization
- **Log Levels**: Captures different log levels (info, warn, error)
- **File Structure**: Tests log file saving and structure
- **High Frequency**: Tests performance under high-frequency logging
- **Log Analysis**: Tests comprehensive log analysis and export
- **Log Integrity**: Maintains log integrity across interactions
- **Edge Cases**: Handles browser console API edge cases

## 🛠️ Utilities

### Console Logger (`utils/console-logger.ts`)

Provides comprehensive console logging capabilities:

```typescript
import { ConsoleLogger } from "./utils/console-logger";

const logger = new ConsoleLogger("Test Name");
logger.setupPageLogging(page);

// Get logs
const logs = logger.getLogs();
const errorLogs = logger.getLogsByType("error");
const searchLogs = logger.getLogsContaining("search term");

// Analysis
const analysis = analyzeMusicalConductorLogs(logs);
console.log(analysis.eventBusMessages);
console.log(analysis.conductorMessages);

// Export
logger.saveLogsAsJSON();
const jsonExport = logger.exportLogsAsJSON();
```

### Test Helpers (`utils/test-helpers.ts`)

Common utilities for E2E testing:

```typescript
import {
  createTestContext,
  initializeMusicalConductor,
  testEventBus,
  testSequences,
  testPlugins,
  getTestMetrics,
} from "./utils/test-helpers";

const context = createTestContext(page, "Test Name");
await initializeMusicalConductor(context);
const success = await testEventBus(context);
const metrics = await getTestMetrics(page);
```

## 📊 Test Results

### Output Locations

- **HTML Report**: `test-results/index.html`
- **JSON Results**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **Console Logs**: `test-results/console-logs/`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/videos/`

### Log Analysis

Console logs are automatically analyzed and categorized:

- **EventBus Messages**: Messages containing 'EventBus' or '📡'
- **Conductor Messages**: Messages containing 'MusicalConductor' or '🎼'
- **Sequence Messages**: Messages containing 'sequence' or '🎵'
- **Plugin Messages**: Messages containing 'plugin' or '🔌'
- **Error Messages**: All error-level messages
- **Performance Metrics**: Messages containing performance data

## 🔧 Configuration

### Playwright Configuration (`playwright.config.ts`)

Key configuration options:

```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html"], ["json"], ["junit"]],
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

### Package Configuration (`package.json`)

The E2E tests install musical-conductor directly from Git:

```json
{
  "dependencies": {
    "musical-conductor": "git+https://github.com/BPMSoftwareSolutions/MusicalConductor.git#main"
  }
}
```

## 🎯 Test Scenarios

### Basic Integration Test

```typescript
test("should integrate with React SPA", async ({ page }) => {
  const context = createTestContext(page, "Integration Test");

  await page.goto("/");
  await initializeMusicalConductor(context);

  const success = await testEventBus(context);
  expect(success).toBe(true);

  const metrics = await getTestMetrics(page);
  expect(metrics.eventCount).toBeGreaterThan(0);
});
```

### Plugin Validation Test

```typescript
test("should validate plugin compliance", async ({ page }) => {
  const context = createTestContext(page, "Plugin Validation");

  await initializeMusicalConductor(context);

  const pluginResult = await page.evaluate(async () => {
    const conductor = window.E2ETestApp?.getConductor();
    return await conductor.mount(plugin, handlers, "test-plugin");
  });

  expect(pluginResult.success).toBe(true);
});
```

### Console Logging Test

```typescript
test("should capture console logs", async ({ page }) => {
  const logger = new ConsoleLogger("Console Test");
  logger.setupPageLogging(page);

  await initializeMusicalConductor({ page, logger, testName: "Console Test" });

  const logs = logger.getLogs();
  expect(logs.length).toBeGreaterThan(0);

  const analysis = analyzeMusicalConductorLogs(logs);
  expect(analysis.conductorMessages.length).toBeGreaterThan(0);
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Package Installation Fails**

   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   npm install
   ```

2. **Browser Installation Issues**

   ```bash
   # Reinstall Playwright browsers
   npx playwright install
   npx playwright install-deps
   ```

3. **Test Server Won't Start**

   ```bash
   # Check if port 3000 is available
   lsof -i :3000
   # Kill process if needed
   kill -9 <PID>
   ```

4. **Git Package Access Issues**
   ```bash
   # Verify Git access
   git ls-remote https://github.com/BPMSoftwareSolutions/MusicalConductor.git
   ```

### Debug Mode

Run tests in debug mode to step through execution:

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:

- Step through test execution
- Inspect page elements
- View console output
- Examine network requests

### Verbose Logging

Enable verbose logging in `playwright.config.ts`:

```typescript
use: {
  trace: 'on',
  video: 'on',
  screenshot: 'on'
}
```

## 📈 Performance Considerations

### Test Execution Time

- **Single Test**: ~30-60 seconds
- **Full Suite**: ~5-10 minutes
- **All Browsers**: ~15-30 minutes

### Resource Usage

- **Memory**: ~500MB per browser instance
- **Disk**: ~100MB for test results
- **Network**: Minimal (local test server)

### Optimization Tips

1. **Parallel Execution**: Tests run in parallel by default
2. **Browser Reuse**: Browsers are reused across tests
3. **Selective Testing**: Run specific test files or browsers
4. **CI Optimization**: Use `--workers=1` in CI environments

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - name: Install dependencies
        run: |
          cd e2e-tests
          npm ci
      - name: Install Playwright
        run: |
          cd e2e-tests
          npx playwright install --with-deps
      - name: Run E2E tests
        run: |
          cd e2e-tests
          npm test
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-test-results
          path: e2e-tests/test-results/
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [MusicalConductor Documentation](../README.md)
- [Testing Strategy](../tools/docs/Testing%20Strategy.md)
- [React SPA Integration Guide](../tools/docs/react-spa-integration.md)

## 🤝 Contributing

When adding new E2E tests:

1. Follow existing test patterns
2. Use the provided utilities
3. Include proper console logging
4. Add comprehensive assertions
5. Update documentation
6. Test across multiple browsers

## 🎬 Example Test Run

Here's what a typical test run looks like:

```bash
$ npm test

> musical-conductor-e2e-tests@1.0.0 test
> playwright test

Running 24 tests using 4 workers

  ✓ react-spa-integration.spec.ts:25:3 › should load MusicalConductor package from Git repository (chromium) (5.2s)
  ✓ react-spa-integration.spec.ts:45:3 › should initialize communication system components (chromium) (3.8s)
  ✓ plugin-validation.spec.ts:23:3 › should validate SPA compliance during plugin mounting (chromium) (4.1s)
  ✓ console-logging.spec.ts:28:3 › should capture console messages with accurate timestamps (chromium) (2.9s)

  ... (more tests)

  24 passed (2m 15s)

To open last HTML report run:
  npx playwright show-report
```

## 📊 Test Coverage

The E2E test suite covers:

- ✅ **Package Installation**: Git repository package loading
- ✅ **System Initialization**: Communication system setup
- ✅ **EventBus Functionality**: Pub/sub in browser environment
- ✅ **Sequence Execution**: Musical sequence orchestration
- ✅ **Plugin System**: Plugin mounting and validation
- ✅ **SPA Compliance**: Architectural boundary enforcement
- ✅ **Console Logging**: Time-stamped log capture and analysis
- ✅ **Error Handling**: Graceful error recovery
- ✅ **Performance**: Load testing and metrics
- ✅ **Cross-Browser**: Chrome, Firefox, Safari, Edge support

## 📄 License

This E2E testing suite is part of the MusicalConductor project and follows the same MIT license.
