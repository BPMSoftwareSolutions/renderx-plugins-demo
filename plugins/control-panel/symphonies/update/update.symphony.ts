import { updateFromElement } from "./update.stage-crew";
import { getSelectionObserver } from "../../state/observer.store";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  updateFromElement,
  notifyUi(data: any, ctx: any) {
    const observer = getSelectionObserver();
    const selectionModel = ctx.payload?.selectionModel;
    
    if (observer && selectionModel) {
      try {
        observer(selectionModel);
      } catch (e) {
        ctx.logger?.warn?.("Control Panel update observer error:", e);
      }
    }
  },
};
