import { describe, it, expect, vi } from 'vitest';
import { register } from '../src/index';

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
  } as any;
}

describe('renderx-plugin-library-component: register()', () => {
  it('mounts the three library-component sequences exactly once with expected pluginIds', async () => {
    const c = createFakeConductor();
    await register(c);

    const ids = c.mounted.map((m: any) => m.seq?.id);
    const count = (id: string) => ids.filter((x: string) => x === id).length;

    expect(count('library-component-drag-symphony')).toBe(1);
    expect(count('library-component-drop-symphony')).toBe(1);
    expect(count('library-component-container-drop-symphony')).toBe(1);

    const pluginIds = c.getMountedPluginIds();
    expect(pluginIds).toContain('LibraryComponentPlugin');
    expect(pluginIds).toContain('LibraryComponentDropPlugin');
  }, 30000);
});

