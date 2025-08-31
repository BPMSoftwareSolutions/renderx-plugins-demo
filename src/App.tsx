import React, { Suspense } from "react";
import { LayoutEngine } from "./layout/LayoutEngine";
import { isFlagEnabled } from "./feature-flags/flags";
import { SlotContainer } from "./layout/SlotContainer";
import "./layout/legacyLayout.css";

export default function App() {
  const useLayoutManifest = isFlagEnabled("ui.layout-manifest");

  if (useLayoutManifest) {
    return (
      <Suspense fallback={<div className="p-3">Loading Layout…</div>}>
        <LayoutEngine />
      </Suspense>
    );
  }

  // Legacy fallback layout
  return (
    <div className="legacy-grid">
      <div data-slot="library" className="slot-wrapper">
        <Suspense fallback={<div className="p-3">Loading Library…</div>}>
          <SlotContainer slot="library" />
        </Suspense>
      </div>
      <div data-slot="canvas" className="slot-wrapper">
        <Suspense fallback={<div className="p-3">Loading Canvas…</div>}>
          <SlotContainer slot="canvas" capabilities={{ droppable: true }} />
        </Suspense>
      </div>
      <div data-slot="controlPanel" className="slot-wrapper">
        <Suspense fallback={<div className="p-3">Loading Control Panel…</div>}>
          <SlotContainer slot="controlPanel" />
        </Suspense>
      </div>
    </div>
  );
}
