import React, { useEffect, useState, lazy, Suspense } from "react";

interface PanelSlotProps {
  slot: string;
  fallback: React.ReactNode;
  pluginProps?: Record<string, any>;
}

const PanelSlot: React.FC<PanelSlotProps> = ({
  slot,
  fallback,
  pluginProps,
}) => {
  const [PluginComponent, setPluginComponent] = useState<any>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const dev =
        (typeof import.meta !== "undefined" &&
          (import.meta as any).env?.DEV) === true;
      if (!dev) {
        if (!cancelled) setAttempted(true);
        return;
      }
      try {
        // Fetch manifest to locate the plugin UI for this slot
        const res = await fetch("/plugins/manifest.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const manifest = await res.json();
        const entry = (manifest?.plugins || []).find(
          (p: any) => p.ui?.slot === slot
        );
        if (!entry) {
          if (!cancelled) setAttempted(true);
          return;
        }

        const exportName = entry.ui?.export || "default";
        const modUrl = `/plugins/${entry.path}index.js`;

        const LazyComp = lazy(async () => {
          const mod: any = await import(/* @vite-ignore */ modUrl as any);
          const exp =
            exportName === "default" ? mod?.default : mod?.[exportName];
          return { default: exp };
        });
        if (!cancelled) setPluginComponent(() => LazyComp);
      } catch {}
      if (!cancelled) setAttempted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [slot]);

  // While import has not finished, avoid mounting fallback to prevent duplicate flows
  if (!attempted) {
    return (
      <div className="panel-slot-loading" data-slot={slot}>
        <div className="loading-state">
          <h4>Loading {slot} UI...</h4>
        </div>
      </div>
    );
  }

  if (PluginComponent) {
    return <PluginComponent {...(pluginProps || {})} />;
  }

  return <>{fallback}</>;
};

export default PanelSlot;
