import { applyOverlayRectForEl, getCanvasRect } from "./select.overlay.dom.stage-crew";

function clamp(v: number, min = 1) {
  return v < min ? min : v;
}

export const updateSize = (data: any) => {
  const { id, dir, startLeft, startTop, startWidth, startHeight, dx, dy } = data || {};
  if (!id) throw new Error("Missing id for resize");
  const el = (typeof document !== "undefined") ? document.getElementById(String(id)) as HTMLElement | null : null;
  if (!el) throw new Error(`Canvas component with id ${id} not found`);

  const canvasRect = getCanvasRect();

  let left = typeof startLeft === "number" ? startLeft : (el.getBoundingClientRect().left - canvasRect.left);
  let top = typeof startTop === "number" ? startTop : (el.getBoundingClientRect().top - canvasRect.top);
  let width = typeof startWidth === "number" ? startWidth : el.getBoundingClientRect().width;
  let height = typeof startHeight === "number" ? startHeight : el.getBoundingClientRect().height;

  const _dx = Number(dx) || 0;
  const _dy = Number(dy) || 0;

  if (String(dir).includes("e")) width = clamp(startWidth + _dx);
  if (String(dir).includes("s")) height = clamp(startHeight + _dy);
  if (String(dir).includes("w")) {
    width = clamp(startWidth - _dx);
    left = startLeft + _dx;
    if (width <= 1) left = startLeft + (startWidth - 1);
  }
  if (String(dir).includes("n")) {
    height = clamp(startHeight - _dy);
    top = startTop + _dy;
    if (height <= 1) top = startTop + (startHeight - 1);
  }

  el.style.position = "absolute";
  el.style.left = `${Math.round(left)}px`;
  el.style.top = `${Math.round(top)}px`;
  el.style.width = `${Math.round(width)}px`;
  el.style.height = `${Math.round(height)}px`;

  const ov = document.getElementById("rx-selection-overlay") as HTMLDivElement | null;
  if (ov) applyOverlayRectForEl(ov, el);

  return { id, left, top, width, height };
};

