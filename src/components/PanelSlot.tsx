import React from "react";

// Simple manifest-driven PanelSlot that lazy-loads a named export from plugin modules
// Manifest format: { plugins: [ { id, ui: { slot, module, export } } ] }
// module is a relative module path under /plugins/ or elsewhere (built-in to this repo)

type Manifest = {
  plugins: Array<{
    id: string;
    ui?: { slot: string; module: string; export: string };
  }>;
};

const manifestPromise: Promise<Manifest> = (async () => {
  try {
    const isBrowser = typeof window !== "undefined" && typeof (globalThis as any).fetch === "function";
    if (isBrowser) {
      const res = await fetch("/plugins/plugin-manifest.json");
      if (res.ok) return (await res.json()) as Manifest;
    }
    // Node/tests fallback: import raw JSON from public
    const mod = await import(/* @vite-ignore */ "../../public/plugins/plugin-manifest.json?raw");
    const text: string = (mod as any)?.default || (mod as any) || "{\"plugins\":[]}";
    return JSON.parse(text);
  } catch {
    return { plugins: [] } as Manifest;
  }
})();

export function PanelSlot({ slot }: { slot: string }) {
  const [Comp, setComp] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const manifest = await manifestPromise;
        const entry = manifest.plugins.find(p => p.ui?.slot === slot);
        if (!entry || !entry.ui) throw new Error(`No plugin UI found for slot ${slot}`);
        const mod = await import(/* @vite-ignore */ entry.ui.module);
        const Exported = mod[entry.ui.export] as React.ComponentType | undefined;
        if (!Exported) throw new Error(`Export ${entry.ui.export} not found in ${entry.ui.module}`);
        if (alive) setComp(() => Exported);
      } catch (err) {
        console.error(err);
        if (alive) setComp(() => () => <div style={{ padding: 12 }}>Failed to load panel: {String(err)}</div>);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slot]);

  if (!Comp) return null;
  return <Comp />;
}

