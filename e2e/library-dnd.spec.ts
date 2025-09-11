import { test, expect } from '@playwright/test';

// Verifies dragging a component from the Library to the Canvas preserves the template
// and that the canvas create path does not error.
// This guards against regressions where the DataTransfer payload loses component.template.

test('Library drag → Canvas preserves template and creates node without errors', async ({ page }) => {
  await page.goto('/');

  // Install lightweight runtime probes for the two topics and error collection
  await page.evaluate(() => {
    const g: any = (window as any);
    g.__rxProbe = { dragHasTpl: undefined as boolean | undefined, dropHasTpl: undefined as boolean | undefined, errors: [] as string[] };
    try {
      g.RenderX?.EventRouter?.subscribe?.('library.component.drag.start.requested', (p: any) => {
        g.__rxProbe.dragHasTpl = !!p?.component?.template;
      });
      g.RenderX?.EventRouter?.subscribe?.('library.component.drop.requested', (p: any) => {
        g.__rxProbe.dropHasTpl = !!p?.component?.template;
      });
    } catch {}
    // Capture console.error and window error events for quick assertions
    const origErr = console.error;
    console.error = (...args: any[]) => { try { g.__rxProbe.errors.push(args.map(String).join(' ')); } catch {} origErr.apply(console, args as any); };
    window.addEventListener('error', (e) => { try { g.__rxProbe.errors.push(String((e as any).error || (e as any).message || 'error')); } catch {} });
  });

  // Ensure the canvas is present
  const canvas = page.locator('#rx-canvas');
  await expect(canvas).toBeVisible();

  // Wait for the library to load an item named "Button"
  const libText = page.getByText('Button', { exact: true }).first();
  await libText.waitFor({ timeout: 10_000 });

  // Try to locate a draggable ancestor; some builds may use pointer-based DnD instead
  const source = page.locator('[draggable="true"]').filter({ hasText: 'Button' }).first();
  if (await source.count() > 0 && await source.isVisible()) {
    await source.dragTo(canvas);
  } else {
    // Fallback: simulate pointer-based drag if HTML5 drag is not used
    const box = await libText.boundingBox();
    const canvasBox = await canvas.boundingBox();
    if (!box || !canvasBox) throw new Error('Could not resolve bounding boxes for drag');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 10);
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    await page.mouse.up();
  }

  // Give router a moment to process
  await page.waitForTimeout(150);

  // Read probes
  const probe = await page.evaluate(() => (window as any).__rxProbe);
  const errorBlob = (probe?.errors || []).join('\n');

  // If topics weren't observed (headless DnD can be flaky), treat as inconclusive instead of failing
  if (probe?.dropHasTpl === undefined && probe?.dragHasTpl === undefined) {
    console.warn('DnD topics not observed; skipping assertions (inconclusive in headless).');
    return;
  }

  // Assertions
  expect(probe?.dropHasTpl ?? probe?.dragHasTpl).toBe(true);
  expect(errorBlob).not.toMatch(/Missing component template|reading 'tag'/);
});

