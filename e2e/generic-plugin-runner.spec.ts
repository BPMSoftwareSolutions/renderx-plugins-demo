import { test, expect } from '@playwright/test';

// Minimal generic runner for Phase 2 using the local fake driver/manifest.
// In Phase 3+, this will iterate over a registry and fetch manifests from plugins.

test.describe('Generic Plugin Runner (Phase 2)', () => {
  test('runs scenarios from local /test/manifest.json via TestHarness', async ({ page }) => {
    // Fetch manifest from the app origin (served by Vite/Preview)
    const res = await page.request.get('/test/manifest.json');
    expect(res.ok()).toBeTruthy();
    const manifest = await res.json();

    // Basic compat check
    expect(manifest?.testApiVersion).toBeDefined();
    expect(Array.isArray(manifest?.scenarios)).toBeTruthy();

    for (const scenario of manifest.scenarios) {
      // Open the harness page and auto-init via query params
      const url = `/src/test-plugin-loading.html?driver=${encodeURIComponent(manifest.driverUrl)}&scenario=${encodeURIComponent(scenario.id)}&phases=0,1,2&timeout=${scenario?.readiness?.timeoutMs || 3000}`;
      await page.goto(url);

      // After auto-init + ready phases, run steps/asserts via the harness API
      const stepResults = await page.evaluate(async (steps) => {
        const h = (window as any).TestHarness;
        if (!h) throw new Error('TestHarness not found on window');
        return await h.runSteps(steps || []);
      }, scenario.steps || []);

      // All steps should be ok
      stepResults.forEach((r: any) => expect(r.status).toBe('ok'));

      const assertResults = await page.evaluate(async (asserts) => {
        const h = (window as any).TestHarness;
        return await h.runAsserts(asserts || []);
      }, scenario.asserts || []);

      // All asserts should be ok
      assertResults.forEach((r: any) => expect(r.status).toBe('ok'));
    }
  });
});
