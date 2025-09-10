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

  // Fail fast if the header plugins failed to load — this makes CI failures actionable instead of timing out.
  const bad = consoleMessages.filter(m => /Failed to resolve module specifier ['"]@renderx-plugins\/header['"]|Failed runtime register for Header(Title|Controls|Theme)Plugin/.test(m.text));
  if (bad.length) {
    throw new Error('Header plugin(s) failed to load: ' + JSON.stringify(bad, null, 2));
  }

  // Read current label and assert optimistic UI toggles regardless of backend sequence timing.
  const labelBefore = await toggle.innerText();

  await toggle.click();
  const expectedAfter = labelBefore.includes('Dark') ? '🌞 Light' : '🌙 Dark';
  await expect(toggle).toHaveText(expectedAfter, { timeout: 5_000 });

  // Toggle back
  await toggle.click();
  await expect(toggle).toHaveText(labelBefore, { timeout: 5_000 });
});

