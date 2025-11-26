/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component";
import { handlers as controlPanelHandlers } from "../src/symphonies/selection/selection.symphony";

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
  let ctx: any;
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

  it("derives selection model from DOM element and component JSON", () => {
    // Arrange: create a canvas element using existing create handlers
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Act: call control panel selection model derivation
    const selectionCtx: any = { payload: {} };
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

  it("publishes selection model via EventRouter", () => {
    const mockEventRouter = {
      publish: vi.fn(),
    };

    // Set up mock EventRouter on globalThis
    const originalRenderX = (globalThis as any).RenderX;
    (globalThis as any).RenderX = {
      EventRouter: mockEventRouter,
    };

    const selectionModel = {
      header: { type: "button", id: "rx-node-test" },
      content: { content: "Click me", variant: "primary", size: "medium", disabled: false },
      layout: { x: 50, y: 30, width: 120, height: 40 },
      styling: { "bg-color": "#007acc", "text-color": "#ffffff" },
    };

    const _ctx: any = {
      payload: { selectionModel },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    // Act: notify UI
    controlPanelHandlers.notifyUi({}, ctx);

    // Assert: EventRouter should publish with selection model
    expect(mockEventRouter.publish).toHaveBeenCalledWith(
      'control.panel.selection.updated',
      selectionModel
    );

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });

  it("handles missing element gracefully", () => {
    const _ctx: any = { payload: {} };

    // Act: try to derive model for non-existent element
    expect(() => {
      controlPanelHandlers.deriveSelectionModel({ id: "non-existent" }, ctx);
    }).not.toThrow();

    // Assert: should set selectionModel to null
    expect(ctx.payload.selectionModel).toBeNull();
  });
});

