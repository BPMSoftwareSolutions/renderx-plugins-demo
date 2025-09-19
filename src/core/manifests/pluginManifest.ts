// Aggregated Plugin Manifest provider (shared for runtime and UI)
// Consolidates discovery from public/, external artifacts dir, or bundled raw import.
// Includes lightweight test overrides.

export type PluginManifest = {
  plugins: Array<{
    id: string;
    ui?: { slot: string; module: string; export: string };
    runtime?: { module: string; export: string };
  }>;
};

let cached: PluginManifest | null = null;
let testOverride: PluginManifest | null = null;

export function getCachedAggregatedPluginManifest(): PluginManifest | null {
  return testOverride || cached;
}

export async function getAggregatedPluginManifest(): Promise<PluginManifest> {
  if (testOverride) return testOverride;
  if (cached) return cached;

  let manifest: any = null;
  try {
    const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    if (isBrowser) {
      try { const res = await fetch('/plugins/plugin-manifest.json'); if (res.ok) manifest = await res.json(); } catch {}
    }
    if (!manifest) {
      try {
        const envMod = await import(/* @vite-ignore */ '../environment/env');
        const artifactsDir = (envMod as any).getArtifactsDir?.();
        if (artifactsDir) {
          try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const procAny: any = (globalThis as any).process;
            const cwd = procAny && typeof procAny.cwd === 'function' ? procAny.cwd() : '';
            const p = path.join(cwd, artifactsDir, 'plugins', 'plugin-manifest.json');
            const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
            if (raw) manifest = JSON.parse(raw || '{}');
          } catch {}
        }
      } catch {}
      if (!manifest) {
        try {
          // @ts-ignore raw JSON import fallback
          const mod = await import(/* @vite-ignore */ '../../../public/plugins/plugin-manifest.json?raw');
          const txt: string = (mod as any)?.default || (mod as any) || '{}';
          manifest = JSON.parse(txt);
        } catch {}
      }
    }
  } catch {}

  cached = (manifest && typeof manifest === 'object') ? manifest as PluginManifest : { plugins: [] };
  return cached;
}

// Test-only override helpers
export function __setPluginManifestForTests(m: PluginManifest | null) {
  testOverride = m;
}

