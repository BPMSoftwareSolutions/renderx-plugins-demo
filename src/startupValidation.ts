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
// Optional integrity check (dev only) – integrity file must be served from site root or copied to public
export async function verifyArtifactsIntegrity(devOnly = true) {
  try {
    // ambient process declaration may not exist in browser types
    // @ts-ignore
    if (devOnly && typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') return null;
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.RENDERX_DISABLE_INTEGRITY === '1') return null;
    const res = await fetch('/artifacts.integrity.json');
    if (!res.ok) return null;
    const json = await res.json();
    const entries = Object.entries(json.files || {});
    const failed: string[] = [];
    for (const [file, metaAny] of entries) {
      try {
        const r = await fetch('/' + file);
        if (!r.ok) continue;
        const txt = await r.text();
        const buf = new TextEncoder().encode(txt);
        const digest = await crypto.subtle.digest('SHA-256', buf);
        const hex = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
        const expected = (metaAny as any).hash;
        if (hex !== expected) failed.push(file);
      } catch {}
    }
    if (failed.length) console.warn('⚠️ Artifact integrity mismatch:', failed);
    else if (entries.length) console.log('✅ Artifact integrity verified:', entries.length, 'files');
  } catch {}
  return null;
}
