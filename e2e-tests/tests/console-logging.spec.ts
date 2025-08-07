/**
 * Console Logging E2E Tests
 * 
 * Tests time-date stamped console logging capabilities
 * and log analysis for MusicalConductor E2E testing
 */

import { test, expect, Page } from '@playwright/test';
import { 
  createTestContext, 
  initializeMusicalConductor,
  waitForPageReady,
  takeTimestampedScreenshot
} from '../utils/test-helpers';
import { ConsoleLogger, analyzeMusicalConductorLogs, formatTimestamp } from '../utils/console-logger';
import { existsSync, readFileSync } from 'fs';

test.describe('MusicalConductor Console Logging', () => {
  let page: Page;
  let logger: ConsoleLogger;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    logger = new ConsoleLogger('Console Logging Tests');
    logger.setupPageLogging(page);

    await page.goto('/');
    await waitForPageReady(page);
  });

  test.afterEach(async () => {
    // Save logs and verify file creation
    const jsonFile = logger.saveLogsAsJSON();
    expect(existsSync(jsonFile)).toBe(true);
    
    await takeTimestampedScreenshot(page, 'console-logging-complete');
  });

  test('should capture console messages with accurate timestamps', async () => {
    const context = createTestContext(page, 'Timestamp Accuracy Test');
    
    const testStartTime = Date.now();
    
    await initializeMusicalConductor(context);
    
    // Generate some console activity
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    
    const testEndTime = Date.now();
    
    // Check captured logs
    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    
    // Verify timestamps are within test timeframe
    logs.forEach(log => {
      const logTime = new Date(log.timestamp).getTime();
      expect(logTime).toBeGreaterThanOrEqual(testStartTime - 1000); // Allow 1s buffer
      expect(logTime).toBeLessThanOrEqual(testEndTime + 1000);
      
      // Verify timestamp format
      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
    
    // Test timestamp formatting utility
    const formattedTime = formatTimestamp(logs[0].timestamp);
    expect(formattedTime).toBeDefined();
    expect(typeof formattedTime).toBe('string');
  });

  test('should categorize MusicalConductor log messages correctly', async () => {
    const context = createTestContext(page, 'Log Categorization Test');
    
    await initializeMusicalConductor(context);
    
    // Generate different types of MusicalConductor activity
    await page.click('#test-eventbus');
    await page.waitForTimeout(500);
    
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    
    await page.click('#test-plugins');
    await page.waitForTimeout(1500);
    
    // Analyze logs
    const logs = logger.getLogs();
    const analysis = analyzeMusicalConductorLogs(logs);
    
    // Verify categorization
    expect(analysis.eventBusMessages.length).toBeGreaterThan(0);
    expect(analysis.conductorMessages.length).toBeGreaterThan(0);
    
    // Check for specific message patterns
    const hasEventBusEmoji = analysis.eventBusMessages.some(log => 
      log.message.includes('📡')
    );
    const hasConductorEmoji = analysis.conductorMessages.some(log => 
      log.message.includes('🎼')
    );
    
    expect(hasEventBusEmoji || analysis.eventBusMessages.length > 0).toBe(true);
    expect(hasConductorEmoji || analysis.conductorMessages.length > 0).toBe(true);
  });

  test('should capture different log levels (info, warn, error)', async () => {
    const context = createTestContext(page, 'Log Levels Test');
    
    await initializeMusicalConductor(context);
    
    // Generate different log levels
    await page.evaluate(() => {
      console.info('E2E Test Info Message');
      console.warn('E2E Test Warning Message');
      console.log('E2E Test Log Message');
    });
    
    // Try to trigger an error (gracefully)
    await page.evaluate(() => {
      try {
        const conductor = window.E2ETestApp?.getConductor();
        if (conductor) {
          // This might generate a warning or error
          conductor.startSequence('non-existent-sequence-for-testing', {});
        }
      } catch (error) {
        console.error('Expected test error:', error.message);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check log levels
    const logs = logger.getLogs();
    const logTypes = [...new Set(logs.map(log => log.type))];
    
    expect(logTypes.length).toBeGreaterThan(1);
    expect(logTypes).toContain('info');
    
    // Check specific log level methods
    const infoLogs = logger.getLogsByType('info');
    expect(infoLogs.length).toBeGreaterThan(0);
    
    // Check for test messages
    const testMessages = logger.getLogsContaining('E2E Test');
    expect(testMessages.length).toBeGreaterThan(0);
  });

  test('should save logs to file with proper structure', async () => {
    const context = createTestContext(page, 'Log File Structure Test');
    
    await initializeMusicalConductor(context);
    
    // Generate activity
    await page.click('#test-eventbus');
    await page.waitForTimeout(1000);
    
    // Save logs
    const logFilePath = logger.getLogFilePath();
    const jsonFilePath = logger.saveLogsAsJSON();
    
    // Verify files exist
    expect(existsSync(logFilePath)).toBe(true);
    expect(existsSync(jsonFilePath)).toBe(true);
    
    // Verify log file content
    const logContent = readFileSync(logFilePath, 'utf-8');
    expect(logContent).toContain('MusicalConductor E2E Test Console Log');
    expect(logContent).toContain('Log File Structure Test');
    expect(logContent).toContain('[INFO]');
    
    // Verify JSON structure
    const jsonContent = JSON.parse(readFileSync(jsonFilePath, 'utf-8'));
    expect(jsonContent.testName).toBe('Log File Structure Test');
    expect(jsonContent.timestamp).toBeDefined();
    expect(jsonContent.totalLogs).toBeGreaterThan(0);
    expect(jsonContent.logs).toBeInstanceOf(Array);
    
    // Verify log entry structure
    if (jsonContent.logs.length > 0) {
      const firstLog = jsonContent.logs[0];
      expect(firstLog.timestamp).toBeDefined();
      expect(firstLog.type).toBeDefined();
      expect(firstLog.message).toBeDefined();
      expect(firstLog.testName).toBe('Log File Structure Test');
    }
  });

  test('should handle high-frequency logging without performance issues', async () => {
    const context = createTestContext(page, 'High Frequency Logging Test');
    
    await initializeMusicalConductor(context);
    
    const startTime = Date.now();
    
    // Generate high-frequency console activity
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        console.log(`High frequency log message ${i}`);
        if (i % 10 === 0) {
          console.info(`Info message ${i}`);
        }
        if (i % 25 === 0) {
          console.warn(`Warning message ${i}`);
        }
      }
    });
    
    // Also generate MusicalConductor activity
    await page.click('#test-eventbus');
    await page.waitForTimeout(500);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Check that logging didn't significantly impact performance
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    
    // Verify logs were captured
    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThan(50); // Should have captured many logs
    
    // Check for high-frequency messages
    const highFreqLogs = logger.getLogsContaining('High frequency log message');
    expect(highFreqLogs.length).toBeGreaterThan(50);
    
    // Verify no errors during high-frequency logging
    expect(logger.hasErrors()).toBe(false);
  });

  test('should export comprehensive log analysis', async () => {
    const context = createTestContext(page, 'Log Analysis Export Test');
    
    await initializeMusicalConductor(context);
    
    // Generate comprehensive activity
    await page.click('#test-eventbus');
    await page.waitForTimeout(500);
    
    await page.click('#test-sequences');
    await page.waitForTimeout(1000);
    
    await page.click('#test-plugins');
    await page.waitForTimeout(1500);
    
    await page.click('#test-spa-validation');
    await page.waitForTimeout(500);
    
    // Export and analyze
    const jsonExport = logger.exportLogsAsJSON();
    const exportData = JSON.parse(jsonExport);
    
    expect(exportData.testName).toBe('Log Analysis Export Test');
    expect(exportData.totalLogs).toBeGreaterThan(0);
    expect(exportData.errorCount).toBeGreaterThanOrEqual(0);
    
    // Analyze MusicalConductor specific logs
    const analysis = analyzeMusicalConductorLogs(exportData.logs);
    
    // Should have various types of MusicalConductor activity
    const totalMCLogs = 
      analysis.eventBusMessages.length +
      analysis.conductorMessages.length +
      analysis.sequenceMessages.length +
      analysis.pluginMessages.length;
    
    expect(totalMCLogs).toBeGreaterThan(0);
    
    // Verify analysis structure
    expect(analysis.eventBusMessages).toBeInstanceOf(Array);
    expect(analysis.conductorMessages).toBeInstanceOf(Array);
    expect(analysis.sequenceMessages).toBeInstanceOf(Array);
    expect(analysis.pluginMessages).toBeInstanceOf(Array);
    expect(analysis.errorMessages).toBeInstanceOf(Array);
    expect(analysis.performanceMetrics).toBeInstanceOf(Array);
  });

  test('should maintain log integrity across page interactions', async () => {
    const context = createTestContext(page, 'Log Integrity Test');
    
    await initializeMusicalConductor(context);
    
    // Perform various interactions
    const interactions = [
      { action: 'test-eventbus', wait: 500 },
      { action: 'clear-logs', wait: 200 },
      { action: 'test-sequences', wait: 1000 },
      { action: 'test-plugins', wait: 1500 },
      { action: 'clear-logs', wait: 200 },
      { action: 'test-spa-validation', wait: 500 }
    ];
    
    const logCountsAfterEachAction = [];
    
    for (const interaction of interactions) {
      await page.click(`#${interaction.action}`);
      await page.waitForTimeout(interaction.wait);
      
      const currentLogs = logger.getLogs();
      logCountsAfterEachAction.push({
        action: interaction.action,
        logCount: currentLogs.length
      });
    }
    
    // Verify log counts increased appropriately
    expect(logCountsAfterEachAction.length).toBe(interactions.length);
    
    // Final log count should be greater than 0
    const finalLogCount = logCountsAfterEachAction[logCountsAfterEachAction.length - 1].logCount;
    expect(finalLogCount).toBeGreaterThan(0);
    
    // Verify logs have proper sequence
    const finalLogs = logger.getLogs();
    for (let i = 1; i < finalLogs.length; i++) {
      const prevTime = new Date(finalLogs[i - 1].timestamp).getTime();
      const currTime = new Date(finalLogs[i].timestamp).getTime();
      expect(currTime).toBeGreaterThanOrEqual(prevTime);
    }
  });

  test('should handle browser console API edge cases', async () => {
    const context = createTestContext(page, 'Console API Edge Cases Test');
    
    await initializeMusicalConductor(context);
    
    // Test various console API edge cases
    await page.evaluate(() => {
      // Test with different argument types
      console.log('String message');
      console.log(42);
      console.log(true);
      console.log(null);
      console.log(undefined);
      console.log({ object: 'test', nested: { value: 123 } });
      console.log(['array', 'test', 456]);
      
      // Test with multiple arguments
      console.log('Multiple', 'arguments', 123, { test: true });
      
      // Test with special characters
      console.log('Special chars: 🎼 📡 🎵 ✅ ❌');
      
      // Test with very long message
      const longMessage = 'A'.repeat(1000);
      console.log('Long message:', longMessage);
      
      // Test with circular reference (should be handled gracefully)
      const circular = { name: 'test' };
      circular.self = circular;
      try {
        console.log('Circular reference test:', circular);
      } catch (e) {
        console.log('Circular reference handled:', e.message);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Verify logs were captured despite edge cases
    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThan(10);
    
    // Check for specific edge case messages
    const stringLog = logger.getLogsContaining('String message');
    expect(stringLog.length).toBeGreaterThan(0);
    
    const multipleArgsLog = logger.getLogsContaining('Multiple arguments');
    expect(multipleArgsLog.length).toBeGreaterThan(0);
    
    const specialCharsLog = logger.getLogsContaining('🎼');
    expect(specialCharsLog.length).toBeGreaterThan(0);
    
    const longMessageLog = logger.getLogsContaining('Long message');
    expect(longMessageLog.length).toBeGreaterThan(0);
    
    // Verify no errors in log capture process
    expect(logger.hasErrors()).toBe(false);
  });
});
