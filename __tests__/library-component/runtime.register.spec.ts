import { describe, it, expect, vi } from 'vitest';
import { registerAllSequences } from '../../src/conductor';

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
  it('registerAllSequences() loads runtime and mounts library-component sequences (even if JSON catalogs also mount)', async () => {
    const c = createFakeConductor();
    await registerAllSequences(c as any);

    const ids = c.mounted.map((m: any) => m.seq?.id);
    expect(ids).toContain('library-component-drag-symphony');
    expect(ids).toContain('library-component-drop-symphony');
    expect(ids).toContain('library-component-container-drop-symphony');

    const pluginIds = c.getMountedPluginIds();
    expect(pluginIds).toContain('LibraryComponentPlugin');
    expect(pluginIds).toContain('LibraryComponentDropPlugin');
  }, 60000);
});

