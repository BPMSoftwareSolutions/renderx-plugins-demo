/**
 * Global Teardown for MusicalConductor E2E Tests
 *
 * Handles cleanup after all tests complete:
 * - Log file consolidation
 * - Test result summary
 * - Resource cleanup
 * - Shared conductor cleanup
 */

import { FullConfig } from "@playwright/test";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { getSharedConductorPage } from "./global-setup";

async function globalTeardown(config: FullConfig) {
  console.log("🎼 Cleaning up MusicalConductor E2E Test Environment...");

  // Clean up shared conductor instance
  await cleanupSharedConductor();

  // Consolidate console logs
  const consoleLogsDir = "test-results/console-logs";
  if (existsSync(consoleLogsDir)) {
    try {
      const logFiles = readdirSync(consoleLogsDir).filter((file) =>
        file.endsWith(".log")
      );

      if (logFiles.length > 0) {
        const consolidatedLog = join(
          "test-results",
          "consolidated-console.log"
        );
        let consolidatedContent = [
          "=".repeat(80),
          "MusicalConductor E2E Tests - Consolidated Console Log",
          `Generated: ${new Date().toISOString()}`,
          `Total log files: ${logFiles.length}`,
          "=".repeat(80),
          "",
        ].join("\n");

        logFiles.forEach((logFile) => {
          const logPath = join(consoleLogsDir, logFile);
          const content = readFileSync(logPath, "utf-8");
          consolidatedContent += `\n${"=".repeat(40)} ${logFile} ${"=".repeat(
            40
          )}\n`;
          consolidatedContent += content;
          consolidatedContent += "\n";
        });

        writeFileSync(consolidatedLog, consolidatedContent);
        console.log(
          `📋 Consolidated console logs saved to: ${consolidatedLog}`
        );
      }
    } catch (error) {
      console.warn("⚠️  Failed to consolidate console logs:", error);
    }
  }

  // Generate test summary
  try {
    const resultsFile = "test-results/results.json";
    if (existsSync(resultsFile)) {
      const results = JSON.parse(readFileSync(resultsFile, "utf-8"));

      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        browsers: results.config?.projects?.map((p: any) => p.name) || [],
      };

      writeFileSync(
        "test-results/test-summary.json",
        JSON.stringify(summary, null, 2)
      );

      console.log("📊 Test Summary:");
      console.log(`   Total: ${summary.totalTests}`);
      console.log(`   Passed: ${summary.passed}`);
      console.log(`   Failed: ${summary.failed}`);
      console.log(`   Duration: ${Math.round(summary.duration / 1000)}s`);
    }
  } catch (error) {
    console.warn("⚠️  Failed to generate test summary:", error);
  }

  console.log("✅ E2E Test Environment cleanup complete");
}

/**
 * Clean up the shared conductor instance
 */
async function cleanupSharedConductor() {
  try {
    const sharedPage = getSharedConductorPage();
    if (sharedPage) {
      console.log("🧹 Cleaning up shared MusicalConductor instance...");

      // Close the shared page and browser
      const browser = sharedPage.context().browser();
      await sharedPage.close();
      if (browser) {
        await browser.close();
      }

      console.log("✅ Shared conductor cleanup complete");
    }
  } catch (error) {
    console.warn("⚠️  Failed to cleanup shared conductor:", error);
  }
}

export default globalTeardown;
