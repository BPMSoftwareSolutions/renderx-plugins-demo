import { test, expect } from '@playwright/test';

// Minimal smoke test: load app and verify conductor exposure
// Prefer single browser; run with: npx playwright test --project="Google Chrome" (or adjust config)

test('RenderX app starts and exposes conductor', async ({ page }) => {
  await page.goto('/');

  // Wait for window.renderxCommunicationSystem.conductor to appear
  await page.waitForFunction(() => {
    // @ts-ignore
    return !!window.renderxCommunicationSystem?.conductor;
  }, { timeout: 15000 });

  const hasConductor = await page.evaluate(() => {
    // @ts-ignore
    return !!window.renderxCommunicationSystem?.conductor;
  });
  expect(hasConductor).toBeTruthy();
});

