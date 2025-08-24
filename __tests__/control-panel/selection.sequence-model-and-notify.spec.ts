/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

import { handlers as controlPanelHandlers } from "../../plugins/control-panel/symphonies/selection/selection.symphony";
import { setSelectionObserver } from "../../plugins/control-panel/state/observer.store";

function makeButtonTemplate() {
  return {
    tag: "button",
    text: "Click me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
    cssVariables: { "bg-color": "#007acc", "text-color": "#ffffff" },
    dimensions: { width: 120, height: 40 },
  };
}

describe("Control Panel selection sequence builds data-driven model", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("derives selection model from DOM element and component JSON", () => {
    // Arrange: create a canvas element using existing create handlers
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Act: call control panel selection model derivation
    const selectionCtx = { payload: {} };
    controlPanelHandlers.deriveSelectionModel({ id: nodeId }, selectionCtx);

    // Assert: should derive model with expected structure
    const model = selectionCtx.payload.selectionModel;
    expect(model).toBeTruthy();
    expect(model.header.type).toBe("button");
    expect(model.header.id).toBe(nodeId);
    expect(model.content.content).toBe("Click me");
    expect(model.layout.x).toBe(50);
    expect(model.layout.y).toBe(30);
    expect(model.layout.width).toBe(120);
    expect(model.layout.height).toBe(40);
  });

  it("notifies UI observer with selection model", () => {
    const observerMock = vi.fn();
    const selectionModel = {
      header: { type: "button", id: "rx-node-test" },
      content: { content: "Click me", variant: "primary", size: "medium", disabled: false },
      layout: { x: 50, y: 30, width: 120, height: 40 },
      styling: { "bg-color": "#007acc", "text-color": "#ffffff" }
    };

    // Set up observer
    setSelectionObserver(observerMock);

    const ctx = {
      payload: { selectionModel }
    };

    // Act: notify UI
    controlPanelHandlers.notifyUi({}, ctx);

    // Assert: observer should be called with model
    expect(observerMock).toHaveBeenCalledWith(selectionModel);

    // Cleanup
    setSelectionObserver(null);
  });

  it("handles missing element gracefully", () => {
    const ctx = { payload: {} };

    // Act: try to derive model for non-existent element
    expect(() => {
      controlPanelHandlers.deriveSelectionModel({ id: "non-existent" }, ctx);
    }).not.toThrow();

    // Assert: should set selectionModel to null
    expect(ctx.payload.selectionModel).toBeNull();
  });
});
