import { describe, it, expect } from 'vitest';

// We verify the plugin-manifest includes a runtime entry for @renderx-plugins/canvas-component.
// Host-level registration behavior is covered by existing guardrails; this test locks the manifest contract.

describe('plugin-manifest runtime entry: @renderx-plugins/canvas-component', () => {
  it('includes a runtime entry for @renderx-plugins/canvas-component', async () => {
    // Load the generated manifest bundled for tests (raw import via Vite)
    // @ts-ignore - Vite raw import
    const raw = await import('../../public/plugins/plugin-manifest.json?raw');
    const txt: string = (raw as any)?.default || (raw as any);
    const manifest = JSON.parse(txt || '{}');
    const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

    const entry = plugins.find((p: any) => p?.id === 'CanvasComponentPlugin');
    expect(entry).toBeDefined();
    expect(entry.runtime?.module).toBe('@renderx-plugins/canvas-component');
    expect(entry.runtime?.export).toBe('register');
  });
});

