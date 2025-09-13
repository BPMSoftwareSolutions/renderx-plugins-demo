import { describe, it, expect, vi } from 'vitest';
import { loadJsonSequenceCatalogs } from '../../src/conductor';

function createFakeConductor() {
  const mounted: any[] = [];
  return {
    mounted,
    logger: { warn: vi.fn(), info: vi.fn() },
    async mount(seq: any, _handlers: any, pluginId: string) {
      mounted.push({ seq, pluginId });
    },
  };
}

describe('@renderx-plugins/canvas-component runtime register', () => {
  it('exported register() is callable and does not cause duplicate mounts when combined with JSON catalogs', async () => {
    const c = createFakeConductor() as any;

    // Point loader to built artifacts in public/
    (process as any).env = { ...(process as any).env, HOST_ARTIFACTS_DIR: 'public' };

    // Import runtime register from the workspace package and call it twice (idempotency)
    const mod: any = await import('@renderx-plugins/canvas-component');
    expect(typeof mod?.register).toBe('function');
    await mod.register(c);
    await mod.register(c);

    // Now mount via JSON catalogs (this performs the real work for canvas-component)
    await loadJsonSequenceCatalogs(c);

    // Count by seq.id and expect no duplicates for a few representative sequences
    const ids = c.mounted.map((m: any) => m.seq?.id);
    const count = (id: string) => ids.filter((x: string) => x === id).length;

    expect(count('canvas-component-resize-start-symphony')).toBe(1);
    expect(count('canvas-component-resize-move-symphony')).toBe(1);
    expect(count('canvas-component-resize-end-symphony')).toBe(1);
    expect(count('canvas-component-create-symphony')).toBe(1);
  }, 60000);
});

