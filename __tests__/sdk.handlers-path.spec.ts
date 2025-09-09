import { describe, it, expect } from 'vitest';
import { normalizeHandlersImportSpec } from '../src/handlersPath';

describe('normalizeHandlersImportSpec', () => {
  it('returns URLs as-is', () => {
    expect(normalizeHandlersImportSpec(true, 'http://example.com/x.js')).toBe('http://example.com/x.js');
    expect(normalizeHandlersImportSpec(false, 'https://cdn.example.com/y.mjs')).toBe('https://cdn.example.com/y.mjs');
  });

  it('normalizes bare package specifiers for browser dev (allows Vite /@id fallback)', () => {
    const bare = '@scope/plugin/symphonies/start.js';
    const out = normalizeHandlersImportSpec(true, bare);
    if (out.startsWith('/@id/')) {
      expect(out).toBe('/@id/' + bare);
    } else {
      expect(out).toBe(bare);
    }
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

