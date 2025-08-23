import { ensureOverlayCss } from "./select.overlay.css.stage-crew";

export function getCanvasOrThrow(): HTMLElement {
  const canvas = typeof document !== "undefined" ? document.getElementById("rx-canvas") : null;
  if (!canvas) throw new Error("#rx-canvas not found");
  return canvas;
}

export function ensureOverlay(): HTMLDivElement {
  ensureOverlayCss();
  const canvas = getCanvasOrThrow();
  let ov = document.getElementById("rx-selection-overlay") as HTMLDivElement | null;
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "rx-selection-overlay";
    ov.className = "rx-selection-overlay";
    const positions = ["nw","n","ne","e","se","s","sw","w"] as const;
    for (const p of positions) {
      const h = document.createElement("div");
      h.className = `rx-handle ${p}`;
      ov.appendChild(h);
    }
    canvas.appendChild(ov);
  }
  return ov;
}

export function getCanvasRect() {
  return getCanvasOrThrow().getBoundingClientRect();
}

export function applyOverlayRectForEl(ov: HTMLDivElement, el: HTMLElement) {
  const canvasRect = getCanvasRect();
  const r = el.getBoundingClientRect();
  Object.assign(ov.style, {
    left: `${Math.round(r.left - canvasRect.left)}px`,
    top: `${Math.round(r.top - canvasRect.top)}px`,
    width: `${Math.round(r.width)}px`,
    height: `${Math.round(r.height)}px`,
    display: "block",
  } as Partial<CSSStyleDeclaration>);
}

