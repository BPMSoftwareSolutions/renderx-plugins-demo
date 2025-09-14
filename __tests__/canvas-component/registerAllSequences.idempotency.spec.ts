import { describe, it, expect, vi } from 'vitest';
import { registerAllSequences } from '../../src/conductor';

function createFakeConductor() {
  const mounted: any[] = [];
  const warnings: string[] = [];
  return {
    mounted,
    warnings,
    logger: {
      warn: vi.fn((msg: string) => warnings.push(msg)),
      info: vi.fn(),
    },
    async mount(seq: any, _handlers: any, pluginId: string) {
      mounted.push({ seq, pluginId });
    },
    getMountedPluginIds() {
      return Array.from(new Set(mounted.map((m) => m.pluginId)));
    },
  };
}

describe('registerAllSequences idempotency (canvas-component)', () => {
  it('calling registerAllSequences() twice does not duplicate canvas-component mounts', async () => {
    const c = createFakeConductor();

    // Use artifacts from public/ so JSON catalogs are available in tests
    (process as any).env = { ...(process as any).env, HOST_ARTIFACTS_DIR: 'public' };

    await registerAllSequences(c as any);
    await registerAllSequences(c as any);

    const ids = c.mounted.map((m: any) => m.seq?.id);
    const count = (id: string) => ids.filter((x: string) => x === id).length;

    expect(count('canvas-component-create-symphony')).toBe(1);
    expect(count('canvas-component-resize-start-symphony')).toBe(1);
    expect(count('canvas-component-resize-move-symphony')).toBe(1);
    expect(count('canvas-component-resize-end-symphony')).toBe(1);
  }, 60000);
});

