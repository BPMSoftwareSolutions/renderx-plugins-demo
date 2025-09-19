import React, { Suspense } from "react";
import { LayoutEngine } from "../../domain/layout/LayoutEngine";
import { isFlagEnabled } from "../../core/environment/feature-flags";
import { SlotContainer } from "../../domain/layout/SlotContainer";
import { EventRouter } from "../../core/events/EventRouter";
import "../../domain/layout/legacyLayout.css";

export default function App() {
  React.useEffect(() => {
    // In non-DOM environments, do nothing
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const wireCanvasDeselect = () => {
      const canvas = document.querySelector("#rx-canvas") as HTMLElement | null;
      if (!canvas) return false;
      const conductor = (window as any).RenderX?.conductor;
      if (!conductor) return false;

      canvas.addEventListener(
        "click",
        async (e: Event) => {
          const target = e.target as HTMLElement;
          const isComp = target.closest?.(".rx-comp,[id^='rx-node-']");
          if (!isComp)
            await EventRouter.publish(
              "canvas.component.deselect.requested",
              {},
              conductor
            );
        },
        true
      );
      return true;
    };

    const wireEscapeDeselect = () => {
      const conductor = (window as any).RenderX?.conductor;
      if (!conductor) return false;

      window.addEventListener("keydown", async (e) => {
        if (e.key === "Escape")
          await EventRouter.publish(
            "canvas.component.deselect.requested",
            {},
            conductor
          );
      });
      return true;
    };

    if (wireCanvasDeselect() && wireEscapeDeselect()) return;

    const observer = new MutationObserver(() => {
      // Guard against jsdom teardown between mutations
      if (typeof window === "undefined" || typeof document === "undefined")
        return;
      if (wireCanvasDeselect() && wireEscapeDeselect()) {
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
