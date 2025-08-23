import { showSelectionOverlay, hideSelectionOverlay } from "./select.stage-crew";

export const sequence = {
  id: "canvas-component-select-symphony",
  name: "Canvas Component Select",
  movements: [
    {
      id: "select",
      name: "Select",
      beats: [
        { beat: 1, event: "canvas:component:select", title: "Show Selection", dynamics: "mf", handler: "showSelectionOverlay", timing: "immediate", kind: "stage-crew" },
        { beat: 2, event: "canvas:component:select:notify", title: "Notify UI", dynamics: "mf", handler: "notifyUi", timing: "immediate", kind: "pure" },
      ],
    },
  ],
} as const;

export const handlers = {
  showSelectionOverlay,
  notifyUi(data: any) {
    data?.onSelected?.(data?.id);
  },
};

