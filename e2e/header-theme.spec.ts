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

  // Verify key runtime artifacts are reachable before we wait on UI
  const manifestOk = await page.evaluate(async () => {
    try {
      const res = await fetch('/plugins/plugin-manifest.json', { cache: 'no-store' });
      return res.ok;
    } catch { return false; }
  });
  expect(manifestOk).toBeTruthy();

  // Wait for the header slot container to exist (even if empty initially)
  await page.waitForSelector('[data-slot="headerRight"] [data-slot-content]', { timeout: 15000 });

  // Global readiness: sequencesReady or conductor present (preview can be slower in CI)
  await page.waitForFunction(() => {
    const w = (window as any);
    return w.RenderX?.sequencesReady === true || !!w.renderxCommunicationSystem?.conductor;
  }, { timeout: 20000 });

  // Wait until HeaderThemePlugin is mounted to make the toggle deterministic in preview/CI
  await page.waitForFunction(() => {
    const ids = (window as any).renderxCommunicationSystem?.conductor?.getMountedPluginIds?.() || [];
    return ids.includes('HeaderThemePlugin');
  }, { timeout: 30000 });

  // If plugins failed to load at runtime, fail fast with details
  const bad = consoleMessages.filter(m => /Failed to resolve module specifier ['"]@renderx-plugins\/header['"]|Failed runtime register for Header(Title|Controls|Theme)Plugin/.test(m.text));
  if (bad.length) {
    throw new Error('Header plugin(s) failed to load: ' + JSON.stringify(bad, null, 2));
  }

  // Introspect conductor for diagnostics (mounted vs discovered)
  const diag = await page.evaluate(() => {
    const c: any = (window as any).renderxCommunicationSystem?.conductor;
    const discovered = c?._discoveredPlugins ?? null;
    const mounted = typeof c?.getMountedPluginIds === 'function' ? c.getMountedPluginIds() : null;
    return { discovered, mounted };
  });
  console.log('Header E2E diagnostics:', JSON.stringify(diag));

  // Now wait for the actual toggle button to become visible
  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Read current label and assert optimistic UI toggles regardless of backend sequence timing.
  const labelBefore = await toggle.innerText();

  await toggle.click();
  const expectedAfter = labelBefore.includes('Dark') ? '🌞 Light' : '🌙 Dark';
  await expect(toggle).toHaveText(expectedAfter, { timeout: 5_000 });

  // Toggle back
  await toggle.click();
  await expect(toggle).toHaveText(labelBefore, { timeout: 5_000 });
});

