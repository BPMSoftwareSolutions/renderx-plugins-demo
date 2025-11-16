import { getCanvasRect } from "./select.overlay.dom.stage-crew";
import { resolveInteraction, EventRouter } from "@renderx-plugins/host-sdk";

// Import diagnostics from the host (will be available at runtime)
function getDiagnosticsEmitter() {
  try {
    return (window as any)?.RenderX?.diagnostics?.emitDiagnostic;
  } catch {
    return null;
  }
}

function readNumericPx(value: string): number | null {
  const n = parseFloat(value || "");
  return Number.isFinite(n) ? n : null;
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

    // Respect per-element enable flag
    const cfg = getResizeConfig(el);
    if (!cfg.enabled) return;

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

	    const clamp = (value: number, min: number) =>
	      value < min ? min : value;

	    let lastMoveRect:
	      | { left: number; top: number; width: number; height: number }
	      | null = null;

	    const computeMoveRect = (dx: number, dy: number) => {
	      let left = startLeft;
	      let top = startTop;
	      let width = startWidth;
	      let height = startHeight;

	      const dxNumber = Number(dx);
	      const dyNumber = Number(dy);
	      if (!Number.isFinite(dxNumber) || !Number.isFinite(dyNumber)) {
	        return {
	          left: startLeft,
	          top: startTop,
	          width: startWidth,
	          height: startHeight,
	        };
	      }

	      const dirStr = String(dir);
	      const safeDx = dxNumber;
	      const safeDy = dyNumber;

	      if (dirStr.includes("e")) {
	        width = clamp(startWidth + safeDx, cfg.minW);
	      }
	      if (dirStr.includes("s")) {
	        height = clamp(startHeight + safeDy, cfg.minH);
	      }
	      if (dirStr.includes("w")) {
	        const nextWidth = clamp(startWidth - safeDx, cfg.minW);
	        const delta = startWidth - nextWidth;
	        width = nextWidth;
	        left = startLeft + delta;
	      }
	      if (dirStr.includes("n")) {
	        const nextHeight = clamp(startHeight - safeDy, cfg.minH);
	        const delta = startHeight - nextHeight;
	        height = nextHeight;
	        top = startTop + delta;
	      }

	      return { left, top, width, height };
	    };


    const call = (
      dx: number,
      dy: number,
      event: "start" | "move" | "end" = "move"
    ) => {
      // Conductor must always be available - no fallback
      if (!conductor?.play) {
        throw new Error(
          "Conductor is required for resize operations but was not provided"
        );
      }

      const base = { id, dir, startLeft, startTop, startWidth, startHeight };
      let payload: any;
      let key: string;

      if (event === "move") {
        const geom = computeMoveRect(dx, dy);
        const rounded = {
          left: Math.round(geom.left),
          top: Math.round(geom.top),
          width: Math.round(geom.width),
          height: Math.round(geom.height),
        };

        if (
          lastMoveRect &&
          lastMoveRect.left === rounded.left &&
          lastMoveRect.top === rounded.top &&
          lastMoveRect.width === rounded.width &&
          lastMoveRect.height === rounded.height
        ) {
          // Geometry has not changed since the last emitted move; skip publishing
          return;
        }

        lastMoveRect = rounded;
        payload = { ...base, dx, dy, phase: "move" };
        key = "canvas.component.resize.move";
      } else {
        if (event === "end") {
          // Reset cache at the end of a drag so the next drag starts clean
          lastMoveRect = null;
        }
        payload = { ...base, phase: event };
        key =
          event === "start"
            ? "canvas.component.resize.start"
            : "canvas.component.resize.end";
      }

      try {
        EventRouter.publish(key, payload, conductor);

        // Emit diagnostic event for this publish
        const emitDiagnostic = getDiagnosticsEmitter();
        if (emitDiagnostic) {
          emitDiagnostic({
            timestamp: new Date().toISOString(),
            level: "debug",
            source: "EventRouter",
            message: `Topic '${key}' published from resize handler`,
            data: { topic: key, payload },
          });
        }
      } catch {
        // Fallback to direct interaction routing if EventRouter fails
        const r = resolveInteraction(key);
        conductor.play(r.pluginId, r.sequenceId, payload);
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
      // cancel any pending trailing rAF move to avoid post-end calls
      try {
        if (raf) cancelAnimationFrame(raf as any);
      } catch {}
      raf = 0 as any;
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
