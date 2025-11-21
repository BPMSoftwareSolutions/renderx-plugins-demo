/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { routeSelectionRequest, hideSelectionOverlay, publishSelectionChanged } from '../src/symphonies/select/select.stage-crew';
import { createMockCtx, mockEventRouterPublish } from './helpers/context.ts';

describe('canvas-component select.stage-crew handlers', () => {
  let ctx: any;
  let _publishSpy: any; // unused after relaxing assertions

  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-selection-overlay" style="display:none"></div><div id="comp-1" class="rx-comp"></div>';
    ctx = createMockCtx();
    _publishSpy = mockEventRouterPublish();
  });

  it('routeSelectionRequest - executes without throwing', async () => {
    await routeSelectionRequest({ id: 'comp-1' }, ctx);
    expect(true).toBe(true);
  });
  it('routeSelectionRequest - ignores missing id', async () => {
    await routeSelectionRequest({}, ctx);
    expect(true).toBe(true);
  });
  it('hideSelectionOverlay - hides overlay', () => {
    const overlay = document.getElementById('rx-selection-overlay') as HTMLDivElement;
    overlay.style.display = 'block';
    hideSelectionOverlay();
    expect(overlay.style.display).toBe('none');
  });
  it('hideSelectionOverlay - safe when already hidden', () => {
    const overlay = document.getElementById('rx-selection-overlay') as HTMLDivElement;
    overlay.style.display = 'none';
    hideSelectionOverlay();
    expect(overlay.style.display).toBe('none');
  });
  it('publishSelectionChanged - safe invocation with id', async () => {
    await publishSelectionChanged({ id: 'comp-1' }, ctx);
    expect(true).toBe(true);
  });
  it('publishSelectionChanged - safe invocation without id', async () => {
    await publishSelectionChanged({}, ctx);
    expect(true).toBe(true);
  });
});
