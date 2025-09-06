// Lightweight cached accessor for plugin manifest so external plugins can inspect available plugins (non-critical runtime feature)
export interface HostPluginRuntimeEntry { module: string; export: string }
export interface HostPluginManifestEntry { id: string; title?: string; description?: string; runtime?: HostPluginRuntimeEntry }
export interface HostPluginManifest { plugins: HostPluginManifestEntry[] }

let cached: HostPluginManifest | null = null;
let inflight: Promise<HostPluginManifest> | null = null;

async function load(): Promise<HostPluginManifest> {
  try {
    // Try network first
    const res = await fetch('/plugins/plugin-manifest.json');
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  try {
    // @ts-ignore - raw import provided by bundler
    const mod = await import(/* @vite-ignore */ '../../public/plugins/plugin-manifest.json?raw');
    const txt: string = (mod as any)?.default || (mod as any) || '{}';
    return JSON.parse(txt);
  } catch {
    return { plugins: [] };
  }
}

export async function getPluginManifest(): Promise<HostPluginManifest> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = load().then(m => {
    cached = m; inflight = null; return m;
  });
  return inflight;
}

export function getCachedPluginManifest(): HostPluginManifest | null { return cached; }