import { test, expect } from '@playwright/test';

// In modern browsers, bare specifiers are not natively resolvable without import maps.
// Vite dev server exposes a stable /@id/ proxy for bare packages; assert that works.

test('browser can import library-component via Vite /@id/ proxy and expose register/handlers', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    try {
      const mod: any = await import('/@id/@renderx-plugins/library-component');
      return { ok: true, reg: typeof mod.register, handlerKeys: Object.keys(mod.handlers || {}) };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  console.log('Import check (/@id/):', result);
  expect(result.ok, `Failed to import /@id/@renderx-plugins/library-component: ${result.error || ''}`).toBe(true);
  expect(result.reg).toBe('function');
  expect(Array.isArray(result.handlerKeys)).toBe(true);
});

