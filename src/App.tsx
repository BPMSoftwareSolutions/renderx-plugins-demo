import React, { Suspense } from "react";
import { PanelSlot } from "./components/PanelSlot";

export default function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 360px", height: "100vh" }}>
      <Suspense fallback={<div className="p-3">Loading Library…</div>}>
        <PanelSlot slot="library" />
      </Suspense>
      <Suspense fallback={<div className="p-3">Loading Canvas…</div>}>
        <PanelSlot slot="canvas" />
      </Suspense>
      <Suspense fallback={<div className="p-3">Loading Control Panel…</div>}>
        <PanelSlot slot="controlPanel" />
      </Suspense>
    </div>
  );
}

