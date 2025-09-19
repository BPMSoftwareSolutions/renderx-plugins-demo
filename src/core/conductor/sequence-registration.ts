// Sequence registration (migrated from src/conductor.ts)
import { resolveModuleSpecifier } from "./conductor";
import { getAggregatedPluginManifest } from "../manifests/pluginManifest";
import { loadPluginModule } from "virtual:plugin-module-loaders";
import { isBareSpecifier } from "../../infrastructure/handlers/handlersPath";

export type ConductorClient = any; // local alias

export async function registerAllSequences(conductor: ConductorClient) {
  // 1) Discover runtime registration modules via aggregated plugin manifest
  const manifest = await getAggregatedPluginManifest();
  const plugins = Array.isArray((manifest as any).plugins)
    ? (manifest as any).plugins
    : [];

  // 2) Plugin-first runtime registration (no special-case prioritization)
  for (const p of plugins) {
    const runtime = p?.runtime;
    if (!runtime?.module || !runtime?.export) continue;
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
      // Use Vite virtual module loaders in browser builds for bare specifiers; otherwise import relative
      let mod: any;
      if (typeof window === "undefined") {
        mod = await import(
          /* @vite-ignore */ resolveModuleSpecifier(runtime.module)
        );
      } else if (isBareSpecifier(runtime.module)) {
        mod = await loadPluginModule(runtime.module);
      } else {
        mod = await import(
          /* @vite-ignore */ resolveModuleSpecifier(runtime.module)
        );
      }
      const reg =
        (mod as any)?.[runtime.export] ||
        (mod as any)?.default?.[runtime.export];
      if (typeof reg === "function") {
        await reg(conductor);
      }
      try {
        console.log("🔌 Registered plugin runtime:", p.id);
      } catch {}
    } catch (e) {
      console.warn("⚠️ Failed runtime register for", p?.id, e);
    }
  }

  // 4) If nothing mounted, optionally fall back to JSON catalogs (dev/test safety net, flag-gated)
  try {
    let ids: string[] = (conductor as any).getMountedPluginIds?.() || [];
    if (!ids.length) {
      try {
        const env: any = (import.meta as any).env || {};
        const inDevOrTest = !!(
          (env && env.DEV) ||
          typeof (import.meta as any).vitest !== "undefined"
        );
        const disableFallback =
          typeof globalThis !== "undefined" &&
          (globalThis as any).__DISABLE_JSON_CATALOG_FALLBACK === true;
        // In dev/test, automatically load JSON catalogs if nothing mounted (unless explicitly disabled for tests)
        if (inDevOrTest && !disableFallback) {
          console.warn(
            "🟡 No plugins mounted via runtime register; loading JSON sequence catalogs (dev/test)"
          );
          const { loadJsonSequenceCatalogs } = await import(
            "./runtime-loaders"
          );
          await loadJsonSequenceCatalogs(conductor);
          ids = (conductor as any).getMountedPluginIds?.() || [];
        }
      } catch {}
    }
    console.log("🔎 Mounted plugin IDs after registration:", ids);
    for (const id of ids) {
      try {
        console.log("Plugin mounted successfully:", id);
      } catch {}
    }
  } catch {}
}
