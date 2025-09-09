import { normalizeHandlersImportSpec } from './handlersPath';
// Statically known runtime package loaders to ensure Vite can analyze and bundle
const runtimePackageLoaders = {
  '@renderx-plugins/header': () => import('@renderx-plugins/header'),
};

export async function initConductor() {
    const { initializeCommunicationSystem } = await import("musical-conductor");
    const { conductor } = initializeCommunicationSystem();
    // expose globally for UIs that import via hook alternative
    window.renderxCommunicationSystem = { conductor };
    // compatibility bridge for stage-crew handlers that may use window.RenderX.conductor
    window.RenderX = window.RenderX || {};
    window.RenderX.conductor = conductor;
    return conductor;
}
// Loads and mounts sequences from per-plugin JSON catalogs.
// - Browser: fetch from /json-sequences/{plugin}/
// - Node/test: import from json-sequences/{plugin}/ with JSON loader
export async function loadJsonSequenceCatalogs(conductor, pluginIds) {
    let artifactsDir = null;
    try {
        const envMod = await import(/* @vite-ignore */ './env');
        artifactsDir = envMod.getArtifactsDir?.() || null;
    }
    catch { }
    // Discover plugin ids dynamically if not provided (decoupling step #102)
    let plugins = pluginIds || [];
    if (!plugins.length) {
        // Try plugin manifest first (browser fetch, then raw import)
        let manifest = null;
        let externalOnly = false;
        try {
            const isBrowser = typeof window !== "undefined" &&
                typeof globalThis.fetch === "function";
            if (isBrowser) {
                const res = await fetch("/plugins/plugin-manifest.json");
                if (res.ok)
                    manifest = await res.json();
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
                        const procAny = globalThis.process;
                        const cwd = procAny && typeof procAny.cwd === 'function' ? procAny.cwd() : '';
                        const p = path.join(cwd, artifactsDir, 'plugins', 'plugin-manifest.json');
                        const raw = await fs.readFile(p, 'utf-8').catch(() => null);
                        if (raw)
                            manifest = JSON.parse(raw || '{}');
                    }
                    catch { }
                }
                // Only fallback to raw import if NO external artifacts directory active
                if (!externalOnly) {
                    try {
                        // @ts-ignore: Vite raw import for development; module path resolved at runtime
                        const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw');
                        const txt = mod?.default || mod || "{}";
                        manifest = JSON.parse(txt);
                    }
                    catch { }
                }
            }
        }
        catch {
            manifest = null;
        }
        if (manifest && Array.isArray(manifest.plugins)) {
            plugins = Array.from(new Set(manifest.plugins
                .map((p) => p?.id)
                .filter((id) => typeof id === "string" && id.length)));
            // Derive probable sequence catalog directory names from ui.module paths (browser path form: /plugins/<dir>/index.ts)
            try {
                const catalogDirs = new Set();
                for (const p of manifest.plugins) {
                    const modPath = p?.ui?.module;
                    if (typeof modPath === 'string') {
                        const m = modPath.match(/^\/plugins\/([^\/]+)\//);
                        if (m)
                            catalogDirs.add(m[1]);
                    }
                }
                // Add special known sequence-only directories if present via heuristic (e.g., library-component, canvas-component) by optimistic inclusion
                catalogDirs.add('library-component');
                catalogDirs.add('canvas-component');
                if (catalogDirs.size) {
                    // Use these directory candidates for catalog loading in browser; Node path scan below will still merge actual dirs
                    conductor._sequenceCatalogDirsFromManifest = Array.from(catalogDirs);
                    // Merge catalog directory hints with existing plugin IDs instead of replacing them
                    // so IDs like HeaderThemePlugin still map to 'header' and get mounted.
                    plugins = Array.from(new Set([...(plugins || []), ...Array.from(catalogDirs)]));
                }
            }
            catch { }
        }
        // Always merge in actual json-sequences directory names (Node/test only) so we load catalogs by directory name
        try {
            const proc = globalThis.process;
            if (proc && typeof proc.cwd === "function") {
                // @ts-ignore node types not present
                const fs = await import("fs/promises");
                // @ts-ignore node types not present
                const path = await import("path");
                const base = artifactsDir ? path.resolve(proc.cwd(), artifactsDir, 'json-sequences') : path.join(proc.cwd(), "json-sequences");
                const entries = await fs.readdir(base).catch(() => []);
                const seqDirs = entries.filter((e) => !e.startsWith("."));
                // Merge directory names; these are the catalog directory identifiers (legacy behavior)
                plugins = Array.from(new Set([...(plugins || []), ...seqDirs]));
            }
        }
        catch { }
    }
    // Debug: expose discovered plugin directories for tests (optional)
    ;
    conductor._discoveredPlugins = plugins;
    const isTestEnv = typeof import.meta !== "undefined" && !!import.meta.vitest;
    const forcedBrowser = typeof globalThis !== 'undefined' && globalThis.__RENDERX_FORCE_BROWSER === true;
    const isBrowser = (forcedBrowser || !isTestEnv) &&
        typeof globalThis !== "undefined" &&
        typeof globalThis.window !== "undefined" &&
        typeof globalThis.document !== "undefined" &&
        typeof globalThis.fetch === "function";
    const seen = new Set();
    const mountFrom = async (seq, handlersPath) => {
        try {
            if (seen.has(seq.id)) {
                conductor.logger?.warn?.(`Sequence ${seq.id} already mounted; skipping`);
                return;
            }
            // Normalize handlers import spec to support URLs, bare specifiers, and paths
            const spec = normalizeHandlersImportSpec(isBrowser, handlersPath);
            let mod;
            mod = await import(/* @vite-ignore */ spec);
            const handlers = mod?.handlers || mod?.default?.handlers;
            if (!handlers) {
                conductor.logger?.warn?.(`No handlers export found at ${handlersPath} for ${seq.id}`);
            }
            await conductor?.mount?.(seq, handlers, seq.pluginId);
            seen.add(seq.id);
        }
        catch (e) {
            conductor.logger?.warn?.(`Failed to mount sequence ${seq?.id} from ${handlersPath}: ${e}`);
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
            let entries = [];
            if (isBrowser) {
                try {
                    const idxRes = await fetch(`/json-sequences/${dir}/index.json`);
                    if (idxRes.ok) {
                        const idxJson = await idxRes.json();
                        entries = idxJson?.sequences || [];
                    }
                }
                catch { }
            }
            if (!entries.length) {
                if (!isBrowser && artifactsDir) {
                    try {
                        // @ts-ignore
                        const fs = await import('fs/promises');
                        // @ts-ignore
                        const path = await import('path');
                        const procAny2 = globalThis.process;
                        const cwd = procAny2 && typeof procAny2.cwd === 'function' ? procAny2.cwd() : '';
                        const idxPath = path.join(cwd, artifactsDir, 'json-sequences', dir, 'index.json');
                        const raw = await fs.readFile(idxPath, 'utf-8').catch(() => null);
                        if (raw) {
                            const idxJson = JSON.parse(raw || '{}');
                            entries = idxJson?.sequences || [];
                        }
                    }
                    catch { }
                }
                // Only attempt raw project import if not using external artifacts
                if (!entries.length && !artifactsDir) {
                    const idxMod = await import(
                    /* @vite-ignore */ `../json-sequences/${dir}/index.json?raw`);
                    const idxText = idxMod?.default || idxMod;
                    const idxJson = JSON.parse(idxText || "{}");
                    entries = idxJson?.sequences || [];
                }
            }
            // 2) For each entry, load sequence JSON (browser first, then Node/test fallback) in parallel
            const tasks = entries.map(async (ent) => {
                let seqJson = null;
                if (isBrowser) {
                    try {
                        const filePath = ent.file.startsWith("/")
                            ? ent.file
                            : `/json-sequences/${dir}/${ent.file}`;
                        const seqRes = await fetch(filePath);
                        if (seqRes.ok)
                            seqJson = await seqRes.json();
                    }
                    catch { }
                }
                if (!seqJson && !isBrowser && artifactsDir) {
                    try {
                        // @ts-ignore
                        const fs = await import('fs/promises');
                        // @ts-ignore
                        const path = await import('path');
                        const procAny3 = globalThis.process;
                        const cwd = procAny3 && typeof procAny3.cwd === 'function' ? procAny3.cwd() : '';
                        const seqPath = path.join(cwd, artifactsDir, 'json-sequences', dir, ent.file);
                        const raw = await fs.readFile(seqPath, 'utf-8').catch(() => null);
                        if (raw)
                            seqJson = JSON.parse(raw || '{}');
                    }
                    catch { }
                }
                if (!seqJson && !artifactsDir) {
                    const seqMod = await import(
                    /* @vite-ignore */ `../json-sequences/${dir}/${ent.file}?raw`);
                    const seqText = seqMod?.default || seqMod;
                    seqJson = JSON.parse(seqText || "{}");
                }
                await mountFrom(seqJson, ent.handlersPath);
            });
            await Promise.all(tasks);
        }
        catch (e) {
            conductor.logger?.warn?.(`Failed to load catalog for ${plugin}: ${e}`);
        }
    }
}
export async function registerAllSequences(conductor) {
    // Mount sequences from JSON catalogs first (artifact or local mode)
    await loadJsonSequenceCatalogs(conductor);
    // Discover runtime registration modules via plugin manifest (ui + optional runtime section)
    let manifest = null;
    try {
        // Browser first
        const isBrowser = typeof window !== 'undefined' && typeof globalThis.fetch === 'function';
        if (isBrowser) {
            const res = await fetch('/plugins/plugin-manifest.json');
            if (res.ok)
                manifest = await res.json();
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
                    const procAny4 = globalThis.process;
                    const cwd = procAny4 && typeof procAny4.cwd === 'function' ? procAny4.cwd() : '';
                    const p = path.join(cwd, artifactsDir2, 'plugins', 'plugin-manifest.json');
                    const raw = await fs.readFile(p, 'utf-8').catch(() => null);
                    if (raw)
                        manifest = JSON.parse(raw || '{}');
                }
            }
            catch { }
            // Only fallback when no external artifacts dir was used
            if (!manifest) {
                try {
                    // @ts-ignore - raw JSON import handled by Vite
                    const mod = await import(/* @vite-ignore */ '../public/plugins/plugin-manifest.json?raw'); // path relative to src/
                    const txt = mod?.default || mod || '{}';
                    manifest = JSON.parse(txt);
                }
                catch { }
            }
        }
    }
    catch {
        manifest = { plugins: [] };
    }
    const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];
    for (const p of plugins) {
        // optional runtime registration: { runtime: { module, export } }
        const runtime = p.runtime;
        if (!runtime || !runtime.module || !runtime.export)
            continue;
        try {
            const loader = runtimePackageLoaders[runtime.module];
            const mod = loader ? await loader() : await import(/* @vite-ignore */ runtime.module);
            const reg = mod[runtime.export];
            if (typeof reg === 'function') {
                await reg(conductor);
                console.log('🔌 Registered plugin runtime:', p.id);
            }
        }
        catch (e) {
            console.warn('⚠️ Failed runtime register for', p.id, e);
        }
    }
    try {
        const ids = conductor.getMountedPluginIds?.() || [];
        console.log('🔎 Mounted plugin IDs after registration:', ids);
    }
    catch { }
}
export function useConductor() {
    const { conductor } = window.renderxCommunicationSystem || {};
    return conductor;
}
//# sourceMappingURL=conductor.js.map