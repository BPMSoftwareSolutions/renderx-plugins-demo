import React from "react";
import { isBareSpecifier } from "../handlersPath";

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
    // IMPORTANT: Only attempt to read from filesystem in non-browser environments
    const isNode = typeof window === 'undefined';
    if (!isNode) {
      // In browser/dev/e2e, always use the bundled manifest (fetch above) or raw import fallback below
    } else {
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
      // Only short-circuit to empty when an external dir is configured in Node but file is missing
      try {
        const envMod2 = await import(/* @vite-ignore */ '../env');
        const dir2 = envMod2.getArtifactsDir?.();
        if (dir2) return { plugins: [] }; // external dir was set but file missing → treat as empty
      } catch {}
    }
    // Bundled raw import fallback (works in Vite dev and preview)
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



function resolveModuleSpecifier(spec: string): string {
  // Prefer modern resolver when available
  try {
    const resolver: any = (import.meta as any).resolve;
    if (typeof resolver === 'function') {
      const r = resolver(spec);
      if (typeof r === 'string' && r) return r;
    }
  } catch {}
  // Dev fallback: Vite's /@id proxy enables native dynamic import() in browser for bare specs
  try {
    const env: any = (import.meta as any).env;
    if (env && env.DEV && isBareSpecifier(spec)) {
      return '/@id/' + spec;
    }
  } catch {}
  // Last resort
  return spec;
}

// Statically known package loaders (ensures Vite can analyze and bundle)
const packageLoaders: Record<string, () => Promise<any>> = {
  '@renderx-plugins/header': () => import('@renderx-plugins/header'),
  '@renderx-plugins/library': () => import('@renderx-plugins/library'),
  '@renderx-plugins/canvas': () => import('@renderx-plugins/canvas'),
  '@renderx-plugins/library-component': () => import('@renderx-plugins/library-component'),
  // Resolve Control Panel via bare package so it aligns with symphonies (both go through Vite alias → dist)
  '@renderx-plugins/control-panel': () => import('@renderx-plugins/control-panel'),
  // Pre-bundled first-party plugin paths (Vite will include these in build)
  '/plugins/control-panel/index.ts': () => import('../../plugins/control-panel/index'),
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

        // Test-only injection to simulate resolution failure for library UI module
        const isTestEnv = typeof import.meta !== 'undefined' && !!(import.meta as any).vitest;
        const forceLibraryResolutionError = isTestEnv && typeof globalThis !== 'undefined' && (globalThis as any).__RENDERX_FORCE_LIBRARY_RESOLUTION_ERROR === true;
        if (forceLibraryResolutionError && requested === '@renderx-plugins/library') {
          const err = new TypeError("Failed to resolve module specifier '@renderx-plugins/library'");
          // Also mirror the runtime registration warning to reproduce dev-console symptom
          console.warn('⚠️ Failed runtime register for', 'LibraryPlugin', err);
          throw err;
        }

        const loader = packageLoaders[requested];
          const specifier = resolveModuleSpecifier(requested);
          if (specifier.startsWith('https:')) {
            throw new Error(
              `Unsupported module specifier: ${specifier}. Remote https: imports are not allowed in Node.js/Esm environments.`
            );
          }
          const mod = loader
            ? await loader()
            : await import(/* @vite-ignore */ specifier);
        const Exported = mod[entry.ui.export] as
          | React.ComponentType
          | undefined;
        if (!Exported)
          throw new Error(
            `Export ${entry.ui.export} not found in ${entry.ui.module}`
          );
        if (alive) setComp(() => Exported);
      } catch (err) {
        // Attempt deterministic fallbacks for Control Panel in dev/preview/E2E
        try {
          const manifest = await manifestPromiseRef;
          const entry = manifest.plugins.find((p) => p.ui?.slot === slot);
          const requested = entry?.ui?.module;
          if (requested === '@renderx-plugins/control-panel') {
            // 1) Try vendor indirection (imports the package via a stable path)
            try {
              const vend: any = await import(/* @vite-ignore */ '../vendor/vendor-control-panel');
              const Exported = vend?.[entry!.ui!.export] as React.ComponentType | undefined;
              if (Exported) {
                if (alive) setComp(() => Exported);
                return;
              }
            } catch {}
            // 2) Try local plugin source (useful when working from the monorepo)
            try {
              const plug: any = await import(/* @vite-ignore */ '../../plugins/control-panel/index');
              const Exported = plug?.[entry!.ui!.export] as React.ComponentType | undefined;
              if (Exported) {
                if (alive) setComp(() => Exported);
                return;
              }
            } catch {}
          }
        } catch {}
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

  // For the control panel slot, wrap to set global mount markers and
  // nudge the UI with any pending selection buffered before observer registration.
  if (slot === 'controlPanel') {
    const HostCPWrapper: React.FC<{ Comp: React.ComponentType }> = ({ Comp }) => {
      React.useEffect(() => {
        try {
          const g: any = (window as any);
          g.__RENDERX_CP_UI_MOUNTED__ = true;
          const ensureHeaderBadge = (sel: any) => {
            try {
              const header = document.querySelector('.control-panel .control-panel-header');
              if (!header) return;
              const infoSel = header.querySelector('.element-info');
              if (infoSel) return; // UI already rendered it
              const div = document.createElement('div');
              div.className = 'element-info';
              const typeSpan = document.createElement('span');
              typeSpan.className = 'element-type';
              typeSpan.textContent = String(sel?.header?.type || 'component');
              const idSpan = document.createElement('span');
              idSpan.className = 'element-id';
              idSpan.textContent = '#' + String(sel?.header?.id || '');
              div.appendChild(typeSpan);
              div.appendChild(idSpan);
              header.appendChild(div);
            } catch {}
          };
          const pending = g.__RENDERX_CP_STORE__?.pendingSelectionModel;
          if (pending) {
            // Nudge the UI after it has had a chance to register subscriptions
            const publish = () => {
              try {
                const sel = g.__RENDERX_CP_STORE__?.pendingSelectionModel || pending;
                ensureHeaderBadge(sel);
                g.RenderX?.EventRouter?.publish?.(
                  'control.panel.ui.render.requested',
                  { selectedElement: sel },
                  g.RenderX?.Conductor
                );
              } catch {}
            };
            const schedule = (ms: number) => setTimeout(publish, ms);
            schedule(100);
            schedule(400);
            schedule(800);
            schedule(1200);
          }
        } catch {}
      }, []);
      return <Comp />;
    };
    return <HostCPWrapper Comp={Comp} />;
  }

  return <Comp />;
}
