/**
 * Canvas Component Resize Plugin (callback-first)
 */

function computeResize(startBox, delta, handle) {
  const sx = startBox.x || 0, sy = startBox.y || 0, sw = startBox.w || 0, sh = startBox.h || 0;
  const dx = (delta?.dx || 0), dy = (delta?.dy || 0);
  let x = sx, y = sy, w = sw, h = sh;
  switch ((handle || "").toLowerCase()) {
    case "e": w = Math.max(0, sw + dx); break;
    case "s": h = Math.max(0, sh + dy); break;
    case "se": w = Math.max(0, sw + dx); h = Math.max(0, sh + dy); break;
    case "w": x = sx + dx; w = Math.max(0, sw - dx); break;
    case "n": y = sy + dy; h = Math.max(0, sh - dy); break;
    case "nw": x = sx + dx; w = Math.max(0, sw - dx); y = sy + dy; h = Math.max(0, sh - dy); break;
    case "ne": w = Math.max(0, sw + dx); y = sy + dy; h = Math.max(0, sh - dy); break;
    case "sw": x = sx + dx; w = Math.max(0, sw - dx); h = Math.max(0, sh + dy); break;
    default: break;
  }
  return { x, y, w, h };
}

export const sequence = {
  id: "Canvas.component-resize-symphony",
  name: "Canvas Component Resize Symphony",
  description: "Resize a canvas component with callback updates",
  version: "1.0.0",
  key: "E Major",
  tempo: 120,
  timeSignature: "4/4",
  category: "ui-interactions",
  movements: [
    {
      id: "resize",
      name: "Resize",
      beats: [
        { beat: 1, event: "canvas:element:resize:start", handler: "handleResizeStart" },
        { beat: 2, event: "canvas:element:resized", handler: "handleResizeMove" },
        { beat: 3, event: "canvas:element:resize:end", handler: "handleResizeEnd" },
      ],
    },
  ],
  events: {
    triggers: [
      "canvas:element:resize:start",
      "canvas:element:resized",
      "canvas:element:resize:end",
    ],
    emits: [
      "canvas:element:resize:start",
      "canvas:element:resized",
      "canvas:element:resize:end",
    ],
  },
};

export const handlers = {
  handleResizeStart: ({ elementId, handle, start }, ctx) => ({ resize: { elementId, handle, start, startBox: { x: 0, y: 0, w: 0, h: 0 } } }),
  handleResizeMove: ({ elementId, handle, delta, onResizeUpdate }, ctx) => {
    const startBox = ctx.payload.resize?.startBox || ctx.payload.resize?.start || { x: 0, y: 0, w: 0, h: 0 };
    const box = computeResize(startBox, delta, handle);
    try { onResizeUpdate?.({ elementId, box }); } catch {}
    return { elementId, box };
  },
  handleResizeEnd: ({ onResizeEnd }, ctx) => { try { onResizeEnd?.(); } catch {} return {}; },
};

