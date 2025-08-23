import { endResize } from "./resize.stage-crew";

export const sequence = {
  id: "canvas-component-resize-end-symphony",
  name: "Canvas Component Resize End",
  movements: [
    {
      id: "resize-end",
      name: "Resize End",
      beats: [
        {
          beat: 1,
          event: "canvas:component:resize:end",
          title: "Resize End",
          dynamics: "mf",
          handler: "endResize",
          timing: "immediate",
          kind: "stage-crew",
        },
      ],
    },
  ],
} as const;

export const handlers = { endResize };

