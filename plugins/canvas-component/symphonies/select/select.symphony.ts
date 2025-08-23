import { showSelectionOverlay } from "./select.stage-crew";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  showSelectionOverlay,
  notifyUi(data: any) {
    data?.onSelected?.(data?.id);
  },
};
