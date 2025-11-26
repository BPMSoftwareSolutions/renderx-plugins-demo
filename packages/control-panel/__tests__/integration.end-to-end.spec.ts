/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component/symphonies/create/create.symphony";
import { resolveInteraction } from "@renderx-plugins/host-sdk";
import { handlers as controlPanelHandlers } from "../src/symphonies/selection/selection.symphony";
import { handlers as classHandlers } from "../src/symphonies/classes/classes.symphony";

// Host-like selection forwarding harness for externalized select symphony
const selectHandlers = {
  notifyUi(data: any, ctx: any) {
    const route = resolveInteraction("control.panel.selection.show");
    ctx?.conductor?.play?.(route.pluginId, route.sequenceId, { id: data?.id });
  },
};

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

describe("Control Panel Integration - End to End", () => {
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
  let mockEventRouter: any;
  let originalRenderX: any;

  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
    vi.clearAllMocks();

    // Setup EventRouter mock
    mockEventRouter = {
      publish: vi.fn(),
    };

    // Store original globalThis.RenderX
    originalRenderX = (globalThis as any).RenderX;

    // Set up mock EventRouter on globalThis
    (globalThis as any).RenderX = {
      EventRouter: mockEventRouter,
    };
  });

  it("complete flow: create element → select → control panel updates → add class → UI updates", () => {
    // Step 1: Create a canvas element
    const createCtx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, createCtx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, createCtx);

    const nodeId = createCtx.payload.nodeId as string;
    const element = document.getElementById(nodeId)!;

    expect(element).toBeTruthy();
    expect(element.classList.contains("rx-button")).toBe(true);

    // Step 2: Select the element (this should forward to Control Panel)
    const selectCtx = {
      conductor: {
        play: vi.fn((pluginId: string, sequenceId: string, data: any) => {
          // Mock the conductor.play call to Control Panel
          if (pluginId === "ControlPanelPlugin" && sequenceId === "control-panel-selection-show-symphony") {
            // Simulate the Control Panel selection sequence
            const controlCtx = { payload: {} } as any;
            controlPanelHandlers.deriveSelectionModel(data, controlCtx);
            controlPanelHandlers.notifyUi({}, controlCtx);
          }
        })
      }
    } as any;

    selectHandlers.notifyUi({ id: nodeId }, selectCtx);

    // Verify selection forwarding happened
    expect(selectCtx.conductor.play).toHaveBeenCalledWith(
      "ControlPanelPlugin",
      "control-panel-selection-show-symphony",
      { id: nodeId }
    );

    // Verify Control Panel published selection update via EventRouter
    expect(mockEventRouter.publish).toHaveBeenCalledWith(
      'control.panel.selection.updated',
      expect.objectContaining({
        header: { type: "button", id: nodeId },
        content: expect.objectContaining({ content: "Click me" }),
        layout: { x: 50, y: 30, width: 120, height: 40 },
        classes: expect.arrayContaining(["rx-comp", "rx-button"])
      })
    );

    // Step 3: Add a CSS class via Control Panel
    const classCtx: any = { payload: {}, logger: { info: vi.fn(), warn: vi.fn() } };
    classHandlers.addClass({ id: nodeId, className: "rx-button--primary" }, classCtx);
    classHandlers.notifyUi({}, classCtx);

    // Verify class was added to DOM
    expect(element.classList.contains("rx-button--primary")).toBe(true);

    // Verify classes update was published via EventRouter
    expect(mockEventRouter.publish).toHaveBeenCalledWith(
      'control.panel.classes.updated',
      {
        id: nodeId,
        classes: expect.arrayContaining(["rx-comp", "rx-button", "rx-button--primary"])
      }
    );

    // Step 4: Remove a CSS class via Control Panel
    const removeClassCtx: any = { payload: {}, logger: { info: vi.fn(), warn: vi.fn() } };
    classHandlers.removeClass({ id: nodeId, className: "rx-button--primary" }, removeClassCtx);
    classHandlers.notifyUi({}, removeClassCtx);

    // Verify class was removed from DOM
    expect(element.classList.contains("rx-button--primary")).toBe(false);

    // Verify classes update was published again via EventRouter
    expect(mockEventRouter.publish).toHaveBeenCalledWith(
      'control.panel.classes.updated', 
      {
        id: nodeId,
        classes: expect.not.arrayContaining(["rx-button--primary"])
      }
    );

    // Cleanup
    (globalThis as any).RenderX = originalRenderX;
  });
});

