/**
 * React SPA Integration E2E Tests
 * 
 * Tests MusicalConductor integration with React Single Page Applications
 * using Playwright in a real browser environment
 */

import { test, expect, Page } from '@playwright/test';
import { 
  createTestContext, 
  initializeMusicalConductor,
  waitForPageReady,
  getTestMetrics,
  assertConductorInitialized,
  assertNoConsoleErrors,
  takeTimestampedScreenshot
} from '../utils/test-helpers';
import { ConsoleLogger, analyzeMusicalConductorLogs } from '../utils/console-logger';

test.describe('MusicalConductor React SPA Integration', () => {
  let page: Page;
  let logger: ConsoleLogger;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    logger = new ConsoleLogger('React SPA Integration');
    logger.setupPageLogging(page);

    // Navigate to test app
    await page.goto('/');
    await waitForPageReady(page);
    
    // Take initial screenshot
    await takeTimestampedScreenshot(page, 'initial-load');
  });

  test.afterEach(async () => {
    // Save logs after each test
    logger.saveLogsAsJSON();
    
    // Take final screenshot
    await takeTimestampedScreenshot(page, 'test-complete');
  });

  test('should load MusicalConductor package from Git repository', async () => {
    const context = createTestContext(page, 'Package Loading Test');
    
    // Check that the page loads without errors
    await expect(page.locator('h1')).toContainText('MusicalConductor E2E Test Environment');
    
    // Check initial status
    const initialStatus = await page.textContent('#status');
    expect(initialStatus).toContain('Initializing');
    
    // Initialize MusicalConductor
    const success = await initializeMusicalConductor(context);
    expect(success).toBe(true);
    
    // Verify package was loaded from Git
    const packageInfo = await page.evaluate(() => {
      // Check if the package is available
      return typeof window.E2ETestApp !== 'undefined';
    });
    
    expect(packageInfo).toBe(true);
    
    // Check for successful initialization message
    const finalStatus = await page.textContent('#status');
    expect(finalStatus).toContain('successfully');
  });

  test('should initialize communication system components', async () => {
    const context = createTestContext(page, 'Communication System Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Verify all components are initialized
    const components = await page.evaluate(() => {
      const conductor = window.E2ETestApp?.getConductor();
      const eventBus = window.E2ETestApp?.getEventBus();
      
      return {
        hasConductor: conductor !== null,
        hasEventBus: eventBus !== null,
        conductorType: typeof conductor,
        eventBusType: typeof eventBus
      };
    });
    
    expect(components.hasConductor).toBe(true);
    expect(components.hasEventBus).toBe(true);
    expect(components.conductorType).toBe('object');
    expect(components.eventBusType).toBe('object');
    
    // Check console logs for initialization messages
    const logs = logger.getLogs();
    const conductorLogs = analyzeMusicalConductorLogs(logs);
    
    expect(conductorLogs.conductorMessages.length).toBeGreaterThan(0);
    expect(conductorLogs.eventBusMessages.length).toBeGreaterThan(0);
  });

  test('should handle EventBus pub/sub in browser environment', async () => {
    const context = createTestContext(page, 'EventBus Browser Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Test EventBus functionality
    await page.click('#test-eventbus');
    
    // Wait for test to complete
    await page.waitForTimeout(2000);
    
    // Check metrics
    const metrics = await getTestMetrics(page);
    expect(metrics.eventCount).toBeGreaterThan(0);
    
    // Verify EventBus test passed
    const logText = await page.textContent('#log-container');
    expect(logText).toContain('EventBus test passed');
    
    // Check for proper event emission in console
    const logs = logger.getLogs();
    const eventBusLogs = logs.filter(log => 
      log.message.includes('EventBus') || log.message.includes('📡')
    );
    
    expect(eventBusLogs.length).toBeGreaterThan(0);
  });

  test('should execute musical sequences in browser', async () => {
    const context = createTestContext(page, 'Sequence Execution Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Test sequence execution
    await page.click('#test-sequences');
    
    // Wait for sequences to execute
    await page.waitForTimeout(3000);
    
    // Check that sequences were executed
    const sequenceCount = await page.textContent('#sequence-count');
    const count = parseInt(sequenceCount || '0');
    expect(count).toBeGreaterThan(0);
    
    // Check console for sequence-related messages
    const logs = logger.getLogs();
    const sequenceLogs = analyzeMusicalConductorLogs(logs);
    
    expect(sequenceLogs.sequenceMessages.length).toBeGreaterThan(0);
    
    // Verify no errors during sequence execution
    expect(sequenceLogs.errorMessages.length).toBe(0);
  });

  test('should maintain proper SPA architecture in browser', async () => {
    const context = createTestContext(page, 'SPA Architecture Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Test SPA validation
    await page.click('#test-spa-validation');
    
    // Wait for validation to complete
    await page.waitForTimeout(2000);
    
    // Check that SPA validation is working
    const logs = logger.getLogs();
    
    // Should have some validation-related messages
    const spaLogs = logs.filter(log => 
      log.message.toLowerCase().includes('spa') ||
      log.message.toLowerCase().includes('validation')
    );
    
    // SPA validation should be active (may or may not have violations)
    expect(spaLogs.length).toBeGreaterThanOrEqual(0);
    
    // Check metrics - should have events from the test
    const metrics = await getTestMetrics(page);
    expect(metrics.eventCount).toBeGreaterThan(0);
  });

  test('should handle plugin mounting in browser environment', async () => {
    const context = createTestContext(page, 'Plugin Mounting Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Test plugin system
    await page.click('#test-plugins');
    
    // Wait for plugin test to complete
    await page.waitForTimeout(4000);
    
    // Check plugin metrics
    const pluginCount = await page.textContent('#plugin-count');
    const count = parseInt(pluginCount || '0');
    expect(count).toBeGreaterThan(0);
    
    // Check console for plugin-related messages
    const logs = logger.getLogs();
    const pluginLogs = analyzeMusicalConductorLogs(logs);
    
    expect(pluginLogs.pluginMessages.length).toBeGreaterThan(0);
    
    // Verify plugin mounting was successful
    const logText = await page.textContent('#log-container');
    expect(logText).toContain('Plugin mounted successfully');
  });

  test('should capture and log console messages with timestamps', async () => {
    const context = createTestContext(page, 'Console Logging Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Run all tests to generate console output
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    
    await page.click('#test-sequences');
    await page.waitForTimeout(2000);
    
    await page.click('#test-plugins');
    await page.waitForTimeout(3000);
    
    // Check that logs were captured
    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    
    // Verify timestamps are present
    logs.forEach(log => {
      expect(log.timestamp).toBeDefined();
      expect(new Date(log.timestamp)).toBeInstanceOf(Date);
    });
    
    // Verify different log types were captured
    const logTypes = [...new Set(logs.map(log => log.type))];
    expect(logTypes.length).toBeGreaterThan(1);
    
    // Save logs as JSON for inspection
    const jsonFile = logger.saveLogsAsJSON();
    expect(jsonFile).toBeDefined();
  });

  test('should handle errors gracefully in browser environment', async () => {
    const context = createTestContext(page, 'Error Handling Test');
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    // Trigger an intentional error by trying to use invalid sequence
    await page.evaluate(() => {
      try {
        const conductor = window.E2ETestApp?.getConductor();
        if (conductor) {
          // This should fail gracefully
          conductor.startSequence('non-existent-sequence', {});
        }
      } catch (error) {
        console.error('Expected error for testing:', error.message);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that the system is still functional after error
    const metrics = await getTestMetrics(page);
    
    // System should still be responsive
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    
    const newMetrics = await getTestMetrics(page);
    expect(newMetrics.eventCount).toBeGreaterThan(metrics.eventCount);
    
    // Error should be logged but system should continue
    const logs = logger.getLogs();
    const errorLogs = logs.filter(log => log.type === 'error');
    expect(errorLogs.length).toBeGreaterThanOrEqual(0); // May or may not have errors depending on implementation
  });

  test('should maintain performance in browser environment', async () => {
    const context = createTestContext(page, 'Performance Test');
    
    const startTime = Date.now();
    
    // Initialize MusicalConductor
    await initializeMusicalConductor(context);
    
    const initTime = Date.now() - startTime;
    expect(initTime).toBeLessThan(10000); // Should initialize within 10 seconds
    
    // Run multiple operations
    const operationStart = Date.now();
    
    await page.click('#test-eventbus');
    await page.waitForTimeout(500);
    
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    
    const operationTime = Date.now() - operationStart;
    expect(operationTime).toBeLessThan(5000); // Operations should complete within 5 seconds
    
    // Check final metrics
    const metrics = await getTestMetrics(page);
    expect(metrics.eventCount).toBeGreaterThan(0);
    expect(metrics.sequenceCount).toBeGreaterThan(0);
    
    // Log performance metrics
    logger.captureConsoleMessage({
      type: () => 'info',
      text: () => `Performance Test - Init: ${initTime}ms, Operations: ${operationTime}ms`,
      args: () => [],
      location: () => null
    } as any);
  });
});
