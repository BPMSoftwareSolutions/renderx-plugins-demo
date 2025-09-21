import { test, expect } from '@playwright/test';

test('placeholder e2e test', async ({ page }) => {
  // Just open the root; in CI a preview server will run, locally vite dev runs.
  await page.goto('/');
  await expect(page).toHaveTitle(/RenderX/i);
});
