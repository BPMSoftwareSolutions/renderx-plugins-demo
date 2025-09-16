import { test } from '@playwright/test';

// Diagnostic probe: report CP UI source/mounted flags and attempt a UI render request
// This test is informational and should not fail the run; it logs structured output.

test('Control Panel diagnostics: source/mounted + render request probe', async ({ page }) => {
  // Collect console logs
  page.on('console', (msg) => {
    // Echo page logs into runner output for visibility
    console.log('[browser]', msg.type(), msg.text());
  });

  await page.goto('/');

  // Wait until routing is active
  await page.waitForFunction(() => (window as any).RenderX?.sequencesReady === true, undefined, { timeout: 15000 });

  // Read markers
  const markers = await page.evaluate(() => ({
    uiSource: (window as any).__RENDERX_CP_UI_SOURCE__ || null,
    uiMounted: !!(window as any).__RENDERX_CP_UI_MOUNTED__,
  }));
  console.log('[diag] markers', JSON.stringify(markers));

  // Try to publish a control.panel.ui.render.requested using the last canvas node
  const result: any = await page.evaluate(async () => {
    const g: any = window as any;
    const router = g.RenderX?.EventRouter;
    const el = document.querySelector('#rx-canvas .rx-comp:last-of-type') as HTMLElement | null;
    const id = el?.id || null;
    const type = (el && (el.dataset as any)?.type) || (el ? Array.from(el.classList).find(c => c.startsWith('rx-') && c !== 'rx-comp')?.replace(/^rx-/,'') : null) || 'component';

    let received: any = null;
    const unsub = router?.subscribe?.('control.panel.ui.render.requested', (p: any) => {
      received = p?.selectedElement?.header || null;
    });

    if (router && id) {
      router.publish('control.panel.ui.render.requested', { selectedElement: { header: { id, type }, content: {} } });
    }

    await new Promise(r => setTimeout(r, 120));
    try { unsub?.(); } catch {}

    const typeEl = document.querySelector('.control-panel .element-type') as HTMLElement | null;
    return {
      hadRouter: !!router,
      hadEl: !!el,
      publishedId: id,
      publishedType: type,
      subReceived: received,
      elementTypePresent: !!typeEl,
      elementTypeText: typeEl?.textContent?.trim() || null,
      uiMounted: !!g.__RENDERX_CP_UI_MOUNTED__,
      uiSource: g.__RENDERX_CP_UI_SOURCE__ || null,
    };
  });

  console.log('[diag] probe', JSON.stringify(result));
});

