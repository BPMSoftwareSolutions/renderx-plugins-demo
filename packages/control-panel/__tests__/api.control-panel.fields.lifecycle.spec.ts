/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initResolver, generateFields, generateSections, prepareField, dispatchField, validateField, mergeErrors } from '../src/symphonies/ui/ui.stage-crew';

vi.mock('@renderx-plugins/host-sdk', () => ({
  resolveInteraction: vi.fn(() => ({ pluginId: 'canvas-component', sequenceId: 'canvas.component.update' }))
}));

function makeCtx() {
  return {
    payload: {},
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    conductor: { play: vi.fn() }
  } as any;
}

const minimalConfig = {
  defaultSections: [
    { id: 'layout', title: 'Layout', order: 1, collapsible: true, defaultExpanded: true },
    { id: 'styling', title: 'Styling', order: 2, collapsible: true, defaultExpanded: true },
    { id: 'content', title: 'Content', order: 3, collapsible: true, defaultExpanded: true }
  ],
  componentTypeOverrides: {}
} as any;

const selectedElement = {
  header: { type: 'button', id: 'btn-1' },
  content: {},
  layout: { x: 0, y: 0, width: 100, height: 40 },
  styling: {},
  classes: ['rx-button']
} as any;

describe('control-panel field lifecycle handlers (public API)', () => {
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
  beforeEach(() => { /* reset */ });

  it('generateFields populates fields array with layout/styling fields', () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    generateFields({ selectedElement }, ctx);
    expect(ctx.payload.fieldsGenerated).toBe(true);
    expect(Array.isArray(ctx.payload.fields)).toBe(true);
    // Expect at least one field from layout and styling sections
    const sections = new Set(ctx.payload.fields.map((f: any) => f.section));
    expect(sections.has('layout')).toBe(true);
    expect(sections.has('styling')).toBe(true);
  });

  it('generateSections returns default sections for button component', () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    generateSections({ selectedElement }, ctx);
    expect(ctx.payload.sectionsGenerated).toBe(true);
    expect(ctx.payload.sections.length).toBeGreaterThanOrEqual(3);
  });

  it('prepareField stores field change context in payload', () => {
    const ctx = makeCtx();
    prepareField({ fieldKey: 'width', value: '250', selectedElement }, ctx);
    expect(ctx.payload.fieldPrepared).toBe(true);
    expect(ctx.payload.fieldKey).toBe('width');
    expect(ctx.payload.value).toBe('250');
    expect(ctx.payload.selectedElement.header.id).toBe('btn-1');
  });

  it('dispatchField calls conductor.play with mapped sequence when prepared', () => {
    const ctx = makeCtx();
    prepareField({ fieldKey: 'width', value: '250', selectedElement }, ctx);
    dispatchField({}, ctx);
    expect(ctx.payload.fieldDispatched).toBe(true);
    expect(ctx.conductor.play).toHaveBeenCalledTimes(1);
    const callArgs = ctx.conductor.play.mock.calls[0];
    expect(callArgs[2]).toMatchObject({ id: 'btn-1', attribute: 'width', value: '250' });
  });

  it('validateField returns invalid for bad number value and valid for good value', () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    const field = { key: 'width', label: 'Width', type: 'number', required: true } as any;
    validateField({ field, value: 'NaN' }, ctx);
    expect(ctx.payload.isValid).toBe(false);
    expect(ctx.payload.errors.length).toBeGreaterThan(0);
    validateField({ field, value: '42' }, ctx);
    expect(ctx.payload.isValid).toBe(true);
    expect(ctx.payload.errors).toEqual([]);
  });

  it('mergeErrors marks errorsMerged after validation', () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    const field = { key: 'width', label: 'Width', type: 'number', required: true } as any;
    validateField({ field, value: '10' }, ctx);
    mergeErrors({}, ctx);
    expect(ctx.payload.errorsMerged).toBe(true);
    expect(ctx.payload.fieldKey).toBe('width');
  });
});
