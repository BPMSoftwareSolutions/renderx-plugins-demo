export interface TopicRoute {
  pluginId: string;
  sequenceId: string;
}

export interface TopicDef {
  routes: TopicRoute[];
  payloadSchema?: any;
  visibility?: "public" | "internal";
  correlationKeys?: string[];
  perf?: { throttleMs?: number; debounceMs?: number; dedupeWindowMs?: number };
  notes?: string;
}

let topics: Record<string, TopicDef> = {};
let loaded = false;

// Try to eagerly preload in Vite/Vitest (sync)
try {
  // @ts-ignore - Vite-specific API
  const files = (import.meta as any).glob("../topics-manifest.json", {
    eager: true,
    query: "?raw",
    import: "default",
  });
  const text: string | undefined = files?.["../topics-manifest.json"];
  if (typeof text === "string") {
    const json = JSON.parse(text || "{}");
    topics = json?.topics || {};
    loaded = true;
  }
} catch {}

async function loadManifest(): Promise<void> {
  try {
    const isBrowser =
      typeof globalThis !== "undefined" &&
      typeof (globalThis as any).fetch === "function";
    if (isBrowser) {
      const res = await fetch("/topics-manifest.json");
      if (res.ok) {
        const json = await res.json();
        topics = json?.topics || {};
        loaded = true;
        return;
      }
    }
    const mod = await import(/* @vite-ignore */ "../topics-manifest.json?raw");
    const text: string = (mod as any)?.default || (mod as any) || "{}";
    const json = JSON.parse(text);
    topics = json?.topics || {};
    loaded = true;
  } catch {
    topics = {};
    loaded = true;
  }
}

export async function initTopicsManifest(): Promise<void> {
  if (!loaded) await loadManifest();
}

export function getTopicDef(key: string): TopicDef | undefined {
  if (!loaded) {
    // fire-and-forget lazy load; tests should call init explicitly
    // @ts-ignore
    loadManifest();
  }
  return topics[key];
}

