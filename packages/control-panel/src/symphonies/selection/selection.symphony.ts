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
    }
    // IMPORTANT: Do not republish the selection.changed topic here.
    // This symphony is triggered BY that topic; republishing would cause a loop.
  },
};
