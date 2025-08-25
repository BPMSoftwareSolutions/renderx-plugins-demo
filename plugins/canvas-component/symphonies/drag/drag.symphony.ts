import { updatePosition } from "./drag.stage-crew";
import { resolveInteraction } from "../../../../src/interactionManifest";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

export const handlers = {
  updatePosition,
  forwardToControlPanel(data: any, ctx: any) {
    // Forward drag updates to Control Panel for live position updates
    const elementId = ctx.payload?.elementId;
    if (elementId && ctx?.conductor?.play) {
      try {
        const route = resolveInteraction("control.panel.update");
        ctx.conductor.play(route.pluginId, route.sequenceId, {
          id: elementId,
          source: "drag"
        });
      } catch (e) {
        ctx.logger?.warn?.("Failed to forward drag update to Control Panel:", e);
      }
    }
  },
};
