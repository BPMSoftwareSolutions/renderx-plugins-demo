import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initConductor, registerAllSequences } from '../../src/conductor';

// Utility: read a public file for fetch mock
async function readPublic(path: string): Promise<string> {
  // @ts-ignore dynamic import of raw JSON
  const mod = await import(/* @vite-ignore */ `../../public/${path}?raw`);
  const txt: string = (mod as any)?.default || (mod as any) || '';
  return txt as string;
}

describe('browser-like header sequences mounting (integration smoke)', () => {
  beforeEach(() => {
    // Force the browser branch in conductor.ts during tests
    ;(globalThis as any).__RENDERX_FORCE_BROWSER = true;

    // Minimal window/document/fetch presence
    if (typeof (globalThis as any).window === 'undefined') (globalThis as any).window = {} as any;
    if (typeof (globalThis as any).document === 'undefined') (globalThis as any).document = {} as any;

    // Stub fetch to serve json-sequences/* and plugins manifest from public/
    vi.stubGlobal('fetch', async (url: string) => {
      const u = String(url);
      let path = '';
      if (u.endsWith('/plugins/plugin-manifest.json')) {
        path = 'plugins/plugin-manifest.json';
      } else if (u.includes('/json-sequences/')) {
        // Strip leading '/'
        path = u.replace(/^\//, '');
      }
      if (!path) return { ok: false, json: async () => ({}) } as any;
      const txt = await readPublic(path).catch(() => '');
      return {
        ok: !!txt,
        json: async () => JSON.parse(txt || '{}')
      } as any;
    });
  });

  it('mounts HeaderThemePlugin sequences so the plugin id is available to play()', async () => {
    const conductor = await initConductor();
    await registerAllSequences(conductor);
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    expect(ids).toContain('HeaderThemePlugin');
  });
});

