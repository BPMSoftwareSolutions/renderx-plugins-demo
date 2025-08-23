// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.
import { resolveInteraction } from "../../../src/interactionManifest";

export const handlers = {
  forwardToCanvasCreate(data: any, ctx: any) {
    const r = resolveInteraction("canvas.component.create");
    ctx.conductor?.play?.(r.pluginId, r.sequenceId, {
      component: data.component,
      position: data.position,
      onComponentCreated: data.onComponentCreated,
      onDragStart: data.onDragStart,
      onDragMove: data.onDragMove,
      onDragEnd: data.onDragEnd,
      onSelected: data.onSelected,
    });
  },
};
