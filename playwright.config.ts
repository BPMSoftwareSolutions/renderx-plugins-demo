import { defineConfig, devices } from '@playwright/test';

// Avoid needing @types/node in this TS config by using globalThis guard
const isCI = !!(globalThis as any).process?.env?.CI;

const baseURL = isCI ? 'http://localhost:4173' : 'http://localhost:5173';
const webServer = isCI
  ? {
      command: 'npm run build && npm run preview',
      url: 'http://localhost:4173',
      reuseExistingServer: false,
      timeout: 180_000,
    }
  : {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    };

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    headless: true,
  },
  webServer,
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

