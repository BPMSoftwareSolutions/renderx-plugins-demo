/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component/symphonies/create/create.symphony.ts";
import { handlers as dragHandlers } from "@renderx-plugins/canvas-component/symphonies/drag/drag.symphony.ts";
import { handlers as resizeHandlers } from "@renderx-plugins/canvas-component/symphonies/resize/resize.move.symphony.ts";
import { setSelectionObserver } from "../../plugins/control-panel/state/observer.store";

import { handlers as controlPanelUpdateHandlers } from "../../plugins/control-panel/symphonies/update/update.symphony";

function makeButtonTemplate() {
  return {
    tag: "button",
    text: "Click me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #007acc; }",
    cssVariables: {},
    dimensions: { width: 120, height: 40 },
  };
}

describe("Control Panel live updates during drag/resize", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("forwards drag position updates to Control Panel", () => {

    // Create element
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Derive model via Control Panel update handler and notify UI
    const selectionObserver = vi.fn();
    setSelectionObserver(selectionObserver);
    const dragCtx = { payload: {} } as any;

    // Act: simulate drag position update and derive model from DOM
    const dragData = { id: nodeId, position: { x: 100, y: 80 } };
    dragHandlers.updatePosition(dragData, dragCtx);
    controlPanelUpdateHandlers.updateFromElement({ id: nodeId }, dragCtx);
    controlPanelUpdateHandlers.notifyUi({}, dragCtx);

    // Assert: observer called with updated position
    expect(selectionObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.objectContaining({ id: nodeId }),
        layout: expect.objectContaining({ x: 100, y: 80 }),
      })
    );

    // Cleanup
    setSelectionObserver(null);
  });

  it("forwards resize updates to Control Panel with position and size", () => {

    // Create element
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Derive model via Control Panel update handler and notify UI
    const selectionObserver = vi.fn();
    setSelectionObserver(selectionObserver);
    const resizeCtx = { payload: {} } as any;

    const resizeData = {
      id: nodeId,
      dir: "se",
      startLeft: 50,
      startTop: 30,
      startWidth: 120,
      startHeight: 40,
      dx: 20,
      dy: 10,
    };
    // update DOM via stage-crew
    resizeHandlers.updateSize(resizeData, resizeCtx);
    // derive model and notify UI
    controlPanelUpdateHandlers.updateFromElement({ id: nodeId }, resizeCtx);
    controlPanelUpdateHandlers.notifyUi({}, resizeCtx);

    // Assert: observer called with updated size and position
    expect(selectionObserver).toHaveBeenCalledWith(
      expect.objectContaining({
        header: expect.objectContaining({ id: nodeId }),
        layout: expect.objectContaining({ x: 50, y: 30, width: 140, height: 50 }),
      })
    );

    // Cleanup
    setSelectionObserver(null);
  });

  it("Control Panel update sequence derives current position/size from DOM", () => {
    // Create element
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    // Simulate position/size changes (as would happen during drag/resize)
    element.style.left = "100px";
    element.style.top = "80px";
    element.style.width = "140px";
    element.style.height = "50px";

    // Act: call Control Panel update handler
    const updateCtx: any = { payload: {} };
    controlPanelUpdateHandlers.updateFromElement({ id: nodeId }, updateCtx);

    // Assert: should derive current model from DOM with updated position/size
    const model = updateCtx.payload.selectionModel;
    expect(model).toBeTruthy();
    expect(model.header.type).toBe("button");
    expect(model.header.id).toBe(nodeId);
    expect(model.layout.x).toBe(100); // Updated position
    expect(model.layout.y).toBe(80); // Updated position
    expect(model.layout.width).toBe(140); // Updated size
    expect(model.layout.height).toBe(50); // Updated size
  });

  it("notifies UI observer with updated model during live updates", () => {
    const observerMock = vi.fn();
    setSelectionObserver(observerMock);

    const updatedModel = {
      header: { type: "button", id: "rx-node-test" },
      content: {
        content: "Click me",
        variant: "primary",
        size: "medium",
        disabled: false,
      },
      layout: { x: 100, y: 80, width: 140, height: 50 }, // Updated position/size
      styling: { "bg-color": "#007acc", "text-color": "#ffffff" },
    };

    const ctx = {
      payload: { selectionModel: updatedModel },
    };

    // Act: notify UI of live update
    controlPanelUpdateHandlers.notifyUi({}, ctx);

    // Assert: observer should be called with updated model
    expect(observerMock).toHaveBeenCalledWith(updatedModel);

    // Cleanup
    setSelectionObserver(null);
  });
});
