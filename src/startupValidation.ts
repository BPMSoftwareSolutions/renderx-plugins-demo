// Lightweight manifest presence & counts for host startup logging

export async function getPluginManifestStats() {
  try {
    const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    let json: any = null;
    if (isBrowser) {
      const res = await fetch('/plugins/plugin-manifest.json');
      if (res.ok) json = await res.json();
    }
    if (!json) {
      // @ts-ignore
      const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw');
      const txt: string = (mod as any)?.default || (mod as any) || '{}';
      json = JSON.parse(txt);
    }
    const plugins = Array.isArray(json.plugins) ? json.plugins : [];
    return { pluginCount: plugins.length };
  } catch (e) {
    console.warn('[startupValidation] Failed reading plugin-manifest.json', e);
    return { pluginCount: 0 };
  }
}
