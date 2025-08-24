import { resolveInteraction } from "../../../src/interactionManifest";
import { getContainerOf, getLocalPoint } from "./coordinates";
import {
  hideSelectionOverlay,
  showSelectionOverlay,
} from "../../canvas-component/symphonies/select/select.stage-crew";

export type ContainerDragCallbacks = {
  onDragStart?: (info: {
    id: string;
    startPosition: { x: number; y: number };
    mousePosition: { x: number; y: number };
    containerId?: string;
  }) => void;
  onDragMove?: (info: {
    id: string;
    position: { x: number; y: number };
    delta: { x: number; y: number };
    containerId?: string;
  }) => void;
  onDragEnd?: (info: {
    id: string;
    finalPosition: { x: number; y: number };
    totalDelta: { x: number; y: number };
    containerId?: string;
  }) => void;
};

export function attachContainerAwareDrag(
  el: HTMLElement,
  canvas: HTMLElement,
  id: string,
  cbs: ContainerDragCallbacks,
  conductor?: any
) {
  try {
    let isDragging = false;
    let startPos = { x: 0, y: 0 };
    let elementStartPos = { x: 0, y: 0 };
    let container: HTMLElement | null = null;

    (el as any).addEventListener?.("mousedown", (e: MouseEvent) => {
      if (e.button !== 0) return;
      isDragging = true;
      startPos = { x: e.clientX, y: e.clientY };

      // Detect if element is inside a container
      container = getContainerOf(el);
      
      const rect = el.getBoundingClientRect();
      const originRect = (container || canvas).getBoundingClientRect();
      elementStartPos = {
        x: rect.left - originRect.left,
        y: rect.top - originRect.top,
      };

      e.preventDefault();

      // Hide selection overlay while dragging
      try {
        hideSelectionOverlay();
      } catch {}

      // Route drag start to appropriate handler
      if (conductor && container) {
        try {
          const r = resolveInteraction("container.component.drag.start");
          conductor.play(r.pluginId, r.sequenceId, {
            nodeId: id,
            containerId: container.id,
            position: elementStartPos,
          });
        } catch (err) {
          console.warn("Failed to route container drag start:", err);
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startPos.x;
        const deltaY = e.clientY - startPos.y;
        const newPos = {
          x: elementStartPos.x + deltaX,
          y: elementStartPos.y + deltaY,
        };

        // Route drag move to appropriate handler
        if (conductor && container) {
          try {
            const r = resolveInteraction("container.component.drag.move");
            conductor.play(r.pluginId, r.sequenceId, {
              nodeId: id,
              containerId: container.id,
              position: newPos,
            });
          } catch (err) {
            console.warn("Failed to route container drag move:", err);
          }
        } else {
          // Fallback to callback for canvas drag
          cbs.onDragMove?.({
            id,
            position: newPos,
            delta: { x: deltaX, y: deltaY },
          });
        }
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

        // Route drag end to appropriate handler
        if (conductor && container) {
          try {
            const r = resolveInteraction("container.component.drag.end");
            conductor.play(r.pluginId, r.sequenceId, {
              nodeId: id,
              containerId: container.id,
              finalPosition: finalPos,
            });
          } catch (err) {
            console.warn("Failed to route container drag end:", err);
          }
        } else {
          // Fallback to callback for canvas drag
          cbs.onDragEnd?.({
            id,
            finalPosition: finalPos,
            totalDelta: { x: deltaX, y: deltaY },
          });
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        
        // Restore overlay visibility after drag ends
        try {
          showSelectionOverlay({ id });
        } catch {}
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Call drag start callback
      cbs.onDragStart?.({
        id,
        startPosition: elementStartPos,
        mousePosition: startPos,
        containerId: container?.id,
      });
    });
  } catch {}
}

export function attachContainerAwareSelection(
  el: HTMLElement,
  id: string,
  conductor?: any,
  onSelected?: (info: { id: string; containerId?: string }) => void
) {
  try {
    (el as any).addEventListener?.("click", () => {
      const container = getContainerOf(el);
      
      if (conductor && container) {
        try {
          const r = resolveInteraction("container.component.select");
          conductor.play(r.pluginId, r.sequenceId, {
            nodeId: id,
            containerId: container.id,
          });
        } catch (err) {
          console.warn("Failed to route container selection:", err);
        }
      }
      
      onSelected?.({ id, containerId: container?.id });
    });
  } catch {}
}
