import {
  applyOverlayRectForEl,
  getCanvasRect,
} from "../select/select.overlay.dom.stage-crew";

function clamp(v: number, min = 1) {
  return v < min ? min : v;
}

function getResizeConfig(el: HTMLElement) {
  const enabled =
    (el.getAttribute("data-resize-enabled") || "true") !== "false";
  const minW = parseFloat(el.getAttribute("data-resize-min-w") || "1");
  const minH = parseFloat(el.getAttribute("data-resize-min-h") || "1");
  return {
    enabled,
    minW: Number.isFinite(minW) ? Math.max(1, minW) : 1,
    minH: Number.isFinite(minH) ? Math.max(1, minH) : 1,
  };
}

export const startResize = (data: any) => {
  const { id, onResizeStart } = data || {};
  if (typeof onResizeStart === "function") {
    try {
      onResizeStart({ id });
    } catch {}
  }
};

export const updateSize = (data: any, ctx?: any) => {
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

  const cfg = getResizeConfig(el);
  if (!cfg.enabled) {
    const result = {
      id,
      left: startLeft,
      top: startTop,
      width: startWidth,
      height: startHeight,
    };
    if (ctx && ctx.payload) {
      ctx.payload.updatedLayout = {
        x: result.left,
        y: result.top,
        width: result.width,
        height: result.height,
      };
      ctx.payload.elementId = id;
    }
    return result;
  }

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
    const result = {
      id,
      left: startLeft,
      top: startTop,
      width: startWidth,
      height: startHeight,
    };
    if (ctx && ctx.payload) {
      ctx.payload.updatedLayout = {
        x: result.left,
        y: result.top,
        width: result.width,
        height: result.height,
      };
      ctx.payload.elementId = id;
    }
    return result;
  }

  const _dx = Number(dx);
  const _dy = Number(dy);
  if (!Number.isFinite(_dx) || !Number.isFinite(_dy)) {
    // No deltas provided — ignore to avoid snap back
    const result = {
      id,
      left: startLeft,
      top: startTop,
      width: startWidth,
      height: startHeight,
    };
    if (ctx && ctx.payload) {
      ctx.payload.updatedLayout = {
        x: result.left,
        y: result.top,
        width: result.width,
        height: result.height,
      };
      ctx.payload.elementId = id;
    }
    return result;
  }

  if (String(dir).includes("e")) width = clamp(startWidth + _dx, cfg.minW);
  if (String(dir).includes("s")) height = clamp(startHeight + _dy, cfg.minH);
  if (String(dir).includes("w")) {
    width = clamp(startWidth - _dx, cfg.minW);
    left = startLeft + _dx;
    if (width <= cfg.minW) left = startLeft + (startWidth - cfg.minW);
  }
  if (String(dir).includes("n")) {
    height = clamp(startHeight - _dy, cfg.minH);
    top = startTop + _dy;
    if (height <= cfg.minH) top = startTop + (startHeight - cfg.minH);
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

  if (ctx && ctx.payload) {
    ctx.payload.updatedLayout = { x: left, y: top, width, height };
    ctx.payload.elementId = id;
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
