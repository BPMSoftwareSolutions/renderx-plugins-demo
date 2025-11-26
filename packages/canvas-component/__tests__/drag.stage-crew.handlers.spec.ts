/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { updatePosition, startDrag, endDrag, forwardToControlPanel } from '../src/symphonies/drag/drag.stage-crew';
import { createMockCtx } from './helpers/context.ts';

describe('canvas-component drag.stage-crew handlers', () => {
  let _ctx: any;
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  let _ctx: any; // underscore to satisfy lint unused rule
  beforeEach(() => {
    document.body.innerHTML = '<div id="comp-1" class="rx-comp" style="position:absolute"></div>';
    _ctx = createMockCtx();
  });

  it('updatePosition - moves element based on delta', () => {
    const result = updatePosition({ id: 'comp-1', position: { x: 10, y: 20 } }, { payload: {} });
    const el = document.getElementById('comp-1') as HTMLElement;
    expect(el.style.left).toBe('10px');
    expect(el.style.top).toBe('20px');
    expect(result).toMatchObject({ success: true, elementId: 'comp-1' });
  });
  it('updatePosition - throws on missing id', () => {
    expect(() => updatePosition({ position: { x: 1, y: 2 } }, { payload: {} })).toThrow();
  });
  it('startDrag - initializes drag state', () => {
    const res = startDrag({ id: 'comp-1' }, { payload: {}, logger: {} });
    expect(res).toMatchObject({ success: true, phase: 'start' });
  });
  it('startDrag - warns on missing id', () => {
    const local = createMockCtx();
    startDrag({}, local);
    expect(local.logger.warn).toHaveBeenCalled();
  });
  it('endDrag - finalizes drag', () => {
    const res = endDrag({ id: 'comp-1' }, { payload: {}, logger: {} });
    expect(res).toMatchObject({ success: true, phase: 'end' });
  });
  it('endDrag - warns on missing id', () => {
    const local = createMockCtx();
    endDrag({}, local);
    expect(local.logger.warn).toHaveBeenCalled();
  });
  it('forwardToControlPanel - returns true', () => {
    expect(forwardToControlPanel({}, {})).toBe(true);
  });
});
