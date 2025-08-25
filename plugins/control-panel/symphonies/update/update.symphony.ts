import { updateFromElement } from "./update.stage-crew";
import { getSelectionObserver } from "../../state/observer.store";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

let lastLayoutById: Record<
  string,
  { x: number; y: number; width: number; height: number }
> = {};
const LAYOUT_EPS = 0.5; // sub-pixel noise threshold

export const handlers = {
  updateFromElement,
  notifyUi(data: any, ctx: any) {
    const observer = getSelectionObserver();
    const selectionModel = ctx.payload?.selectionModel;
    const source = ctx.payload?._source;

    if (!observer || !selectionModel) return;

    // Drop redundant layout-only updates during drag/resize
    const id = selectionModel?.header?.id;
    const layout = selectionModel?.layout;
    if (id && layout && (source === "drag" || source === "resize")) {
      const last = lastLayoutById[id];
      const changed =
        !last ||
        Math.abs(layout.x - last.x) > LAYOUT_EPS ||
        Math.abs(layout.y - last.y) > LAYOUT_EPS ||
        Math.abs(layout.width - last.width) > LAYOUT_EPS ||
        Math.abs(layout.height - last.height) > LAYOUT_EPS;
      if (!changed) return;
      lastLayoutById[id] = layout;
    }

    try {
      observer(selectionModel);
    } catch (e) {
      ctx.logger?.warn?.("Control Panel update observer error:", e);
    }
  },
};
