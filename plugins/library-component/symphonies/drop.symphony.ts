export const sequence = {
  id: "library-component-drop-symphony",
  name: "Library Component Drop",
  movements: [
    {
      id: "drop",
      name: "Drop",
      beats: [
        { beat: 1, event: "library:component:drop", title: "Forward to Canvas Create", dynamics: "mf", handler: "forwardToCanvasCreate", timing: "immediate" }
      ],
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

