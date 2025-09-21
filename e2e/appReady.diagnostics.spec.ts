import { test, expect } from '@playwright/test';
import { waitForAppReady } from './support/appReady';

// This test validates Phase 2 diagnostics: waitForAppReady should throw with
// actionable diagnostics when the page never emits readiness signals.
// It navigates to about:blank (no app) and asserts on the thrown message.

test('waitForAppReady produces diagnostics on timeout when app is not present', async ({ page }) => {
  await page.goto('about:blank');
  // Emit some console noise during the wait window so the helper captures it
  await page.evaluate(() => setTimeout(() => console.warn('[boot] starting...'), 50));

  let err: any;
  try {
    await waitForAppReady(page, { timeout: 250, diagnostics: { consoleLimit: 5 } });
  } catch (e) {
    err = e;
  }

  expect(err).toBeTruthy();
  const msg = String(err?.message ?? err);
  expect(msg).toContain('App readiness timeout');
  expect(msg).toContain('document.readyState');
  expect(msg).toContain('Console (last');
});

