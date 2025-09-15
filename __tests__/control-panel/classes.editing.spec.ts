/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component";

import { handlers as controlPanelClassHandlers } from "../../plugins/control-panel/symphonies/classes/classes.symphony";
import { setClassesObserver } from "../../plugins/control-panel/state/observer.store";

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

describe("Control Panel class editing sequences", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("adds CSS class to selected element via stage-crew", () => {
    // Arrange: create a canvas element
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    // Verify initial classes
    expect(element.classList.contains("rx-button--primary")).toBe(false);

    // Act: add class via control panel sequence
    const classCtx = { payload: {} };
    controlPanelClassHandlers.addClass(
      { id: nodeId, className: "rx-button--primary" },
      classCtx
    );

    // Assert: class was added to DOM and payload updated
    expect(element.classList.contains("rx-button--primary")).toBe(true);
    expect(classCtx.payload.id).toBe(nodeId);
    expect(classCtx.payload.updatedClasses).toContain("rx-button--primary");
  });

  it("removes CSS class from selected element via stage-crew", () => {
    // Arrange: create element with existing class
    const ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    // Add class first
    element.classList.add("rx-button--primary");
    expect(element.classList.contains("rx-button--primary")).toBe(true);

    // Act: remove class via control panel sequence
    const classCtx = { payload: {} };
    controlPanelClassHandlers.removeClass(
      { id: nodeId, className: "rx-button--primary" },
      classCtx
    );

    // Assert: class was removed from DOM and payload updated
    expect(element.classList.contains("rx-button--primary")).toBe(false);
    expect(classCtx.payload.id).toBe(nodeId);
    expect(classCtx.payload.updatedClasses).not.toContain("rx-button--primary");
  });

  it("notifies UI after class changes", () => {
    const observerMock = vi.fn();

    // Set up observer
    setClassesObserver(observerMock);

    const ctx = {
      payload: { id: "rx-node-test", updatedClasses: ["rx-comp", "rx-button", "rx-button--primary"] }
    };

    // Act: notify UI of class changes
    controlPanelClassHandlers.notifyUi({}, ctx);

    // Assert: observer was called with class data
    expect(observerMock).toHaveBeenCalledWith({
      id: "rx-node-test",
      classes: ["rx-comp", "rx-button", "rx-button--primary"]
    });

    // Cleanup
    setClassesObserver(null);
  });

  it("handles missing element gracefully for class operations", () => {
    const ctx = { payload: {} };

    // Act: try to add class to non-existent element
    expect(() => {
      controlPanelClassHandlers.addClass(
        { id: "non-existent", className: "test-class" },
        ctx
      );
    }).not.toThrow();

    expect(() => {
      controlPanelClassHandlers.removeClass(
        { id: "non-existent", className: "test-class" },
        ctx
      );
    }).not.toThrow();

    // Should not have updated payload since element doesn't exist
    expect(ctx.payload.id).toBeUndefined();
    expect(ctx.payload.updatedClasses).toBeUndefined();
  });
});
