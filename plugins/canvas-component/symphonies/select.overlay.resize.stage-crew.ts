import { applyOverlayRectForEl, getCanvasRect } from "./select.overlay.dom.stage-crew";

function readNumericPx(value: string): number | null {
  const n = parseFloat(value || "");
  return Number.isFinite(n) ? n : null;
}

export function attachResizeHandlers(ov: HTMLDivElement) {
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

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
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
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  ov.addEventListener("mousedown", onMouseDown);
}

