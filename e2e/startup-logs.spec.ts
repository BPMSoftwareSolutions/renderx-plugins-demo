import { test, expect } from '@playwright/test';
import { waitForAppReady } from './support/appReady';


// Browser-startup smoke guardrail: ensure all runtimes register and no critical errors are logged
// This complements the JSDOM startup test by exercising the real dev/preview server.

test('startup has no critical errors and all plugin runtimes register', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', (msg) => {
    try { messages.push(msg.text()); } catch {}
  });

  await page.goto('/');
  await waitForAppReady(page);

  // Wait for conductor to be available (readiness already gated above)
  await page.waitForFunction(() => !!(window as any).RenderX?.conductor);

  const wanted = ['LibraryPlugin','CanvasPlugin','LibraryComponentPlugin','CanvasComponentPlugin'];
  const hasOk = (id: string) => messages.some(m => new RegExp(`Registered plugin runtime:\\s*${id}`, 'i').test(m));

  const blob = messages.join('\n');

  // Fail fast on known bad patterns observed in real startup logs
  const badPatterns = [
    /\bFailed runtime register for\b/i,
    /Failed to resolve module specifier\s+'@renderx-plugins\//i,
    /\bInvalid hook call\b/i,
    /Cannot read properties of null \(reading 'useState'\)/i,
  ];
  for (const re of badPatterns) {
    expect.soft(blob).not.toMatch(re);
  }

  // Require success logs for each externalized plugin
  for (const id of wanted) {
    expect.soft(hasOk(id), `Expected success log for ${id} in startup console.\nLogs:\n${blob}`).toBe(true);
  }
});

