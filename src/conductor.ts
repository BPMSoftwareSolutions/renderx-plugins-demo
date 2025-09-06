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
export async function loadJsonSequenceCatalogs(
  conductor: ConductorClient,
  pluginIds?: string[]
) {
  // Discover plugin ids dynamically if not provided (decoupling step #102)
  let plugins: string[] = pluginIds || [];
  if (!plugins.length) {
    // Try plugin manifest first (browser fetch, then raw import)
    let manifest: any = null;
    try {
      const isBrowser =
        typeof window !== "undefined" &&
        typeof (globalThis as any).fetch === "function";
      if (isBrowser) {
        const res = await fetch("/plugins/plugin-manifest.json");
        if (res.ok) manifest = await res.json();
      }
      if (!manifest) {
        // Attempt raw import relative to project root public folder during dev tests
        try {
          // @ts-ignore: Vite raw import for development; module path resolved at runtime
          // @ts-ignore: raw JSON import via Vite during dev/test
          const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw');
          const txt: string = (mod as any)?.default || (mod as any) || "{}";
          manifest = JSON.parse(txt);
        } catch {}
      }
    } catch {
      manifest = null;
    }
    if (manifest && Array.isArray(manifest.plugins)) {
      plugins = Array.from(
        new Set(
          manifest.plugins
            .map((p: any) => p?.id)
            .filter((id: any) => typeof id === "string" && id.length)
        )
      );
      // Derive probable sequence catalog directory names from ui.module paths (browser path form: /plugins/<dir>/index.ts)
      try {
        const catalogDirs = new Set<string>();
        for (const p of manifest.plugins) {
          const modPath = p?.ui?.module;
          if (typeof modPath === 'string') {
            const m = modPath.match(/^\/plugins\/([^\/]+)\//);
            if (m) catalogDirs.add(m[1]);
          }
        }
        // Add special known sequence-only directory if present via heuristic (library-component) by optimistic inclusion
        catalogDirs.add('library-component');
        if (catalogDirs.size) {
          // Use these directory candidates for catalog loading in browser; Node path scan below will still merge actual dirs
          (conductor as any)._sequenceCatalogDirsFromManifest = Array.from(catalogDirs);
          plugins = Array.from(new Set([...(catalogDirs as any)]));
        }
      } catch {}
    }
    // Always merge in actual json-sequences directory names (Node/test only) so we load catalogs by directory name
    try {
      const proc: any = (globalThis as any).process;
      if (proc && typeof proc.cwd === "function") {
        // @ts-ignore node types not present
        const fs = await import("fs/promises");
        // @ts-ignore node types not present
        const path = await import("path");
  const dir = path.join(proc.cwd(), "json-sequences");
        const entries = await fs.readdir(dir).catch(() => [] as string[]);
        const seqDirs = entries.filter((e: string) => !e.startsWith("."));
        // Merge directory names; these are the catalog directory identifiers (legacy behavior)
        plugins = Array.from(new Set([...(plugins || []), ...seqDirs]));
      }
    } catch {}
  }
  // Debug: expose discovered plugin directories for tests (optional)
  ;(conductor as any)._discoveredPlugins = plugins;
  const isTestEnv =
    typeof import.meta !== "undefined" && !!(import.meta as any).vitest;
  const isBrowser =
    !isTestEnv &&
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).window !== "undefined" &&
    typeof (globalThis as any).document !== "undefined" &&
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

      // 2) For each entry, load sequence JSON (browser first, then Node/test fallback) in parallel
      const tasks = entries.map(async (ent) => {
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
        await mountFrom(seqJson as SequenceJson, ent.handlersPath);
      });
      await Promise.all(tasks);
    } catch (e) {
      (conductor as any).logger?.warn?.(
        `Failed to load catalog for ${plugin}: ${e}`
      );
    }
  }
}

export async function registerAllSequences(conductor: ConductorClient) {
  // Mount sequences from JSON catalogs first (artifact or local mode)
  await loadJsonSequenceCatalogs(conductor);

  // Discover runtime registration modules via plugin manifest (ui + optional runtime section)
  let manifest: any = null;
  try {
    // Browser first
    const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    if (isBrowser) {
      const res = await fetch('/plugins/plugin-manifest.json');
      if (res.ok) manifest = await res.json();
    }
    if (!manifest) {
  // @ts-ignore - raw JSON import handled by Vite
  const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw'); // path relative to src/
      const txt: string = (mod as any)?.default || (mod as any) || '{}';
      manifest = JSON.parse(txt);
    }
  } catch {
    manifest = { plugins: [] };
  }
  const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

  for (const p of plugins) {
    // optional runtime registration: { runtime: { module, export } }
    const runtime = p.runtime;
    if (!runtime || !runtime.module || !runtime.export) continue;
    try {
      const mod = await import(/* @vite-ignore */ runtime.module);
      const reg = mod[runtime.export];
      if (typeof reg === 'function') {
        await reg(conductor);
        console.log('🔌 Registered plugin runtime:', p.id);
      }
    } catch (e) {
      console.warn('⚠️ Failed runtime register for', p.id, e);
    }
  }
  try {
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    console.log('🔎 Mounted plugin IDs after registration:', ids);
  } catch {}
}

export function useConductor(): ConductorClient {
  const { conductor } = (window as any).renderxCommunicationSystem || {};
  return conductor as ConductorClient;
}
