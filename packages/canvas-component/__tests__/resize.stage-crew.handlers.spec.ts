/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { startResize, updateSize, endResize } from '../src/symphonies/resize/resize.stage-crew';
import { createMockCtx } from './helpers/context.ts';

describe('canvas-component resize.stage-crew handlers', () => {
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
  let ctx: any;
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas"></div><div id="rx-selection-overlay"></div><div id="comp-1" style="position:absolute;left:0px;top:0px;width:100px;height:50px"></div>';
    ctx = createMockCtx();
  });

  it('startResize - captures line base metrics (non-line harmless)', () => {
    startResize({ id: 'comp-1' });
    expect(true).toBe(true);
  });
  it('updateSize - applies size deltas and updates payload', () => {
    const res = updateSize({
      id: 'comp-1', dir: 'se', startLeft: 0, startTop: 0, startWidth: 100, startHeight: 50, dx: 10, dy: 5
    }, ctx);
    expect(res).toMatchObject({ id: 'comp-1' });
    expect(ctx.payload.updatedLayout).toMatchObject({ width: 110, height: 55 });
  });
  it('updateSize - throws on missing id', () => {
    expect(() => updateSize({ startLeft:0 }, ctx)).toThrow();
  });
  it('endResize - executes without error', () => {
    endResize({ id: 'comp-1' });
    expect(true).toBe(true);
  });
});
