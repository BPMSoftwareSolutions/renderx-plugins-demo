import { describe, it, expect, vi } from 'vitest';
import { registerAllSequences } from '../../src/core/conductor';

function createFakeConductor() {
  const mounted: any[] = [];
  return {
    mounted,
    logger: { warn: vi.fn(), info: vi.fn() },
    async mount(seq: any, _handlers: any, pluginId: string) {
      mounted.push({ seq, pluginId });
    },
    getMountedPluginIds() {
      return Array.from(new Set(mounted.map(m => m.pluginId)));
    },
  };
}

describe('@renderx-plugins/library-component runtime registration', () => {
  it('registerAllSequences() mounts library-component sequences exactly once (no duplicates from JSON catalogs)', async () => {
    const c = createFakeConductor();
    // Use artifacts from public/ so JSON catalogs are available in tests
    (process as any).env = { ...(process as any).env, HOST_ARTIFACTS_DIR: 'public' };
    await registerAllSequences(c as any);

    const ids = c.mounted.map((m: any) => m.seq?.id);
    const count = (id: string) => ids.filter((x: string) => x === id).length;

    expect(count('library-component-drag-symphony')).toBe(1);
    expect(count('library-component-drop-symphony')).toBe(1);
    expect(count('library-component-container-drop-symphony')).toBe(1);

    const pluginIds = c.getMountedPluginIds();
    expect(pluginIds).toContain('LibraryComponentPlugin');
    expect(pluginIds).toContain('LibraryComponentDropPlugin');
  }, 60000);
});
