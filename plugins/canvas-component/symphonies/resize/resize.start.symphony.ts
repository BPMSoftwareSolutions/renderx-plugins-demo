import { startResize } from "./resize.stage-crew";

export const sequence = {
  id: "canvas-component-resize-start-symphony",
  name: "Canvas Component Resize Start",
  movements: [
    {
      id: "resize-start",
      name: "Resize Start",
      beats: [
        {
          beat: 1,
          event: "canvas:component:resize:start",
          title: "Resize Start",
          dynamics: "mf",
          handler: "startResize",
          timing: "immediate",
          kind: "stage-crew",
        },
      ],
    },
  ],
} as const;

export const handlers = { startResize };

