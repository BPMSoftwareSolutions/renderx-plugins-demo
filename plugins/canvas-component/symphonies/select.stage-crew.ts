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
  .rx-selection-overlay .rx-handle { position:absolute; width:8px; height:8px; background:#3b82f6; border:1px solid #fff; border-radius:50%; box-sizing:border-box; }
  .rx-selection-overlay .rx-handle.nw { left:-4px; top:-4px; }
  .rx-selection-overlay .rx-handle.n  { left:50%; top:-4px; transform: translateX(-50%); }
  .rx-selection-overlay .rx-handle.ne { right:-4px; top:-4px; }
  .rx-selection-overlay .rx-handle.e  { right:-4px; top:50%; transform: translateY(-50%); }
  .rx-selection-overlay .rx-handle.se { right:-4px; bottom:-4px; }
  .rx-selection-overlay .rx-handle.s  { left:50%; bottom:-4px; transform: translateX(-50%); }
  .rx-selection-overlay .rx-handle.sw { left:-4px; bottom:-4px; }
  .rx-selection-overlay .rx-handle.w  { left:-4px; top:50%; transform: translateY(-50%); }
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

function ensureOverlay() {
  ensureOverlayCss();
  const canvas = document.getElementById("rx-canvas") as HTMLElement | null;
  if (!canvas) throw new Error("#rx-canvas not found");
  let ov = document.getElementById("rx-selection-overlay") as HTMLDivElement | null;
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "rx-selection-overlay";
    ov.className = "rx-selection-overlay";
    // add 8 handles
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

export function showSelectionOverlay(data: any) {
  const { id } = data || {};
  if (!id) return;
  const el = document.getElementById(String(id)) as HTMLElement | null;
  if (!el) return;
  const canvasRect = getCanvasRect();
  const r = el.getBoundingClientRect();
  const ov = ensureOverlay();
  Object.assign(ov.style, {
    left: `${Math.round(r.left - canvasRect.left)}px`,
    top: `${Math.round(r.top - canvasRect.top)}px`,
    width: `${Math.round(r.width)}px`,
    height: `${Math.round(r.height)}px`,
    display: "block",
  } as Partial<CSSStyleDeclaration>);
}

export function hideSelectionOverlay() {
  const ov = document.getElementById("rx-selection-overlay") as HTMLDivElement | null;
  if (ov) ov.style.display = "none";
}

