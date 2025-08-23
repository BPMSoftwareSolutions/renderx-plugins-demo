import { ensureOverlay } from "./select.overlay.dom.stage-crew";
import { attachResizeHandlers } from "./select.overlay.resize.stage-crew";
import { applyOverlayRectForEl } from "./select.overlay.dom.stage-crew";
import {
  attachLineResizeHandlers,
  ensureLineOverlayFor,
} from "./select.overlay.line-resize.stage-crew";

function getOverlayKindFor(el: HTMLElement): "line" | "box" {
  // Prefer data-overlay from template; fallback to class heuristic while we migrate
  const ov = el.getAttribute("data-overlay");
  if (ov === "line") return "line";
  return el.classList.contains("rx-line") ? "line" : "box";
}

export function showSelectionOverlay(data: any, ctx?: any) {
  const { id } = data || {};
  if (!id) return;
  const el = document.getElementById(String(id)) as HTMLElement | null;
  if (!el) return;

  // Delegate by overlay kind rather than component internals
  const kind = getOverlayKindFor(el);
  if (kind === "line") {
    const lov = ensureLineOverlayFor(el);
    attachLineResizeHandlers(lov, ctx?.conductor);
    lov.dataset.targetId = String(id);
    lov.style.display = "block";
    return;
  }

  const ov = ensureOverlay();
  attachResizeHandlers(ov, ctx?.conductor);
  ov.dataset.targetId = String(id);
  ov.style.display = "block";
  applyOverlayRectForEl(ov, el);
}

export function hideSelectionOverlay() {
  const ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (ov) ov.style.display = "none";
}
