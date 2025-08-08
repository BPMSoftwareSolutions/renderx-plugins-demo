/**
 * Drag Utilities
 * Helper functions for drag and drop operations with click offset compensation
 */

export interface ClickOffset {
  x: number;
  y: number;
}

/**
 * Captures the click offset within an element during drag start
 * Handles both React synthetic events and native DOM events with robust fallbacks
 */
export function captureClickOffset(event: any): ClickOffset {
  let clickOffset: ClickOffset = { x: 0, y: 0 };
  
  try {
    // Method 1: React synthetic event with nativeEvent
    if (event.nativeEvent && typeof event.nativeEvent.offsetX === 'number') {
      clickOffset = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };
      console.log("🎯 Click offset captured via nativeEvent:", clickOffset);
      return clickOffset;
    }
    
    // Method 2: Native DOM event with offsetX/Y
    if (typeof event.offsetX === 'number') {
      clickOffset = {
        x: event.offsetX,
        y: event.offsetY,
      };
      console.log("🎯 Click offset captured via offsetX/Y:", clickOffset);
      return clickOffset;
    }
    
    // Method 3: Calculate from element bounds and client coordinates
    const target = event.currentTarget || event.target;
    if (target && target.getBoundingClientRect && typeof event.clientX === 'number') {
      const rect = target.getBoundingClientRect();
      clickOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      console.log("🎯 Click offset calculated from bounds:", clickOffset);
      return clickOffset;
    }
    
    // Method 4: Fallback to element center
    if (target && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      clickOffset = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
      console.warn("🎯 Using element center as click offset fallback:", clickOffset);
      return clickOffset;
    }
    
  } catch (error) {
    console.warn("🎯 Error capturing click offset:", error);
  }
  
  // Final fallback
  console.warn("🎯 Using zero offset as final fallback");
  return { x: 0, y: 0 };
}

/**
 * Applies click offset compensation to a position
 */
export function applyClickOffsetCompensation(
  rawPosition: { x: number; y: number },
  clickOffset: ClickOffset
): { x: number; y: number } {
  return {
    x: rawPosition.x - clickOffset.x,
    y: rawPosition.y - clickOffset.y,
  };
}

/**
 * Stores drag data globally for access during HTML5 dragover events
 */
export function storeDragDataGlobally(dragData: any): void {
  (window as any).currentDragData = dragData;
}

/**
 * Retrieves globally stored drag data
 */
export function getGlobalDragData(): any {
  return (window as any).currentDragData || null;
}

/**
 * Cleans up globally stored drag data
 */
export function clearGlobalDragData(): void {
  (window as any).currentDragData = null;
}

/**
 * Validates that click offset values are reasonable
 */
export function validateClickOffset(clickOffset: ClickOffset, elementSize?: { width: number; height: number }): boolean {
  // Basic validation
  if (typeof clickOffset.x !== 'number' || typeof clickOffset.y !== 'number') {
    return false;
  }

  if (clickOffset.x < 0 || clickOffset.y < 0) {
    return false;
  }

  // If element size is provided, ensure offset is within bounds
  if (elementSize) {
    if (clickOffset.x > elementSize.width || clickOffset.y > elementSize.height) {
      return false;
    }
  }

  return true;
}

/**
 * Synchronizes visual selection tools (resize handles, selection outline) with element position
 * Should be called after element position changes during drag operations
 */
export function syncVisualToolsPosition(elementId: string, delay: number = 10): void {
  setTimeout(() => {
    try {
      const element = document.getElementById(elementId);
      if (!element || !element.classList.contains('rx-selected-with-handles')) {
        return;
      }

      console.log("🎯 DragUtils: Syncing visual tools for element:", elementId);

      // Update resize handles position if they exist
      const handlesId = element.dataset.resizeHandlesId;
      if (handlesId) {
        const handlesContainer = document.getElementById(handlesId);
        if (handlesContainer) {
          // Recalculate position based on element's current position
          const bounds = element.getBoundingClientRect();
          const canvasContainer = element.closest('.canvas-content');
          if (canvasContainer) {
            const canvasRect = canvasContainer.getBoundingClientRect();
            const relativeLeft = bounds.left - canvasRect.left;
            const relativeTop = bounds.top - canvasRect.top;

            handlesContainer.style.left = `${relativeLeft}px`;
            handlesContainer.style.top = `${relativeTop}px`;
            handlesContainer.style.width = `${bounds.width}px`;
            handlesContainer.style.height = `${bounds.height}px`;

            // Get component's actual CSS position for comparison
            const computedStyle = window.getComputedStyle(element);
            const componentCSSLeft = parseInt(computedStyle.left) || 0;
            const componentCSSTop = parseInt(computedStyle.top) || 0;

            console.log("🎯 DragUtils: Visual tools synced to position:", {
              elementId,
              visualToolsPosition: { left: relativeLeft, top: relativeTop },
              componentBounds: { left: bounds.left, top: bounds.top },
              componentCSSPosition: { left: componentCSSLeft, top: componentCSSTop },
              coordinatesMatch: (Math.abs(relativeLeft - componentCSSLeft) < 5 && Math.abs(relativeTop - componentCSSTop) < 5),
              width: bounds.width,
              height: bounds.height
            });
          }
        }
      }
    } catch (error) {
      console.warn("🎯 DragUtils: Failed to sync visual tools:", error);
    }
  }, delay);
}
