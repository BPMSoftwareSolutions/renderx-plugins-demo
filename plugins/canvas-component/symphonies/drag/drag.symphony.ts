import { updatePosition } from "./drag.stage-crew";
import { resolveInteraction } from "../../../../src/interactionManifest";

// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.

// Coalesce CP updates to one per animation frame (latest wins)
let cpUpdateScheduled = false;
let cpUpdateLatestId: string | null = null;

export const handlers = {
  updatePosition,
  forwardToControlPanel(data: any, ctx: any) {
    const elementId = ctx.payload?.elementId;
    if (!elementId || !ctx?.conductor?.play) return;

    // In tests, keep immediate behavior for deterministic assertions
    const isTest =
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "test";
    if (isTest) {
      try {
        const route = resolveInteraction("control.panel.update");
        ctx.conductor.play(route.pluginId, route.sequenceId, {
          id: elementId,
          source: "drag",
        });
      } catch (e) {
        ctx.logger?.warn?.(
          "Failed to forward drag update to Control Panel:",
          e
        );
      }
      return;
    }

    // Coalesce on rAF (or microtask fallback)
    cpUpdateLatestId = elementId;
    if (cpUpdateScheduled) return;
    cpUpdateScheduled = true;

    const raf =
      typeof window !== "undefined" && (window as any).requestAnimationFrame
        ? (cb: FrameRequestCallback) =>
            (window as any).requestAnimationFrame(cb)
        : (cb: Function) => setTimeout(cb as any, 0);

    raf(() => {
      try {
        if (cpUpdateLatestId) {
          const route = resolveInteraction("control.panel.update");
          ctx.conductor.play(route.pluginId, route.sequenceId, {
            id: cpUpdateLatestId,
            source: "drag",
          });
        }
      } catch (e) {
        ctx.logger?.warn?.(
          "Failed to forward drag update to Control Panel:",
          e
        );
      } finally {
        cpUpdateScheduled = false;
        cpUpdateLatestId = null;
      }
    });
  },
};
