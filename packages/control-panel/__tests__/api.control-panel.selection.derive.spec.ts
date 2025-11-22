/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveSelectionModel } from '../src/symphonies/selection/selection.stage-crew';

function makeCtx() {
  return { payload: {}, logger: { warn: vi.fn() } } as any;
}

describe('control-panel selection deriveSelectionModel handler (public API)', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('returns null selectionModel when id missing', () => {
    const ctx = makeCtx();
    deriveSelectionModel({}, ctx);
    expect(ctx.payload.selectionModel).toBeNull();
  });

  it('returns null selectionModel when element not found', () => {
    const ctx = makeCtx();
    deriveSelectionModel({ id: 'nope' }, ctx);
    expect(ctx.payload.selectionModel).toBeNull();
  });

  it('derives model for element with rx-button class', () => {
    const el = document.createElement('div');
    el.id = 'btn-1';
    el.className = 'rx-button extra';
    el.style.left = '10px';
    el.style.top = '20px';
    el.style.width = '100px';
    el.style.height = '40px';
    document.body.appendChild(el);
    const ctx = makeCtx();
    deriveSelectionModel({ id: 'btn-1' }, ctx);
    const model = ctx.payload.selectionModel;
    expect(model).toBeTruthy();
    expect(model.header.type).toBe('button');
    expect(model.header.id).toBe('btn-1');
    expect(model.layout).toMatchObject({ x: 10, y: 20, width: 100, height: 40 });
    expect(model.classes).toContain('rx-button');
  });

  it('falls back to container type for plain div without rx- classes', () => {
    const el = document.createElement('div');
    el.id = 'div-1';
    document.body.appendChild(el);
    const ctx = makeCtx();
    deriveSelectionModel({ id: 'div-1' }, ctx);
    const model = ctx.payload.selectionModel;
    expect(model.header.type).toBe('container');
    expect(ctx.logger.warn).toHaveBeenCalled();
  });
});
