import { updateSize } from "./resize.stage-crew";
import { resolveInteraction } from "../../../../src/interactionManifest";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  updateSize,
  forwardToControlPanel(data: any, ctx: any) {
    // Forward resize updates to Control Panel for live size/position updates
    const { id } = data || {};
    if (id && ctx?.conductor?.play) {
      try {
        const route = resolveInteraction("control.panel.update");
        ctx.conductor.play(route.pluginId, route.sequenceId, {
          id,
          source: "resize"
        });
      } catch (e) {
        ctx.logger?.warn?.("Failed to forward resize update to Control Panel:", e);
      }
    }
  },
};
