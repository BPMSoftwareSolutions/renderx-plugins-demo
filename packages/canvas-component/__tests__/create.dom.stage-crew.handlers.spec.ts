/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCanvasOrThrow, createElementWithId, applyClasses, applyInlineStyle, appendTo } from '../src/symphonies/create/create.dom.stage-crew';

describe('canvas-component create.dom.stage-crew handlers', () => {
  let _ctx: any;
  beforeEach(() => {
    _ctx = {
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
    _ctx = null;
  });
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  it('getCanvasOrThrow - returns canvas element', () => {
    expect(getCanvasOrThrow().id).toBe('rx-canvas');
  });
  it('getCanvasOrThrow - throws when canvas missing', () => {
    document.body.innerHTML = '';
    expect(() => getCanvasOrThrow()).toThrow();
  });
  it('createElementWithId - creates element with ID', () => {
    const el = createElementWithId('div', 'abc');
    expect(el.id).toBe('abc');
  });
  it('applyClasses - applies class list', () => {
    const el = document.createElement('div');
    applyClasses(el, ['a', 'b']);
    expect(el.classList.contains('a')).toBe(true);
    expect(el.classList.contains('b')).toBe(true);
  });
  it('applyInlineStyle - sets style properties', () => {
    const el = document.createElement('div');
    applyInlineStyle(el, { width: '10px', height: '5px' });
    expect(el.style.width).toBe('10px');
    expect(el.style.height).toBe('5px');
  });
  it('appendTo - appends child to parent', () => {
    const parent = getCanvasOrThrow();
    const child = document.createElement('span');
    appendTo(parent, child);
    expect(parent.contains(child)).toBe(true);
  });
});

