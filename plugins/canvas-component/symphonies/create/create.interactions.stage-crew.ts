import {
  hideSelectionOverlay,
  showSelectionOverlay,
} from "../select/select.stage-crew";

export type DragCallbacks = {
  onDragStart?: (info: {
    id: string;
    startPosition: { x: number; y: number };
    mousePosition: { x: number; y: number };
  }) => void;
  onDragMove?: (info: {
    id: string;
    position: { x: number; y: number };
    delta: { x: number; y: number };
  }) => void;
  onDragEnd?: (info: {
    id: string;
    finalPosition: { x: number; y: number };
    totalDelta: { x: number; y: number };
  }) => void;
};

export function attachSelection(
  el: HTMLElement,
  id: string,
  onSelected?: (info: { id: string }) => void
) {
  try {
    (el as any).addEventListener?.("click", (e: Event) => {
      try {
        e.stopPropagation?.();
      } catch {}
      onSelected?.({ id });
    });
  } catch {}
}

export function attachDrag(
  el: HTMLElement,
  canvas: HTMLElement,
  id: string,
  cbs: DragCallbacks
) {
  try {
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let elementStartPos = { x: 0, y: 0 };

    (el as any).addEventListener?.("mousedown", (e: MouseEvent) => {
      if (e.button !== 0) return;
      try {
        e.stopPropagation?.();
      } catch {}
      isDragging = true;
      startPos = { x: e.clientX, y: e.clientY };

      const rect = el.getBoundingClientRect();
      const parentRect = (el.parentElement || canvas).getBoundingClientRect();
      elementStartPos = {
        x: rect.left - parentRect.left,
        y: rect.top - parentRect.top,
      };

      e.preventDefault();

      // Hide selection overlay while dragging
      try {
        hideSelectionOverlay();
      } catch {}

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        const newPos = {
          x: elementStartPos.x + deltaX,
          y: elementStartPos.y + deltaY,
        };
        cbs.onDragMove?.({
          id,
          position: newPos,
          delta: { x: deltaX, y: deltaY },
        });
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        const finalPos = {
          x: elementStartPos.x + deltaX,
          y: elementStartPos.y + deltaY,
        };
        cbs.onDragEnd?.({
          id,
          finalPosition: finalPos,
          totalDelta: { x: deltaX, y: deltaY },
        });
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        // Restore overlay visibility after drag ends
        try {
          showSelectionOverlay({ id });
        } catch {}
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      cbs.onDragStart?.({
        id,
        startPosition: elementStartPos,
        mousePosition: startPos,
      });
    });
  } catch {}
}
