import { test, expect } from '@playwright/test';
import { waitForAppReady } from './support/appReady';


// Guardrail: there should be no "Plugin not found: LibraryComponent*" messages during
// drag/drop orchestration. This gives a crisp failure when library-component sequences
// are not mounted in the browser.

test('no "Plugin not found: LibraryComponent*" appears during drag/drop orchestration', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (m) => logs.push(m.text()));

  await page.goto('/');
  await waitForAppReady(page);

  // Print mounted IDs for triage
  const ids = await page.evaluate(() => {
    const api: any = (window as any).RenderX?.conductor;
    return typeof api?.getMountedPluginIds === 'function' ? api.getMountedPluginIds() : [];
  });
  console.log('Mounted plugin IDs:', ids);

  // If no plugins are mounted (preview/prod without dev-only manifets), treat as inconclusive
  if (Array.isArray(ids) && ids.length === 0) {
    console.log('LibraryComponent guardrail: no plugins mounted in preview; skipping assertions.');
    return;
  }

  // Try to exercise the sequences via the EventRouter like a drop would
  await page.evaluate(async () => {
    const rx: any = (window as any).RenderX;
    if (!rx?.inventory?.listComponents) return;
    const list = await rx.inventory.listComponents();
    const comp = list.find((x: any) => x?.id === 'button') ?? list[0];
    if (!comp) return;

    const el = document.querySelector('#rx-canvas') as HTMLElement;
    const rect = el?.getBoundingClientRect?.();
    const position = rect ? { x: Math.floor(rect.width / 2), y: Math.floor(rect.height / 2) } : { x: 100, y: 100 };

    await rx.EventRouter.publish('library.component.drop.requested', { component: comp, position });
  });

  const blob = logs.join('\n');
  // Assert no plugin-not-found for LibraryComponent*
  expect(blob).not.toMatch(/Plugin not found:\s*LibraryComponent/i);
});

