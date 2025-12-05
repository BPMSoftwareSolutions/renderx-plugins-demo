/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "@renderx-plugins/canvas-component/symphonies/create/create.symphony.ts";

function makeTemplate() {
  return {
    tag: "button",
    text: "Click Me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { padding: 8px 16px; border: none; border-radius: 4px; font-size: 14px; background-color: var(--bg-color); color: var(--text-color); }",
    cssVariables: { "bg-color": "#007acc", "text-color": "#ffffff" },
    dimensions: { width: 120, height: 40 },
  };
}

function makeCtx() {
  return { payload: {} } as any; // No stageCrew — we want DOM-only behavior
}

describe("canvas-component create beat (DOM-only)", () => {
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    // Host container used by Canvas
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  /**
   * @ac renderx-web-orchestration:canvas-component-create-symphony:1.3:1
   *
   * Given: valid template and nodeId exist in context.payload
   * When: createNode executes
   * Then: DOM element is created with specified tag and ID
   *       CSS styles and variables are injected and applied
   *       element is appended to canvas or target container
   *       interactions (selection, drag) are attached
   *       created node metadata is stored in context.payload.createdNode
   * And: operation completes within 2s P95
   *      React rendering is NOT performed directly (deferred to renderReact beat)
   *      schema is validated before applying
   */
  it("[AC:renderx-web-orchestration:canvas-component-create-symphony:1.3:1] creates a single element under #rx-canvas with text, position and dimensions", () => {
    // Given: valid template and nodeId exist in context.payload
    const template = makeTemplate();

    // When: createNode executes
    handlers.resolveTemplate({ component: { template } } as any, ctx);
    handlers.createNode({ position: { x: 50, y: 80 } } as any, ctx);

    const btn = document.querySelector(
      "#rx-canvas button"
    ) as HTMLButtonElement | null;

    // Then: DOM element is created with specified tag and ID
    expect(btn).toBeTruthy();
    expect(btn!.id).toMatch(/^rx-node-/);
    expect(btn!.className).toContain("rx-button");
    expect(btn!.textContent).toBe("Click Me");

    // Then: CSS styles and variables are injected and applied
    const style = (btn as HTMLElement).style as CSSStyleDeclaration;
    expect(style.position).toBe("absolute");
    expect(style.left).toBe("50px");
    expect(style.top).toBe("80px");
    expect(style.width).toBe("120px");
    expect(style.height).toBe("40px");

    const styleTag = document.getElementById("rx-components-styles");
    expect(styleTag).toBeTruthy();

    // Then: element is appended to canvas or target container
    expect(btn!.parentElement?.id).toBe("rx-canvas");
  });
});


