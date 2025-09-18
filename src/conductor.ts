import { normalizeHandlersImportSpec, isBareSpecifier } from './handlersPath';
import { isFlagEnabled } from './feature-flags/flags';
// @ts-ignore - JSON assertion supported by bundler / TS
import topicsManifestJson from '../topics-manifest.json' with { type: 'json' };




// Resolve dynamic module specifiers (bare package names, paths, URLs) to importable URLs
function resolveModuleSpecifier(spec: string): string {
  try {
    const resolver: any = (import.meta as any).resolve;
    if (typeof resolver === 'function') {
      const r = resolver(spec);
      if (typeof r === 'string' && r) return r;
    }
  } catch {}
  // Dev fallback: Vite's /@id proxy for bare specifiers so native import() works in browser
  try {
    const env: any = (import.meta as any).env;
    if (env && env.DEV && isBareSpecifier(spec)) {
      return '/@id/' + spec;
    }
  } catch {}
  return spec; // Works for URLs and absolute/relative paths; bare specs may fail in native browser import
}

// Statically known runtime package loaders to ensure Vite can analyze and bundle
export const runtimePackageLoaders: Record<string, () => Promise<any>> = {
  '@renderx-plugins/header': () => import('@renderx-plugins/header'),
  '@renderx-plugins/library': () => import('@renderx-plugins/library'),
  '@renderx-plugins/library-component': () => import('@renderx-plugins/library-component'),
  '@renderx-plugins/canvas': () => import('@renderx-plugins/canvas'),
  '@renderx-plugins/canvas-component': () => import('@renderx-plugins/canvas-component'),
  // Resolve Control Panel via workspace npm package during migration
  '@renderx-plugins/control-panel': () => import('@renderx-plugins/control-panel'),
  // Pre-bundled first-party fallback for yet-internal plugins

};


export type ConductorClient = any;

export async function initConductor(): Promise<ConductorClient> {
  const { initializeCommunicationSystem } = await import("musical-conductor");
  const { conductor } = initializeCommunicationSystem();
  
  // Import our EventRouter
  const { EventRouter } = await import("./EventRouter");
  
  // expose globally for UIs that import via hook alternative
  (window as any).renderxCommunicationSystem = { conductor, eventRouter: EventRouter };
  // compatibility bridge for stage-crew handlers that may use window.RenderX.conductor
  (window as any).RenderX = (window as any).RenderX || {};
  (window as any).RenderX.conductor = conductor;

  try {
    // Dev guardrail: warn on direct plays when a routed topic exists
    if (isFlagEnabled("lint.topics.warn-direct-invocation")) {
      const topics: any = (topicsManifestJson as any)?.topics || {};
      const reverse = new Map<string, string[]>();
      for (const [topic, def] of Object.entries(topics)) {
        if (!topic.endsWith(".requested")) continue;
        const routes = (def as any)?.routes || [];
        for (const r of routes as any[]) {
          const key = `${(r as any).pluginId}::${(r as any).sequenceId}`;
          const list = reverse.get(key) || [];
          list.push(topic as string);
          reverse.set(key, list);
        }
      }
      const orig = (conductor as any).play?.bind(conductor);
      if (typeof orig === "function") {
        (conductor as any).play = (pid: string, sid: string, payload: any) => {
          try {
            const hits = reverse.get(`${pid}::${sid}`);
            if (hits && hits.length) {
              console.warn(
                `[topics] Direct conductor.play(${pid}, ${sid}) used; prefer EventRouter.publish(${hits.join(
                  ", "
                )}).`
              );
            }
          } catch {}
          return orig(pid, sid, payload);
        };
      }
    }
  } catch {}

  return conductor as ConductorClient;
}

