// Sequence registration (migrated from src/conductor.ts)
import {
  runtimePackageLoaders,
  loadJsonSequenceCatalogs,
} from "./runtime-loaders";
import { resolveModuleSpecifier } from "./conductor";

export type ConductorClient = any; // local alias

export async function registerAllSequences(conductor: ConductorClient) {
  // Wrap conductor.mount to avoid duplicate sequence IDs from runtime registrations
  try {
    const seenIds: Set<string> = new Set(
      Array.isArray((conductor as any)._mountedSeqIds)
        ? (conductor as any)._mountedSeqIds
        : []
    );
    const originalMount = (conductor as any).mount?.bind(conductor);
    if (typeof originalMount === "function") {
      const seenPluginIds: Set<string> = new Set(
        Array.isArray((conductor as any)._mountedPluginIds)
          ? (conductor as any)._mountedPluginIds
          : []
      );
      if (typeof (conductor as any).getMountedPluginIds !== "function") {
        (conductor as any).getMountedPluginIds = () =>
          Array.from(seenPluginIds);
      }
      (conductor as any).mount = async (
        seq: any,
        handlers: any,
        pluginId: string
      ) => {
        const id = (seq as any)?.id;
        if (typeof id === "string" && id) {
          if (seenIds.has(id)) {
            (conductor as any).logger?.warn?.(
              `Sequence ${id} already mounted; skipping`
            );
            return;
          }
          seenIds.add(id);
          (conductor as any)._mountedSeqIds = Array.from(seenIds);
        }
        const result = await originalMount(seq, handlers, pluginId);
        try {
          if (typeof pluginId === "string" && pluginId) {
            const firstTime = !seenPluginIds.has(pluginId);
            seenPluginIds.add(pluginId);
            (conductor as any)._mountedPluginIds = Array.from(seenPluginIds);
            if (firstTime) {
              try {
                console.log("Plugin mounted successfully:", pluginId);
              } catch {}
            }
          }
        } catch {}
        return result;
      };
    }
  } catch {}

  // 1) Discover runtime registration modules via plugin manifest (ui + optional runtime section)
  let manifest: any = null;
  try {
    const isBrowser =
      typeof window !== "undefined" &&
      typeof (globalThis as any).fetch === "function";
    if (isBrowser) {
      try {
        const res = await fetch("/plugins/plugin-manifest.json");
        if (res.ok) manifest = await res.json();
      } catch {}
    }
    if (!manifest) {
      try {
        const envMod = await import(/* @vite-ignore */ "../environment/env");
        const artifactsDir2 = (envMod as any).getArtifactsDir?.();
        if (artifactsDir2) {
          try {
            const fs = await import("fs/promises");
            const path = await import("path");
            const procAny4: any = (globalThis as any).process;
            const cwd =
              procAny4 && typeof procAny4.cwd === "function"
                ? procAny4.cwd()
                : "";
            const p = path.join(
              cwd,
              artifactsDir2,
              "plugins",
              "plugin-manifest.json"
            );
            const raw = await fs.readFile(p, "utf-8").catch(() => null as any);
            if (raw) manifest = JSON.parse(raw || "{}");
          } catch {}
        }
      } catch {}
      if (!manifest) {
        try {
          const env = await import(/* @vite-ignore */ "../environment/env");
          if ((env as any).allowFallbacks?.()) {
            // @ts-ignore raw JSON import fallback (tests only)
            const mod = await import(
              /* @vite-ignore */ "../../../public/plugins/plugin-manifest.json?raw"
            );
            const txt: string = (mod as any)?.default || (mod as any) || "{}";
            manifest = JSON.parse(txt);
          }
        } catch {}
      }
    }
  } catch {
    manifest = { plugins: [] };
  }
  const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

  // 2) Register runtime modules (prioritize certain ids)
  const prioritized = plugins.slice().sort((a: any, b: any) => {
    const prio = (x: any) =>
      x?.id === "LibraryComponentPlugin" || x?.id === "CanvasComponentPlugin"
        ? 1
        : 0;
    return prio(b) - prio(a);
  });
  // Optional dev-time whitelist: set globalThis.__RENDERX_ONLY_PLUGINS to an array or CSV string
  let runtimeList = prioritized;
  try {
    let onlyRaw: any = (globalThis as any).__RENDERX_ONLY_PLUGINS;
    // Also support persistence via localStorage or ?only=... query param
    try {
      if (!onlyRaw && typeof window !== "undefined") {
        const fromLS = (window as any).localStorage?.getItem(
          "__RENDERX_ONLY_PLUGINS"
        );
        if (fromLS) {
          onlyRaw = fromLS;
        } else {
          const sp = new URLSearchParams(
            (window as any).location?.search || ""
          );
          const fromQS = sp.get("only");
          if (fromQS) onlyRaw = fromQS;
        }
      }
      if (typeof onlyRaw === "string") {
        const s = (onlyRaw as string).trim();
        if (s.startsWith("[")) {
          try {
            const arr = JSON.parse(s);
            if (Array.isArray(arr)) {
              onlyRaw = arr;
            }
          } catch {}
        }
      }
    } catch {}

    let only: string[] = [];
    if (Array.isArray(onlyRaw)) {
      only = onlyRaw.filter((s) => typeof s === "string" && s.length);
    } else if (typeof onlyRaw === "string") {
      only = onlyRaw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length);
    }
    if (only.length) {
      const before = prioritized.map((p: any) => p?.id);
      runtimeList = prioritized.filter((p: any) => only.includes(p?.id));
      console.log(
        "🎼 registerAllSequences: Applying ONLY-plugins whitelist to runtime registrations",
        { only, before, after: runtimeList.map((p: any) => p?.id) }
      );
    }
  } catch {}
  for (const p of runtimeList) {
    const runtime = p.runtime;
    if (!runtime || !runtime.module || !runtime.export) continue;
    try {
      const isTestEnv =
        typeof import.meta !== "undefined" && !!(import.meta as any).vitest;
      const forceLibraryResolutionError =
        isTestEnv &&
        typeof globalThis !== "undefined" &&
        (globalThis as any).__RENDERX_FORCE_LIBRARY_RESOLUTION_ERROR === true;
      if (
        forceLibraryResolutionError &&
        runtime.module === "@renderx-plugins/library"
      ) {
        throw new TypeError(
          "Failed to resolve module specifier '@renderx-plugins/library'"
        );
      }
      const loader = runtimePackageLoaders[runtime.module];
      const mod = loader
        ? await loader()
        : await import(
            /* @vite-ignore */ resolveModuleSpecifier(runtime.module)
          );
      console.log("🔌 Registered plugin runtime:", p.id);
      const reg =
        (mod as any)?.[runtime.export] ||
        (mod as any)?.default?.[runtime.export];
      if (typeof reg === "function") {
        console.log("🎯 Calling register function for:", p.id);
        await reg(conductor);
        console.log("✅ Register function completed for:", p.id);
      } else {
        console.warn(
          "⚠️ No register function found for:",
          p.id,
          "Available exports:",
          Object.keys(mod || {})
        );
      }
    } catch (e) {
      console.error("❌ Failed runtime register for", p.id, e);
      console.error(
        "❌ Stack trace:",
        (e as Error)?.stack || "No stack trace available"
      );
    }
  }

  // 3) Mount sequences from JSON catalogs
  await loadJsonSequenceCatalogs(conductor);

  // 3b) Removed: do not auto-mount library-component sequences in dev/prod.
  // Tests that need this behavior should explicitly mount sequences in their setup.

  // 4) Debug logs
  try {
    const idsA = (conductor as any).getMountedPluginIds?.() || [];
    const idsB = Array.isArray((conductor as any)._mountedPluginIds)
      ? (conductor as any)._mountedPluginIds
      : [];
    const ids = Array.from(new Set([...(idsA || []), ...(idsB || [])]));
    console.log("🔎 Mounted plugin IDs after registration:", ids);
    for (const id of ids) {
      try {
        console.log("Plugin mounted successfully:", id);
      } catch {}
    }
  } catch {}
}
