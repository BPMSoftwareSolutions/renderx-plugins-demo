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

  // Assert no module resolution errors for externalized header plugins
  const bad = consoleMessages.filter(m => /Failed to resolve module specifier ['"]@renderx-plugins\/header['"]|Failed runtime register for Header(Title|Controls|Theme)Plugin/.test(m.text));
  expect(bad, 'No header plugin resolution/registration errors in console').toEqual([]);

  // themeBefore not used; rely on label changes to assert toggling
  const labelBefore = await toggle.innerText();

  await toggle.click();
  // Prefer UI label change to avoid flakiness; verify label changes on each click
  await expect(toggle).not.toHaveText(labelBefore, { timeout: 10_000 });

  // Toggle back
  const labelMid = await toggle.innerText();
  await toggle.click();
  await expect(toggle).not.toHaveText(labelMid, { timeout: 10_000 });
});

