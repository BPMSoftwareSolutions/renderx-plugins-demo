import { ensureOverlay } from "./select.overlay.dom.stage-crew";
import { attachResizeHandlers } from "./select.overlay.resize.stage-crew";
import { applyOverlayRectForEl } from "./select.overlay.dom.stage-crew";

export function showSelectionOverlay(data: any, ctx?: any) {
  const { id } = data || {};
  if (!id) return;
  const el = document.getElementById(String(id)) as HTMLElement | null;
  if (!el) return;
  const ov = ensureOverlay();
  attachResizeHandlers(ov, ctx?.conductor);
  ov.dataset.targetId = String(id);
  // Explicitly unhide before applying rect
  ov.style.display = "block";
  applyOverlayRectForEl(ov, el);
}

export function hideSelectionOverlay() {
  const ov = document.getElementById(
    "rx-selection-overlay"
  ) as HTMLDivElement | null;
  if (ov) ov.style.display = "none";
}
