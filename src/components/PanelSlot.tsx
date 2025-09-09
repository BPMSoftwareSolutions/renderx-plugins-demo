import React from "react";

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
  try {
    const isBrowser =
      typeof window !== "undefined" &&
      typeof (globalThis as any).fetch === "function";
    if (isBrowser) {
      const res = await fetch("/plugins/plugin-manifest.json");
      if (res.ok) return (await res.json()) as Manifest;
    }
    // External artifacts directory (env) before bundled raw import
    try {
      const envMod = await import(/* @vite-ignore */ '../env');
      const artifactsDir = envMod.getArtifactsDir?.();
      if (artifactsDir) {
        // @ts-ignore
        const fs = await import('fs/promises');
        // @ts-ignore
        const path = await import('path');
        const p = path.join(process.cwd(), artifactsDir, 'plugins', 'plugin-manifest.json');
        const raw = await fs.readFile(p, 'utf-8').catch(()=>null as any);
        if (raw) return JSON.parse(raw || '{"plugins":[]}');
      }
    } catch {}
    // Only fallback to bundled raw import if no external artifacts dir
    try {
      const envMod2 = await import(/* @vite-ignore */ '../env');
      const dir2 = envMod2.getArtifactsDir?.();
      if (dir2) return { plugins: [] }; // external dir was set but file missing → treat as empty
    } catch {}
    try {
      const mod = await import(
        /* @vite-ignore */ "../../public/plugins/plugin-manifest.json?raw"
      );
      const text: string =
        (mod as any)?.default || (mod as any) || '{"plugins":[]}';
      return JSON.parse(text);
    } catch {
      return { plugins: [] } as Manifest;
    }
  } catch {
    return { plugins: [] } as Manifest;
  }
})();

// Test-only hook to override manifest during unit tests
export function __setPanelSlotManifestForTests(m: Manifest) {
  manifestPromiseRef = Promise.resolve(m);
}

function isUrl(spec: string) {
  return spec.startsWith("http://") || spec.startsWith("https://");
}

function isBareSpecifier(spec: string): boolean {
  if (!spec) return false;
  if (isUrl(spec)) return false;
  return !spec.startsWith('/') && !spec.startsWith('.');
}

function resolveModuleSpecifier(spec: string): string {
  // Browser: use import.meta.resolve to turn package specifiers (and other specs)
  // into fully-qualified URLs that the browser can import dynamically.
  try {
    const resolver: any = (import.meta as any).resolve;
    if (typeof resolver === 'function') {
      return resolver(spec);
    }
  } catch {}
  // Fallback: return as-is (works for URLs; bare specifiers may fail in native browser import)
  return spec;
}

// Statically known package loaders (ensures Vite can analyze and bundle)
const packageLoaders: Record<string, () => Promise<any>> = {
  '@renderx/plugin-header': () => import('@renderx/plugin-header'),
};


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
        const requested = entry.ui.module;
        const loader = packageLoaders[requested];
        const mod = loader
          ? await loader()
          : await import(/* @vite-ignore */ resolveModuleSpecifier(requested));
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
