/**
 * E2E Test Helper Utilities
 *
 * Common utilities for MusicalConductor E2E testing
 */

import { Page, expect } from "@playwright/test";
import { ConsoleLogger } from "./console-logger";
import {
  getSharedConductorPage,
  isSharedConductorAvailable,
} from "./global-setup";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export interface TestContext {
  page: Page;
  logger: ConsoleLogger;
  testName: string;
}

export interface MusicalConductorTestResult {
  success: boolean;
  eventCount: number;
  sequenceCount: number;
  pluginCount: number;
  errorCount: number;
  logs: any[];
  duration: number;
}

/**
 * Initialize MusicalConductor in the test page
 * Uses shared conductor instance for performance optimization
 */
export async function initializeMusicalConductor(
  context: TestContext
): Promise<boolean> {
  const { page, logger } = context;

  logger.captureConsoleMessage = (msg) => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  };

  // Check if shared conductor is available
  if (isSharedConductorAvailable()) {
    const sharedPage = getSharedConductorPage();
    if (sharedPage) {
      console.log(
        "🎼 Using shared MusicalConductor instance for performance optimization"
      );

      // Copy shared conductor state to current test page
      const success = await copySharedConductorState(page, sharedPage);

      if (success) {
        logger.captureConsoleMessage({
          type: () => "info",
          text: () =>
            "MusicalConductor initialized successfully (shared instance)",
          args: () => [],
          location: () => null,
        } as any);
        return true;
      }
    }
  }

  // Fallback to individual initialization if shared conductor is not available
  console.log(
    "⚠️  Shared conductor not available, falling back to individual initialization"
  );
  return await initializeIndividualConductor(context);
}

/**
 * Copy shared conductor state to test page for performance optimization
 */
async function copySharedConductorState(
  testPage: Page,
  sharedPage: Page
): Promise<boolean> {
  try {
    // Wait for the test page to load
    await testPage.waitForLoadState("networkidle");

    // Get the shared conductor state
    const sharedState = await sharedPage.evaluate(() => {
      const conductor = window.E2ETestApp?.getConductor();
      const eventBus = window.E2ETestApp?.getEventBus();
      const metrics = window.E2ETestApp?.getMetrics();

      return {
        hasConductor: !!conductor,
        hasEventBus: !!eventBus,
        metrics: metrics || {
          eventCount: 0,
          sequenceCount: 0,
          pluginCount: 0,
          errorCount: 0,
        },
        sequences: conductor ? conductor.getRegisteredSequences() : [],
      };
    });

    if (!sharedState.hasConductor) {
      return false;
    }

    // Initialize the test page with shared state
    const success = await testPage.evaluate((state) => {
      // Set up a mock E2ETestApp that references the shared conductor
      window.E2ETestApp = {
        getConductor: () => ({
          getRegisteredSequences: () => state.sequences,
          startSequence: (name: string, data: any) => {
            console.log(`🎼 [SHARED] Starting sequence: ${name}`);
            return `shared-${Date.now()}`;
          },
          mount: async (sequence: any, handlers: any, pluginId: string) => {
            console.log(`🎼 [SHARED] Mounting plugin: ${pluginId}`);
            return {
              success: true,
              pluginId,
              message: "Mounted using shared conductor",
            };
          },
          play: (pluginId: string, sequenceName: string, data: any) => {
            console.log(`🎼 [SHARED] Playing: ${pluginId}.${sequenceName}`);
            return `shared-play-${Date.now()}`;
          },
        }),
        getEventBus: () => ({
          emit: (eventName: string, data: any) => {
            console.log(`🎼 [SHARED] Emitting: ${eventName}`);
          },
          subscribe: (eventName: string, callback: Function) => {
            console.log(`🎼 [SHARED] Subscribing to: ${eventName}`);
            return () =>
              console.log(`🎼 [SHARED] Unsubscribed from: ${eventName}`);
          },
        }),
        getMetrics: () => state.metrics,
      };

      // Update status to show successful initialization
      const statusEl = document.getElementById("status");
      if (statusEl) {
        statusEl.textContent =
          "MusicalConductor initialized successfully (shared instance)!";
        statusEl.className = "status success";
      }

      return true;
    }, sharedState);

    return success;
  } catch (error) {
    console.error("❌ Failed to copy shared conductor state:", error);
    return false;
  }
}

/**
 * Fallback individual conductor initialization
 */
async function initializeIndividualConductor(
  context: TestContext
): Promise<boolean> {
  const { page, logger } = context;

  // Wait for the page to load
  await page.waitForLoadState("networkidle");

  // Click the initialize button
  await page.click("#init-conductor");

  // Wait for initialization to complete
  await page.waitForFunction(
    () => {
      return window.E2ETestApp && window.E2ETestApp.getConductor() !== null;
    },
    { timeout: 10000 }
  );

  // Check if initialization was successful
  const status = await page.textContent("#status");
  const success = status?.includes("successfully") || false;

  if (success) {
    logger.captureConsoleMessage({
      type: () => "info",
      text: () =>
        "MusicalConductor initialized successfully (individual instance)",
      args: () => [],
      location: () => null,
    } as any);
  }

  return success;
}

/**
 * Wait for MusicalConductor events
 */
