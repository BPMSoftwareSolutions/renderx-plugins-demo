import { getCanvasOrThrow } from "./select.overlay.dom.stage-crew";
import { resolveInteraction, EventRouter } from "@renderx-plugins/host-sdk";
import { recomputeLineSvg } from "../augment/line.recompute.stage-crew";
import { createOverlayStructure, resolveEndpoints } from "./select.overlay.helpers";

function ensureAdvancedLineCss() {
  if (typeof document === "undefined") return;
  const id = "rx-adv-line-overlay-styles";
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  const css = `
  .rx-adv-line-overlay { position:absolute; pointer-events:none; z-index:12; }
  .rx-adv-line-overlay .handle { position:absolute; width:12px; height:12px; border:2px solid #3b82f6; background:#fff; border-radius:50%; pointer-events:auto; box-sizing:border-box; box-shadow:0 0 0 2px rgba(59,130,246,0.35); }
  `;
  if (!(el.textContent || "").includes(".rx-adv-line-overlay")) {
    el.appendChild(document.createTextNode(css));
  }
}

export function ensureAdvancedLineOverlayFor(
  target: HTMLElement
): HTMLDivElement {
  ensureAdvancedLineCss();
  const canvas = getCanvasOrThrow();
  const ov = createOverlayStructure(canvas);

  // Position overlay to match target's bounding box
  const r = target.getBoundingClientRect();
  const cbox = canvas.getBoundingClientRect();
  ov.style.left = `${Math.round(r.left - cbox.left)}px`;
  ov.style.top = `${Math.round(r.top - cbox.top)}px`;
  ov.style.width = `${Math.round(r.width)}px`;
  ov.style.height = `${Math.round(r.height)}px`;

  try {
    // Ensure latest geometry, then derive endpoints from actual SVG + viewBox
    try {
      const svg = target as unknown as SVGSVGElement;
      recomputeLineSvg(svg);
    } catch {}

    const svg = target as unknown as SVGSVGElement;
    try {
      recomputeLineSvg(svg);
    } catch {}

    const pts = resolveEndpoints(target);
    const a = ov.querySelector(".handle.a") as HTMLDivElement | null;
    const b = ov.querySelector(".handle.b") as HTMLDivElement | null;
    if (a) {
      a.style.left = `${Math.round(pts.a.x - 5)}px`;
      a.style.top = `${Math.round(pts.a.y - 5)}px`;
    }
    if (b) {
      b.style.left = `${Math.round(pts.b.x - 5)}px`;
      b.style.top = `${Math.round(pts.b.y - 5)}px`;
    }
  } catch {}
  return ov;
}

export function attachAdvancedLineManipHandlers(
  ov: HTMLDivElement,
  conductor?: any
) {
  if ((ov as any)._rxAdvLineManipAttached) return;
  (ov as any)._rxAdvLineManipAttached = true;

  ov.addEventListener("mousedown", (e: MouseEvent) => {
    const t = e.target as HTMLElement | null;
    if (!t || !t.classList.contains("handle")) return;
    e.preventDefault();

    const handle: "a" | "b" = t.classList.contains("a") ? "a" : "b";

    const id = ov.dataset.targetId;
    if (!id) return;
    const target = document.getElementById(id) as HTMLElement | null;
    if (!target) return;

    const start = { x: e.clientX, y: e.clientY };

    let last = { x: start.x, y: start.y };
    const call = async (phase: "start" | "move" | "end", dx = 0, dy = 0) => {
      const key =
        phase === "start"
          ? "canvas.component.manip.line.start"
          : phase === "end"
          ? "canvas.component.manip.line.end"
          : "canvas.component.manip.line.move";
      const payload: any = { id, handle, dx, dy, phase };
      const play = conductor?.play || (window as any).RenderX?.conductor?.play;
      if (typeof play === "function") {
        // Prefer EventRouter when topic exists; fall back to direct resolveInteraction
        try {
          await EventRouter.publish(
            key,
            payload,
            conductor || (window as any).RenderX?.conductor
          );
          return;
        } catch {
          try {
            const r = resolveInteraction(key);
            await play(r.pluginId, r.sequenceId, payload);
            return;
          } catch {}
        }
      }
      // Fallback: directly update CSS vars on target + recompute (endpoints only)
      if (phase === "move") {
        const isA = handle === "a";
        const baseX = parseFloat(
          target.style.getPropertyValue(isA ? "--x1" : "--x2") || "0"
        );
        const baseY = parseFloat(
          target.style.getPropertyValue(isA ? "--y1" : "--y2") || "0"
        );
        const nx = Math.round(baseX + dx);
        const ny = Math.round(baseY + dy);
        target.style.setProperty(isA ? "--x1" : "--x2", `${nx}`);
        target.style.setProperty(isA ? "--y1" : "--y2", `${ny}`);
        const svg = target as unknown as SVGSVGElement;
        try {
          recomputeLineSvg(svg);
        } catch {}
        // Reposition both handles based on actual SVG geometry to avoid drift
        try {
          // Use shared resolver to compute endpoints (includes viewBox, path sampling, CSS fallback, rotation)
          const pts = resolveEndpoints(target);
          const aEl = ov.querySelector(".handle.a") as HTMLDivElement | null;
          const bEl = ov.querySelector(".handle.b") as HTMLDivElement | null;
          if (aEl) {
            aEl.style.left = `${Math.round(pts.a.x - 5)}px`;
            aEl.style.top = `${Math.round(pts.a.y - 5)}px`;
          }
          if (bEl) {
            bEl.style.left = `${Math.round(pts.b.x - 5)}px`;
            bEl.style.top = `${Math.round(pts.b.y - 5)}px`;
          }
        } catch {
          const endpoint = ov.querySelector(
            isA ? ".handle.a" : ".handle.b"
          ) as HTMLDivElement;
          if (endpoint) {
            endpoint.style.left = `${nx - 5}px`;
            endpoint.style.top = `${ny - 5}px`;
          }
        }
      }
    };

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - last.x;
      const dy = ev.clientY - last.y;
      last = { x: ev.clientX, y: ev.clientY };
      void call("move", dx, dy);
    };
    const onUp = () => {
      void call("end");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    void call("start");
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}
