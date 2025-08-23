type Route = { pluginId: string; sequenceId: string };
let routes: Record<string, Route> = {};
let loaded = false;

async function loadManifest(): Promise<void> {
  try {
    const isBrowser = typeof globalThis !== "undefined" && typeof (globalThis as any).fetch === "function";
    if (isBrowser) {
      const res = await fetch("/interaction-manifest.json");
      if (res.ok) {
        const json = await res.json();
        routes = json?.routes || {};
        loaded = true;
        return;
      }
    }
    // Node/tests fallback: import raw JSON at repo root
    const mod = await import(/* @vite-ignore */ "../interaction-manifest.json?raw");
    const text: string = (mod as any)?.default || (mod as any) || "{}";
    const json = JSON.parse(text);
    routes = json?.routes || {};
    loaded = true;
  } catch (e) {
    routes = {};
    loaded = true; // avoid retry storms; callers can handle missing keys
  }
}

export async function initInteractionManifest(): Promise<void> {
  if (!loaded) await loadManifest();
}

export function resolveInteraction(key: string): Route {
  if (!loaded) {
    // Lazy trigger load; not awaited to keep call sites simple. Tests should init explicitly.
    // @ts-ignore
    loadManifest();
  }
  const r = routes[key];
  if (!r) throw new Error(`Unknown interaction: ${key}`);
  return r;
}

