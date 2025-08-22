import { updatePosition } from "./drag.stage-crew";

export const sequence = {
  id: "canvas-component-drag-symphony",
  name: "Canvas Component Drag",
  movements: [
    {
      id: "drag-move",
      name: "Drag Move",
      beats: [
        {
          beat: 1,
          event: "canvas:component:drag:move",
          title: "Update Position",
          dynamics: "mf",
          handler: "updatePosition",
          timing: "immediate",
          kind: "stage-crew",
        },
      ],
    },
  ],
} as const;

export const handlers = {
  updatePosition,
};
