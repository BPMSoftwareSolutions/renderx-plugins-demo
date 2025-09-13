import { test, expect } from '@playwright/test';

// App smoke: verify runtime bridges, theme toggle, and library inventory loads

const getTheme = () => document.documentElement.getAttribute('data-theme') || '';

test.describe('App smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console for debugging on failure
    page.on('console', (msg) => {
      const t = msg.type();
      if (t === 'error' || t === 'warning') {
        // eslint-disable-next-line no-console
        console.log(`[browser:${t}]`, msg.text());
      }
    });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for host bridges exposed by main.tsx
    await page.waitForFunction(() => {
      const rx: any = (window as any).RenderX;
      return !!(rx && rx.EventRouter && typeof rx.EventRouter.publish === 'function' && rx.inventory && typeof rx.inventory.listComponents === 'function');
    }, undefined, { timeout: 8000 });
  });

  test('library components load via host inventory bridge', async ({ page }) => {
    const items = await page.evaluate(async () => {
      const rx: any = (window as any).RenderX;
      const arr = await rx.inventory.listComponents();
      return Array.isArray(arr) ? arr.map((x: any) => x?.id ?? x?.metadata?.type) : [];
    });

    expect(items.length).toBeGreaterThanOrEqual(5);
    expect(items).toContain('button');
  });

  test('layout renders library and canvas slots (smoke)', async ({ page }) => {
    // Accept either grid layout or fallback, but require core slots to render
    await page.waitForFunction(() => !!document.querySelector('[data-layout-container]') || !!document.querySelector('[data-slot="library"]'));
    await expect(page.locator('[data-slot="library"]')).toBeVisible();
    await expect(page.locator('[data-slot="canvas"]')).toBeVisible();
    await expect(page.locator('[data-slot="controlPanel"]')).toBeVisible();
  });
});

