import {
  applyOverlayRectForEl,
  getCanvasRect,
} from "./select.overlay.dom.stage-crew";

function readNumericPx(value: string): number | null {
  const n = parseFloat(value || "");
  return Number.isFinite(n) ? n : null;
}

export function attachResizeHandlers(ov: HTMLDivElement, conductor?: any) {
  if ((ov as any)._rxResizeAttached) return;
  (ov as any)._rxResizeAttached = true;

  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target || !target.classList.contains("rx-handle")) return;

    e.preventDefault();

    const dir = Array.from(target.classList).find((c) =>
      ["n", "s", "e", "w", "nw", "ne", "sw", "se"].includes(c)
    ) as string | undefined;
    const id = ov.dataset.targetId;
    if (!dir || !id) return;
    const el = document.getElementById(id) as HTMLElement | null;
    if (!el) return;

    const canvasRect = getCanvasRect();
    const rect = el.getBoundingClientRect();
    const styleLeft = readNumericPx(el.style.left);
    const styleTop = readNumericPx(el.style.top);
    const styleWidth = readNumericPx(el.style.width);
    const styleHeight = readNumericPx(el.style.height);
    const startLeft = styleLeft ?? rect.left - canvasRect.left;
    const startTop = styleTop ?? rect.top - canvasRect.top;
    const startWidth = styleWidth ?? rect.width;
    const startHeight = styleHeight ?? rect.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const clamp = (v: number, min = 1) => (v < min ? min : v);

    const call = (
      dx: number,
      dy: number,
      event: "start" | "move" | "end" = "move"
    ) => {
      const play = conductor?.play || (window as any).RenderX?.conductor?.play;
      const base = { id, dir, startLeft, startTop, startWidth, startHeight };
      const payload =
        event === "move"
          ? { ...base, dx, dy, phase: "move" }
          : { ...base, phase: event };
      const { seqId } =
        event === "start"
          ? { seqId: "canvas-component-resize-start-symphony" }
          : event === "end"
          ? { seqId: "canvas-component-resize-end-symphony" }
          : { seqId: "canvas-component-resize-move-symphony" };
      if (typeof play === "function") {
        play("CanvasComponentPlugin", seqId, payload);
      } else {
        if (event !== "move") return;
        // Fallback direct style updates for environments without conductor
        let left = startLeft;
        let top = startTop;
        let width = startWidth;
        let height = startHeight;
        if (dir.includes("e")) width = clamp(startWidth + dx);
        if (dir.includes("s")) height = clamp(startHeight + dy);
        if (dir.includes("w")) {
          width = clamp(startWidth - dx);
          left = startLeft + dx;
          if (width <= 1) left = startLeft + (startWidth - 1);
        }
        if (dir.includes("n")) {
          height = clamp(startHeight - dy);
          top = startTop + dy;
          if (height <= 1) top = startTop + (startHeight - 1);
        }
        el.style.position = "absolute";
        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
        el.style.width = `${Math.round(width)}px`;
        el.style.height = `${Math.round(height)}px`;
        applyOverlayRectForEl(ov, el);
      }
    };

    let raf = 0;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // Immediate update to keep tests and UI responsive
      call(dx, dy, "move");
      // Trailing batch update, if rAF available
      const rafFn =
        typeof requestAnimationFrame === "function"
          ? requestAnimationFrame
          : (fn: FrameRequestCallback) =>
              setTimeout(() => fn(performance.now() as any), 0) as any;
      if (raf) cancelAnimationFrame(raf as any);
      raf = rafFn(() => call(dx, dy, "move")) as any;
    };

    const onUp = () => {
      call(0, 0, "end");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    call(0, 0, "start");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  ov.addEventListener("mousedown", onMouseDown);
}
