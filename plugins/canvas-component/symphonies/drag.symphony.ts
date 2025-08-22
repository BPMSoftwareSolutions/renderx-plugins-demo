import { updatePosition } from "./drag.stage-crew";

export const sequence = {
  id: "canvas-component-drag-symphony",
  name: "Canvas Component Drag",
  movements: [
    {
      id: "drag-start",
      name: "Drag Start",
      beats: [
        { beat: 1, event: "canvas:component:drag:start", title: "Start Drag", dynamics: "mf", handler: "onDragStart", timing: "immediate", kind: "pure" },
      ],
    },
    {
      id: "drag-move",
      name: "Drag Move", 
      beats: [
        { beat: 1, event: "canvas:component:drag:move", title: "Update Position", dynamics: "mf", handler: "updatePosition", timing: "immediate", kind: "stage-crew" },
      ],
    },
    {
      id: "drag-end",
      name: "Drag End",
      beats: [
        { beat: 1, event: "canvas:component:drag:end", title: "End Drag", dynamics: "mf", handler: "onDragEnd", timing: "immediate", kind: "pure" },
      ],
    },
  ],
} as const;

export const handlers = {
  onDragStart(data: any) {
    // Pure handler - just log or track drag start
    return { 
      dragStarted: true,
      elementId: data.id,
      startPosition: data.startPosition,
      mousePosition: data.mousePosition
    };
  },
  
  updatePosition,
  
  onDragEnd(data: any) {
    // Pure handler - just log or track drag end
    return {
      dragEnded: true,
      elementId: data.id,
      finalPosition: data.finalPosition,
      totalDelta: data.totalDelta
    };
  },
};
