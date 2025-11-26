/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initResolver, loadSchemas, registerObservers, notifyReady } from '../src/symphonies/ui/ui.stage-crew';

// Mock host-sdk resolveInteraction (not used directly in these handlers but ensures isolation if imported elsewhere)
vi.mock('@renderx-plugins/host-sdk', () => ({
  resolveInteraction: vi.fn(() => ({ pluginId: 'canvas-component', sequenceId: 'canvas.component.update' }))
}));

function makeCtx() {
  return { payload: {}, logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } } as any;
}

const minimalConfig = {
  defaultSections: [
    { id: 'layout', title: 'Layout', order: 1, collapsible: true, defaultExpanded: true },
    { id: 'styling', title: 'Styling', order: 2, collapsible: true, defaultExpanded: true },
    { id: 'content', title: 'Content', order: 3, collapsible: true, defaultExpanded: true }
  ],
  componentTypeOverrides: {}
} as any;

describe('control-panel UI bootstrap handlers (public API)', () => {
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
  beforeEach(() => { /* reset DOM/context per test */ });

  it('initResolver initializes resolver and sets payload flags', () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    expect(ctx.payload.resolverInitialized).toBe(true);
    expect(ctx.payload.resolver).toBeTruthy();
    expect(ctx.logger.info).toHaveBeenCalledWith('Schema resolver initialized');
  });

  it('loadSchemas sets schemasLoaded when resolver present (test env shortcut)', async () => {
    const ctx = makeCtx();
    initResolver({ config: minimalConfig }, ctx);
    await loadSchemas({}, ctx);
    expect(ctx.payload.schemasLoaded).toBe(true);
  });

  // Note: negative path (resolver missing) skipped due to persistent module-level uiState across tests.

  it('registerObservers marks observersRegistered', () => {
    const ctx = makeCtx();
    registerObservers({}, ctx);
    expect(ctx.payload.observersRegistered).toBe(true);
    expect(ctx.logger.info).toHaveBeenCalledWith('UI observers registered');
  });

  it('notifyReady sets uiReady and timestamp', () => {
    const ctx = makeCtx();
    notifyReady({}, ctx);
    expect(ctx.payload.uiReady).toBe(true);
    expect(typeof ctx.payload.timestamp).toBe('number');
  });
});
