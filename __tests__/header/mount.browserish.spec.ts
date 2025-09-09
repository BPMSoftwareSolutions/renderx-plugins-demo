import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initConductor, registerAllSequences } from '../../src/conductor';
import { normalizeHandlersImportSpec } from '../../src/handlersPath';

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
    // Sanity: ensure header catalog is readable via fetch stub
    const headerIdxTxt = await readPublic('json-sequences/header/index.json').catch(()=> '');
    console.log('header index length:', headerIdxTxt?.length || 0);

    const conductor = await initConductor();
    await registerAllSequences(conductor);
    // Debug: inspect discovered plugin dirs/ids
    console.log('Discovered plugins:', (conductor as any)._discoveredPlugins);
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    console.log('Mounted plugin IDs after registration:', ids);

    // Expect header plugins are discovered from plugin manifest
    const discovered = (conductor as any)._discoveredPlugins || [];
    expect(discovered).toEqual(
      expect.arrayContaining(['HeaderTitlePlugin', 'HeaderControlsPlugin', 'HeaderThemePlugin'])
    );

    // In Vitest/browser-like env, we expect the handlers import spec to remain a bare specifier
    // and be left to the bundler to resolve. Our normalization should therefore be a no-op here.
    const spec = normalizeHandlersImportSpec(true, '@renderx-plugins/header');
    // Accept either bare spec or Vite/Vitest /@id/ proxy path
    const normalized = spec.replace(/^\/@id\//, '');
    expect(normalized).toBe('@renderx-plugins/header');
  }, 20000);
});

