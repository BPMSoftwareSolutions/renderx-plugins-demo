/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Host SDK for conductor, resolver, and EventRouter
vi.mock('@renderx-plugins/host-sdk', () => {
  const publish = vi.fn().mockResolvedValue(undefined);
  const conductor = { play: vi.fn().mockResolvedValue(undefined) };
  return {
    useConductor: () => conductor,
    resolveInteraction: (topic: string) => ({ pluginId: 'canvas-component', sequenceId: topic }),
    EventRouter: { publish },
    isFlagEnabled: () => false,
  };
});

// Mock rule-engine before importing update handler so its instance uses our mock
vi.mock('../src/temp-deps/rule-engine', () => {
  class ComponentRuleEngine {
    applyUpdate = vi.fn(() => true);
    applyContent = vi.fn(() => {});
    getUpdateRulesFor = vi.fn(() => []);
  }
  return { ComponentRuleEngine };
});

// No-op interactions to avoid attaching listeners
vi.mock('../src/symphonies/create/create.interactions.stage-crew', () => ({
  attachSelection: () => {},
  attachDrag: () => {},
  attachSvgNodeClick: () => {},
}));

import * as Host from '@renderx-plugins/host-sdk';
import { notifyUi as notifyUiSelection, routeSelectionRequest } from '../src/symphonies/select/select.stage-crew';
import { updateAttribute } from '../src/symphonies/update/update.stage-crew';
import { createNode } from '../src/symphonies/create/create.stage-crew';

function getConductor() {
  return (Host as any).useConductor();
}

describe('canvas-component public API beats', () => {
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
    document.body.innerHTML = '<div id="rx-canvas"></div>';
    vi.clearAllMocks();
  });

  it('notifyUi (selection) routes to control panel selection.show via conductor.play', () => {
    ctx.conductor = getConductor();
    ctx.baton = {};
    ctx.payload = {};
    notifyUiSelection({ id: 'n1' }, ctx);
    const calls = getConductor().play.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [, seqId, payload] = calls[0];
    expect(seqId).toBe('control-panel-selection-show-symphony');
    expect(payload).toEqual({ id: 'n1' });
  });

  it('routeSelectionRequest forwards to canvas.component.select with _routed flag', async () => {
    ctx.conductor = getConductor();
    ctx.logger = { warn: vi.fn() };
    await routeSelectionRequest({ id: 'n2' }, ctx);
    const calls = getConductor().play.mock.calls;
    expect(calls.length).toBe(1);
    const [pluginId, seqId, payload] = calls[0];
    expect(pluginId).toBe('canvas-component');
    expect(seqId).toBe('canvas.component.select');
    expect(payload).toMatchObject({ id: 'n2', _routed: true });
  });

  it('updateAttribute applies update via rule engine and stores payload', () => {
    const el = document.createElement('div');
    el.id = 'n3';
    document.body.appendChild(el);

    ctx.payload = {};
    ctx.conductor = getConductor();
    ctx.logger = { warn: vi.fn() };
    updateAttribute({ id: 'n3', attribute: 'width', value: '100px' }, ctx);
    expect(ctx.payload.updatedAttribute).toEqual({ id: 'n3', attribute: 'width', value: '100px' });
    expect(ctx.payload.elementId).toBe('n3');
  });

  it('createNode creates element under #rx-canvas and populates createdNode payload', () => {
    ctx.payload.template = { tag: 'div', text: 'Hello', classes: ['foo'] };
    ctx.payload.nodeId = 'n4';
    createNode({ position: { x: 10, y: 20 } }, ctx);
    const created = ctx.payload.createdNode;
    expect(created?.id).toBe('n4');
    const el = document.getElementById('n4');
    expect(el).toBeTruthy();
    expect(el?.textContent).toBe('Hello');
    // contains template class and an instance class
    const cls = Array.from((el as HTMLElement).classList);
    expect(cls.includes('foo')).toBe(true);
    expect(cls.length).toBeGreaterThan(1);
  });
});
