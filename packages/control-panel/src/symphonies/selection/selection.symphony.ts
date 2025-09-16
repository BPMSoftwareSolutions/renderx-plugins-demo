import { deriveSelectionModel } from "./selection.stage-crew";
import { getSelectionObserver } from "../../state/observer.store";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  deriveSelectionModel,
  notifyUi(_data: any, ctx: any) {
    const observer = getSelectionObserver();
    const selectionModel = ctx.payload?.selectionModel;

    if (observer && selectionModel) {
      try {
        observer(selectionModel);
      } catch (e) {
        ctx.logger?.warn?.("Control Panel selection observer error:", e);
      }

      // Dev-safe nudge: also publish a UI render request via host router if available.
      // This ensures the UI render symphony runs even if the observer wiring misses in certain envs.
      try {
        const g: any = (globalThis as any);
        const ER = g?.RenderX?.EventRouter;
        const conductor = g?.RenderX?.Conductor;
        ER?.publish?.(
          "control.panel.ui.render.requested",
          { selectedElement: selectionModel },
          conductor
        );
      } catch {}
    }
    // IMPORTANT: Do not republish the 'canvas.component.selection.changed' topic here.
    // This symphony is triggered BY that topic; republishing would cause a loop.
  },
};
