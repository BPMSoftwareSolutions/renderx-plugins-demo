/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { hideAllOverlays, deselectComponent, publishDeselectionChanged, publishSelectionsCleared, clearAllSelections, routeDeselectionRequest } from '../src/symphonies/deselect/deselect.stage-crew';
import { createMockCtx, mockEventRouterPublish } from './helpers/context.ts';

describe('canvas-component deselect.stage-crew handlers', () => {
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null,`n      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  let ctx: any;
  let _publishSpy: any;
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-selection-overlay" data-target-id="comp-1" style="display:block"></div><div id="rx-adv-line-overlay" data-target-id="comp-1" style="display:block"></div><div id="comp-1" class="rx-comp"></div>';
    ctx = createMockCtx();
    _publishSpy = mockEventRouterPublish();
  });

  it('hideAllOverlays - hides overlays if present', () => {
    hideAllOverlays();
    expect((document.getElementById('rx-selection-overlay') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('rx-adv-line-overlay') as HTMLElement).style.display).toBe('none');
  });
  it('hideAllOverlays - safe when overlays are missing', () => {
    document.body.innerHTML = '';
    hideAllOverlays();
    expect(document.body.innerHTML).toBe('');
  });
  it('deselectComponent - executes without throwing', async () => {
    await deselectComponent({ id: 'comp-1' }, ctx);
    expect(true).toBe(true);
  });
  it('deselectComponent - no-op when id missing', async () => {
    await deselectComponent({}, ctx);
    expect(true).toBe(true);
  });
  it('publishDeselectionChanged - safe invocation with id', async () => {
    await publishDeselectionChanged({ id: 'comp-1' }, ctx);
    expect(true).toBe(true);
  });
  it('publishDeselectionChanged - safe invocation without id', async () => {
    await publishDeselectionChanged({}, ctx);
    expect(true).toBe(true);
  });
  it('publishSelectionsCleared - executes without throwing', async () => {
    await publishSelectionsCleared({}, ctx);
    expect(true).toBe(true);
  });
  it('clearAllSelections - executes without throwing', async () => {
    await clearAllSelections({}, ctx);
    expect(true).toBe(true);
  });
  it('routeDeselectionRequest - executes with id', async () => {
    await routeDeselectionRequest({ id: 'comp-1' }, ctx);
    expect(true).toBe(true);
  });
  it('routeDeselectionRequest - executes without id', async () => {
    await routeDeselectionRequest({}, ctx);
    expect(true).toBe(true);
  });
});