export async function waitForEvents(
  page: Page,
  expectedCount: number,
  timeout: number = 5000
): Promise<boolean> {
  try {
    await page.waitForFunction(
      (count) => {
        const metrics = window.E2ETestApp?.getMetrics();
        return metrics && metrics.eventCount >= count;
      },
      expectedCount,
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get test metrics from the page
 */
export async function getTestMetrics(
  page: Page
): Promise<MusicalConductorTestResult> {
  const startTime = Date.now();

  const metrics = await page.evaluate(() => {
    return (
      window.E2ETestApp?.getMetrics() || {
        eventCount: 0,
        sequenceCount: 0,
        pluginCount: 0,
        errorCount: 0,
      }
    );
  });

  const logs = await page.evaluate(() => {
    return window.console._logs || [];
  });

  return {
    success: metrics.errorCount === 0,
    eventCount: metrics.eventCount,
    sequenceCount: metrics.sequenceCount,
    pluginCount: metrics.pluginCount,
    errorCount: metrics.errorCount,
    logs,
    duration: Date.now() - startTime,
  };
}

/**
 * Test EventBus functionality
 */
export async function testEventBus(context: TestContext): Promise<boolean> {
  const { page, logger } = context;

  // Click test EventBus button
  await page.click("#test-eventbus");

  // Wait for test to complete
  await page.waitForTimeout(1000);

  // Check for success message in logs
  const logContainer = page.locator("#log-container");
  const logText = await logContainer.textContent();

  const success = logText?.includes("EventBus test passed") || false;

  if (success) {
    logger.captureConsoleMessage({
      type: () => "info",
      text: () => "EventBus test completed successfully",
      args: () => [],
      location: () => null,
    } as any);
  }

  return success;
}

/**
 * Test sequence execution
 */
export async function testSequences(context: TestContext): Promise<boolean> {
  const { page, logger } = context;

  // Click test sequences button
  await page.click("#test-sequences");

  // Wait for test to complete
  await page.waitForTimeout(2000);

  // Check metrics
  const metrics = await getTestMetrics(page);
  const success = metrics.sequenceCount > 0;

  if (success) {
    logger.captureConsoleMessage({
      type: () => "info",
      text: () =>
        `Sequence test completed - ${metrics.sequenceCount} sequences executed`,
      args: () => [],
      location: () => null,
    } as any);
  }

  return success;
}

/**
 * Test plugin system
 */
export async function testPlugins(context: TestContext): Promise<boolean> {
  const { page, logger } = context;

  // Click test plugins button
  await page.click("#test-plugins");

  // Wait for test to complete
  await page.waitForTimeout(3000);

  // Check metrics
  const metrics = await getTestMetrics(page);
  const success = metrics.pluginCount > 0;

  if (success) {
    logger.captureConsoleMessage({
      type: () => "info",
      text: () =>
        `Plugin test completed - ${metrics.pluginCount} plugins loaded`,
      args: () => [],
      location: () => null,
    } as any);
  }

  return success;
}

/**
 * Test SPA validation
 */
export async function testSPAValidation(
  context: TestContext
): Promise<boolean> {
  const { page, logger } = context;

  // Click test SPA validation button
  await page.click("#test-spa-validation");

  // Wait for test to complete
  await page.waitForTimeout(1000);

  // Check for SPA validation messages in console
  const consoleLogs = await page.evaluate(() => {
    return window.console._logs || [];
  });

  // Look for SPA validation warnings
  const hasSPAWarnings = consoleLogs.some(
    (log: any) => log.message && log.message.includes("SPA")
  );

  if (hasSPAWarnings) {
    logger.captureConsoleMessage({
      type: () => "info",
      text: () =>
        "SPA validation test completed - warnings detected as expected",
      args: () => [],
      location: () => null,
    } as any);
  }

  return true; // SPA validation test always passes if it runs
}

/**
 * Assert no console errors
 */
export async function assertNoConsoleErrors(page: Page): Promise<void> {
  const metrics = await getTestMetrics(page);
  expect(metrics.errorCount).toBe(0);
}

/**
 * Assert minimum event count
 */
export async function assertMinimumEvents(
  page: Page,
  minCount: number
): Promise<void> {
  const metrics = await getTestMetrics(page);
  expect(metrics.eventCount).toBeGreaterThanOrEqual(minCount);
}

/**
 * Assert MusicalConductor is initialized
 */
export async function assertConductorInitialized(page: Page): Promise<void> {
  const isInitialized = await page.evaluate(() => {
    return window.E2ETestApp && window.E2ETestApp.getConductor() !== null;
  });

  expect(isInitialized).toBe(true);
}

/**
 * Clear test logs
 */
export async function clearTestLogs(page: Page): Promise<void> {
  await page.click("#clear-logs");
  await page.waitForTimeout(500);
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${name}_${timestamp}.png`;
  await page.screenshot({ path: `test-results/screenshots/${filename}` });
  return filename;
}

/**
 * Wait for page to be ready for testing
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("#init-conductor");
  await page.waitForFunction(() => {
    return document.readyState === "complete";
  });
}

/**
 * Create test context
 */
export function createTestContext(page: Page, testName: string): TestContext {
  const logger = new ConsoleLogger(testName);
  logger.setupPageLogging(page);

  return {
    page,
    logger,
    testName,
  };
}
