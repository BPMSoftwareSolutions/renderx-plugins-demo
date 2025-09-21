import { test as base, expect } from '@playwright/test';

// Shared Playwright fixture that guarantees the app is fully initialized
// before any test code runs. It auto-runs for every test that imports this file.
export const test = base.extend<{ appReady: void }>({
  appReady: [
    async ({ page }, use) => {
      // Navigate to the app root and wait for DOM readiness
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Wait for SPA + runtime readiness signals
      // - RenderX.sequencesReady is set at the end of src/index.tsx init flow
      // - Alternatively, accept conductor presence (preview or partial cases)
      // - Ensure core slots/layout exist so UI is mounted
      await page.waitForFunction(
        () => {
          const w = window as any;
          const conductor = w.renderxCommunicationSystem?.conductor;
          const sequencesReady = w.RenderX?.sequencesReady === true;
          const uiReady = !!document.querySelector('[data-layout-container], [data-slot="canvas"]');
          return uiReady && (sequencesReady || !!conductor);
        },
        { timeout: 30000 }
      );

      // EventRouter publish should be available for tests that use topic-based orchestration
      await page.waitForFunction(
        () => !!(window as any).RenderX?.EventRouter?.publish,
        { timeout: 10000 }
      );

      await use();
    },
    { auto: true },
  ],
});

export { expect };

