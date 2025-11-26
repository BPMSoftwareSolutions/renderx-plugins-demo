/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component/symphonies/create/create.symphony";
import { handlers as dragHandlers } from "@renderx-plugins/canvas-component/symphonies/drag/drag.symphony";
import { handlers as resizeHandlers } from "@renderx-plugins/canvas-component/symphonies/resize/resize.move.symphony";
import { handlers as controlPanelUpdateHandlers } from "../src/symphonies/update/update.symphony";

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
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();
  });

  it("forwards drag position updates to Control Panel", () => {
    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Derive model via Control Panel update handler and notify UI
    const originalRenderX = (globalThis as any).RenderX;
    const publish = vi.fn();
    ;(globalThis as any).RenderX = { EventRouter: { publish } } as any;
    const dragCtx = { payload: {}, logger: { info: vi.fn(), warn: vi.fn() } } as any;

    // Act: simulate drag position update and derive model from DOM
    const dragData = { id: nodeId, position: { x: 100, y: 80 } };
    dragHandlers.updatePosition(dragData, dragCtx);
    controlPanelUpdateHandlers.updateFromElement({ id: nodeId, source: "drag" }, dragCtx);
    controlPanelUpdateHandlers.notifyUi({}, dragCtx);

    // Assert: EventRouter published selection update with new position
    expect(publish).toHaveBeenCalledWith(
      'control.panel.selection.updated',
      expect.objectContaining({
        header: expect.objectContaining({ id: nodeId }),
        layout: expect.objectContaining({ x: 100, y: 80 }),
      })
    );

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });

  it("forwards resize updates to Control Panel with position and size", async () => {
    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Derive model via Control Panel update handler and notify UI
    const originalRenderX = (globalThis as any).RenderX;
    const publish = vi.fn();
    ;(globalThis as any).RenderX = { EventRouter: { publish } } as any;
    const resizeCtx = { payload: {}, logger: { info: vi.fn(), warn: vi.fn() } } as any;

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
    controlPanelUpdateHandlers.updateFromElement({ id: nodeId, source: "resize" }, resizeCtx);
    // Allow dedupe window to pass before notifying
    await new Promise((r) => setTimeout(r, 160));
    controlPanelUpdateHandlers.notifyUi({}, resizeCtx);

    // Assert: EventRouter published selection update with updated size and position
    expect(publish).toHaveBeenCalledWith(
      'control.panel.selection.updated',
      expect.objectContaining({
        header: expect.objectContaining({ id: nodeId }),
        layout: expect.objectContaining({ x: 50, y: 30, width: 140, height: 50 }),
      })
    );

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });

  it("Control Panel update sequence derives current position/size from DOM", () => {
    // Create element
    const _ctx: any = { payload: {} };
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

  it("notifies UI observer with updated model during live updates", async () => {
    const originalRenderX = (globalThis as any).RenderX;
    const publish = vi.fn();
    ;(globalThis as any).RenderX = { EventRouter: { publish } } as any;

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
      logger: { info: vi.fn(), warn: vi.fn() }
    } as any;

    // Act: notify UI of live update
    // Allow dedupe window to pass
    await new Promise((r) => setTimeout(r, 160));
    controlPanelUpdateHandlers.notifyUi({}, ctx);

    // Assert: EventRouter should publish with updated model
    expect(publish).toHaveBeenCalledWith('control.panel.selection.updated', updatedModel);

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });
});

