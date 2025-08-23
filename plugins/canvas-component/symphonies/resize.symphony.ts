import { startResize, updateSize, endResize } from "./resize.stage-crew";

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
          event: "canvas:component:resize:start",
          title: "Resize Start",
          dynamics: "mf",
          handler: "startResize",
          timing: "immediate",
          kind: "stage-crew",
        },
        {
          beat: 2,
          event: "canvas:component:resize:move",
          title: "Resize Move",
          dynamics: "mf",
          handler: "updateSize",
          timing: "immediate",
          kind: "stage-crew",
        },
        {
          beat: 3,
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

export const handlers = { startResize, updateSize, endResize };
