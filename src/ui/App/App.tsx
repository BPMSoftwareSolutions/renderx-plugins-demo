import React, { Suspense } from "react";
import { LayoutEngine } from "../../domain/layout/LayoutEngine";
import { isFlagEnabled } from "@renderx-plugins/host-sdk";
import { SlotContainer } from "../../domain/layout/SlotContainer";
import { EventRouter } from "@renderx-plugins/host-sdk";
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


    if (wireCanvasDeselect() && wireEscapeDeselect() && wireDeleteSelected()) return;

    const observer = new MutationObserver(() => {
      if (wireCanvasDeselect() && wireEscapeDeselect() && wireDeleteSelected()) {
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
