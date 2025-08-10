import React, { useEffect, useState } from "react";
import { loadUiForSlot } from "../services/PluginUiLoader";

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
      // Only attempt plugin UI in dev; production uses fallback UI
      const dev =
        (typeof import.meta !== "undefined" &&
          (import.meta as any).env?.DEV) === true;
      if (!dev) {
        if (!cancelled) setAttempted(true);
        return;
      }
      try {
        const Comp = await loadUiForSlot(slot);
        if (!cancelled && typeof Comp === "function")
          setPluginComponent(() => Comp);
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
