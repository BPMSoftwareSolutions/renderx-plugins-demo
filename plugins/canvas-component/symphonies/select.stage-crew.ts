function ensureOverlayCss() {
  if (typeof document === "undefined") return;
  const id = "rx-components-styles";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  const css = `
  .rx-selection-overlay { position:absolute; border: 1px solid #3b82f6; box-shadow: 0 0 0 1px #fff inset; pointer-events: none; z-index: 10; }
  .rx-selection-overlay .rx-handle { position:absolute; width:8px; height:8px; background:#3b82f6; border:1px solid #fff; border-radius:50%; box-sizing:border-box; pointer-events: auto; }
  .rx-selection-overlay .rx-handle.nw { left:-4px; top:-4px; cursor: nwse-resize; }
  .rx-selection-overlay .rx-handle.n  { left:50%; top:-4px; transform: translateX(-50%); cursor: ns-resize; }
  .rx-selection-overlay .rx-handle.ne { right:-4px; top:-4px; cursor: nesw-resize; }
  .rx-selection-overlay .rx-handle.e  { right:-4px; top:50%; transform: translateY(-50%); cursor: ew-resize; }
  .rx-selection-overlay .rx-handle.se { right:-4px; bottom:-4px; cursor: nwse-resize; }
  .rx-selection-overlay .rx-handle.s  { left:50%; bottom:-4px; transform: translateX(-50%); cursor: ns-resize; }
  .rx-selection-overlay .rx-handle.sw { left:-4px; bottom:-4px; cursor: nesw-resize; }
  .rx-selection-overlay .rx-handle.w  { left:-4px; top:50%; transform: translateY(-50%); cursor: ew-resize; }
  `;
  if (!(el.textContent || "").includes("rx-selection-overlay")) {
    el.appendChild(document.createTextNode(css));
  }
}

function getCanvasRect() {
  const canvas = document.getElementById("rx-canvas") as HTMLElement | null;
  if (!canvas) throw new Error("#rx-canvas not found");
  return canvas.getBoundingClientRect();
}

function applyOverlayRectForEl(ov: HTMLDivElement, el: HTMLElement) {
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

function attachResizeHandlers(ov: HTMLDivElement) {
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
    const styleLeft = parseFloat(el.style.left || "");
    const styleTop = parseFloat(el.style.top || "");
    const styleWidth = parseFloat(el.style.width || "");
    const styleHeight = parseFloat(el.style.height || "");
    const startLeft = Number.isFinite(styleLeft)
      ? styleLeft
      : rect.left - canvasRect.left;
    const startTop = Number.isFinite(styleTop)
      ? styleTop
      : rect.top - canvasRect.top;
    const startWidth = Number.isFinite(styleWidth) ? styleWidth : rect.width;
    const startHeight = Number.isFinite(styleHeight)
      ? styleHeight
      : rect.height;
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

function ensureOverlay() {
  ensureOverlayCss();
  const canvas = document.getElementById("rx-canvas") as HTMLElement | null;
  if (!canvas) throw new Error("#rx-canvas not found");
  let ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "rx-selection-overlay";
    ov.className = "rx-selection-overlay";
    // add 8 handles
    const positions = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
    for (const p of positions) {
      const h = document.createElement("div");
      h.className = `rx-handle ${p}`;
      ov.appendChild(h);
    }
    canvas.appendChild(ov);
  }
  attachResizeHandlers(ov);
  return ov;
}

export function showSelectionOverlay(data: any) {
  const { id } = data || {};
  if (!id) return;
  const el = document.getElementById(String(id)) as HTMLElement | null;
  if (!el) return;
  const ov = ensureOverlay();
  ov.dataset.targetId = String(id);
  applyOverlayRectForEl(ov, el);
}

export function hideSelectionOverlay() {
  const ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (ov) ov.style.display = "none";
}
