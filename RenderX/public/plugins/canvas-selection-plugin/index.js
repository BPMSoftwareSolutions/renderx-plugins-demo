/**
 * Canvas Component Selection Plugin (callback-first)
 */

export const sequence = {
  id: "Canvas.component-select-symphony",
  name: "Canvas Component Selection Symphony",
  description: "Select/deselect a canvas component and notify via callback",
  version: "1.0.0",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: "ui-interactions",
  movements: [
    {
      id: "selection",
      name: "Selection",
      description: "Select or clear selection",
      beats: [
        { beat: 1, event: "canvas:selection:show", handler: "handleSelect" },
        { beat: 2, event: "canvas:selection:hide", handler: "handleFinalize" },
      ],
    },
  ],
  events: {
    triggers: ["canvas:selection:show", "canvas:selection:hide"],
    emits: ["canvas:selection:show", "canvas:selection:hide"],
  },
};

export const handlers = {
  handleSelect: ({ elementId, onSelectionChange }, ctx) => {
    try { onSelectionChange?.(elementId); } catch {}
    return { elementId };
  },
  handleFinalize: ({ elementId, onSelectionChange }, ctx) => {
    try { if (elementId == null) onSelectionChange?.(null); } catch {}
    return { elementId: elementId ?? null };
  },
};

