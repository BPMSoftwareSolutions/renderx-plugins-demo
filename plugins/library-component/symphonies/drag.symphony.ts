export const sequence = {
  id: "library-component-drag-symphony",
  name: "Library Component Drag",
  movements: [
    {
      id: "drag",
      name: "Drag",
      beats: [
        { beat: 1, event: "library:component:drag:start", title: "Start Drag", dynamics: "mf", handler: "onDragStart", timing: "immediate" }
      ],
    },
  ],
} as const;

export const handlers = {
  onDragStart(data: any) {
    data.domEvent?.dataTransfer?.setData(
      "application/rx-component",
      JSON.stringify({ component: data.component })
    );
    return { started: true };
  },
};

