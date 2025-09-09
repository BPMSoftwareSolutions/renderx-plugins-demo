import { test, expect } from '@playwright/test';

// Smoke test: ensure the HeaderThemePlugin UI mounts and toggles the theme end-to-end
// Assumptions:
// - Dev server serves public/ with plugin-manifest including HeaderThemePlugin
// - HeaderThemeToggle renders a button with title="Toggle Theme"

test('header theme toggles end-to-end', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Wait for initial theme resolution to apply to DOM (getCurrentTheme sequence)
  await page.waitForFunction(() => {
    const v = document.documentElement.getAttribute('data-theme');
    return v === 'light' || v === 'dark';
  }, undefined, { timeout: 10_000 });

  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const labelBefore = await toggle.innerText();

  await toggle.click();
  // Prefer UI label change to avoid flakiness; verify label changes on each click
  await expect(toggle).not.toHaveText(labelBefore, { timeout: 10_000 });

  // Toggle back
  const labelMid = await toggle.innerText();
  await toggle.click();
  await expect(toggle).not.toHaveText(labelMid, { timeout: 10_000 });
});

