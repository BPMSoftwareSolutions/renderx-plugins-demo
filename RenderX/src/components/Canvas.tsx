/**
 * Canvas Component
 * Main workspace for drag-and-drop component placement
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import CanvasElement from "./CanvasElement";
import DragPreview from "./DragPreview";
import {
  generateAndInjectComponentCSS,
  injectSelectionStyles,
} from "../utils/cssUtils";
import {
  getGlobalDragData,
  applyClickOffsetCompensation,
  syncVisualToolsPosition,
} from "../utils/dragUtils";
import type { CanvasProps } from "../types/AppTypes";

const Canvas: React.FC<CanvasProps> = ({
  mode,
  onCanvasElementDragStart,
  onCanvasElementDragEnd,
}) => {
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // State for real-time drag preview with click offset compensation
  const [dragPreview, setDragPreview] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    clickOffset: { x: 0, y: 0 },
    componentData: null,
    elementType: "component",
  });

  // ✅ THIN CLIENT: Subscribe to plugin events for state updates via conductor
  useEffect(() => {
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem?.conductor) {
      console.log(
        "🎼 [THIN CLIENT] Canvas: Subscribing to plugin events via conductor"
      );

      // Subscribe to canvas element updates from plugins
      const handleElementAdded = (data: any) => {
        console.log("🎼 [THIN CLIENT] Canvas: Element added by plugin", data);

        // 🎽 Try to get element data from the data baton first
        const elementData = data?.context?.payload?.elementData || data.element;

        console.log("🎼 [THIN CLIENT] Canvas: Element data:", elementData);
        console.log(
          "🎽 [THIN CLIENT] Canvas: Baton payload:",
          data?.context?.payload
        );

        if (elementData) {
          console.log(
            "🎼 [THIN CLIENT] Canvas: Adding element to canvas state"
          );
          setCanvasElements((prev) => {
            const newElements = [...prev, elementData];
            console.log(
              "🎼 [THIN CLIENT] Canvas: New canvas elements:",
              newElements
            );
            return newElements;
          });
        } else {
          console.warn(
            "🚨 [THIN CLIENT] Canvas: Plugin sequence completed without elementData in payload.",
            {
              pluginEvent: data,
              payload: data?.context?.payload,
              fallbackElement: data.element,
            }
          );
        }
      };

      const handleElementMoved = (data: any) => {
        console.log("🎼 [THIN CLIENT] Canvas: Element moved by plugin", data);
        if (data.elementId && data.position) {
          setCanvasElements((prev) =>
            prev.map((el) =>
              el.id === data.elementId ? { ...el, position: data.position } : el
            )
          );
        }
      };

      const handleElementRemoved = (data: any) => {
        console.log("🎼 [THIN CLIENT] Canvas: Element removed by plugin", data);
        if (data.elementId) {
          setCanvasElements((prev) =>
            prev.filter((el) => el.id !== data.elementId)
          );
        }
      };

      const handleDragPreviewUpdate = (data: any) => {
        console.log(
          "🎼 [THIN CLIENT] Canvas: Drag preview update from plugin",
          data
        );
        if (data.preview) {
          setDragPreview(data.preview);
        }
      };

      const handleDragOverState = (data: any) => {
        console.log(
          "🎼 [THIN CLIENT] Canvas: Drag over state from plugin",
          data
        );
        if (typeof data.isDragOver === "boolean") {
          setIsDragOver(data.isDragOver);
        }
      };

      // Subscribe to events via conductor (SPA-compliant)
      const unsubscribe1 = communicationSystem.conductor.subscribe(
        "canvas-element-created",
        handleElementAdded
      );
      const unsubscribe2 = communicationSystem.conductor.subscribe(
        "canvas-element-positioned",
        handleElementAdded // Also handle positioning as element addition
      );
      const unsubscribe3 = communicationSystem.conductor.subscribe(
        "canvas-element-moved",
        handleElementMoved
      );
      const unsubscribe4 = communicationSystem.conductor.subscribe(
        "canvas-element-deleted",
        handleElementRemoved
      );
      const unsubscribe5 = communicationSystem.conductor.subscribe(
        "Canvas:drag:preview:update",
        handleDragPreviewUpdate
      );
      const unsubscribe6 = communicationSystem.conductor.subscribe(
        "Canvas:drag:over:state",
        handleDragOverState
      );

      // Cleanup subscriptions using unsubscribe functions (SPA-compliant)
      return () => {
        unsubscribe1();
        unsubscribe2();
        unsubscribe3();
        unsubscribe4();
        unsubscribe5();
        unsubscribe6();
      };
    }
  }, []);

  // Drop handlers - THIN CLIENT APPROACH
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // Basic dropEffect setting - let plugin handle complex logic
    if (e.dataTransfer.effectAllowed === "move") {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "copy";
    }

    setIsDragOver(true);

    // Get coordinates for the conductor.play() call
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const coordinates = {
      x: Math.round(e.clientX - canvasRect.left),
      y: Math.round(e.clientY - canvasRect.top),
    };

    // 🎼 THIN CLIENT: Check what type of drag this is before calling symphony
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem) {
      try {
        const dragDataString = e.dataTransfer.getData("application/json");
        const dragData = dragDataString ? JSON.parse(dragDataString) : null;

        if (dragData?.isCanvasElement) {
          // Canvas element drag over - call Component.drag-symphony
          communicationSystem.conductor.play(
            "Component.drag-symphony",
            "Component Drag Symphony No. 4",
            {
              event: {
                clientX: e.clientX,
                clientY: e.clientY,
                currentTarget: e.currentTarget,
                dataTransfer: e.dataTransfer,
              },
              coordinates,
              timestamp: Date.now(),
              source: "canvas-dragover",
            }
          );
        } else {
          // Library element drag over - no symphony needed, just UI feedback
          // (silent - no logging needed for frequent dragover events)
        }
      } catch (error) {
        // If we can't parse drag data, assume it's library drag and do nothing
        console.log(
          "🎼 [THIN CLIENT] Drag over - unable to determine drag type, skipping symphony"
        );
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Hide drag preview when leaving canvas
    setDragPreview((prev) => ({ ...prev, isVisible: false }));

    // 🎼 THIN CLIENT: Check what type of drag this is before calling symphony
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem) {
      try {
        const dragDataString = e.dataTransfer.getData("application/json");
        const dragData = dragDataString ? JSON.parse(dragDataString) : null;

        if (dragData?.isCanvasElement) {
          // Canvas element drag leave - call Component.drag-symphony
          const canvasRect = e.currentTarget.getBoundingClientRect();
          const coordinates = {
            x: Math.round(e.clientX - canvasRect.left),
            y: Math.round(e.clientY - canvasRect.top),
          };

          communicationSystem.conductor.play(
            "Component.drag-symphony",
            "Component Drag Symphony No. 4",
            {
              event: {
                clientX: e.clientX,
                clientY: e.clientY,
                currentTarget: e.currentTarget,
                dataTransfer: e.dataTransfer,
              },
              coordinates,
              timestamp: Date.now(),
              source: "canvas-dragleave",
            }
          );
        } else {
          // Library element drag leave - no symphony needed, just UI cleanup
          // (silent - no logging needed for drag leave events)
        }
      } catch (error) {
        // If we can't parse drag data, assume it's library drag and do nothing
        console.log(
          "🎼 [THIN CLIENT] Drag leave - unable to determine drag type, skipping symphony"
        );
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    console.log(
      "🎼 [THIN CLIENT] Canvas handleDrop called - drop event received!"
    );
    e.preventDefault();
    setIsDragOver(false);

    // Hide drag preview on drop
    setDragPreview((prev) => ({ ...prev, isVisible: false }));

    // 🎼 THIN CLIENT: Only call conductor.play() - let plugins handle ALL drop logic
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem) {
      // Get basic drop coordinates for the plugin
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const coordinates = {
        x: Math.round(e.clientX - canvasRect.left),
        y: Math.round(e.clientY - canvasRect.top),
      };

      // Check if this is a canvas element move or library drop
      try {
        const dragDataString = e.dataTransfer.getData("application/json");
        const dragData = dragDataString ? JSON.parse(dragDataString) : null;

        if (dragData?.isCanvasElement) {
          // Canvas element move - call Component.drag-symphony
          console.log(
            "🎼 [THIN CLIENT] Canvas element move - calling Component.drag-symphony"
          );
          communicationSystem.conductor.play(
            "Component.drag-symphony",
            "Component Drag Symphony No. 4",
            {
              event: e,
              coordinates,
              dragData,
              timestamp: Date.now(),
              source: "canvas-element-drop",
            }
          );
        } else {
          // Library element drop - call ElementLibrary.library-drop-symphony
          console.log(
            "🎼 [THIN CLIENT] Library element drop - calling ElementLibrary.library-drop-symphony"
          );
          communicationSystem.conductor.play(
            "Library.component-drop-symphony",
            "Library.component-drop-symphony",
            {
              event: e,
              coordinates,
              dragData,
              timestamp: Date.now(),
              source: "canvas-library-drop",
              onComponentCreated: (payload) => {
                try {
                  console.log("🧩 Canvas.onComponentCreated", payload);
                  setCanvasElements((prev) => [
                    ...prev,
                    {
                      id: payload.id,
                      type: payload.type,
                      cssClass: payload.cssClass,
                      position: payload.position,
                      componentData: payload.component,
                      metadata: payload.component?.metadata,
                    },
                  ]);
                } catch (err) {
                  console.warn("⚠️ Failed to handle onComponentCreated", err);
                }
              },
            }
          );
        }
      } catch (error) {
        console.error("🎼 [THIN CLIENT] Failed to parse drag data:", error);
        // Fallback to library drop
        communicationSystem.conductor.play(
          "Library.component-drop-symphony",
          "Library.component-drop-symphony",
          {
            event: e,
            coordinates,
            timestamp: Date.now(),
            source: "canvas-drop-fallback",
          }
        );
      }
    } else {
      console.warn(
        "🎼 [THIN CLIENT] Communication system not available for drop handling"
      );
    }
  };

  return (
    <div className={`canvas-container canvas-container--${mode}`}>
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left">
          <button className="toolbar-button" disabled>
            💾 Save
          </button>
          <button className="toolbar-button" disabled>
            📁 Load
          </button>
          <button className="toolbar-button" disabled>
            ↩️ Undo
          </button>
          <button className="toolbar-button" disabled>
            ↪️ Redo
          </button>
        </div>
        <div className="canvas-toolbar-center">
          <span className="canvas-title">Untitled Canvas</span>
        </div>
        <div className="canvas-toolbar-right">
          <button className="toolbar-button" disabled>
            🔍 Zoom
          </button>
          <button className="toolbar-button" disabled>
            ⚙️ Settings
          </button>
        </div>
      </div>
      <div className="canvas-workspace">
        <div className="canvas-grid"></div>
        <div
          className={`canvas-content ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {canvasElements.length === 0 ? (
            <div className="canvas-placeholder">
              <h3>Canvas Workspace</h3>
              <p>Drag components from Element Library to add them</p>
              <p>Mode: {mode}</p>
            </div>
          ) : (
            <>
              {canvasElements.map((element) => {
                // Generate stable element ID and CSS class (should be done once when element is created)
                const elementId =
                  element.elementId ||
                  element.id ||
                  `rx-${Math.random().toString(36).slice(2, 8)}`;
                const cssClass =
                  element.cssClass ||
                  `rx-comp-${(
                    element.type || "comp"
                  ).toLowerCase()}-${Math.random().toString(36).slice(2, 8)}`;

                // Render component using data-driven approach
                const pos = element.position || { x: 0, y: 0 };
                // Debug position rendering
                try {
                  console.log("[Canvas] render element position", {
                    id: elementId,
                    type: element.type,
                    pos,
                  });
                } catch {}

                return (
                  <CanvasElement
                    key={element.id}
                    element={{ ...element, position: pos }}
                    elementId={elementId}
                    cssClass={cssClass}
                    onDragStart={onCanvasElementDragStart}
                    onDragEnd={onCanvasElementDragEnd}
                  />
                );
              })}
            </>
          )}

          {/* Real-time drag preview with click offset compensation */}
          <DragPreview
            isVisible={dragPreview.isVisible}
            position={dragPreview.position}
            clickOffset={dragPreview.clickOffset}
            componentData={dragPreview.componentData}
            elementType={dragPreview.elementType}
          />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
