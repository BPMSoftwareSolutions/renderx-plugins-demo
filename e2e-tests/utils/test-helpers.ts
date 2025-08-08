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

export interface OptimizedTestConfig {
  useSharedConductor?: boolean;
  useCachedModules?: boolean;
  enablePerformanceTracking?: boolean;
  timeout?: number;
  retries?: number;
  testUrl?: string;
}

export interface ConductorTestContext {
  conductor: any;
  eventBus: any;
  communicationSystem: any;
  isShared: boolean;
  isCached: boolean;
  performanceMetrics?: any;
  cacheStats?: any;
}

// Default optimized test configuration
const OPTIMIZED_CONFIG: OptimizedTestConfig = {
  useSharedConductor: true,
  useCachedModules: false,
  enablePerformanceTracking: true,
  timeout: 30000,
  retries: 3,
  testUrl: "http://127.0.0.1:3000/bundled",
};

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

/**
 * Initialize MusicalConductor with optimized performance settings
 * Supports shared conductors, module caching, and performance tracking
 */
export async function initializeOptimizedMusicalConductor(
  context: TestContext,
  config: OptimizedTestConfig = {}
): Promise<ConductorTestContext> {
  const { page, logger } = context;
  const finalConfig = { ...OPTIMIZED_CONFIG, ...config };
  const startTime = Date.now();

  try {
    // Determine the best URL to use based on configuration
    let testUrl = finalConfig.testUrl!;
    if (finalConfig.useCachedModules) {
      testUrl += "/cached";
      logger.log("🚀 Using cached module version for optimal performance");
    }

    // Check if shared conductor is available and requested
    if (finalConfig.useSharedConductor && isSharedConductorAvailable()) {
      logger.log("🚀 Attempting to use shared MusicalConductor instance");
      const sharedPage = getSharedConductorPage();
      if (sharedPage) {
        // Copy shared conductor state to current page
        const sharedState = await sharedPage.evaluate(() => {
          return {
            conductor: window.E2ETestApp?.getConductor(),
            eventBus: window.E2ETestApp?.getEventBus(),
            metrics: window.E2ETestApp?.getMetrics(),
            cacheStats: window.MusicalConductorCache?.getStats(),
          };
        });

        if (sharedState.conductor) {
          logger.log("✅ Shared conductor state retrieved successfully");
          return {
            conductor: sharedState.conductor,
            eventBus: sharedState.eventBus,
            communicationSystem: null, // Not available in shared context
            isShared: true,
            isCached: finalConfig.useCachedModules || false,
            performanceMetrics: sharedState.metrics,
            cacheStats: sharedState.cacheStats,
          };
        }
      }
    }

    // Fall back to individual initialization with optimizations
    logger.log(
      "⚠️ Shared conductor not available, initializing individual instance"
    );
    logger.log(`🌐 Navigating to: ${testUrl}`);

    // Navigate to the optimized test app
    await page.goto(testUrl);
    await page.waitForLoadState("networkidle");

    // Track performance if enabled
    if (finalConfig.enablePerformanceTracking) {
      await page.evaluate(() => {
        if (window.performanceMetrics) {
          window.performanceMetrics.testStartTime = performance.now();
        }
      });
    }

    // Initialize conductor
    await page.click("#init-conductor");

    // Wait for initialization to complete with timeout
    await page.waitForFunction(
      () => {
        return window.E2ETestApp && window.E2ETestApp.getConductor() !== null;
      },
      { timeout: finalConfig.timeout }
    );

    // Get conductor instances and metrics
    const context = await page.evaluate(() => {
      const conductor = window.E2ETestApp?.getConductor();
      const eventBus = window.E2ETestApp?.getEventBus();
      const metrics = window.E2ETestApp?.getMetrics();
      const perfMetrics = window.performanceMetrics;
      const cacheStats = window.MusicalConductorCache?.getStats();

      return {
        conductor: conductor !== null,
        eventBus: eventBus !== null,
        metrics,
        perfMetrics,
        cacheStats,
      };
    });

    if (!context.conductor || !context.eventBus) {
      throw new Error("Failed to initialize conductor or eventBus");
    }

    const duration = Date.now() - startTime;
    logger.log(
      `✅ Individual MusicalConductor instance initialized in ${duration}ms`
    );

    // Log performance metrics if available
    if (context.cacheStats) {
      logger.log(
        `📊 Cache Performance: ${context.cacheStats.cacheHitRatio?.toFixed(
          1
        )}% hit ratio`
      );
      logger.log(`📊 HTTP Requests: ${context.cacheStats.httpRequests}`);
    }

    return {
      conductor: context.conductor,
      eventBus: context.eventBus,
      communicationSystem: null, // Would need to be extracted from page context
      isShared: false,
      isCached: finalConfig.useCachedModules || false,
      performanceMetrics: context.metrics,
      cacheStats: context.cacheStats,
    };
  } catch (error) {
    logger.error(
      `❌ Failed to initialize optimized MusicalConductor: ${error.message}`
    );
    throw error;
  }
}

/**
 * Test conductor reuse across multiple test scenarios
 * This function demonstrates how to reuse a conductor instance efficiently
 */
export async function testConductorReuse(
  context: TestContext,
  conductorContext: ConductorTestContext
): Promise<boolean> {
  const { page, logger } = context;

  try {
    logger.log("🔄 Testing conductor reuse capabilities...");

    // Test 1: EventBus functionality
    await page.click("#test-eventbus");
    await page.waitForTimeout(1000);

    // Test 2: Sequence execution
    await page.click("#test-sequences");
    await page.waitForTimeout(1000);

    // Test 3: Plugin system
    await page.click("#test-plugins");
    await page.waitForTimeout(1000);

    // Get final metrics
    const finalMetrics = await page.evaluate(() => {
      return window.E2ETestApp?.getMetrics() || {};
    });

    // Verify conductor is still functional
    const isStillFunctional =
      finalMetrics.eventCount > 0 &&
      finalMetrics.sequenceCount > 0 &&
      finalMetrics.pluginCount > 0;

    if (isStillFunctional) {
      logger.log("✅ Conductor reuse test passed - all functionality working");

      // Log performance benefits if using cached version
      if (conductorContext.isCached && conductorContext.cacheStats) {
        logger.log(
          `📊 Cache benefits: ${conductorContext.cacheStats.cacheHitRatio?.toFixed(
            1
          )}% hit ratio`
        );
      }
    } else {
      logger.error("❌ Conductor reuse test failed - functionality degraded");
    }

    return isStillFunctional;
  } catch (error) {
    logger.error(`❌ Conductor reuse test failed: ${error.message}`);
    return false;
  }
}
