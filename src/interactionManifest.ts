type Route = { pluginId: string; sequenceId: string };
let routes: Record<string, Route> = {};
let loaded = false;

// Built-in defaults to guarantee test/runtime stability even if manifest isn't preloaded
const DEFAULT_ROUTES: Record<string, Route> = {
  "library.load": {
    pluginId: "LibraryPlugin",
    sequenceId: "library-load-symphony",
  },
  "library.component.drag.start": {
    pluginId: "LibraryComponentPlugin",
    sequenceId: "library-component-drag-symphony",
  },
  "library.component.drop": {
    pluginId: "LibraryComponentDropPlugin",
    sequenceId: "library-component-drop-symphony",
  },
  "canvas.component.create": {
    pluginId: "CanvasComponentPlugin",
    sequenceId: "canvas-component-create-symphony",
  },
  "canvas.component.drag.move": {
    pluginId: "CanvasComponentDragPlugin",
    sequenceId: "canvas-component-drag-symphony",
  },
  "canvas.component.select": {
    pluginId: "CanvasComponentSelectionPlugin",
    sequenceId: "canvas-component-select-symphony",
  },
  "canvas.component.resize.start": {
    pluginId: "CanvasComponentResizeStartPlugin",
    sequenceId: "canvas-component-resize-start-symphony",
  },
  "canvas.component.resize.move": {
    pluginId: "CanvasComponentResizeMovePlugin",
    sequenceId: "canvas-component-resize-move-symphony",
  },
  "canvas.component.resize.end": {
    pluginId: "CanvasComponentResizeEndPlugin",
    sequenceId: "canvas-component-resize-end-symphony",
  },
};

// Try to eagerly preload routes in Vite/ Vitest environments (sync)
try {
  // @ts-ignore - Vite-specific API
  const files = (import.meta as any).glob("../interaction-manifest.json", {
    eager: true,
    query: "?raw",
    import: "default",
  });
  const text: string | undefined = files?.["../interaction-manifest.json"];
  if (typeof text === "string") {
    const json = JSON.parse(text || "{}");
    routes = json?.routes || {};
    loaded = true;
  }
} catch {}

async function loadManifest(): Promise<void> {
  try {
    const isBrowser =
      typeof globalThis !== "undefined" &&
      typeof (globalThis as any).fetch === "function";
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
    const mod = await import(
      /* @vite-ignore */ "../interaction-manifest.json?raw"
    );
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
    // Use defaults immediately to avoid empty ids in early calls (tests)
    if (!loaded) {
      routes = { ...DEFAULT_ROUTES };
      loaded = true;
    }
  }
  const r = routes[key] || DEFAULT_ROUTES[key];
  if (!r) throw new Error(`Unknown interaction: ${key}`);
  return r;
}
