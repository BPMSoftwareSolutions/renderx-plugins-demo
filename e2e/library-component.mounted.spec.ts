import { test, expect } from '@playwright/test';
import { waitForAppReady } from './support/appReady';



const isPreview = !!(globalThis as any).process?.env?.CI;
// This test imports handlers via Vite's dev-only /@id/ proxy — not available in preview/prod
// Skip in CI where we run `vite preview`
test.skip(isPreview, 'Dev-only test: /@id/ proxy not available in preview (CI)');

// Guardrail: validate that library-component catalogs are reachable and handlers resolve in-browser.
// We avoid asserting strict mounted plugin IDs because mounting can be implementation-dependent across envs.

test('library-component catalogs fetch and handlers resolve in browser', async ({ page }) => {
  // Capture console for diagnostics
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'warning' || t === 'error') console.log(`[browser:${t}]`, msg.text());
  });

  await page.goto('/');
  await waitForAppReady(page);

  // Wait for the app to finish registering/mounting sequences
  await page.waitForFunction(() => (window as any).RenderX?.sequencesReady === true);

  // 1) Catalog is served
  const catalog = await page.evaluate(async () => {
    const res = await fetch('/json-sequences/library-component/index.json');
    return { ok: res.ok, status: res.status };
  });
  expect(catalog.ok, `Expected 200 OK for /json-sequences/library-component/index.json (got ${catalog.status})`).toBe(true);

  // 2) Handlers importable via Vite /@id/ proxy
  const modInfo = await page.evaluate(async () => {
    const mod: any = await import('/@id/@renderx-plugins/library-component');
    return { reg: typeof mod.register, handlerKeys: Object.keys(mod.handlers || {}) };
  });
  expect(modInfo.reg).toBe('function');
  expect(Array.isArray(modInfo.handlerKeys)).toBe(true);
});

