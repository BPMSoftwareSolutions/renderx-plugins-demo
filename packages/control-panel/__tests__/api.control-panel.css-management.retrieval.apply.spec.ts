/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCssClass,
  listCssClasses,
  applyCssClassToElement,
  removeCssClassFromElement
} from '../src/symphonies/css-management/css-management.stage-crew';

// Focused API spec: sequence-defined control-panel css-management retrieval & element application handlers
// Public contract assertions only; avoids exercising create/update/delete (covered elsewhere)

function makeCtx() {
  return {
    payload: {},
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
  } as any;
}

describe('control-panel css-management retrieval/apply handlers (public API)', () => {
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
  beforeEach(() => {
    // jsdom provides a clean document each test; ensure element space empty
    document.body.innerHTML = '';
  });

  it('getCssClass returns built-in class definition (rx-button)', () => {
    const ctx = makeCtx();
    getCssClass({ className: 'rx-button' }, ctx);
    expect(ctx.payload.success).toBe(true);
    expect(ctx.payload.className).toBe('rx-button');
    expect(ctx.payload.content).toMatch(/\.rx-button/);
    expect(ctx.payload.isBuiltIn).toBe(true);
    expect(typeof ctx.payload.createdAt).toBe('number');
    expect(typeof ctx.payload.updatedAt).toBe('number');
  });

  it('getCssClass sets error when class missing', () => {
    const ctx = makeCtx();
    getCssClass({ className: 'does-not-exist' }, ctx);
    expect(ctx.payload.success).toBe(false);
    expect(ctx.payload.error).toMatch(/not found/);
  });

  it('listCssClasses returns built-in classes collection', () => {
    const ctx = makeCtx();
    listCssClasses({}, ctx);
    expect(ctx.payload.success).toBe(true);
    expect(ctx.payload.count).toBeGreaterThanOrEqual(3); // rx-button, rx-container, rx-comp-div
    const names = (ctx.payload.classes || []).map((c: any) => c.name);
    expect(names).toContain('rx-button');
  });

  it('applyCssClassToElement adds class to DOM element and sets payload success', () => {
    const el = document.createElement('div');
    el.id = 'node-1';
    document.body.appendChild(el);
    const ctx = makeCtx();
    applyCssClassToElement({ elementId: 'node-1', className: 'rx-button' }, ctx);
    expect(ctx.payload.success).toBe(true);
    expect(ctx.payload.elementId).toBe('node-1');
    expect(ctx.payload.className).toBe('rx-button');
    expect(el.classList.contains('rx-button')).toBe(true);
  });

  it('applyCssClassToElement sets error when element missing', () => {
    const ctx = makeCtx();
    applyCssClassToElement({ elementId: 'missing-node', className: 'rx-button' }, ctx);
    expect(ctx.payload.success).toBe(false);
    expect(ctx.payload.error).toMatch(/not found/);
  });

  it('removeCssClassFromElement removes existing class from DOM element', () => {
    const el = document.createElement('div');
    el.id = 'node-2';
    el.className = 'rx-button';
    document.body.appendChild(el);
    const ctx = makeCtx();
    removeCssClassFromElement({ elementId: 'node-2', className: 'rx-button' }, ctx);
    expect(ctx.payload.success).toBe(true);
    expect(el.classList.contains('rx-button')).toBe(false);
  });

  it('removeCssClassFromElement sets error when element missing', () => {
    const ctx = makeCtx();
    removeCssClassFromElement({ elementId: 'ghost', className: 'rx-button' }, ctx);
    expect(ctx.payload.success).toBe(false);
    expect(ctx.payload.error).toMatch(/not found/);
  });
});
