// NOTE: Runtime sequences are mounted from JSON (see json-sequences/*). This file only exports handlers.
export const handlers = {
  forwardToCanvasCreate(data: any, ctx: any) {
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
  },
};
