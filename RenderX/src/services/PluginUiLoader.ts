// Minimal manifest-driven UI loader for plugin components (dev-time dynamic import)
export interface UiMountSpec {
  slot: "left" | "center" | "right" | string;
  export?: string;
}

interface UiPluginEntry {
  name: string;
  path: string; // e.g., "component-library-plugin/"
  ui?: { slot: string; export?: string };
}

interface Manifest {
  version: string;
  plugins: UiPluginEntry[];
}

export async function loadUiForSlot(slot: string): Promise<any | null> {
  try {
    // Fetch manifest served from public/plugins
    const res = await fetch("/plugins/manifest.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const manifest = (await res.json()) as Manifest;
    const entry = (manifest.plugins || []).find((p) => p.ui?.slot === slot);
    if (!entry) return null;

    // Build module URL under /plugins and dynamic import it
    const modUrl = `/plugins/${entry.path}index.js`;
    const mod: any = await import(/* @vite-ignore */ modUrl as any);
    const exportName = entry.ui?.export || "default";
    const Comp = exportName === "default" ? mod?.default : mod?.[exportName];
    return typeof Comp === "function" ? Comp : null;
  } catch (e) {
    console.warn("PluginUiLoader: failed to load UI for slot", slot, e);
    return null;
  }
}

