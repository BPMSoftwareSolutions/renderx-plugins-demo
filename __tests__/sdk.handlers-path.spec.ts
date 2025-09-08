import { describe, it, expect } from 'vitest';
import { normalizeHandlersImportSpec } from '../src/handlersPath';

describe('normalizeHandlersImportSpec', () => {
  it('returns URLs as-is', () => {
    expect(normalizeHandlersImportSpec(true, 'http://example.com/x.js')).toBe('http://example.com/x.js');
    expect(normalizeHandlersImportSpec(false, 'https://cdn.example.com/y.mjs')).toBe('https://cdn.example.com/y.mjs');
  });

  it('returns bare package specifiers as-is', () => {
    // Scoped packages treated as bare specifiers
    expect(normalizeHandlersImportSpec(true, '@scope/plugin/symphonies/start.js')).toBe('@scope/plugin/symphonies/start.js');
  });

  it('normalizes relative paths for browser', () => {
    expect(normalizeHandlersImportSpec(true, './plugins/library/handlers.js')).toBe('/plugins/library/handlers.js');
    expect(normalizeHandlersImportSpec(true, 'plugins/header/handlers.js')).toBe('/plugins/header/handlers.js');
    expect(normalizeHandlersImportSpec(true, '/plugins/canvas/handlers.js')).toBe('/plugins/canvas/handlers.js');
  });

  it('normalizes paths for node/test', () => {
    expect(normalizeHandlersImportSpec(false, './plugins/library/handlers.js')).toBe('../plugins/library/handlers.js');
    expect(normalizeHandlersImportSpec(false, 'plugins/header/handlers.js')).toBe('../plugins/header/handlers.js');
    expect(normalizeHandlersImportSpec(false, '/plugins/canvas/handlers.js')).toBe('../plugins/canvas/handlers.js');
  });
});

