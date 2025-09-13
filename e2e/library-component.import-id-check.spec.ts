import { test, expect } from '@playwright/test';


const isPreview = !!(globalThis as any).process?.env?.CI;
// Dev-only: Vite /@id/ proxy is not available under preview/prod builds
// Skip in CI where we run `vite preview`
test.skip(isPreview, 'Dev-only test: /@id/ proxy not available in preview (CI)');

test('browser can import /@id/@renderx-plugins/library-component (Vite dev proxy)', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    try {
      const mod: any = await import('/@id/@renderx-plugins/library-component');
      return { ok: true, reg: typeof mod.register, handlerKeys: Object.keys(mod.handlers || {}) };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  });
  console.log('Import /@id check:', result);
  expect(result.ok, `Failed to import /@id/@renderx-plugins/library-component: ${result.error || ''}`).toBe(true);
  expect(result.reg).toBe('function');
});

