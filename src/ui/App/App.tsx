import React, { Suspense } from "react";
import { LayoutEngine } from "../../domain/layout/LayoutEngine";
import { isFlagEnabled } from "../../core/environment/feature-flags";
import { SlotContainer } from "../../domain/layout/SlotContainer";
import { EventRouter } from "../../core/events/EventRouter";
import { resolveInteraction } from "@renderx-plugins/host-sdk";
import "../../domain/layout/legacyLayout.css";

export default function App() {
  React.useEffect(() => {
    const wireCanvasDeselect = () => {
      const canvas = document.querySelector("#rx-canvas") as HTMLElement;
      if (!canvas) return false;
      const conductor = (window as any).RenderX?.conductor;
      if (!conductor) return false;

      canvas.addEventListener(
        "click",
        async (e: Event) => {
          const target = e.target as HTMLElement;
          const isComp = target.closest?.(".rx-comp,[id^='rx-node-']");
          if (!isComp)
            await EventRouter.publish("canvas.component.deselect.requested", {}, conductor);
        },
        true
      );
      return true;
    };

    const wireEscapeDeselect = () => {
      const conductor = (window as any).RenderX?.conductor;
      if (!conductor) return false;

      window.addEventListener("keydown", async (e) => {
        if (e.key === "Escape") await EventRouter.publish("canvas.component.deselect.requested", {}, conductor);
      });
      return true;
    };

    const wireDeleteSelected = () => {
      const conductor = (window as any).RenderX?.conductor;
      if (!conductor) return false;

      window.addEventListener("keydown", async (e) => {
        if (e.key === "Delete") await EventRouter.publish("canvas.component.delete.requested", {}, conductor);
      });
      return true;
    };

    const wireCanvasDrag = () => {
      const canvas = document.querySelector("#rx-canvas") as HTMLElement;
      if (!canvas) return false;


      let dragging = false;
      let currentId: string | null = null;
      let offsetX = 0;
      let offsetY = 0;
      let canvasRect: DOMRect | null = null;

      const findNodeEl = (t: HTMLElement): HTMLElement | null => {
        return (t.closest?.("[id^='rx-node-']") as HTMLElement) || (t.closest?.(".rx-comp") as HTMLElement) || null;
      };

      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const nodeEl = findNodeEl(target);
        if (!nodeEl) return;
        const id = nodeEl.id || nodeEl.getAttribute("data-rx-node");
        if (!id) return;
        canvasRect = canvas.getBoundingClientRect();
        const elRect = nodeEl.getBoundingClientRect();
        offsetX = e.clientX - elRect.left;
        offsetY = e.clientY - elRect.top;
        currentId = id;
        dragging = true;
        // Prevent text selection while dragging
        e.preventDefault();
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!dragging || !currentId || !canvasRect) return;
        const x = e.clientX - canvasRect.left - offsetX;
        const y = e.clientY - canvasRect.top - offsetY;
        try {
          const route = resolveInteraction("canvas.component.drag.move");
          if (!route) return; // manifest not ready yet
          const conductorRef = (window as any).RenderX?.conductor;
          conductorRef?.play?.(route.pluginId, route.sequenceId, { id: currentId, position: { x, y } });
        } catch {}
      };

      const onMouseUp = () => {
        dragging = false;
        currentId = null;
      };

      canvas.addEventListener("mousedown", onMouseDown, true);
      window.addEventListener("mousemove", onMouseMove, true);
      window.addEventListener("mouseup", onMouseUp, true);
      return true;
    };

    if (wireCanvasDeselect() && wireEscapeDeselect() && wireDeleteSelected() && wireCanvasDrag()) return;

    const observer = new MutationObserver(() => {
      if (wireCanvasDeselect() && wireEscapeDeselect() && wireDeleteSelected() && wireCanvasDrag()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const useLayoutManifest = isFlagEnabled("ui.layout-manifest");

  if (useLayoutManifest) {
    return (
      <Suspense fallback={<div className="p-3">Loading Layout…</div>}>
        <LayoutEngine />
      </Suspense>
    );
  }

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
