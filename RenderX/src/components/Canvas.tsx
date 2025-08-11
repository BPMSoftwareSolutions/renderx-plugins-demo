/**
 * Canvas Component
 * Main workspace for drag-and-drop component placement
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import CanvasElement from "./CanvasElement";
import DragPreview from "./DragPreview";
import VisualTools from "./VisualTools";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // State for real-time drag preview with click offset compensation
  const [dragPreview, setDragPreview] = useState({
    isVisible: false,
    position: { x: 0, y: 0 },
    clickOffset: { x: 0, y: 0 },
    componentData: null,
    elementType: "component",
  });

  // Selection state from custom event dispatched by CanvasElement
  useEffect(() => {
    const onSelection = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id: string | null };
      setSelectedId(detail?.id ?? null);
    };
    window.addEventListener("renderx:selection:update", onSelection as any);
    return () =>
      window.removeEventListener(
        "renderx:selection:update",
        onSelection as any
      );
  }, []);

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

  // Helper: check CIA readiness (mounted plugins > 0)
  const isCIAReady = () => {
    try {
      const cs = (window as any).renderxCommunicationSystem;
      const mounted = Array.isArray(cs?.conductor?.getMountedPluginIds?.())
        ? cs.conductor.getMountedPluginIds().length
        : 0;
      return mounted > 0;
    } catch {
      return false;
    }
  };

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
    if (communicationSystem && isCIAReady()) {
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
        "🎼 [THIN CLIENT] Communication system or CIA plugins not ready for drop handling"
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
                // Use a stable identifier for all interactions to avoid drag origin resets
                // Prefer element.id (created by plugins). Fallback to element.elementId if present.
                const elementId = element.id || element.elementId;
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

                // If width/height are missing, measure the rendered component once and persist size
                // This keeps the overlay aligned with actual DOM size
                if (
                  (element.style?.width == null ||
                    element.style?.height == null) &&
                  typeof window !== "undefined"
                ) {
                  requestAnimationFrame(() => {
                    const el = document.getElementById(elementId);
                    if (el) {
                      const rect = el.getBoundingClientRect();
                      const measuredW = Math.round(rect.width);
                      const measuredH = Math.round(rect.height);
                      if (measuredW > 0 && measuredH > 0) {
                        setCanvasElements((prev) =>
                          prev.map((p) =>
                            p.id === element.id
                              ? {
                                  ...p,
                                  style: {
                                    ...p.style,
                                    width: p.style?.width ?? measuredW,
                                    height: p.style?.height ?? measuredH,
                                  },
                                }
                              : p
                          )
                        );
                      }
                    }
                  });
                }

                const isSelected =
                  selectedId === elementId || selectedId === element.id;

                return (
                  <div
                    key={elementId}
                    style={{
                      position: "absolute",
                      left: pos.x,
                      top: pos.y,
                      width:
                        (element.style?.width as number | undefined) ??
                        element.componentData?.integration?.canvasIntegration
                          ?.defaultWidth ??
                        0,
                      height:
                        (element.style?.height as number | undefined) ??
                        element.componentData?.integration?.canvasIntegration
                          ?.defaultHeight ??
                        0,
                    }}
                    onPointerDown={(e) => {
                      // Begin drag for this element via drag symphony
                      const cs = (window as any).renderxCommunicationSystem;
                      // Use current canvas position as origin so dx/dy apply correctly in canvas coordinates
                      const origin = { x: pos.x, y: pos.y };
                      cs?.conductor.play(
                        "Canvas.component-drag-symphony",
                        "Canvas.component-drag-symphony",
                        {
                          action: "start",
                          elementId,
                          origin,
                          onDragUpdate: ({ elementId: id, position }) => {
                            setCanvasElements((prev) =>
                              prev.map((el) =>
                                el.id === id || (el as any).elementId === id
                                  ? { ...el, position }
                                  : el
                              )
                            );
                          },
                        }
                      );
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const onMove = (ev: PointerEvent) => {
                        const cs2 = (window as any).renderxCommunicationSystem;
                        cs2?.conductor.play(
                          "Canvas.component-drag-symphony",
                          "Canvas.component-drag-symphony",
                          {
                            action: "move",
                            elementId,
                            delta: {
                              dx: ev.clientX - startX,
                              dy: ev.clientY - startY,
                            },
                            current: { x: ev.clientX, y: ev.clientY },
                            onDragUpdate: ({ elementId: id, position }) => {
                              setCanvasElements((prev) =>
                                prev.map((el) =>
                                  el.id === id || (el as any).elementId === id
                                    ? { ...el, position }
                                    : el
                                )
                              );
                            },
                          }
                        );
                      };
                      const onUp = () => {
                        const cs3 = (window as any).renderxCommunicationSystem;
                        cs3?.conductor.play(
                          "Canvas.component-drag-symphony",
                          "Canvas.component-drag-symphony",
                          { action: "end", elementId }
                        );
                        window.removeEventListener("pointermove", onMove);
                        window.removeEventListener("pointerup", onUp);
                      };
                      window.addEventListener("pointermove", onMove);
                      window.addEventListener("pointerup", onUp, {
                        once: true,
                      });
                    }}
                  >
                    <CanvasElement
                      element={{ ...element, position: pos }}
                      elementId={elementId}
                      cssClass={cssClass}
                      onDragStart={onCanvasElementDragStart}
                      onDragEnd={onCanvasElementDragEnd}
                    />
                    {isSelected && (
                      <VisualTools
                        elementId={elementId}
                        handles={
                          element.componentData?.ui?.tools?.resize?.handles || [
                            "nw",
                            "n",
                            "ne",
                            "e",
                            "se",
                            "s",
                            "sw",
                            "w",
                          ]
                        }
                        tools={element.componentData?.ui?.tools}
                        startBox={{
                          x: element.position?.x || 0,
                          y: element.position?.y || 0,
                          w: element.style?.width || 0,
                          h: element.style?.height || 0,
                        }}
                        onResizeUpdate={({ elementId: id, box }) => {
                          // Apply both size and position updates from resize plugin
                          // Clamp width/height to minimum 1px to prevent handle collapse
                          const minSize = 1;
                          setCanvasElements((prev) =>
                            prev.map((el) =>
                              el.id === id || (el as any).elementId === id
                                ? {
                                    ...el,
                                    position: {
                                      ...(el.position || { x: 0, y: 0 }),
                                      x: Math.round(
                                        box.x ?? (el.position?.x || 0)
                                      ),
                                      y: Math.round(
                                        box.y ?? (el.position?.y || 0)
                                      ),
                                    },
                                    style: {
                                      ...el.style,
                                      width: Math.max(
                                        minSize,
                                        Math.round(
                                          box.w ?? (el.style?.width || 1)
                                        )
                                      ),
                                      height: Math.max(
                                        minSize,
                                        Math.round(
                                          box.h ?? (el.style?.height || 1)
                                        )
                                      ),
                                    },
                                  }
                                : el
                            )
                          );
                        }}
                      />
                    )}
                  </div>
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
