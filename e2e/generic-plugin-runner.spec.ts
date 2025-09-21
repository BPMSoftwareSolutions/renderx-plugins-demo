import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

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

  test('runs scenarios from plugin registry (tests/e2e.plugin-registry.local.json)', async ({ page }) => {
    // Read local registry from the repo (dev-only)
    let registry: any;
    try {
      const txt = await fs.readFile('tests/e2e.plugin-registry.local.json', 'utf-8');
      registry = JSON.parse(txt);
    } catch {
      test.skip(true, 'No local plugin registry found');
    }

    const plugins: Array<{ id: string; baseUrl: string; manifestPath: string; driverPath?: string }> = registry?.plugins || [];
    if (!Array.isArray(plugins) || plugins.length === 0) {
      test.skip(true, 'Local plugin registry has no entries');
    }

    let executed = 0;

    // Helper to join URLs safely
    function joinUrl(base: string, path: string) {
      if (/^https?:\/\//i.test(path)) return path;
      const a = base.replace(/\/$/, '');
      const b = path.startsWith('/') ? path : `/${path}`;
      return `${a}${b}`;
    }

    for (const p of plugins) {
      const manifestUrl = joinUrl(p.baseUrl, p.manifestPath || '/test/manifest.json');
      let manifest: any;
      try {
        const res = await page.request.get(manifestUrl);
        if (!res.ok()) {
          test.info().annotations.push({ type: 'skip', description: `Plugin ${p.id} manifest not reachable at ${manifestUrl} (status ${res.status()})` });
          continue;
        }
        manifest = await res.json();
      } catch (err: any) {
        test.info().annotations.push({ type: 'skip', description: `Plugin ${p.id} manifest fetch error at ${manifestUrl}: ${String(err?.message || err)}` });
        continue;
      }
      if (!manifest || !Array.isArray(manifest.scenarios)) {
        test.info().annotations.push({ type: 'skip', description: `Plugin ${p.id} manifest invalid` });
        continue;
      }

      const driverBase = p.baseUrl;
      const driverUrl = /^https?:\/\//i.test(manifest.driverUrl)
        ? manifest.driverUrl
        : joinUrl(driverBase, manifest.driverUrl || p.driverPath || '/test/driver.html');

      for (const scenario of manifest.scenarios) {
        executed++;
        const url = `/src/test-plugin-loading.html?driver=${encodeURIComponent(driverUrl)}&scenario=${encodeURIComponent(scenario.id)}&phases=0,1,2&timeout=${scenario?.readiness?.timeoutMs || 5000}`;
        await page.goto(url);

        const stepResults = await page.evaluate(async (steps) => {
          const h = (window as any).TestHarness;
          if (!h) throw new Error('TestHarness not found on window');
          return await h.runSteps(steps || []);
        }, scenario.steps || []);

        stepResults.forEach((r: any) => expect(r.status, `plugin ${p.id} scenario ${scenario.id} step`).toBe('ok'));

        const assertResults = await page.evaluate(async (asserts) => {
          const h = (window as any).TestHarness;
          return await h.runAsserts(asserts || []);
        }, scenario.asserts || []);

        assertResults.forEach((r: any) => expect(r.status, `plugin ${p.id} scenario ${scenario.id} assert`).toBe('ok'));
      }
    }

    if (executed === 0) {
      test.skip(true, 'No plugins from registry were reachable or had scenarios');
    }
  });
});
