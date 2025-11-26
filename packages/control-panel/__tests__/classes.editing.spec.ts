/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component";

import { handlers as controlPanelClassHandlers } from "../src/symphonies/classes/classes.symphony";

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
  let _ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("adds CSS class to selected element via stage-crew", () => {
    // Arrange: create a canvas element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    // Verify initial classes
    expect(element.classList.contains("rx-button--primary")).toBe(false);

    // Act: add class via control panel sequence
    const classCtx = { payload: {} } as any;
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
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    // Add class first
    element.classList.add("rx-button--primary");
    expect(element.classList.contains("rx-button--primary")).toBe(true);

    // Act: remove class via control panel sequence
    const classCtx = { payload: {} } as any;
    controlPanelClassHandlers.removeClass(
      { id: nodeId, className: "rx-button--primary" },
      classCtx
    );

    // Assert: class was removed from DOM and payload updated
    expect(element.classList.contains("rx-button--primary")).toBe(false);
    expect(classCtx.payload.id).toBe(nodeId);
    expect(classCtx.payload.updatedClasses).not.toContain("rx-button--primary");
  });

  it("publishes class changes via EventRouter", () => {
    const originalRenderX = (globalThis as any).RenderX;
    const publish = vi.fn();
    (globalThis as any).RenderX = { EventRouter: { publish } } as any;

    const ctx = {
      payload: { id: "rx-node-test", updatedClasses: ["rx-comp", "rx-button", "rx-button--primary"] },
      logger: { info: vi.fn(), warn: vi.fn() }
    } as any;

    // Act: notify UI of class changes
    controlPanelClassHandlers.notifyUi({}, ctx);

    // Assert: EventRouter was called with class data
    expect(publish).toHaveBeenCalledWith('control.panel.classes.updated', {
      id: "rx-node-test",
      classes: ["rx-comp", "rx-button", "rx-button--primary"]
    });

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });

  it("handles missing element gracefully for class operations", () => {
    const ctx = { payload: {} } as any;

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

