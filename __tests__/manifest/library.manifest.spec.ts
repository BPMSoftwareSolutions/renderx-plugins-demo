import { describe, it, expect } from 'vitest';
import manifest from '../../catalog/json-plugins/plugin-manifest.json';

describe('Library plugin manifest uses workspace package specifier', () => {
  it('points UI and runtime to @renderx-plugins/library', () => {
    const plugins = (manifest as any)?.plugins || [];
    const lib = plugins.find((p: any) => p?.id === 'LibraryPlugin');
    expect(lib).toBeTruthy();
    expect(lib.ui?.module).toBe('@renderx-plugins/library');
    expect(lib.ui?.export).toBe('LibraryPanel');
    expect(lib.runtime?.module).toBe('@renderx-plugins/library');
    expect(lib.runtime?.export).toBe('register');
  });
});

