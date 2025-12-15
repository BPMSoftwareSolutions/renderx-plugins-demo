/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { startLineResize, updateLine, endLineResize } from '../src/symphonies/resize-line/resize.line.stage-crew';
import { createMockCtx } from './helpers/context';

describe('canvas-component resize.line.stage-crew handlers', () => {
  let ctx: any;
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    document.body.innerHTML = '<div id="comp-line" class="rx-line" style="--x1:0;--y1:0;--x2:10;--y2:10"></div>';
    ctx = createMockCtx();
  });

  it('startLineResize - calls optional callback harmlessly', () => {
    const cb = vi.fn();
    startLineResize({ id: 'comp-line', handle: 'a', onLineResizeStart: cb });
    expect(cb).toHaveBeenCalled();
  });
  it('updateLine - updates endpoints/length', () => {
    const res = updateLine({ id: 'comp-line', handle: 'a', dx: 5, dy: 5 });
    expect(res).toMatchObject({ id: 'comp-line', handle: 'a' });
  });
  it('updateLine - throws when id missing', () => {
    expect(() => updateLine({ handle: 'a', dx: 1 })).toThrow();
  });
  it('endLineResize - invokes optional callback', () => {
    const cb = vi.fn();
    endLineResize({ id: 'comp-line', onLineResizeEnd: cb });
    expect(cb).toHaveBeenCalled();
  });
});

