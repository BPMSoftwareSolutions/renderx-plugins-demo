import React from "react";
import { useConductor } from "../../../src/conductor";

export const LIB_COMP_PLUGIN_ID = "LibraryComponentDropPlugin" as const;
export const LIB_COMP_DROP_SEQ_ID = "library-component-drop-symphony" as const;

export async function onDropForTest(e: any, conductor: any, onCreated?: (n: any) => void) {
  e.preventDefault();
  const raw = e.dataTransfer.getData("application/rx-component");
  const payload = raw ? JSON.parse(raw) : {};
  const rect = e.currentTarget.getBoundingClientRect();
  const position = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  conductor?.play?.(LIB_COMP_PLUGIN_ID, LIB_COMP_DROP_SEQ_ID, {
    component: payload.component,
    position,
    onComponentCreated: onCreated,
  });
}

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

