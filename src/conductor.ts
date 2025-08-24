export type ConductorClient = any;

export async function initConductor(): Promise<ConductorClient> {
  const { initializeCommunicationSystem } = await import("musical-conductor");
  const { conductor } = initializeCommunicationSystem();
  // expose globally for UIs that import via hook alternative
  (window as any).renderxCommunicationSystem = { conductor };
  // compatibility bridge for stage-crew handlers that may use window.RenderX.conductor
  (window as any).RenderX = (window as any).RenderX || {};
  (window as any).RenderX.conductor = conductor;
  return conductor as ConductorClient;
}

// Loads and mounts sequences from per-plugin JSON catalogs.
// - Browser: fetch from /json-sequences/{plugin}/
// - Node/test: import from json-sequences/{plugin}/ with JSON loader
export async function loadJsonSequenceCatalogs(conductor: ConductorClient) {
  const plugins = ["library", "library-component", "canvas-component", "control-panel"] as const;
  const isBrowser =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).fetch === "function";

  type CatalogEntry = { file: string; handlersPath: string };
  type SequenceJson = {
    pluginId: string;
    id: string;
    name: string;
    movements: Array<{
      id: string;
      name?: string;
      beats: Array<{
        beat: number;
        event: string;
        title?: string;
        dynamics?: string;
        handler: string;
        timing?: string;
        kind?: string;
      }>;
    }>;
  };

  const seen = new Set<string>();
  const mountFrom = async (seq: SequenceJson, handlersPath: string) => {
    try {
      if (seen.has(seq.id)) {
        (conductor as any).logger?.warn?.(
          `Sequence ${seq.id} already mounted; skipping`
        );
        return;
      }
      // Prefer absolute "/plugins/..." in browser; in Node/tests, convert to relative path
      let spec = handlersPath;
      if (isBrowser) {
        spec = spec.startsWith("/") ? spec : "/" + spec.replace(/^\.\/?/, "");
      } else {
        spec = spec.startsWith("/")
          ? `..${spec}`
          : `../${spec.replace(/^\.\/?/, "")}`;
      }
      const mod = await import(/* @vite-ignore */ spec as any);
      const handlers = (mod as any)?.handlers || mod?.default?.handlers;
      if (!handlers) {
        (conductor as any).logger?.warn?.(
          `No handlers export found at ${handlersPath} for ${seq.id}`
        );
      }
      await (conductor as any)?.mount?.(seq, handlers, seq.pluginId);
      seen.add(seq.id);
    } catch (e) {
      (conductor as any).logger?.warn?.(
        `Failed to mount sequence ${seq?.id} from ${handlersPath}: ${e}`
      );
    }
  };

  for (const plugin of plugins) {
    try {
      // 1) Load catalog entries (browser first, then Node/test fallback)
      let entries: CatalogEntry[] = [];
      if (isBrowser) {
        try {
          const idxRes = await fetch(`/json-sequences/${plugin}/index.json`);
          if (idxRes.ok) {
            const idxJson = await idxRes.json();
            entries = idxJson?.sequences || [];
          }
        } catch {}
      }
      if (!entries.length) {
        const idxMod = await import(
          /* @vite-ignore */ `../json-sequences/${plugin}/index.json?raw`
        );
        const idxText: string = (idxMod as any)?.default || (idxMod as any);
        const idxJson = JSON.parse(idxText || "{}");
        entries = idxJson?.sequences || [];
      }

      // 2) For each entry, load sequence JSON (browser first, then Node/test fallback)
      for (const ent of entries) {
        let seqJson: SequenceJson | null = null;
        if (isBrowser) {
          try {
            const filePath = ent.file.startsWith("/")
              ? ent.file
              : `/json-sequences/${plugin}/${ent.file}`;
            const seqRes = await fetch(filePath);
            if (seqRes.ok) seqJson = await seqRes.json();
          } catch {}
        }
        if (!seqJson) {
          const seqMod = await import(
            /* @vite-ignore */ `../json-sequences/${plugin}/${ent.file}?raw`
          );
          const seqText: string = (seqMod as any)?.default || (seqMod as any);
          seqJson = JSON.parse(seqText || "{}");
        }
        await mountFrom(seqJson, ent.handlersPath);
      }
    } catch (e) {
      (conductor as any).logger?.warn?.(
        `Failed to load catalog for ${plugin}: ${e}`
      );
    }
  }
}

export async function registerAllSequences(conductor: ConductorClient) {
  // First, mount sequences from JSON catalogs
  await loadJsonSequenceCatalogs(conductor);

  // Import and register plugins sequentially (UI only; registrars should not mount sequences)
  const modules = [
    await import("../plugins/library"),
    await import("../plugins/library-component"),
    await import("../plugins/canvas-component"),
    await import("../plugins/canvas"),
    await import("../plugins/control-panel"),
  ];
  for (const mod of modules) {
    const reg = (mod as any).register;
    const nameGuess = (mod as any).LibraryPanel
      ? "LibraryPlugin"
      : (mod as any).CanvasPage
      ? "CanvasPlugin"
      : (mod as any).ControlPanel
      ? "ControlPanelPlugin"
      : "(unknown)";
    if (typeof reg === "function") {
      try {
        await reg(conductor);
        console.log(`🔌 Registered plugin module: ${nameGuess}`);
      } catch (e) {
        console.error("❌ Failed to register plugin module", nameGuess, e);
      }
    }
  }
  try {
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    console.log("🔎 Mounted plugin IDs after registration:", ids);
  } catch {}
}

export function useConductor(): ConductorClient {
  const { conductor } = (window as any).renderxCommunicationSystem || {};
  return conductor as ConductorClient;
}
