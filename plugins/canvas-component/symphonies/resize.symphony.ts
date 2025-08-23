import { updateSize } from "./resize.stage-crew";

export const sequence = {
  id: "canvas-component-resize-symphony",
  name: "Canvas Component Resize",
  movements: [
    {
      id: "resize",
      name: "Resize",
      beats: [
        {
          beat: 1,
          event: "canvas:component:resize",
          title: "Update Size",
          dynamics: "mf",
          handler: "updateSize",
          timing: "immediate",
          kind: "stage-crew",
        },
      ],
    },
  ],
} as const;

export const handlers = { updateSize };

