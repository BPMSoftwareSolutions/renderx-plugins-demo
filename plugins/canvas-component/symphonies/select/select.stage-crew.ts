import { ensureOverlay } from "./select.overlay.dom.stage-crew";
import { attachResizeHandlers } from "./select.overlay.resize.stage-crew";
import { applyOverlayRectForEl } from "./select.overlay.dom.stage-crew";
import { useConductor } from "../../../../src/conductor";

function configureHandlesVisibility(ov: HTMLDivElement, targetEl: HTMLElement) {
  const handlesAttr = targetEl.getAttribute("data-resize-handles");
  const allow = new Set(
    (handlesAttr || "nw,n,ne,e,se,s,sw,w")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const handleEls = ov.querySelectorAll<HTMLDivElement>(".rx-handle");
  handleEls.forEach((h) => {
    const dir = Array.from(h.classList).find((c) =>
      ["n", "s", "e", "w", "nw", "ne", "sw", "se"].includes(c)
    );
    (h.style as CSSStyleDeclaration).display =
      dir && allow.has(dir) ? "block" : "none";
  });
}

export function showSelectionOverlay(data: any, ctx?: any) {
  const { id } = data || {};
  if (!id) return;
  const el = document.getElementById(String(id)) as HTMLElement | null;
  if (!el) return;

  // Always use the standard selection overlay; behavior is data-driven via attributes
  const ov = ensureOverlay();
  // Use conductor from context if provided, otherwise get from global context
  const conductor = ctx?.conductor || useConductor();
  attachResizeHandlers(ov, conductor);
  ov.dataset.targetId = String(id);
  configureHandlesVisibility(ov, el);
  ov.style.display = "block";
  applyOverlayRectForEl(ov, el);
}

export function hideSelectionOverlay() {
  const ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (ov) ov.style.display = "none";
}
