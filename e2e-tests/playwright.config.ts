import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for MusicalConductor E2E Tests
 *
 * Features:
 * - Headless browser testing with console logging
 * - Time-date stamped logs
 * - Multiple browser support
 * - Parallel test execution
 * - Comprehensive reporting
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/results.xml" }],
    ["list"],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video recording */
    video: "retain-on-failure",

    /* Console logging */
    launchOptions: {
      // Enable console logging
      args: ["--enable-logging", "--v=1"],
    },
  },

  /* Configure projects */
  projects: process.env.E2E_SIMPLE
    ? [
        {
          name: "Google Chrome",
          use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
      ]
    : [
        {
          name: "chromium",
          use: {
            ...devices["Desktop Chrome"],
            // Enable console API for capturing logs
            contextOptions: {
              // Capture console messages
              recordVideo: {
                dir: "test-results/videos/",
                size: { width: 1280, height: 720 },
              },
            },
          },
        },
        {
          name: "firefox",
          use: { ...devices["Desktop Firefox"] },
        },
        {
          name: "webkit",
          use: { ...devices["Desktop Safari"] },
        },
        /* Test against mobile viewports. */
        {
          name: "Mobile Chrome",
          use: { ...devices["Pixel 5"] },
        },
        {
          name: "Mobile Safari",
          use: { ...devices["iPhone 12"] },
        },
        /* Test against branded browsers. */
        {
          name: "Microsoft Edge",
          use: { ...devices["Desktop Edge"], channel: "msedge" },
        },
        {
          name: "Google Chrome",
          use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
      ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "node server.js",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },

  /* Global setup and teardown */
  globalSetup: require.resolve("./utils/global-setup.ts"),
  globalTeardown: require.resolve("./utils/global-teardown.ts"),

  /* Test output directory */
  outputDir: "test-results/",

  /* Test timeout */
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
});
