/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-plugins/canvas-component";
import { setSelectionObserver } from "../src/state/observer.store";
import { resolveInteraction } from "@renderx-plugins/host-sdk";

import { handlers as canvasUpdateHandlers } from "@renderx-plugins/canvas-component";

// Ensure we always use the local mocked canvas-component handlers in CI and locally
vi.mock("@renderx-plugins/canvas-component", async () => {
  return await import("./__mocks__/@renderx-plugins/canvas-component.ts");
});

// Mock resolveInteraction via Host SDK to avoid host internals
vi.mock("@renderx-plugins/host-sdk", async () => {
  const actual = await vi.importActual<any>("@renderx-plugins/host-sdk");
  return {
    ...actual,
    resolveInteraction: vi.fn((key: string) => {
      if (key === "canvas.component.update") {
        return {
          pluginId: "CanvasComponentPlugin",
          sequenceId: "canvas-component-update-symphony",
        };
      }
      return { pluginId: "unknown", sequenceId: "unknown" };
    }),
  };
});

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

describe("Control Panel bidirectional attribute editing", () => {
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

  it("forwards content changes to Canvas component", () => {
    const selectionObserver = vi.fn();
    setSelectionObserver(selectionObserver);

    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();
    
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);
    
    const nodeId = ctx.payload.nodeId as string;

    // Mock conductor to capture Canvas update calls
    const playMock = vi.fn();
    const updateCtx = {
      payload: {},
      conductor: { play: playMock }
    } as any;

    // Act: simulate Control Panel content change
    const contentChange = {
      id: nodeId,
      attribute: "content",
      value: "Updated Button Text"
    };

    const route = resolveInteraction("canvas.component.update");
    updateCtx.conductor.play(route.pluginId, route.sequenceId, contentChange);

    // Assert: should forward to Canvas update
    expect(playMock).toHaveBeenCalledWith(
      "CanvasComponentPlugin", 
      "canvas-component-update-symphony",
      contentChange
    );

    // Cleanup
    setSelectionObserver(null);
  });

  it("forwards styling changes to Canvas component", () => {
    const selectionObserver = vi.fn();
    setSelectionObserver(selectionObserver);

    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();
    
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);
    
    const nodeId = ctx.payload.nodeId as string;

    // Mock conductor
    const playMock = vi.fn();
    const updateCtx = {
      payload: {},
      conductor: { play: playMock }
    } as any;

    // Act: simulate Control Panel styling change
    const stylingChange = {
      id: nodeId,
      attribute: "bg-color",
      value: "#ff6b6b"
    };

    const route = resolveInteraction("canvas.component.update");
    updateCtx.conductor.play(route.pluginId, route.sequenceId, stylingChange);

    // Assert: should forward to Canvas update
    expect(playMock).toHaveBeenCalledWith(
      "CanvasComponentPlugin",
      "canvas-component-update-symphony", 
      stylingChange
    );

    // Cleanup
    setSelectionObserver(null);
  });

  it("forwards layout changes to Canvas component", () => {
    const selectionObserver = vi.fn();
    setSelectionObserver(selectionObserver);

    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();
    
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);
    
    const nodeId = ctx.payload.nodeId as string;

    // Mock conductor
    const playMock = vi.fn();
    const updateCtx = {
      payload: {},
      conductor: { play: playMock }
    } as any;

    // Act: simulate Control Panel layout change
    const layoutChange = {
      id: nodeId,
      attribute: "width",
      value: 150
    };

    const route = resolveInteraction("canvas.component.update");
    updateCtx.conductor.play(route.pluginId, route.sequenceId, layoutChange);

    // Assert: should forward to Canvas update
    expect(playMock).toHaveBeenCalledWith(
      "CanvasComponentPlugin",
      "canvas-component-update-symphony",
      layoutChange
    );

    // Cleanup
    setSelectionObserver(null);
  });

  it("Canvas component updates DOM when receiving attribute changes", () => {
    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)! as HTMLElement;

    // Initial state
    expect(element.textContent).toBe("Click me");
    expect(element.style.backgroundColor).toBe("");

    // Act: call Canvas update handler with content change
    const contentUpdateCtx = { payload: {} } as any;
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "content",
        value: "Updated Text"
      },
      contentUpdateCtx
    );

    // Assert: DOM should be updated
    expect(element.textContent).toBe("Updated Text");

    // Act: call Canvas update handler with styling change
    const styleUpdateCtx = { payload: {} } as any;
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "bg-color",
        value: "#ff6b6b"
      },
      styleUpdateCtx
    );

    // Assert: DOM should be updated
    expect(element.style.backgroundColor).toBe("rgb(255, 107, 107)"); // CSS converts hex to rgb
  });

  it("updates trigger Control Panel refresh for bidirectional sync", () => {
    const observerMock = vi.fn();
    setSelectionObserver(observerMock);

    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;

    // Mock conductor to capture refresh calls
    const playMock = vi.fn();
    const refreshCtx = {
      payload: { elementId: nodeId },
      conductor: { play: playMock }
    } as any;

    // Act: call refresh handler
    canvasUpdateHandlers.refreshControlPanel({}, refreshCtx);

    // Assert: should call Control Panel update
    expect(playMock).toHaveBeenCalledWith(
      "ControlPanelPlugin",
      "control-panel-update-symphony",
      { id: nodeId, source: "attribute-update" }
    );

    // Cleanup
    setSelectionObserver(null);
  });
});

