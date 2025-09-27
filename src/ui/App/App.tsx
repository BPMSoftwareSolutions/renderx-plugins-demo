import * as React from "react";
import { LayoutEngine } from "../../domain/layout/LayoutEngine";
import { isFlagEnabled } from "@renderx-plugins/host-sdk";
import { SlotContainer } from "../../domain/layout/SlotContainer";
import { wireUiEvents } from "../events/wiring";
import uiEventDefs from "../../core/manifests/uiEvents.json";
import "../../domain/layout/legacyLayout.css";

export default function App() {
  React.useEffect(() => {
    const cleanup = wireUiEvents(uiEventDefs as any);
    return () => cleanup();
  }, []);

  const useLayoutManifest = isFlagEnabled("ui.layout-manifest");

  if (useLayoutManifest) {
    return (
      <React.Suspense fallback={<div className="p-3">Loading Layout…</div>}>
        <LayoutEngine />
      </React.Suspense>
    );
  }

  return (
    <div className="legacy-grid">
      <div data-slot="library" className="slot-wrapper">
        <React.Suspense fallback={<div className="p-3">Loading Library…</div>}>
          <SlotContainer slot="library" />
        </React.Suspense>
      </div>
      <div data-slot="canvas" className="slot-wrapper">
        <React.Suspense fallback={<div className="p-3">Loading Canvas…</div>}>
          <SlotContainer slot="canvas" capabilities={{ droppable: true }} />
        </React.Suspense>
      </div>
      <div data-slot="controlPanel" className="slot-wrapper">
        <React.Suspense fallback={<div className="p-3">Loading Control Panel…</div>}>
          <SlotContainer slot="controlPanel" />
        </React.Suspense>
      </div>
    </div>
  );
}
