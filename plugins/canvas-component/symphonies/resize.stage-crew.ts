import {
  applyOverlayRectForEl,
  getCanvasRect,
} from "./select.overlay.dom.stage-crew";

function clamp(v: number, min = 1) {
  return v < min ? min : v;
}

export const startResize = (data: any) => {
  const { id, onResizeStart } = data || {};
  if (typeof onResizeStart === "function") {
    try {
      onResizeStart({ id });
    } catch {}
  }
};

export const updateSize = (data: any) => {
  const {
    id,
    dir,
    startLeft,
    startTop,
    startWidth,
    startHeight,
    dx,
    dy,
    onResize,
    phase,
  } = data || {};
  if (!id) throw new Error("Missing id for resize");
  const el =
    typeof document !== "undefined"
      ? (document.getElementById(String(id)) as HTMLElement | null)
      : null;
  if (!el) throw new Error(`Canvas component with id ${id} not found`);

  const canvasRect = getCanvasRect();

  let left =
    typeof startLeft === "number"
      ? startLeft
      : el.getBoundingClientRect().left - canvasRect.left;
  let top =
    typeof startTop === "number"
      ? startTop
      : el.getBoundingClientRect().top - canvasRect.top;
  let width =
    typeof startWidth === "number"
      ? startWidth
      : el.getBoundingClientRect().width;
  let height =
    typeof startHeight === "number"
      ? startHeight
      : el.getBoundingClientRect().height;

  // Guard: if this invocation is not a move (e.g., start/end), don't recompute size
  if (phase && phase !== "move") {
    return {
      id,
      left: startLeft,
      top: startTop,
      width: startWidth,
      height: startHeight,
    };
  }

  const _dx = Number(dx);
  const _dy = Number(dy);
  if (!Number.isFinite(_dx) || !Number.isFinite(_dy)) {
    // No deltas provided — ignore to avoid snap back
    return {
      id,
      left: startLeft,
      top: startTop,
      width: startWidth,
      height: startHeight,
    };
  }

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

  const ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (ov) applyOverlayRectForEl(ov, el);

  if (typeof onResize === "function") {
    try {
      onResize({ id, left, top, width, height });
    } catch {}
  }

  return { id, left, top, width, height };
};

export const endResize = (data: any) => {
  const { id, onResizeEnd } = data || {};
  if (typeof onResizeEnd === "function") {
    try {
      onResizeEnd({ id });
    } catch {}
  }
  // resync overlay to final inline styles
  try {
    const el = document.getElementById(String(id)) as HTMLElement | null;
    const ov = document.getElementById(
      "rx-selection-overlay"
    ) as HTMLDivElement | null;
    if (el && ov) applyOverlayRectForEl(ov, el);
  } catch {}
};
