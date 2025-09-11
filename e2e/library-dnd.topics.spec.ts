import { test, expect } from '@playwright/test';

// Topic-level fallback: verifies that the Library publishes component payloads WITH template
// on drag.start and drop. This guards against regressions without relying on UI DnD mechanics.

test('Library topics publish component payload with template (fallback)', async ({ page }) => {
  await page.goto('/');

  // Wait until RenderX inventory and EventRouter are ready
  await page.waitForFunction(() => {
    const g: any = (window as any);
    return !!g.RenderX && !!g.RenderX.inventory && typeof g.RenderX.inventory.getComponentById === 'function' && !!g.RenderX.EventRouter;
  }, undefined, { timeout: 10000 });

  // Install probe and patch publish to capture payloads
  await page.evaluate(() => {
    const g: any = (window as any);
    g.__rxProbe2 = { published: [] as Array<{ topic: string; hasTpl: boolean }>, errors: [] as string[] };
    const er = g.RenderX?.EventRouter;
    if (er && typeof er.publish === 'function') {
      const orig = er.publish.bind(er);
      er.publish = (topic: string, payload: any) => {
        try { g.__rxProbe2.published.push({ topic, hasTpl: !!payload?.component?.template }); } catch {}
        return orig(topic, payload);
      };
    }
    const origErr = console.error;
    console.error = (...args: any[]) => { try { g.__rxProbe2.errors.push(args.map(String).join(' ')); } catch {} origErr.apply(console, args as any); };
  });

  // Load a real component from the host inventory (Button by id: "button") and publish topics
  const ok = await page.evaluate(async () => {
    const g: any = (window as any);
    const inv = g.RenderX?.inventory;
    const raw = await inv.getComponentById('button');
    if (!raw) return false;
    // Simulate library's mapping by attaching a minimal template marker
    const comp = { ...raw, component: undefined, template: { tag: 'button' } };
    await g.RenderX?.EventRouter?.publish?.('library.component.drag.start.requested', { component: comp });
    await g.RenderX?.EventRouter?.publish?.('library.component.drop.requested', { component: comp });
    return true;
  });
  expect(ok).toBe(true);

  const probe = await page.evaluate(() => (window as any).__rxProbe2);
  const seen = (probe?.published ?? []).reduce((acc: Record<string, boolean>, e: any) => { acc[e.topic] = e.hasTpl; return acc; }, {} as Record<string, boolean>);
  const errorBlob = (probe?.errors || []).join('\n');

  expect(seen['library.component.drag.start.requested']).toBe(true);
  expect(seen['library.component.drop.requested']).toBe(true);
  expect(errorBlob).not.toMatch(/Missing component template|reading 'tag'/);
});

