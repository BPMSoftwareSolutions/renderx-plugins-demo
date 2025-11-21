/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock host-sdk resolveInteraction to avoid real host dependencies
vi.mock('@renderx-plugins/host-sdk', () => ({
  resolveInteraction: () => ({ pluginId: 'test-plugin', sequenceId: 'canvas.component.create' })
}));

// Mock create helpers to keep createPastedComponent side-effect free
vi.mock('../src/symphonies/create/create.from-import', () => ({
  toCreatePayloadFromData: (comp: any) => ({ position: comp?.position || { x: 0, y: 0 }, _overrideNodeId: 'orig' }),
  attachStandardImportInteractions: () => void 0,
}));

// Mock clipboard util to provide JSON when needed
vi.mock('../src/symphonies/_clipboard', () => ({
  getClipboardText: () => JSON.stringify({ type: 'renderx-component', component: { template: { tag: 'div' }, position: { x: 10, y: 15 } } })
}));

import { readFromClipboard, deserializeComponentData, calculatePastePosition, createPastedComponent, notifyPasteComplete } from '../src/symphonies/paste/paste.stage-crew';
import { createMockCtx } from './helpers/context';

describe('canvas-component paste.stage-crew handlers', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-selection-overlay" data-target-id="sel-1"></div>';
  });

  it('readFromClipboard - parses clipboard into clipboardData', async () => {
    const res = await readFromClipboard({}, {});
    expect(res.clipboardData).toBeDefined();
    expect(res.clipboardData.type).toBe('renderx-component');
  });

  it('deserializeComponentData - uses provided clipboardText', async () => {
    const text = JSON.stringify({ type: 'renderx-component', component: { template: { tag: 'div' } } });
    const res = await deserializeComponentData({ clipboardText: text }, {});
    expect(res.clipboardData).toBeDefined();
  });

  it('calculatePastePosition - offsets by +20,+20', async () => {
    const data = { clipboardData: { component: { position: { x: 10, y: 15 } } } };
    const res = await calculatePastePosition(data, {});
    expect(res.newPosition).toEqual({ x: 30, y: 35 });
  });

  it('createPastedComponent - transforms and plays create sequence', async () => {
    const ctx = createMockCtx();
    const data = { clipboardData: { component: { position: { x: 2, y: 3 } } } };
    await createPastedComponent(data as any, ctx as any);
    expect(ctx.conductor.play).toHaveBeenCalledTimes(1);
    const args = (ctx.conductor.play as any).mock.calls[0];
    expect(args[0]).toBe('test-plugin');
    expect(args[1]).toBe('canvas.component.create');
    const payload = args[2];
    // Position is offset by +20
    expect(payload.position).toEqual({ x: 22, y: 23 });
    // Should not preserve _overrideNodeId
    expect('_overrideNodeId' in payload).toBe(false);
  });

  it('notifyPasteComplete - no-op success', async () => {
    await expect(notifyPasteComplete({}, {})).resolves.toBeUndefined();
  });
});
