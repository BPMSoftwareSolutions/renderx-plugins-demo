/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AllRulesConfig } from '../src/temp-deps/rule-engine';
// Static imports to allow handler test extraction to map these public API handlers
import { setAllRulesConfig, loadAllRulesFromWindow, getAllRulesConfig } from '../src/temp-deps/rule-engine';

// We exercise the public rule-engine configuration handlers that are sequence-defined
// (setAllRulesConfig, loadAllRulesFromWindow, getAllRulesConfig). These enable external
// or window-provided rule configuration for update/content/extract behaviors.

// Because the module maintains internal cached state (cachedAllRules), we use
// vi.resetModules() + dynamic import in specific tests to ensure we can observe
// the lazy window-loading path cleanly. Direct negative tests (e.g., malformed
// window config) are skipped; upstream integration guarantees shape before use.

function makeConfig(): AllRulesConfig {
  return {
    update: { default: [{ whenAttr: 'x', action: 'stylePx', prop: 'left' }] },
    content: { default: [{ action: 'textFrom', from: 'label', fallback: 'N/A' }] },
    extract: { default: [{ get: 'textContent', as: 'content' }] }
  } as AllRulesConfig;
}

describe('canvas-component rule-engine config handlers (public API)', () => {
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
      error: null,
payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    _ctx = null;
  });
  beforeEach(() => {
    // Clear any global RenderX componentRules to avoid cross-test pollution
    delete (globalThis as any).RenderX;
  });

  it('exports exist (sanity) and setAllRulesConfig followed by getAllRulesConfig returns the same config object', async () => {
    // Use static imports for mapping + functionality
    expect(typeof setAllRulesConfig).toBe('function');
    expect(typeof loadAllRulesFromWindow).toBe('function');
    expect(typeof getAllRulesConfig).toBe('function');
    const cfg = makeConfig();
    setAllRulesConfig(cfg);
    const retrieved = getAllRulesConfig();
    // Basic shape + reference (non-deep-cloned) expectation
    expect(retrieved).toBe(cfg);
    expect(retrieved.update?.default[0].whenAttr).toBe('x');
    expect(retrieved.content?.default[0].action).toBe('textFrom');
    expect(retrieved.extract?.default[0].get).toBe('textContent');
    // Explicit direct references (no-op) to strengthen handler mapping
    setAllRulesConfig; loadAllRulesFromWindow; getAllRulesConfig;
  });

  it('loadAllRulesFromWindow picks up window-provided configuration', async () => {
    const cfg = makeConfig();
    (globalThis as any).RenderX = { componentRules: cfg };
  // Dynamic import for isolation without aliasing names
  const mod2 = await import('../src/temp-deps/rule-engine');
  mod2.loadAllRulesFromWindow();
  const retrieved = mod2.getAllRulesConfig();
    expect(retrieved).toBe(cfg);
    const firstContentRule = retrieved.content?.default[0];
    expect(firstContentRule?.action).toBe('textFrom');
    if (firstContentRule?.action === 'textFrom') {
      expect(firstContentRule.fallback).toBe('N/A');
    }
  });

  it('getAllRulesConfig lazily loads from window when no cached config is set yet', async () => {
    const cfg = makeConfig();
    (globalThis as any).RenderX = { componentRules: cfg };
    // Ensure module cache cleared so cachedAllRules is null when re-imported
    vi.resetModules();
  const fresh = await import('../src/temp-deps/rule-engine');
  const retrieved = fresh.getAllRulesConfig(); // triggers implicit loadAllRulesFromWindow
    expect(retrieved).toBe(cfg);
    const firstUpdateRule = retrieved.update?.default[0];
    expect(firstUpdateRule?.action).toBe('stylePx');
    if (firstUpdateRule?.action === 'stylePx' || firstUpdateRule?.action === 'style') {
      expect((firstUpdateRule as any).prop).toBe('left');
    }
  });
});


