/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "@renderx-web/canvas-component";
import { handlers as canvasUpdateHandlers } from "@renderx-web/canvas-component";
import { setSelectionObserver } from "../src/state/observer.store";

// Ensure we always use the local mocked canvas-component handlers in CI and locally
vi.mock("@renderx-web/canvas-component", async () => {
  return await import("./__mocks__/@renderx-web/canvas-component.ts");
});

function makeButtonTemplate() {
  return {
    tag: "button",
    text: "Original Text",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #007acc; color: white; }",
    cssVariables: {},
    dimensions: { width: 120, height: 40 },
  };
}

describe("Control Panel ↔ Canvas Component Integration", () => {
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

  it("demonstrates full bidirectional attribute editing flow", () => {
    // 1. Create a Canvas component
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 100, y: 50 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)! as HTMLElement;

    // Verify initial state
    expect(element.textContent).toBe("Original Text");
    expect(element.style.backgroundColor).toBe("");
    expect(element.style.left).toBe("100px");
    expect(element.style.top).toBe("50px");

    // 2. Simulate Control Panel attribute changes
    console.log("🎯 Testing content change...");
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "content",
        value: "Updated Button Text",
      },
      { payload: {} } as any
    );

    expect(element.textContent).toBe("Updated Button Text");

    console.log("🎨 Testing styling changes...");
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "bg-color",
        value: "#ff6b6b",
      },
      { payload: {} } as any
    );

    expect(element.style.backgroundColor).toBe("rgb(255, 107, 107)");

    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "text-color",
        value: "#ffffff",
      },
      { payload: {} } as any
    );

    expect(element.style.color).toBe("rgb(255, 255, 255)");

    console.log("📐 Testing layout changes...");
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "x",
        value: 200,
      },
      { payload: {} } as any
    );

    expect(element.style.left).toBe("200px");

    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "width",
        value: 150,
      },
      { payload: {} } as any
    );

    expect(element.style.width).toBe("150px");

    console.log("🔧 Testing variant changes...");
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "variant",
        value: "danger",
      },
      { payload: {} } as any
    );

    expect(element.classList.contains("rx-button--danger")).toBe(true);
    expect(element.classList.contains("rx-button--primary")).toBe(false);

    console.log("✅ Testing disabled state...");
    canvasUpdateHandlers.updateAttribute(
      {
        id: nodeId,
        attribute: "disabled",
        value: true,
      },
      { payload: {} } as any
    );

    expect(element.hasAttribute("disabled")).toBe(true);

    // 3. Test Control Panel refresh mechanism
    const observerMock = vi.fn();
    setSelectionObserver(observerMock);

    const playMock = vi.fn();
    const refreshCtx = {
      payload: { elementId: nodeId },
      conductor: { play: playMock },
    } as any;

    canvasUpdateHandlers.refreshControlPanel({}, refreshCtx);

    expect(playMock).toHaveBeenCalledWith(
      "ControlPanelPlugin",
      "control-panel-update-symphony",
      { id: nodeId, source: "attribute-update" }
    );

    console.log("🎉 Full bidirectional flow completed successfully!");

    // Cleanup
    setSelectionObserver(null);
  });

  it("handles multiple rapid attribute changes", () => {
    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)! as HTMLElement;

    // Rapid changes
    const changes = [
      { attribute: "content", value: "Change 1" },
      { attribute: "bg-color", value: "#ff0000" },
      { attribute: "content", value: "Change 2" },
      { attribute: "width", value: 200 },
      { attribute: "content", value: "Final Text" },
    ];

    changes.forEach((change) => {
      canvasUpdateHandlers.updateAttribute(
        {
          id: nodeId,
          ...change,
        },
        { payload: {} } as any
      );
    });

    // Verify final state
    expect(element.textContent).toBe("Final Text");
    expect(element.style.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(element.style.width).toBe("200px");
  });

  it("gracefully handles invalid attribute updates", () => {
    // Create element
    const _ctx: any = { payload: {} };
    const template = makeButtonTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 50, y: 30 } }, ctx);

    const nodeId = ctx.payload.nodeId as string;
    const element = document.getElementById(nodeId)! as HTMLElement;

    // Test invalid updates (should not crash)
    expect(() => {
      canvasUpdateHandlers.updateAttribute(
        {
          id: nodeId,
          attribute: "invalid-attribute",
          value: "some value",
        },
        { payload: {} } as any
      );
    }).not.toThrow();

    expect(() => {
      canvasUpdateHandlers.updateAttribute(
        {
          id: "non-existent-id",
          attribute: "content",
          value: "test",
        },
        { payload: {} } as any
      );
    }).not.toThrow();

    // Element should remain unchanged
    expect(element.textContent).toBe("Original Text");
  });
});