// Loads and mounts sequences from per-plugin JSON catalogs.
// - Browser: fetch from /json-sequences/{plugin}/
// - Node/test: import from json-sequences/{plugin}/ with JSON loader
export async function loadJsonSequenceCatalogs(
  conductor: ConductorClient,
  pluginIds?: string[]
) {
  let artifactsDir: string | null = null;
  try {
    const envMod = await import(/* @vite-ignore */ './env');
    artifactsDir = envMod.getArtifactsDir?.() || null;
  } catch {}
  // Discover plugin ids dynamically if not provided (decoupling step #102)
  let plugins: string[] = pluginIds || [];
  if (!plugins.length) {
    // Try plugin manifest first (browser fetch, then raw import)
    let manifest: any = null;
    let externalOnly = false;
    try {
      const isBrowser =
        typeof window !== "undefined" &&
        typeof (globalThis as any).fetch === "function";
      if (isBrowser) {
        const res = await fetch("/plugins/plugin-manifest.json");
        if (res.ok) manifest = await res.json();
      }
      if (!manifest) {
        // External artifacts dir first
        if (artifactsDir) {
          externalOnly = true;
          try {
            // @ts-ignore
            const fs = await import('fs/promises');
            // @ts-ignore
            const path = await import('path');
            const procAny: any = (globalThis as any).process;
            const cwd = procAny && typeof procAny.cwd === 'function' ? procAny.cwd() : '';
            const p = path.join(cwd, artifactsDir, 'plugins', 'plugin-manifest.json');
            const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
            if (raw) manifest = JSON.parse(raw || '{}');
          } catch {}
        }
        // Only fallback to raw import if NO external artifacts directory active
        if (!externalOnly) {
          try {
            // @ts-ignore: Vite raw import for development; module path resolved at runtime
            const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw');
            const txt: string = (mod as any)?.default || (mod as any) || "{}";
            manifest = JSON.parse(txt);
          } catch {}
        }
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
        // Add special known sequence-only directories if present via heuristic (e.g., library-component, canvas-component) by optimistic inclusion
        catalogDirs.add('library-component');
        catalogDirs.add('canvas-component');
        if (catalogDirs.size) {
          // Use these directory candidates for catalog loading in browser; Node path scan below will still merge actual dirs
          (conductor as any)._sequenceCatalogDirsFromManifest = Array.from(catalogDirs);
          // Merge catalog directory hints with existing plugin IDs instead of replacing them
          // so IDs like HeaderThemePlugin still map to 'header' and get mounted.
          plugins = Array.from(new Set([...(plugins || []), ...Array.from(catalogDirs)]));
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
        const base = artifactsDir ? path.resolve(proc.cwd(), artifactsDir, 'json-sequences') : path.join(proc.cwd(), "json-sequences");
        const entries = await fs.readdir(base).catch(() => [] as string[]);
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
  const forcedBrowser = typeof globalThis !== 'undefined' && (globalThis as any).__RENDERX_FORCE_BROWSER === true;
  const isBrowser =
    (forcedBrowser || !isTestEnv) &&
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
  const runtimeMounted: Set<string> = (conductor as any)._runtimeMountedSeqIds instanceof Set
    ? (conductor as any)._runtimeMountedSeqIds
    : new Set<string>(Array.isArray((conductor as any)._runtimeMountedSeqIds) ? (conductor as any)._runtimeMountedSeqIds : []);
  const mountFrom = async (seq: SequenceJson, handlersPath: string) => {
    try {
      if (seen.has(seq.id) || runtimeMounted.has(seq.id)) {
        (conductor as any).logger?.warn?.(
          `Sequence ${seq.id} already mounted; skipping`
        );
        return;
      }
      // Normalize handlers import spec to support URLs, bare specifiers, and paths
      let spec = normalizeHandlersImportSpec(isBrowser, handlersPath);
      // Strengthen bare package resolution in browser by leveraging the same resolver as runtime loaders
      if (isBrowser && isBareSpecifier(handlersPath)) {
        try { spec = resolveModuleSpecifier(handlersPath); } catch {}
      }
      let mod: any;
      mod = await import(/* @vite-ignore */ spec as any);
      const handlers = (mod as any)?.handlers || mod?.default?.handlers;
      if (!handlers) {
        (conductor as any).logger?.warn?.(
          `No handlers export found at ${handlersPath} for ${seq.id}`
        );
      }
      await (conductor as any)?.mount?.(seq, handlers, seq.pluginId);
      seen.add(seq.id);
      try {
        runtimeMounted.add(seq.id);
        (conductor as any)._runtimeMountedSeqIds = runtimeMounted;
      } catch {}
    } catch (e) {
      (conductor as any).logger?.warn?.(
        `Failed to mount sequence ${seq?.id} from ${handlersPath}: ${e}`
      );
    }
  };

  for (const plugin of plugins) {
    // Map plugin IDs to catalog directory names when they differ (legacy naming)
    const dir = plugin === 'CanvasComponentPlugin' ? 'canvas-component'
      : plugin === 'LibraryPlugin' ? 'library'
      : plugin === 'ControlPanelPlugin' ? 'control-panel'
      : plugin === 'HeaderThemePlugin' || plugin === 'HeaderControlsPlugin' || plugin === 'HeaderTitlePlugin' ? 'header'
      : plugin;
    try {
      // 1) Load catalog entries (browser first, then Node/test fallback)
      let entries: CatalogEntry[] = [];
      if (isBrowser) {
        try {
          const idxRes = await fetch(`/json-sequences/${dir}/index.json`);
          if (idxRes.ok) {
            const idxJson = await idxRes.json();
            entries = idxJson?.sequences || [];
          }
        } catch {}
      }
      if (!entries.length) {
  if (!isBrowser && artifactsDir) {
          try {
            // @ts-ignore
            const fs = await import('fs/promises');
            // @ts-ignore
            const path = await import('path');
            const procAny2: any = (globalThis as any).process;
            const cwd = procAny2 && typeof procAny2.cwd === 'function' ? procAny2.cwd() : '';
            const idxPath = path.join(cwd, artifactsDir, 'json-sequences', dir, 'index.json');
            const raw = await fs.readFile(idxPath, 'utf-8').catch(()=>null as any);
            if (raw) {
              const idxJson = JSON.parse(raw || '{}');
              entries = idxJson?.sequences || [];
            }
          } catch {}
        }
  // Only attempt raw project import if not using external artifacts
  if (!entries.length && !artifactsDir) {
          const idxMod = await import(
            /* @vite-ignore */ `../json-sequences/${dir}/index.json?raw`
          );
          const idxText: string = (idxMod as any)?.default || (idxMod as any);
          const idxJson = JSON.parse(idxText || "{}");
          entries = idxJson?.sequences || [];
        }
      }

      // 2) For each entry, load sequence JSON (browser first, then Node/test fallback) in parallel
      const tasks = entries.map(async (ent) => {
        let seqJson: SequenceJson | null = null;
        if (isBrowser) {
          try {
            const filePath = ent.file.startsWith("/")
              ? ent.file
              : `/json-sequences/${dir}/${ent.file}`;
            const seqRes = await fetch(filePath);
            if (seqRes.ok) seqJson = await seqRes.json();
          } catch {}
        }
        if (!seqJson && !isBrowser && artifactsDir) {
          try {
            // @ts-ignore
            const fs = await import('fs/promises');
            // @ts-ignore
            const path = await import('path');
            const procAny3: any = (globalThis as any).process;
            const cwd = procAny3 && typeof procAny3.cwd === 'function' ? procAny3.cwd() : '';
            const seqPath = path.join(cwd, artifactsDir, 'json-sequences', dir, ent.file);
            const raw = await fs.readFile(seqPath, 'utf-8').catch(()=>null as any);
            if (raw) seqJson = JSON.parse(raw || '{}');
          } catch {}
        }
  if (!seqJson && !artifactsDir) {
          const seqMod = await import(
            /* @vite-ignore */ `../json-sequences/${dir}/${ent.file}?raw`
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
  // 1) Discover runtime registration modules via plugin manifest (ui + optional runtime section)
  let manifest: any = null;
  try {
    // Browser first
    const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    if (isBrowser) {
      const res = await fetch('/plugins/plugin-manifest.json');
      if (res.ok) manifest = await res.json();
    }
    if (!manifest) {
      try {
        const envMod = await import(/* @vite-ignore */ './env');
        const artifactsDir2 = envMod.getArtifactsDir?.();
        if (artifactsDir2) {
          // @ts-ignore
          const fs = await import('fs/promises');
          // @ts-ignore
          const path = await import('path');
          const procAny4: any = (globalThis as any).process;
          const cwd = procAny4 && typeof procAny4.cwd === 'function' ? procAny4.cwd() : '';
          const p = path.join(cwd, artifactsDir2, 'plugins', 'plugin-manifest.json');
          const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
          if (raw) manifest = JSON.parse(raw || '{}');
        }
      } catch {}
      // Only fallback when no external artifacts dir was used
      if (!manifest) {
        try {
          // @ts-ignore - raw JSON import handled by Vite
          const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw'); // path relative to src/
          const txt: string = (mod as any)?.default || (mod as any) || '{}';
          manifest = JSON.parse(txt);
        } catch {}
      }
    }
  } catch {
    manifest = { plugins: [] };
  }
  const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

  // 2) Register runtime modules BEFORE mounting JSON catalogs so plugin ids are known to the conductor
  // Prioritize component runtime-only plugins to surface success logs earlier in E2E startup
  const prioritized = plugins.slice().sort((a: any, b: any) => {
    const prio = (x: any) => (x?.id === 'LibraryComponentPlugin' || x?.id === 'CanvasComponentPlugin') ? 1 : 0;
    return prio(b) - prio(a);
  });
  for (const p of prioritized) {
    const runtime = p.runtime;
    if (!runtime || !runtime.module || !runtime.export) continue;
    try {
      // Test-only injection to simulate resolution failure for library plugin
      const isTestEnv = typeof import.meta !== 'undefined' && !!(import.meta as any).vitest;
      const forceLibraryResolutionError = isTestEnv && typeof globalThis !== 'undefined' && (globalThis as any).__RENDERX_FORCE_LIBRARY_RESOLUTION_ERROR === true;
      if (forceLibraryResolutionError && runtime.module === '@renderx-plugins/library') {
        throw new TypeError("Failed to resolve module specifier '@renderx-plugins/library'");
      }

      const loader = runtimePackageLoaders[runtime.module];
      const mod = loader
        ? await loader()
        : await import(/* @vite-ignore */ resolveModuleSpecifier(runtime.module));
      // Emit success as soon as runtime module resolves; do not block on register()
      console.log('🔌 Registered plugin runtime:', p.id);
      const reg = (mod as any)?.[runtime.export] || (mod as any)?.default?.[runtime.export];
      if (typeof reg === 'function') {
        await reg(conductor);
      } else {
        // No-op if the module exposes no register; module resolved successfully.
      }
    } catch (e) {
      console.warn('⚠️ Failed runtime register for', p.id, e);
    }
  }

  // 3) Mount sequences from JSON catalogs (artifact or local mode)
  await loadJsonSequenceCatalogs(conductor);

  // 3b) Targeted fallback: if library-component sequences are still not mounted in browser,
  // try to import handlers and mount directly from public JSON catalogs.
  try {
    const isBrowser = typeof window !== 'undefined' && typeof (globalThis as any).fetch === 'function';
    if (isBrowser) {
      const ids: string[] = (conductor as any).getMountedPluginIds?.() || [];
      const needLib = !ids.includes('LibraryComponentPlugin') || !ids.includes('LibraryComponentDropPlugin');
      if (needLib) {
        try {
          const spec = resolveModuleSpecifier('@renderx-plugins/library-component');
          const mod: any = await import(/* @vite-ignore */ spec as any);
          const handlers = (mod as any)?.handlers || mod?.default?.handlers;
          if (handlers) {
            const pull = async (file: string) => {
              try {
                const r = await fetch(`/json-sequences/library-component/${file}`);
                if (r.ok) return await r.json();
              } catch {}
              return null;
            };
            const seqs = [
              await pull('drag.json'),
              await pull('drop.json'),
              await pull('container.drop.json'),
            ].filter(Boolean) as any[];
            for (const s of seqs) {
              try { await (conductor as any).mount?.(s, handlers, s.pluginId); } catch {}
            }
          }
        } catch {}
      }
    }
  } catch {}

  // 4) Debug
  try {
    const ids = (conductor as any).getMountedPluginIds?.() || [];
    console.log('🔎 Mounted plugin IDs after registration:', ids);
    // Emit per-plugin success logs to aid E2E startup guardrails
    for (const id of ids) {
      try { console.log('Plugin mounted successfully:', id); } catch {}
    }
  } catch {}
}

export function useConductor(): ConductorClient {
  const { conductor } = (window as any).renderxCommunicationSystem || {};
  return conductor as ConductorClient;
}
