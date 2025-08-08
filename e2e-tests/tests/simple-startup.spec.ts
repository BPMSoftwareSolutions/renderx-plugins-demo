import { test, expect } from '@playwright/test';
import { waitForPageReady } from '../utils/test-helpers';

// Minimal smoke test: load /bundled and initialize once
// Runs only on Chrome when invoked via npm run test:simple

test('startup: app initializes on Chrome', async ({ page }) => {
  // Navigate to the bundled variant
  await page.goto('/bundled');
  await waitForPageReady(page);

  // Click init
  await page.click('#init-conductor');

  // Wait for status success
  await page.waitForFunction(() => {
    const el = document.querySelector('#status');
    return !!el && el.textContent?.toLowerCase().includes('success');
  }, { timeout: 30000 });

  const status = await page.textContent('#status');
  expect(status?.toLowerCase()).toContain('success');
});

