export const sequence = {
  id: "library-component-drop-symphony",
  name: "Library Component Drop",
  movements: [
    {
      id: "drop",
      beats: [{ beat: 1, event: "library:component:drop", handler: "forwardToCanvasCreate" }],
    },
  ],
} as const;

export const handlers = {
  forwardToCanvasCreate(data: any, ctx: any) {
    ctx.conductor?.play?.("CanvasComponentPlugin", "canvas-component-create-symphony", {
      component: data.component,
      position: data.position,
      onComponentCreated: data.onComponentCreated,
    });
  },
};

