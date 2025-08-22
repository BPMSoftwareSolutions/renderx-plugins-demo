export const sequence = {
  id: "library-component-drag-symphony",
  name: "Library Component Drag",
  movements: [
    {
      id: "drag",
      beats: [{ beat: 1, event: "library:component:drag:start", handler: "onDragStart" }],
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

