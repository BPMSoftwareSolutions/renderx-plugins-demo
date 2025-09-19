import React from "react";
import { isBareSpecifier } from "../../infrastructure/handlers/handlersPath";
import { loadPluginModule } from "virtual:plugin-module-loaders";

// Simple manifest-driven PanelSlot that lazy-loads a named export from plugin modules
// Manifest format: { plugins: [ { id, ui: { slot, module, export } } ] }
// ui.module may be one of:
//   - path string (e.g., "/plugins/library/index.ts")
//   - package specifier (e.g., "@org/canvas-plugin")
//   - URL (e.g., "https://cdn.example.com/plugin.mjs")

type Manifest = {
  plugins: Array<{
    id: string;
    ui?: { slot: string; module: string; export: string };
  }>;
};

let manifestPromiseRef: Promise<Manifest> = (async () => {
  const { getAggregatedPluginManifest } = await import(
    "../../core/manifests/pluginManifest"
  );
  return (await getAggregatedPluginManifest()) as any;
})();

// Test-only hook to override manifest during unit tests
export async function __setPanelSlotManifestForTests(m: Manifest) {
  const { __setPluginManifestForTests } = await import(
    "../../core/manifests/pluginManifest"
  );
  __setPluginManifestForTests(m as any);
  manifestPromiseRef = Promise.resolve(m);
}

function resolveModuleSpecifier(spec: string): string {
  // Prefer modern resolver when available
  try {
    const resolver: any = (import.meta as any).resolve;
    if (typeof resolver === "function") {
      const r = resolver(spec);
      if (typeof r === "string" && r) return r;
    }
  } catch {}
  // Dev fallback: Vite's /@id proxy enables native dynamic import() in browser for bare specs
  try {
    const env: any = (import.meta as any).env;
    if (env && env.DEV && isBareSpecifier(spec)) {
      return "/@id/" + spec;
    }
  } catch {}
  // Last resort
  return spec;
}

export function PanelSlot({ slot }: { slot: string }) {
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await manifestPromiseRef;
        const entry = manifest.plugins.find((p) => p.ui?.slot === slot);
        if (!entry || !entry.ui)
          throw new Error(`No plugin UI found for slot ${slot}`);
        let requested = entry.ui.module;
        // Back-compat: some tests inject a manifest with a legacy relative path that was
        // authored relative to the old file location (src/components/PanelSlot.tsx).
        // After moving implementation to src/ui/shared/, those '../../src/vendor/*' paths
        // resolve incorrectly (becoming src/src/vendor/...). Adjust one directory deeper.
        if (requested.startsWith("../../src/vendor/")) {
          const corrected = requested.replace(
            "../../src/vendor/",
            "../../../src/vendor/"
          );
          if (corrected !== requested) {
            requested = corrected;
          }
        }

        // Test-only injection to simulate resolution failure for library UI module
        const isTestEnv =
          typeof import.meta !== "undefined" && !!(import.meta as any).vitest;
        const forceLibraryResolutionError =
          isTestEnv &&
          typeof globalThis !== "undefined" &&
          (globalThis as any).__RENDERX_FORCE_LIBRARY_RESOLUTION_ERROR === true;
        if (
          forceLibraryResolutionError &&
          requested === "@renderx-plugins/library"
        ) {
          const err = new TypeError(
            "Failed to resolve module specifier '@renderx-plugins/library'"
          );
          // Also mirror the runtime registration warning to reproduce dev-console symptom
          console.warn("⚠️ Failed runtime register for", "LibraryPlugin", err);
          throw err;
        }

        const specifier = resolveModuleSpecifier(requested);
        if (specifier.startsWith("https:")) {
          throw new Error(
            `Unsupported module specifier: ${specifier}. Remote https: imports are not allowed in Node.js/Esm environments.`
          );
        }
        let mod: any;
        if (typeof window === "undefined") {
          mod = await import(/* @vite-ignore */ specifier);
        } else if (isBareSpecifier(requested)) {
          mod = await loadPluginModule(requested);
        } else {
          // For relative/absolute paths in jsdom tests, import relative to this module
          mod = await import(/* @vite-ignore */ specifier);
        }
        const Exported = mod[entry.ui.export] as
          | React.ComponentType
          | undefined;
        if (!Exported)
          throw new Error(
            `Export ${entry.ui.export} not found in ${entry.ui.module}`
          );
        if (alive) setComp(() => Exported);
      } catch (err) {
        console.error(err);
        // In non-browser test environments, jsdom teardown can happen before this catch.
        // Guard setState to avoid post-teardown updates that would touch `window`.
        const canUpdate = alive && typeof window !== "undefined";
        if (canUpdate)
          setComp(() => () => (
            <div style={{ padding: 12 }}>
              Failed to load panel: {String(err)}
            </div>
          ));
      }
    })();
    return () => {
      alive = false;
    };
  }, [slot]);

  if (!Comp) return null;
  return <Comp />;
}
