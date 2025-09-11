import { describe, it, expect } from 'vitest';

describe('@renderx-plugins/canvas package exports', () => {
  it('exposes CanvasPage and register()', async () => {
    const pkg = await import('@renderx-plugins/canvas');
    expect(typeof pkg.register).toBe('function');
    // CanvasPage is a React component function; we just assert it is defined
    expect(typeof pkg.CanvasPage).toBe('function');
  }, 30000);
});

