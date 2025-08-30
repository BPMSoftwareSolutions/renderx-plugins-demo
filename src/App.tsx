import React, { Suspense } from "react";
import { LayoutEngine } from "./layout/LayoutEngine";
import { isFlagEnabled } from "./feature-flags/flags";
import { SlotContainer } from "./layout/SlotContainer";

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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 360px",
        height: "100vh",
      }}
    >
      <div data-slot="library" style={{ position: "relative" }}>
        <Suspense fallback={<div className="p-3">Loading Library…</div>}>
          <SlotContainer slot="library" />
        </Suspense>
      </div>
      <div data-slot="canvas" style={{ position: "relative" }}>
        <Suspense fallback={<div className="p-3">Loading Canvas…</div>}>
          <SlotContainer slot="canvas" capabilities={{ droppable: true }} />
        </Suspense>
      </div>
      <div data-slot="controlPanel" style={{ position: "relative" }}>
        <Suspense fallback={<div className="p-3">Loading Control Panel…</div>}>
          <SlotContainer slot="controlPanel" />
        </Suspense>
      </div>
    </div>
  );
}
