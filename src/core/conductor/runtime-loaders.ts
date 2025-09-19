// Runtime loaders & JSON sequence catalog mounting (migrated from src/conductor.ts)
// Type declarations for plugin packages may be absent; dynamic imports are intentionally untyped.
import {
  isBareSpecifier,
  normalizeHandlersImportSpec,
} from "../../infrastructure/handlers/handlersPath";
import { resolveModuleSpecifier } from "./conductor";

// Statically known runtime package loaders to ensure Vite can analyze and bundle
export const runtimePackageLoaders: Record<string, () => Promise<any>> = {
  // @ts-ignore missing d.ts (external plugin package)
  "@renderx-plugins/header": () => import("@renderx-plugins/header"),
  // @ts-ignore missing d.ts
  "@renderx-plugins/library": () => import("@renderx-plugins/library"),
  // @ts-ignore missing d.ts
  "@renderx-plugins/library-component": () =>
    import("@renderx-plugins/library-component"),
  // @ts-ignore missing d.ts
  "@renderx-plugins/canvas": () => import("@renderx-plugins/canvas"),
  // @ts-ignore missing d.ts
  "@renderx-plugins/canvas-component": () =>
    import("@renderx-plugins/canvas-component"),
  // @ts-ignore missing d.ts
  "@renderx-plugins/control-panel": () =>
    import("@renderx-plugins/control-panel"),
};

export type ConductorClient = any; // re-declared for local file cohesion

