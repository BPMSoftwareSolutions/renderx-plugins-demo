// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.
export const handlers = {
  forwardToCanvasCreate(data: any, ctx: any) {
    try {
      const {
        resolveInteraction,
      } = require("../../../src/interactionManifest");
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
    } catch {
      ctx.conductor?.play?.(
        "CanvasComponentPlugin",
        "canvas-component-create-symphony",
        {
          component: data.component,
          position: data.position,
          onComponentCreated: data.onComponentCreated,
          onDragStart: data.onDragStart,
          onDragMove: data.onDragMove,
          onDragEnd: data.onDragEnd,
          onSelected: data.onSelected,
        }
      );
    }
  },
};
