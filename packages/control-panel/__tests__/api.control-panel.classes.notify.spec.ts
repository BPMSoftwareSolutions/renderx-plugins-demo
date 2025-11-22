/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { handlers as classesHandlers } from '../src/symphonies/classes/classes.symphony';
import { addClass, removeClass } from '../src/symphonies/classes/classes.stage-crew';

// Provide a global EventRouter shim for control-panel notifyUi
beforeEach(() => {
  (globalThis as any).RenderX = { EventRouter: { publish: vi.fn().mockResolvedValue(undefined) } };
});

describe('control-panel: classes add/remove + notifyUi', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('addClass adds class and populates payload', () => {
    const el = document.createElement('div');
    el.id = 'c1';
    document.body.appendChild(el);
    const ctx: any = { payload: {} };
    addClass({ id: 'c1', className: 'active' }, ctx);
    expect(el.classList.contains('active')).toBe(true);
    expect(ctx.payload).toMatchObject({ id: 'c1' });
    expect(Array.isArray(ctx.payload.updatedClasses)).toBe(true);
  });

  it('removeClass removes class and populates payload', () => {
    const el = document.createElement('div');
    el.id = 'c2';
    el.className = 'active';
    document.body.appendChild(el);
    const ctx: any = { payload: {} };
    removeClass({ id: 'c2', className: 'active' }, ctx);
    expect(el.classList.contains('active')).toBe(false);
    expect(ctx.payload).toMatchObject({ id: 'c2' });
    expect(Array.isArray(ctx.payload.updatedClasses)).toBe(true);
  });

  it('notifyUi publishes control.panel.classes.updated when payload present', () => {
    const ctx: any = { payload: { id: 'c3', updatedClasses: ['a','b'] }, logger: { info: vi.fn(), warn: vi.fn() } };
    classesHandlers.notifyUi({}, ctx);
    const calls = (globalThis as any).RenderX.EventRouter.publish.mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe('control.panel.classes.updated');
    expect(calls[0][1]).toEqual({ id: 'c3', classes: ['a','b'] });
  });
});
