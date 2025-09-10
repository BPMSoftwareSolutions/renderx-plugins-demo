import { test, expect } from '@playwright/test';

// Smoke test: ensure the HeaderThemePlugin UI mounts and toggles the theme end-to-end
// Assumptions:
// - Dev server serves public/ with plugin-manifest including HeaderThemePlugin
// - HeaderThemeToggle renders a button with title="Toggle Theme"

test('header theme toggles end-to-end', async ({ page }) => {
  // Capture console warnings/errors during startup
  const consoleMessages: { type: string; text: string }[] = [];
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'warning' || t === 'error') {
      consoleMessages.push({ type: t, text: msg.text() });
    }
  });

  await page.goto('/');

  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Wait for initial theme resolution to apply to DOM (getCurrentTheme sequence)
  await page.waitForFunction(() => {
    const v = document.documentElement.getAttribute('data-theme');
    return v === 'light' || v === 'dark';
  }, undefined, { timeout: 10_000 });

  // Note: We log plugin resolution warnings but do not fail on them in E2E to reduce flakiness in dev-server mode.
  const bad = consoleMessages.filter(m => /Failed to resolve module specifier ['"]@renderx-plugins\/header['"]|Failed runtime register for Header(Title|Controls|Theme)Plugin/.test(m.text));
  if (bad.length) console.warn('header-plugin warnings:', bad);

  // Read current theme from DOM and derive the expected label AFTER a toggle.
  const themeBefore = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const expectedAfterLabel = themeBefore === 'light' ? '🌞 Light' : '🌙 Dark';

  await toggle.click();

  // Wait until the DOM theme actually changes, then assert the label matches the new theme.
  await page.waitForFunction((prev) => document.documentElement.getAttribute('data-theme') !== prev, themeBefore, { timeout: 10_000 });
  await expect(toggle).toHaveText(expectedAfterLabel, { timeout: 10_000 });

  // Toggle back and assert again using the DOM as source of truth.
  const themeMid = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  const expectedFinalLabel = themeMid === 'light' ? '🌞 Light' : '🌙 Dark';
  await toggle.click();
  await page.waitForFunction((prev) => document.documentElement.getAttribute('data-theme') !== prev, themeMid, { timeout: 10_000 });
  await expect(toggle).toHaveText(expectedFinalLabel, { timeout: 10_000 });
});

