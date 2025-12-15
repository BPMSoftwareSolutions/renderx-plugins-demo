/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setDirty, awaitRefresh, updateView, toggleSection } from '../src/symphonies/ui/ui.stage-crew';
import { updateFromElement } from '../src/symphonies/update/update.stage-crew';

function makeCtx() {
  return { payload: {}, logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } } as any;
}

describe('control-panel state/update/refresh handlers (public API)', () => {
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => { document.body.innerHTML = ''; });

  it('setDirty marks isDirty with timestamp', () => {
    const ctx = makeCtx();
    setDirty({}, ctx);
    expect(ctx.payload.isDirty).toBe(true);
    expect(typeof ctx.payload.dirtyTimestamp).toBe('number');
  });

  it('awaitRefresh sets refreshAwaited flag', () => {
    const ctx = makeCtx();
    awaitRefresh({}, ctx);
    expect(ctx.payload.refreshAwaited).toBe(true);
  });

  it('updateView sets viewUpdated and timestamp', () => {
    const ctx = makeCtx();
    updateView({}, ctx);
    expect(ctx.payload.viewUpdated).toBe(true);
    expect(typeof ctx.payload.updateTimestamp).toBe('number');
  });

  it('toggleSection marks sectionToggled with provided id', () => {
    const ctx = makeCtx();
    toggleSection({ sectionId: 'layout' }, ctx);
    expect(ctx.payload.sectionToggled).toBe(true);
    expect(ctx.payload.sectionId).toBe('layout');
  });

  it('toggleSection error path sets sectionToggled false and error', () => {
    const ctx = makeCtx();
    toggleSection({}, ctx); // missing sectionId
    expect(ctx.payload.sectionToggled).toBe(false);
    expect(String(ctx.payload.error)).toMatch(/sectionId/i);
  });

  it('updateFromElement builds full selectionModel (non-drag) with classes', () => {
    const el = document.createElement('div');
    el.id = 'comp-1';
    el.className = 'rx-button extra';
    el.style.left = '15px';
    el.style.top = '25px';
    el.style.width = '120px';
    el.style.height = '48px';
    document.body.appendChild(el);
    const ctx = makeCtx();
    updateFromElement({ id: 'comp-1', source: 'poll' }, ctx);
    const model = ctx.payload.selectionModel;
    expect(model.header.id).toBe('comp-1');
    expect(model.header.type).toBe('button');
    expect(model.layout).toMatchObject({ x: 15, y: 25, width: 120, height: 48 });
    expect(model.classes).toContain('rx-button');
    expect(ctx.payload._source).toBe('poll');
  });

  it('updateFromElement drag path uses forwarded position/size and minimal model', () => {
    const el = document.createElement('div');
    el.id = 'comp-2';
    el.className = 'rx-button';
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.width = '10px';
    el.style.height = '10px';
    document.body.appendChild(el);
    const ctx = makeCtx();
    updateFromElement({ id: 'comp-2', source: 'drag', position: { x: 300, y: 400 } }, ctx);
    const model = ctx.payload.selectionModel;
    expect(model.layout.x).toBe(300);
    expect(model.layout.y).toBe(400);
    // width/height cached from initial element style
    expect(model.layout.width).toBeGreaterThan(0);
    expect(model.header.type).toBe('button');
    expect(ctx.payload._source).toBe('drag');
    // Drag path does not include content/styling classes array
    expect(model.classes).toBeUndefined();
  });
});
