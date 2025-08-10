/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect } from "react";
import type { ElementLibraryProps } from "../types/AppTypes";
import LegacyElementLibrary from "./LegacyElementLibrary";
import { loadUiForSlot } from "../services/PluginUiLoader";

const ElementLibrary: React.FC<ElementLibraryProps> = () => {
  // Try to render plugin-provided UI first; fallback to built-in UI if unavailable
  const [PluginUIPanel, setPluginUIPanel] = useState<any>(null);
  const [pluginTried, setPluginTried] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Only attempt plugin UI in dev; production uses fallback UI
      const dev =
        (typeof import.meta !== "undefined" &&
          (import.meta as any).env?.DEV) === true;
      if (!dev) {
        if (!cancelled) setPluginTried(true);
        return;
      }
      try {
        const Comp = await loadUiForSlot("left");
        if (!cancelled && typeof Comp === "function")
          setPluginUIPanel(() => Comp);
      } catch {}
      if (!cancelled) setPluginTried(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // While plugin UI import has not finished, avoid mounting legacy to prevent double loads
  if (!pluginTried) {
    return (
      <div className="element-library">
        <div className="element-library-content">
          <div className="element-library-loading">
            <div className="loading-state">
              <h4>Loading Library UI...</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render plugin UI if present (keeps hook order stable)
  if (PluginUIPanel) {
    return <PluginUIPanel />;
  }

  // Fallback to legacy UI component
  return <LegacyElementLibrary />;
};

export default ElementLibrary;
