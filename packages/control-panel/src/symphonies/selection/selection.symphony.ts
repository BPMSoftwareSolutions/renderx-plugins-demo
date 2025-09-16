import { deriveSelectionModel } from "./selection.stage-crew";
import { notifySelection } from "../../state/observer.store";
import { EventRouter as SDKEventRouter } from "@renderx-plugins/host-sdk";

// Resolve a router that always delegates to the host/global instance when present
function getRouter() {
  try {
    const g: any = globalThis as any;
    return (g?.RenderX?.EventRouter) || SDKEventRouter;
  } catch {
    return SDKEventRouter;
  }
}

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  deriveSelectionModel,
  notifyUi(_data: any, ctx: any) {
    const selectionModel = ctx.payload?.selectionModel;

    if (selectionModel) {
      try {
        ctx.logger?.debug?.("[cp] selection.notifyUi called with", selectionModel?.header || selectionModel);
        // Deliver to observer if registered; otherwise buffer until UI registers
        const delivered = notifySelection(selectionModel);
        if (delivered) {
          ctx.logger?.info?.("[cp] selection delivered to UI observer");
        } else {
          ctx.logger?.info?.("[cp] buffered selection model until UI observer registers");
        }
      } catch (e) {
        ctx.logger?.warn?.("Control Panel selection observer error:", e);
      }

      // Dev-safe nudge: also publish a UI render request via host router if available.
      // This ensures the UI render symphony runs even if the observer wiring misses in certain envs.
      try {
        const router = getRouter();
        router.publish(
          "control.panel.ui.render.requested",
          { selectedElement: selectionModel }
        );
      } catch {}
    }
    // IMPORTANT: Do not republish the 'canvas.component.selection.changed' topic here.
    // This symphony is triggered BY that topic; republishing would cause a loop.
  },
};
