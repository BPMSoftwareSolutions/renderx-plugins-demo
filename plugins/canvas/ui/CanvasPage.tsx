import React from "react";
import { useConductor } from "../../../src/conductor";
import { onDropForTest } from "./CanvasDrop";

export function CanvasPage() {
  const conductor = useConductor();

  const onDrop = (e: React.DragEvent) => {
    onDropForTest(e, conductor);
  };

  return (
    <div
      className="relative h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      style={{ position: "relative", height: "100%" }}
    >
      <h3 className="p-3">Canvas</h3>
      {/* StageCrew renders actual DOM inside #rx-canvas; UI stays dumb */}
      <div id="rx-canvas" className="absolute inset-0" style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}

