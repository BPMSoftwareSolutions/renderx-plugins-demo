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

// Helpers to read/write numeric CSS custom properties
function readCssNumber(el: HTMLElement, name: string, fallback: number) {
  const inline = el.style.getPropertyValue(name);
  if (inline) {
    const n = parseFloat(inline);
    if (Number.isFinite(n)) return n;
  }
  try {
    const v = getComputedStyle(el).getPropertyValue(name);
    const n = parseFloat(v);
    if (Number.isFinite(n)) return n;
  } catch {}
  return fallback;
}

function writeCssNumber(el: HTMLElement, name: string, value: number) {
  el.style.setProperty(name, String(Math.round(value)));
}

export const startResize = (data: any) => {
  const { id, onResizeStart } = data || {};
  // Capture base line endpoints to allow proportional scaling during resize
  try {
    const el = document.getElementById(String(id)) as HTMLElement | null;
    if (el && el.classList.contains("rx-line")) {
      const rect = el.getBoundingClientRect();
      el.dataset.lineBaseW = String(
        rect.width || parseFloat(el.style.width) || 0
      );
      el.dataset.lineBaseH = String(
        rect.height || parseFloat(el.style.height) || 0
      );
      // Read current endpoints/control as px (fallbacks mirror recompute defaults)
      const x1 = readCssNumber(el, "--x1", 0);
      const y1 = readCssNumber(el, "--y1", 0);
      const x2 = readCssNumber(
        el,
        "--x2",
        (parseFloat(el.dataset.lineBaseW || "0") || x1)
      );
      const y2 = readCssNumber(el, "--y2", y1);
      const cx = readCssNumber(el, "--cx", (x1 + x2) / 2);
      const cy = readCssNumber(el, "--cy", (y1 + y2) / 2);
      el.dataset.lineBaseX1 = String(x1);
      el.dataset.lineBaseY1 = String(y1);
      el.dataset.lineBaseX2 = String(x2);
      el.dataset.lineBaseY2 = String(y2);
      el.dataset.lineBaseCx = String(cx);
      el.dataset.lineBaseCy = String(cy);
    }
  } catch {}

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
  const canvasRect = getCanvasRect();

  // ResizeCalculator encapsulates the geometry math for the resize operation
  class ResizeCalculator {
    left: number;
    top: number;
    width: number;
    height: number;
    constructor() {
      this.left =
        typeof startLeft === "number"
          ? startLeft
          : el!.getBoundingClientRect().left - canvasRect.left;
      this.top =
        typeof startTop === "number"
          ? startTop
          : el!.getBoundingClientRect().top - canvasRect.top;
      this.width =
        typeof startWidth === "number"
          ? startWidth
          : el!.getBoundingClientRect().width;
      this.height =
        typeof startHeight === "number"
          ? startHeight
          : el!.getBoundingClientRect().height;
    }

    applyDeltas() {
      // If resize is disabled, caller will handle early return
      const _dx = Number(dx);
      const _dy = Number(dy);
      if (!Number.isFinite(_dx) || !Number.isFinite(_dy)) return false;
      if (String(dir).includes("e")) this.width = clamp(startWidth + _dx, cfg.minW);
      if (String(dir).includes("s")) this.height = clamp(startHeight + _dy, cfg.minH);
      if (String(dir).includes("w")) {
        this.width = clamp(startWidth - _dx, cfg.minW);
        this.left = startLeft + _dx;
        if (this.width <= cfg.minW) this.left = startLeft + (startWidth - cfg.minW);
      }
      if (String(dir).includes("n")) {
        this.height = clamp(startHeight - _dy, cfg.minH);
        this.top = startTop + _dy;
        if (this.height <= cfg.minH) this.top = startTop + (startHeight - cfg.minH);
      }
      return true;
    }

    rounded() {
      return {
        rLeft: Math.round(this.left),
        rTop: Math.round(this.top),
        rWidth: Math.round(this.width),
        rHeight: Math.round(this.height),
      };
    }
  }

  // StyleManager centralizes inline style reads/writes and comparisons
  class StyleManager {
    el: HTMLElement;
    constructor(el: HTMLElement) {
      this.el = el;
    }
    readCurrent() {
      return {
        currLeft: parseFloat(this.el.style.left || ""),
        currTop: parseFloat(this.el.style.top || ""),
        currWidth: parseFloat(this.el.style.width || ""),
        currHeight: parseFloat(this.el.style.height || ""),
      };
    }
    isSame(rLeft: number, rTop: number, rWidth: number, rHeight: number) {
      const { currLeft, currTop, currWidth, currHeight } = this.readCurrent();
      const allFinite =
        Number.isFinite(currLeft) &&
        Number.isFinite(currTop) &&
        Number.isFinite(currWidth) &&
        Number.isFinite(currHeight);
      return allFinite && currLeft === rLeft && currTop === rTop && currWidth === rWidth && currHeight === rHeight;
    }
    applyRounded(rLeft: number, rTop: number, rWidth: number, rHeight: number) {
      this.el.style.position = "absolute";
      this.el.style.left = `${rLeft}px`;
      this.el.style.top = `${rTop}px`;
      this.el.style.width = `${rWidth}px`;
      this.el.style.height = `${rHeight}px`;
    }
  }

  // LineScaler handles proportional endpoint scaling for rx-line elements
  class LineScaler {
    el: HTMLElement;
    constructor(el: HTMLElement) {
      this.el = el;
    }
    scaleIfNeeded(startWidth: number, startHeight: number, width: number, height: number) {
      try {
        if (!this.el.classList.contains("rx-line")) return;
        const baseW =
          parseFloat(this.el.dataset.lineBaseW || String(startWidth) || "0") || 0;
        const baseH =
          parseFloat(this.el.dataset.lineBaseH || String(startHeight) || "0") || 0;
        if (baseW > 0 && baseH > 0) {
          const sx = width / baseW;
          const sy = height / baseH;
          const bx1 = parseFloat(this.el.dataset.lineBaseX1 || "0") || 0;
          const by1 = parseFloat(this.el.dataset.lineBaseY1 || "0") || 0;
          const bx2 = parseFloat(this.el.dataset.lineBaseX2 || String(baseW)) || baseW;
          const by2 = parseFloat(this.el.dataset.lineBaseY2 || String(by1)) || by1;
          const bcx = parseFloat(this.el.dataset.lineBaseCx || String((bx1 + bx2) / 2));
          const bcy = parseFloat(this.el.dataset.lineBaseCy || String((by1 + by2) / 2));
          writeCssNumber(this.el, "--x1", bx1 * sx);
          writeCssNumber(this.el, "--y1", by1 * sy);
          writeCssNumber(this.el, "--x2", bx2 * sx);
          writeCssNumber(this.el, "--y2", by2 * sy);
          writeCssNumber(this.el, "--cx", bcx * sx);
          writeCssNumber(this.el, "--cy", bcy * sx);
        }
      } catch {}
    }
  }

  // ResultBuilder centralizes payload mutation + return object
  class ResultBuilder {
    static setPayload(ctx: any, id: any, left: number, top: number, width: number, height: number) {
      if (ctx && ctx.payload) {
        ctx.payload.updatedLayout = { x: left, y: top, width, height };
        ctx.payload.elementId = id;
      }
    }
    static build(id: any, left: number, top: number, width: number, height: number) {
      return { id, left, top, width, height };
    }
  }

  // Orchestration
  if (!cfg.enabled) {
    const result = ResultBuilder.build(id, startLeft, startTop, startWidth, startHeight);
    ResultBuilder.setPayload(ctx, id, result.left, result.top, result.width, result.height);
    return result;
  }

  const calc = new ResizeCalculator();
  if (phase && phase !== "move") {
    const result = ResultBuilder.build(id, startLeft, startTop, startWidth, startHeight);
    ResultBuilder.setPayload(ctx, id, result.left, result.top, result.width, result.height);
    return result;
  }

  const applied = calc.applyDeltas();
  if (!applied) {
    const result = ResultBuilder.build(id, startLeft, startTop, startWidth, startHeight);
    ResultBuilder.setPayload(ctx, id, result.left, result.top, result.width, result.height);
    return result;
  }

  const { rLeft, rTop, rWidth, rHeight } = calc.rounded();
  const styles = new StyleManager(el);
  if (styles.isSame(rLeft, rTop, rWidth, rHeight)) {
    ResultBuilder.setPayload(ctx, id, calc.left, calc.top, calc.width, calc.height);
    return ResultBuilder.build(id, calc.left, calc.top, calc.width, calc.height);
  }

  styles.applyRounded(rLeft, rTop, rWidth, rHeight);

  const scaler = new LineScaler(el);
  scaler.scaleIfNeeded(startWidth, startHeight, calc.width, calc.height);

  const ov = document.getElementById("rx-selection-overlay") as HTMLDivElement | null;
  if (ov) applyOverlayRectForEl(ov, el);

  if (typeof onResize === "function") {
    try {
      onResize({ id, left: calc.left, top: calc.top, width: calc.width, height: calc.height });
    } catch {}
  }

  ResultBuilder.setPayload(ctx, id, calc.left, calc.top, calc.width, calc.height);
  return ResultBuilder.build(id, calc.left, calc.top, calc.width, calc.height);
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
    if (el) {
      // Clear captured base metrics
      delete el.dataset.lineBaseW;
      delete el.dataset.lineBaseH;
      delete el.dataset.lineBaseX1;
      delete el.dataset.lineBaseY1;
      delete el.dataset.lineBaseX2;
      delete el.dataset.lineBaseY2;
      delete el.dataset.lineBaseCx;
      delete el.dataset.lineBaseCy;
    }
    const ov = document.getElementById(
      "rx-selection-overlay"
    ) as HTMLDivElement | null;
    if (el && ov) applyOverlayRectForEl(ov, el);
  } catch {}
};

// Export handlers for JSON sequence mounting
export const handlers = { startResize, updateSize, endResize };
