import { test } from '@playwright/test';
import { waitForAppReady } from './support/appReady';
const DIAG = process.env.RX_E2E_DIAG === '1' || process.env.RX_E2E_DIAG === 'true';


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
  await waitForAppReady(page);

  // Skip early if the required plugin is not available in this environment
  const hasHeader = await page.evaluate(() => {
    const c: any = (window as any).renderxCommunicationSystem?.conductor;
    const mounted: string[] = c?.getMountedPluginIds?.() || [];
    const discovered: string[] = c?._discoveredPlugins || [];
    return mounted.includes('HeaderThemePlugin') || discovered.includes('HeaderThemePlugin');
  });
  if (!hasHeader) {
    test.skip(true, 'Required plugin HeaderThemePlugin not available in preview/CI environment');
  }

  // Wait for the header slot container to exist (even if empty initially)
  await page.waitForSelector('[data-slot="headerRight"] [data-slot-content]');

  // Global readiness: sequencesReady or conductor present (preview can be slower in CI)
  await page.waitForFunction(() => {
    const w = (window as any);
    return w.RenderX?.sequencesReady === true || !!w.renderxCommunicationSystem?.conductor;
  });

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
  if (DIAG) console.log('Header E2E diagnostics:', JSON.stringify(diag));

  // Now wait for the actual toggle button to become visible
  const toggle = page.getByTitle('Toggle Theme');
  await toggle.waitFor();

  // Capture initial UI + theme state for robust change detection
  // note: label value captured via window.__beforeLabel; avoid unused local var
  await page.evaluate(() => {
    (window as any).__beforeLabel = (document.querySelector('[title="Toggle Theme"]')?.textContent || '').trim();
    (window as any).__beforeIsDark = document.documentElement.classList.contains('dark')
      || document.body.classList.contains('dark')
      || document.documentElement.getAttribute('data-theme') === 'dark';
    (window as any).__beforeTheme = (window as any).RenderX?.theme?.current ?? null;
  });

  // Click to toggle theme
  await toggle.click();

  // Wait until either UI changed or no plugins are available (preview), inside one browser function
  const outcomeHandle = await page.waitForFunction(() => {
    const label = (document.querySelector('[title="Toggle Theme"]')?.textContent || '').trim();
    const isDark = document.documentElement.classList.contains('dark')
      || document.body.classList.contains('dark')
      || document.documentElement.getAttribute('data-theme') === 'dark';
    const theme = (window as any).RenderX?.theme?.current ?? null;
    const changed = label !== (window as any).__beforeLabel
      || isDark !== (window as any).__beforeIsDark
      || (theme && theme !== (window as any).__beforeTheme);
    const ids = (window as any).renderxCommunicationSystem?.conductor?.getMountedPluginIds?.() || [];
    const noPlugins = Array.isArray(ids) && ids.length === 0;
    return changed || noPlugins ? { changed, noPlugins } : false;
  });

  const outcome: any = await outcomeHandle.jsonValue();
  if (!outcome.changed) {
    // If plugins are not mounted at runtime, skip instead of treating as pass
    const noPlugins = await page.evaluate(() => {
      const ids = (window as any).renderxCommunicationSystem?.conductor?.getMountedPluginIds?.() || [];
      return Array.isArray(ids) && ids.length === 0;
    });
    if (noPlugins) {
      test.skip(true, 'No plugins mounted at runtime in this environment');
    }
  }

  // Toggle back (best-effort)
  await toggle.click();
});
