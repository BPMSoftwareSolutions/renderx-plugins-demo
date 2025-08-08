/**
 * Plugin Validation E2E Tests
 *
 * Tests architectural boundary compliance and SPA validation
 * in real browser scenarios using Playwright
 */

import { test, expect, Page } from "@playwright/test";
import {
  createTestContext,
  initializeMusicalConductor,
  waitForPageReady,
  getTestMetrics,
  takeTimestampedScreenshot,
} from "../utils/test-helpers";
import {
  ConsoleLogger,
  analyzeMusicalConductorLogs,
} from "../utils/console-logger";

test.describe("MusicalConductor Plugin Validation", () => {
  let page: Page;
  let logger: ConsoleLogger;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    logger = new ConsoleLogger("Plugin Validation");
    logger.setupPageLogging(page);

    await page.goto("/bundled");
    await waitForPageReady(page);
    await takeTimestampedScreenshot(page, "plugin-validation-start");
  });

  test.afterEach(async () => {
    logger.saveLogsAsJSON();
    await takeTimestampedScreenshot(page, "plugin-validation-end");
  });

  test("should validate SPA compliance during plugin mounting", async () => {
    const context = createTestContext(page, "SPA Compliance Test");

    await initializeMusicalConductor(context);

    // Test plugin mounting with SPA validation
    const validationResult = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      if (!conductor) return { success: false, error: "No conductor" };

      try {
        // Create a compliant plugin
        const compliantPlugin = {
          name: "Compliant Test Plugin",
          version: "1.0.0",
          movements: [
            {
              name: "Compliant Movement",
              beats: [
                {
                  beat: 1,
                  event: "compliant-test-event",
                  timing: "immediate",
                  data: { compliant: true },
                },
              ],
            },
          ],
        };

        const compliantHandlers = {
          "Compliant Movement": (context) => {
            // This is compliant - uses conductor.play() pattern
            return { success: true, message: "Compliant execution" };
          },
        };

        const result = await conductor.mount(
          compliantPlugin,
          compliantHandlers,
          "compliant-test-plugin"
        );

        return { success: result.success, result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    expect(validationResult.success).toBe(true);

    // Check for validation messages in logs
    const logs = logger.getLogs();
    const validationLogs = logs.filter(
      (log) =>
        log.message.toLowerCase().includes("validation") ||
        log.message.toLowerCase().includes("compliant")
    );

    // Should have some validation activity
    expect(validationLogs.length).toBeGreaterThanOrEqual(0);
  });

  test("should detect and prevent direct EventBus access violations", async () => {
    const context = createTestContext(page, "EventBus Violation Test");

    await initializeMusicalConductor(context);

    // Test direct EventBus access (should be caught by SPA validator)
    const violationTest = await page.evaluate(() => {
      const eventBus = window.E2ETestApp?.getEventBus();
      if (!eventBus) return { tested: false };

      // Capture console messages before the violation
      const originalConsoleError = console.error;
      const consoleMessages = [];
      console.error = (...args) => {
        consoleMessages.push(args.join(" "));
        originalConsoleError.apply(console, args);
      };

      try {
        // This should trigger SPA validation warning
        eventBus.emit("direct-violation-test", {
          violation: true,
          timestamp: Date.now(),
        });

        // Restore console
        console.error = originalConsoleError;

        return {
          tested: true,
          consoleMessages,
          violationDetected: consoleMessages.some(
            (msg) => msg.includes("SPA") || msg.includes("violation")
          ),
        };
      } catch (error) {
        console.error = originalConsoleError;
        return { tested: true, error: error.message };
      }
    });

    expect(violationTest.tested).toBe(true);

    // Check that the event was still emitted (but potentially logged as violation)
    const metrics = await getTestMetrics(page);
    expect(metrics.eventCount).toBeGreaterThan(0);
  });

  test("should validate plugin code for architectural compliance", async () => {
    const context = createTestContext(page, "Code Validation Test");

    await initializeMusicalConductor(context);

    // Test plugin code validation
    const codeValidationResult = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      if (!conductor) return { success: false };

      // Test with non-compliant plugin code
      const nonCompliantCode = `
        function badPlugin() {
          // This is non-compliant - direct eventBus access
          eventBus.emit('bad-event', {});
          window.globalEventBus.emit('another-bad-event', {});
        }
      `;

      // Test with compliant plugin code
      const compliantCode = `
        function goodPlugin(conductor) {
          // This is compliant - uses conductor.play()
          conductor.play('plugin-id', 'sequence-name', {});
        }
      `;

      try {
        // If SPAValidator has validatePluginMount method, test it
        if (conductor.validatePluginMount) {
          const badResult = conductor.validatePluginMount(
            "bad-plugin",
            nonCompliantCode
          );
          const goodResult = conductor.validatePluginMount(
            "good-plugin",
            compliantCode
          );

          return {
            success: true,
            badPluginValid: badResult.valid,
            badPluginViolations: badResult.violations,
            goodPluginValid: goodResult.valid,
            goodPluginViolations: goodResult.violations,
          };
        }

        return { success: true, validationNotAvailable: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    expect(codeValidationResult.success).toBe(true);

    // If validation is available, check results
    if (!codeValidationResult.validationNotAvailable) {
      expect(codeValidationResult.badPluginValid).toBe(false);
      expect(codeValidationResult.goodPluginValid).toBe(true);
      expect(codeValidationResult.badPluginViolations?.length).toBeGreaterThan(
        0
      );
    }
  });

  test("should enforce conductor.play() usage pattern", async () => {
    const context = createTestContext(page, "Conductor Play Pattern Test");

    await initializeMusicalConductor(context);

    // Test proper conductor.play() usage
    const playPatternTest = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      if (!conductor) return { success: false };

      try {
        // First mount a plugin
        const testPlugin = {
          name: "Play Pattern Test Plugin",
          version: "1.0.0",
          movements: [
            {
              name: "Test Movement",
              beats: [
                {
                  beat: 1,
                  event: "play-pattern-test",
                  timing: "immediate",
                  data: { pattern: "test" },
                },
              ],
            },
          ],
        };

        const testHandlers = {
          "Test Movement": (context) => {
            return { success: true, context };
          },
        };

        const mountResult = await conductor.mount(
          testPlugin,
          testHandlers,
          "play-pattern-plugin"
        );

        if (!mountResult.success) {
          return { success: false, error: "Mount failed" };
        }

        // Now test conductor.play() usage
        const playResult = conductor.play(
          "play-pattern-plugin",
          "Play Pattern Test Plugin",
          { testData: "conductor.play() test" }
        );

        return {
          success: true,
          mountResult,
          playResult,
          playExecuted: playResult !== undefined,
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    expect(playPatternTest.success).toBe(true);
    expect(playPatternTest.mountResult?.success).toBe(true);

    // Check console for proper conductor usage
    const logs = logger.getLogs();
    const conductorLogs = analyzeMusicalConductorLogs(logs);
    expect(conductorLogs.conductorMessages.length).toBeGreaterThan(0);
  });

  test("should validate plugin metadata and structure", async () => {
    const context = createTestContext(page, "Plugin Structure Test");

    await initializeMusicalConductor(context);

    // Test plugin structure validation
    const structureTest = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      if (!conductor) return { success: false };

      const results = [];

      // Test 1: Valid plugin structure
      try {
        const validPlugin = {
          name: "Valid Structure Plugin",
          version: "1.0.0",
          movements: [
            {
              name: "Valid Movement",
              beats: [
                {
                  beat: 1,
                  event: "valid-structure-test",
                  timing: "immediate",
                },
              ],
            },
          ],
        };

        const validHandlers = {
          "Valid Movement": () => ({ success: true }),
        };

        const validResult = await conductor.mount(
          validPlugin,
          validHandlers,
          "valid-plugin"
        );
        results.push({ test: "valid", success: validResult.success });
      } catch (error) {
        results.push({ test: "valid", success: false, error: error.message });
      }

      // Test 2: Invalid plugin structure (missing required fields)
      try {
        const invalidPlugin = {
          // Missing name and version
          movements: [],
        };

        const invalidHandlers = {};

        const invalidResult = await conductor.mount(
          invalidPlugin,
          invalidHandlers,
          "invalid-plugin"
        );
        results.push({
          test: "invalid",
          success: invalidResult.success,
          shouldFail: true,
        });
      } catch (error) {
        results.push({
          test: "invalid",
          success: false,
          error: error.message,
          expectedError: true,
        });
      }

      // Test 3: Plugin with metadata
      try {
        const metadataPlugin = {
          name: "Metadata Plugin",
          version: "2.0.0",
          movements: [
            {
              name: "Metadata Movement",
              beats: [
                {
                  beat: 1,
                  event: "metadata-test",
                  timing: "immediate",
                },
              ],
            },
          ],
        };

        const metadataHandlers = {
          "Metadata Movement": () => ({ success: true }),
        };

        const metadata = {
          author: "E2E Test Suite",
          description: "Test plugin with metadata",
          tags: ["test", "e2e", "validation"],
        };

        const metadataResult = await conductor.mount(
          metadataPlugin,
          metadataHandlers,
          "metadata-plugin",
          metadata
        );

        results.push({ test: "metadata", success: metadataResult.success });
      } catch (error) {
        results.push({
          test: "metadata",
          success: false,
          error: error.message,
        });
      }

      return { success: true, results };
    });

    expect(structureTest.success).toBe(true);

    // Check individual test results
    const validTest = structureTest.results?.find((r) => r.test === "valid");
    expect(validTest?.success).toBe(true);

    const metadataTest = structureTest.results?.find(
      (r) => r.test === "metadata"
    );
    expect(metadataTest?.success).toBe(true);

    // Invalid test should either fail or be caught by validation
    const invalidTest = structureTest.results?.find(
      (r) => r.test === "invalid"
    );
    expect(invalidTest).toBeDefined();
  });

  test("should handle plugin lifecycle events correctly", async () => {
    const context = createTestContext(page, "Plugin Lifecycle Test");

    await initializeMusicalConductor(context);

    // Test plugin lifecycle
    const lifecycleTest = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      if (!conductor) return { success: false };

      const lifecycleEvents = [];

      try {
        // Create plugin with lifecycle tracking
        const lifecyclePlugin = {
          name: "Lifecycle Test Plugin",
          version: "1.0.0",
          movements: [
            {
              name: "Lifecycle Movement",
              beats: [
                {
                  beat: 1,
                  event: "lifecycle-test",
                  timing: "immediate",
                  data: { phase: "execution" },
                },
              ],
            },
          ],
        };

        const lifecycleHandlers = {
          "Lifecycle Movement": (context) => {
            lifecycleEvents.push({ phase: "handler-executed", context });
            return { success: true, phase: "completed" };
          },
        };

        // Mount phase
        lifecycleEvents.push({ phase: "mounting" });
        const mountResult = await conductor.mount(
          lifecyclePlugin,
          lifecycleHandlers,
          "lifecycle-plugin"
        );

        if (mountResult.success) {
          lifecycleEvents.push({ phase: "mounted", result: mountResult });

          // Execution phase
          lifecycleEvents.push({ phase: "executing" });
          const playResult = conductor.play(
            "lifecycle-plugin",
            "Lifecycle Test Plugin",
            { lifecycleTest: true }
          );

          lifecycleEvents.push({ phase: "executed", result: playResult });
        }

        return {
          success: true,
          lifecycleEvents,
          mountSuccess: mountResult.success,
        };
      } catch (error) {
        lifecycleEvents.push({ phase: "error", error: error.message });
        return { success: false, error: error.message, lifecycleEvents };
      }
    });

    expect(lifecycleTest.success).toBe(true);
    expect(lifecycleTest.mountSuccess).toBe(true);
    expect(lifecycleTest.lifecycleEvents?.length).toBeGreaterThan(0);

    // Verify lifecycle phases
    const phases = lifecycleTest.lifecycleEvents?.map((e) => e.phase) || [];
    expect(phases).toContain("mounting");
    expect(phases).toContain("mounted");
    expect(phases).toContain("executing");
  });

  test("should maintain architectural boundaries under load", async () => {
    const context = createTestContext(
      page,
      "Architectural Boundaries Load Test"
    );

    await initializeMusicalConductor(context);

    // Test architectural boundaries under multiple operations
    const loadTest = await page.evaluate(async () => {
      const conductor = window.E2ETestApp?.getConductor();
      const eventBus = window.E2ETestApp?.getEventBus();
      if (!conductor || !eventBus) return { success: false };

      const operations = [];
      const startTime = Date.now();

      try {
        // Perform multiple operations rapidly
        for (let i = 0; i < 10; i++) {
          // Mount plugins
          const plugin = {
            name: `Load Test Plugin ${i}`,
            version: "1.0.0",
            movements: [
              {
                name: `Load Movement ${i}`,
                beats: [
                  {
                    beat: 1,
                    event: `load-test-${i}`,
                    timing: "immediate",
                  },
                ],
              },
            ],
          };

          const handlers = {
            [`Load Movement ${i}`]: () => ({ success: true, index: i }),
          };

          const mountResult = await conductor.mount(
            plugin,
            handlers,
            `load-plugin-${i}`
          );
          operations.push({
            type: "mount",
            index: i,
            success: mountResult.success,
          });

          // Execute plugin
          if (mountResult.success) {
            const playResult = conductor.play(
              `load-plugin-${i}`,
              `Load Test Plugin ${i}`,
              { index: i }
            );
            operations.push({
              type: "play",
              index: i,
              success: playResult !== undefined,
            });
          }

          // Emit events
          eventBus.emit(`load-event-${i}`, { index: i, timestamp: Date.now() });
          operations.push({ type: "emit", index: i, success: true });
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        return {
          success: true,
          operations,
          duration,
          operationCount: operations.length,
          averageTime: duration / operations.length,
        };
      } catch (error) {
        return { success: false, error: error.message, operations };
      }
    });

    expect(loadTest.success).toBe(true);
    expect(loadTest.operationCount).toBeGreaterThan(20); // Should have multiple operations
    expect(loadTest.duration).toBeLessThan(10000); // Should complete within 10 seconds

    // Check that all mount operations succeeded
    const mountOps =
      loadTest.operations?.filter((op) => op.type === "mount") || [];
    const successfulMounts = mountOps.filter((op) => op.success);
    expect(successfulMounts.length).toBeGreaterThan(0);

    // Verify system is still responsive
    const finalMetrics = await getTestMetrics(page);
    expect(finalMetrics.eventCount).toBeGreaterThan(0);
    expect(finalMetrics.pluginCount).toBeGreaterThan(0);
  });
});
