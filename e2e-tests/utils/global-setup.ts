/**
 * Global Setup for MusicalConductor E2E Tests
 *
 * Handles global test environment setup including:
 * - Test server startup
 * - Browser installation verification
 * - Log directory creation
 * - Environment validation
 * - Shared conductor instance initialization
 */

import { chromium, FullConfig, Browser, Page } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { request } from "http";

// Global state for shared conductor
let sharedBrowser: Browser | null = null;
let sharedPage: Page | null = null;
let sharedConductorInitialized = false;

async function globalSetup(config: FullConfig) {
  console.log("🎼 Setting up MusicalConductor E2E Test Environment...");

  // Create necessary directories
  const testResultsDir = "test-results";
  const consoleLogsDir = join(testResultsDir, "console-logs");
  const videosDir = join(testResultsDir, "videos");
  const screenshotsDir = join(testResultsDir, "screenshots");

  [testResultsDir, consoleLogsDir, videosDir, screenshotsDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Verify browser installation
  try {
    const browser = await chromium.launch();
    await browser.close();
    console.log("✅ Browser installation verified");
  } catch (error) {
    console.error("❌ Browser installation failed:", error);
    throw error;
  }

  // Verify musical-conductor package is available
  try {
    require("musical-conductor");
    console.log("✅ musical-conductor package is available");
  } catch (error) {
    console.warn(
      "⚠️  musical-conductor package not found - this is expected if running from source"
    );
  }

  // Initialize shared conductor instance for performance optimization
  await initializeSharedConductor();

  console.log("🚀 E2E Test Environment setup complete");
}

/**
 * Wait for server to be ready
 */
async function waitForServer(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();
  const urlObj = new URL(url);

  return new Promise((resolve, reject) => {
    const checkServer = () => {
      const req = request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 80,
          path: urlObj.pathname,
          method: "GET",
          timeout: 5000,
        },
        (res) => {
          if (res.statusCode === 200) {
            console.log("✅ Test server is ready");
            resolve();
          } else {
            retryOrFail();
          }
        }
      );

      req.on("error", () => {
        retryOrFail();
      });

      req.on("timeout", () => {
        req.destroy();
        retryOrFail();
      });

      req.end();
    };

    const retryOrFail = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error(`Server at ${url} not ready after ${timeout}ms`));
      } else {
        setTimeout(checkServer, 1000);
      }
    };

    checkServer();
  });
}

/**
 * Initialize a shared MusicalConductor instance to avoid redundant loading
 * This dramatically improves test performance by:
 * - Loading modules only once instead of 30+ times per test
 * - Registering plugins only once instead of per test
 * - Eliminating multiple conductor instance conflicts
 */
async function initializeSharedConductor() {
  try {
    console.log("🎼 Initializing shared MusicalConductor instance...");

    // Wait for test server to be ready
    console.log("⏳ Waiting for test server to be ready...");
    await waitForServer("http://127.0.0.1:3000", 30000);

    // Launch browser for shared conductor
    sharedBrowser = await chromium.launch({ headless: true });
    const context = await sharedBrowser.newContext();
    sharedPage = await context.newPage();

    // Enable console logging for debugging
    sharedPage.on("console", (msg) => {
      console.log(`[SHARED-BROWSER] ${msg.type()}: ${msg.text()}`);
    });

    // Navigate to test app
    console.log("🌐 Navigating to test app...");
    await sharedPage.goto("http://127.0.0.1:3000");
    await sharedPage.waitForLoadState("networkidle");

    // Check if page loaded correctly
    const title = await sharedPage.title();
    console.log(`📄 Page title: ${title}`);

    // Wait for the init button to be available
    console.log("⏳ Waiting for init button...");
    await sharedPage.waitForSelector("#init-conductor", { timeout: 10000 });

    // Initialize conductor
    console.log("🎼 Clicking init conductor button...");
    await sharedPage.click("#init-conductor");

    // Wait for initialization to complete
    console.log("⏳ Waiting for conductor initialization...");
    await sharedPage.waitForFunction(
      () => {
        return window.E2ETestApp && window.E2ETestApp.getConductor() !== null;
      },
      { timeout: 30000 }
    );

    // Verify initialization was successful
    const status = await sharedPage.textContent("#status");
    console.log(`📊 Status text: "${status}"`);

    if (status?.includes("successfully")) {
      sharedConductorInitialized = true;
      console.log(
        "✅ Shared MusicalConductor instance initialized successfully"
      );

      // Save shared conductor state for tests to use
      const sharedState = {
        initialized: true,
        timestamp: new Date().toISOString(),
        url: "http://127.0.0.1:3000",
      };

      writeFileSync(
        join("test-results", "shared-conductor-state.json"),
        JSON.stringify(sharedState, null, 2)
      );
    } else {
      throw new Error(
        `Shared conductor initialization failed. Status: "${status}"`
      );
    }
  } catch (error) {
    console.error("❌ Failed to initialize shared conductor:", error);
    console.log("⚠️  Tests will fall back to individual conductor instances");

    // Clean up on failure
    if (sharedPage) {
      await sharedPage.close();
      sharedPage = null;
    }
    if (sharedBrowser) {
      await sharedBrowser.close();
      sharedBrowser = null;
    }
  }
}

/**
 * Get the shared conductor page for tests to use
 */
export function getSharedConductorPage(): Page | null {
  return sharedPage;
}

/**
 * Check if shared conductor is available
 */
export function isSharedConductorAvailable(): boolean {
  return sharedConductorInitialized && sharedPage !== null;
}

export default globalSetup;