// Loads and mounts sequences from per-plugin JSON catalogs.
export async function loadJsonSequenceCatalogs(
  conductor: ConductorClient,
  pluginIds?: string[]
) {
  console.log(
    "🎼 loadJsonSequenceCatalogs: Starting JSON sequence catalog loading..."
  );
  let artifactsDir: string | null = null;
  try {
    const envMod = await import(/* @vite-ignore */ "../environment/env");
    artifactsDir = (envMod as any).getArtifactsDir?.() || null;
  } catch {}
  let plugins: string[] = pluginIds || [];
  if (!plugins.length) {
    let manifest: any = null;
    let externalOnly = false;
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
        if (artifactsDir) {
          externalOnly = true;
          try {
            const fs = await import("fs/promises");
            const path = await import("path");
            const procAny: any = (globalThis as any).process;
            const cwd =
              procAny && typeof procAny.cwd === "function" ? procAny.cwd() : "";
            const p = path.join(
              cwd,
              artifactsDir,
              "plugins",
              "plugin-manifest.json"
            );
            const raw = await fs.readFile(p, "utf-8").catch(() => null as any);
            if (raw) manifest = JSON.parse(raw || "{}");
          } catch {}
        }
        if (!externalOnly) {
          try {
            const env = await import(/* @vite-ignore */ "../environment/env");
            if ((env as any).allowFallbacks?.()) {
              // @ts-ignore raw JSON import for test fallback
              const mod = await import(
                /* @vite-ignore */ "../../../public/plugins/plugin-manifest.json?raw"
              );
              const txt: string = (mod as any)?.default || (mod as any) || "{}";
              manifest = JSON.parse(txt);
            }
          } catch {}
        }
      }
    } catch {}
    if (manifest && Array.isArray(manifest.plugins)) {
      plugins = Array.from(
        new Set(
          manifest.plugins
            .map((p: any) => p?.id)
            .filter((id: any) => typeof id === "string" && id.length)
        )
      );
      try {
        const catalogDirs = new Set<string>();
        for (const p of manifest.plugins) {
          const modPath = p?.ui?.module;
          if (typeof modPath === "string") {
            const m = modPath.match(/^\/plugins\/([^\/]+)\//);
            if (m) catalogDirs.add(m[1]);
          }
        }
        // Do not include library-component JSON catalogs; runtime package owns these
        catalogDirs.add("canvas-component");
        if (catalogDirs.size) {
          (conductor as any)._sequenceCatalogDirsFromManifest =
            Array.from(catalogDirs);
          plugins = Array.from(
            new Set([...(plugins || []), ...Array.from(catalogDirs)])
          );
        }
      } catch {}
    }
    try {
      const proc: any = (globalThis as any).process;
      if (proc && typeof proc.cwd === "function") {
        const fs = await import("fs/promises");
        const path = await import("path");
        const base = artifactsDir
          ? path.resolve(proc.cwd(), artifactsDir, "json-sequences")
          : path.join(proc.cwd(), "json-sequences");
        const entries = await fs.readdir(base).catch(() => [] as string[]);
        const seqDirs = entries.filter((e: string) => !e.startsWith("."));
        plugins = Array.from(new Set([...(plugins || []), ...seqDirs]));
      }
    } catch {}
  }
  (conductor as any)._discoveredPlugins = plugins;
  const isTestEnv =
    typeof import.meta !== "undefined" && !!(import.meta as any).vitest;
  const forcedBrowser =
    typeof globalThis !== "undefined" &&
    (globalThis as any).__RENDERX_FORCE_BROWSER === true;
  const isBrowser =
    (forcedBrowser || !isTestEnv) &&
    typeof globalThis !== "undefined" &&
    typeof (globalThis as any).window !== "undefined" &&
    typeof (globalThis as any).document !== "undefined" &&
    typeof (globalThis as any).fetch === "function";

  const DEBUG =
    typeof (globalThis as any).__RENDERX_DEBUG_RUNTIME_LOADERS === "boolean"
      ? (globalThis as any).__RENDERX_DEBUG_RUNTIME_LOADERS
      : false;

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
  const runtimeMounted: Set<string> =
    (conductor as any)._runtimeMountedSeqIds instanceof Set
      ? (conductor as any)._runtimeMountedSeqIds
      : new Set<string>(
          Array.isArray((conductor as any)._runtimeMountedSeqIds)
            ? (conductor as any)._runtimeMountedSeqIds
            : []
        );

  // Seed runtimeMounted from any sequences the conductor already mounted
  try {
    const pre = Array.isArray((conductor as any).mounted)
      ? (conductor as any).mounted
      : [];
    for (const m of pre as any[]) {
      const id = (m as any)?.seq?.id;
      if (typeof id === "string" && id) runtimeMounted.add(id);
    }
    (conductor as any)._runtimeMountedSeqIds = runtimeMounted;
  } catch {}

  const mountFrom = async (seq: SequenceJson, handlersPath: string) => {
    try {
      if (DEBUG)
        console.log(
          `🎼 loadJsonSequenceCatalogs: Attempting to mount sequence "${seq.name}" (${seq.id}) from ${handlersPath}`
        );
      if (seen.has(seq.id) || runtimeMounted.has(seq.id)) {
        console.log(
          `🎼 loadJsonSequenceCatalogs: Sequence ${seq.id} already mounted; skipping`
        );
        (conductor as any).logger?.warn?.(
          `Sequence ${seq.id} already mounted; skipping`
        );
        return;
      }
      let spec = normalizeHandlersImportSpec(isBrowser, handlersPath);
      if (isBrowser && isBareSpecifier(handlersPath)) {
        try {
          spec = resolveModuleSpecifier(handlersPath);
          if (DEBUG)
            console.log(
              `🎼 loadJsonSequenceCatalogs: Resolved module specifier: ${handlersPath} -> ${spec}`
            );
        } catch (e) {
          console.error(
            `🎼 loadJsonSequenceCatalogs: Failed to resolve module specifier ${handlersPath}:`,
            e
          );
        }
      }
      if (DEBUG)
        console.log(
          `🎼 loadJsonSequenceCatalogs: Importing handlers from: ${spec}`
        );
      let mod: any = await import(/* @vite-ignore */ spec as any);
      if (DEBUG)
        console.log(
          `🎼 loadJsonSequenceCatalogs: Imported module:`,
          Object.keys(mod || {})
        );
      const handlers = (mod as any)?.handlers || mod?.default?.handlers;
      if (!handlers) {
        console.error(
          `🎼 loadJsonSequenceCatalogs: No handlers export found at ${handlersPath} for ${seq.id}`
        );
        (conductor as any).logger?.warn?.(
          `No handlers export found at ${handlersPath} for ${seq.id}`
        );
      } else {
        if (DEBUG)
          console.log(
            `🎼 loadJsonSequenceCatalogs: Found handlers:`,
            Object.keys(handlers || {})
          );
      }
      if (DEBUG)
        console.log(
          `🎼 loadJsonSequenceCatalogs: Calling conductor.mount for ${seq.id}`
        );
      await (conductor as any)?.mount?.(seq, handlers, seq.pluginId);
      if (DEBUG)
        console.log(
          `🎼 loadJsonSequenceCatalogs: Successfully mounted ${seq.id}`
        );
      seen.add(seq.id);
      try {
        runtimeMounted.add(seq.id);
        (conductor as any)._runtimeMountedSeqIds = runtimeMounted;
      } catch {}
    } catch (e) {
      console.error(
        `🎼 loadJsonSequenceCatalogs: Failed to mount sequence ${seq?.id} from ${handlersPath}:`,
        e
      );
      (conductor as any).logger?.warn?.(
        `Failed to mount sequence ${seq?.id} from ${handlersPath}: ${e}`
      );
    }
  };

  if (DEBUG)
    console.log("🎼 loadJsonSequenceCatalogs: Discovered plugins:", plugins);

  let completedIterations = 0;
  try {
    if (DEBUG)
      console.log(
        `🎼 loadJsonSequenceCatalogs: About to start main loop with ${plugins.length} plugins`
      );
    for (let i = 0; i < plugins.length; i++) {
      try {
        const plugin = plugins[i];
        console.log(
          `🎼 loadJsonSequenceCatalogs: Starting iteration ${i + 1}/${
            plugins.length
          } for plugin: "${plugin}"`
        );

        const dir =
          plugin === "CanvasComponentPlugin"
            ? "canvas-component"
            : plugin === "LibraryPlugin"
            ? "library"
            : plugin === "ControlPanelPlugin"
            ? "control-panel"
            : plugin === "HeaderThemePlugin" ||
              plugin === "HeaderControlsPlugin" ||
              plugin === "HeaderTitlePlugin"
            ? "header"
            : plugin;

        // In Vitest environment, skip JSON catalogs for library-component to avoid
        // duplicate mounts when runtime packages also register sequences.
        if (isTestEnv && dir === "library-component") {
          if (DEBUG)
            console.log(
              `🎼 loadJsonSequenceCatalogs: Skipping JSON catalog for "${dir}" in test env to avoid duplicates`
            );
          continue;
        }

        if (DEBUG)
          console.log(
            `🎼 loadJsonSequenceCatalogs: Processing plugin ${i + 1}/${
              plugins.length
            }: "${plugin}" -> directory "${dir}"`
          );

        try {
          let entries: CatalogEntry[] = [];
          if (isBrowser) {
            try {
              if (DEBUG)
                console.log(
                  `🎼 loadJsonSequenceCatalogs: Fetching /json-sequences/${dir}/index.json`
                );
              const idxRes = await fetch(`/json-sequences/${dir}/index.json`);
              if (idxRes.ok) {
                const idxJson = await idxRes.json();
                entries = idxJson?.sequences || [];
                console.log(
                  `🎼 loadJsonSequenceCatalogs: Found ${entries.length} entries for ${dir}:`,
                  entries
                );
              } else {
                console.log(
                  `🎼 loadJsonSequenceCatalogs: Failed to fetch index.json for ${dir}, status:`,
                  idxRes.status
                );
              }
            } catch (e) {
              console.error(
                `🎼 loadJsonSequenceCatalogs: Error fetching index.json for ${dir}:`,
                e
              );
            }
          }
          if (!entries.length) {
            if (!isBrowser && artifactsDir) {
              try {
                const fs = await import("fs/promises");
                const path = await import("path");
                const procAny2: any = (globalThis as any).process;
                const cwd =
                  procAny2 && typeof procAny2.cwd === "function"
                    ? procAny2.cwd()
                    : "";
                const idxPath = path.join(
                  cwd,
                  artifactsDir,
                  "json-sequences",
                  dir,
                  "index.json"
                );
                const raw = await fs
                  .readFile(idxPath, "utf-8")
                  .catch(() => null as any);
                if (raw) {
                  const idxJson = JSON.parse(raw || "{}");
                  entries = idxJson?.sequences || [];
                }
              } catch {}
            }
            if (!entries.length && !artifactsDir) {
              try {
                const env = await import(
                  /* @vite-ignore */ "../environment/env"
                );
                if ((env as any).allowFallbacks?.()) {
                  // @ts-ignore raw JSON import (tests only)
                  const idxMod = await import(
                    /* @vite-ignore */ `../../../json-sequences/${dir}/index.json?raw`
                  );
                  const idxText: string =
                    (idxMod as any)?.default || (idxMod as any);
                  const idxJson = JSON.parse(idxText || "{}");
                  entries = idxJson?.sequences || [];
                }
              } catch {}
            }
          }
          console.log(
            `🎼 loadJsonSequenceCatalogs: About to process ${entries.length} sequences for ${plugin}`
          );
          const tasks = entries.map(async (ent, index) => {
            try {
              console.log(
                `🎼 loadJsonSequenceCatalogs: Starting task ${index + 1}/${
                  entries.length
                } for ${plugin}: ${ent.file}`
              );
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
                  const fs = await import("fs/promises");
                  const path = await import("path");
                  const procAny3: any = (globalThis as any).process;
                  const cwd =
                    procAny3 && typeof procAny3.cwd === "function"
                      ? procAny3.cwd()
                      : "";
                  const seqPath = path.join(
                    cwd,
                    artifactsDir,
                    "json-sequences",
                    dir,
                    ent.file
                  );
                  const raw = await fs
                    .readFile(seqPath, "utf-8")
                    .catch(() => null as any);
                  if (raw) seqJson = JSON.parse(raw || "{}");
                } catch {}
              }
              if (!seqJson && !artifactsDir) {
                try {
                  const env = await import(
                    /* @vite-ignore */ "../environment/env"
                  );
                  if ((env as any).allowFallbacks?.()) {
                    // @ts-ignore raw JSON import (tests only)
                    const seqMod = await import(
                      /* @vite-ignore */ `../../../json-sequences/${dir}/${ent.file}?raw`
                    );
                    const seqText: string =
                      (seqMod as any)?.default || (seqMod as any);
                    seqJson = JSON.parse(seqText || "{}");
                  }
                } catch {}
              }
              await mountFrom(seqJson as SequenceJson, ent.handlersPath);
              console.log(
                `🎼 loadJsonSequenceCatalogs: Completed task ${index + 1}/${
                  entries.length
                } for ${plugin}: ${ent.file}`
              );
            } catch (e) {
              console.error(
                `🎼 loadJsonSequenceCatalogs: Failed to process sequence ${ent.file} for ${plugin}:`,
                e
              );
              console.log(
                `🎼 loadJsonSequenceCatalogs: Failed task ${index + 1}/${
                  entries.length
                } for ${plugin}: ${ent.file}`
              );
            }
          });
          if (DEBUG)
            console.log(
              `🎼 loadJsonSequenceCatalogs: About to await Promise.allSettled for ${tasks.length} tasks`
            );

          const results = await Promise.allSettled(tasks);

          if (DEBUG)
            console.log(
              `🎼 loadJsonSequenceCatalogs: Promise.allSettled completed for ${plugin}. Results:`,
              Array.isArray(results)
                ? results.map((r, i) => ({
                    index: i,
                    status: r.status,
                    reason: r.status === "rejected" ? r.reason : "fulfilled",
                  }))
                : "timeout"
            );
        } catch (e) {
          console.error(
            `🎼 loadJsonSequenceCatalogs: Failed to load catalog for ${plugin}:`,
            e
          );
          (conductor as any).logger?.warn?.(
            `Failed to load catalog for ${plugin}: ${e}`
          );
        }
        console.log(
          `🎼 loadJsonSequenceCatalogs: Completed processing plugin "${plugin}"`
        );
        console.log(
          `🎼 loadJsonSequenceCatalogs: About to continue to next plugin iteration...`
        );
        completedIterations++;
        console.log(
          `🎼 loadJsonSequenceCatalogs: Incremented completedIterations to ${completedIterations}`
        );
        console.log(
          `🎼 loadJsonSequenceCatalogs: Loop condition check: completedIterations=${completedIterations} < plugins.length=${
            plugins.length
          } = ${completedIterations < plugins.length}`
        );

        // Add explicit check for next iteration
        if (completedIterations < plugins.length) {
          console.log(
            `🎼 loadJsonSequenceCatalogs: Next plugin to process will be: "${plugins[completedIterations]}" (index ${completedIterations})`
          );
        } else {
          console.log(
            `🎼 loadJsonSequenceCatalogs: All plugins processed, loop will exit`
          );
        }
      } catch (e) {
        console.error(
          `🎼 loadJsonSequenceCatalogs: ERROR processing plugin "${plugins[i]}":`,
          e
        );
        console.error(`🎼 loadJsonSequenceCatalogs: Stack trace:`, e.stack);
        completedIterations++;
        console.log(
          `🎼 loadJsonSequenceCatalogs: Error handling - incremented completedIterations to ${completedIterations}`
        );
      }
    }
    console.log(
      `🎼 loadJsonSequenceCatalogs: Loop completed, processed ${completedIterations}/${plugins.length} plugins`
    );
    console.log(
      `🎼 loadJsonSequenceCatalogs: Final plugin list processed:`,
      plugins.slice(0, completedIterations)
    );
    console.log(
      `🎼 loadJsonSequenceCatalogs: Remaining plugins not processed:`,
      plugins.slice(completedIterations)
    );
    console.log(
      `🎼 loadJsonSequenceCatalogs: Finished processing all ${plugins.length} plugins`
    );
  } catch (e) {
    console.error(
      `🎼 loadJsonSequenceCatalogs: CRITICAL ERROR in main loop:`,
      e
    );
    throw e;
  }
}
