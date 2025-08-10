import React from "react";

interface VisualToolsProps {
  elementId: string;
  handles?: string[]; // e.g., ["nw","n","ne","e","se","s","sw","w"] or custom
  tools?: any; // ui.tools config from component JSON
  startBox?: { x: number; y: number; w: number; h: number };
  onResizeUpdate?: (payload: {
    elementId: string;
    box: { x: number; y: number; w: number; h: number };
  }) => void;
}

const defaultHandles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

export const VisualTools: React.FC<VisualToolsProps> = ({
  elementId,
  handles = defaultHandles as unknown as string[],
  tools,
  startBox,
  onResizeUpdate,
}) => {
  const handlePointerDown = (handle: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const cs = (window as any).renderxCommunicationSystem;
    const start = { x: e.clientX, y: e.clientY };
    cs?.conductor.play(
      "Canvas.component-resize-symphony",
      "Canvas.component-resize-symphony",
      {
        action: "start",
        elementId,
        handle,
        start,
        tools,
        startBox,
        onResizeUpdate,
        debugBox: {
          elementId,
          startBox,
          overlayRect: (() => {
            const p = (e.target as HTMLElement)?.closest('.rx-resize-overlay') as HTMLElement | null;
            if (!p) return null as any;
            const r = p.getBoundingClientRect();
            return { x: r.x, y: r.y, w: r.width, h: r.height };
          })(),
        },
      }
    );
    const sx = e.clientX;
    const sy = e.clientY;
    const onMove = (ev: PointerEvent) => {
      const cs2 = (window as any).renderxCommunicationSystem;
      cs2?.conductor.play(
        "Canvas.component-resize-symphony",
        "Canvas.component-resize-symphony",
        {
          action: "move",
          elementId,
          handle,
          delta: { dx: ev.clientX - sx, dy: ev.clientY - sy },
          tools,
          onResizeUpdate,
        }
      );
    };
    const onUp = () => {
      const cs3 = (window as any).renderxCommunicationSystem;
      cs3?.conductor.play(
        "Canvas.component-resize-symphony",
        "Canvas.component-resize-symphony",
        { action: "end", elementId, handle, tools }
      );
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  return (
    <div
      className="rx-resize-overlay"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {handles.map((handle) => (
        <div
          key={handle}
          className={`rx-resize-handle rx-${handle}`}
          onPointerDown={handlePointerDown(handle)}
        />
      ))}
    </div>
  );
};

export default VisualTools;
