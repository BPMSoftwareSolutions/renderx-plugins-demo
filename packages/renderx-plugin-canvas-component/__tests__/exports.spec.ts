import { describe, it, expect } from 'vitest';

describe('@renderx-plugins/canvas-component package exports', () => {
  it('exposes a callable register() and deep symphony subpaths', async () => {
    const pkg = await import('@renderx-plugins/canvas-component');
    expect(typeof pkg.register).toBe('function');
    await pkg.register({} as any); // should be a no-op
    await pkg.register({} as any); // idempotent

    const resizeStart = await import('@renderx-plugins/canvas-component/symphonies/resize/resize.start.symphony.ts');
    expect(typeof resizeStart.handlers).toBe('object');

    const create = await import('@renderx-plugins/canvas-component/symphonies/create/create.symphony.ts');
    expect(typeof create.handlers).toBe('object');
  }, 30000);
});

