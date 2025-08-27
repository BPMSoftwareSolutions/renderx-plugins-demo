/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/import/import.symphony";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

function setupCanvas() {
  const root = document.createElement("div");
  root.innerHTML = `<div id="rx-canvas" style="position:absolute; left:0; top:0; width:1200px; height:800px;"></div>`;
  document.body.innerHTML = "";
  document.body.appendChild(root);
}

function makeCtx() {
  const ops: any[] = [];
  return {
    payload: {},
    io: {
      kv: {
        put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])),
      },
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    conductor: {
      play: vi.fn(async (pluginId: string, sequenceId: string, data: any) => {
        ops.push(["conductor.play", pluginId, sequenceId, data]);
        // Mock the canvas.component.create behavior for testing
        if (sequenceId === "canvas-component-create-symphony") {
          const createCtx = {
            payload: {},
            io: {
              kv: {
                put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])),
              },
            },
          };
          await createHandlers.resolveTemplate(data, createCtx);
          await createHandlers.registerInstance(data, createCtx);
          await createHandlers.createNode(data, createCtx);
          await createHandlers.notifyUi(data, createCtx);
        }
      }),
    },
    _ops: ops,
  } as any;
}

describe("canvas-component import.symphony", () => {
  beforeEach(() => {
    setupCanvas();
  });

  it("imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV", async () => {
    const ctx = makeCtx();
    const ui = {
      version: "1.0.0",
      metadata: {
        createdAt: new Date().toISOString(),
        canvasSize: { width: 1200, height: 800 },
        componentCount: 2,
      },
      cssClasses: {
        "rx-comp": {
          name: "rx-comp",
          content: ".rx-comp { position: absolute; box-sizing: border-box; }",
        },
        "rx-button": {
          name: "rx-button",
          content: ".rx-button { background: #3b82f6; color: white; }",
        },
        "rx-container": {
          name: "rx-container",
          content: ".rx-container { position: relative; }",
        },
      },
      components: [
        {
          id: "container-1",
          type: "container",
          template: {
            tag: "div",
            classRefs: ["rx-comp", "rx-container"],
            style: {},
          },
          layout: { x: 10, y: 20, width: 300, height: 200 },
          parentId: null,
          siblingIndex: 0,
          createdAt: Date.now(),
        },
        {
          id: "btn-1",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-comp", "rx-button"],
            style: {
              background: "rgb(0, 122, 204)",
              color: "rgb(255, 255, 255)",
              padding: "8px 16px",
            },
          },
          content: {
            content: "Submit Form",
            text: "Submit Form",
            disabled: false,
          },
          layout: { x: 30, y: 40, width: 120, height: 40 },
          parentId: "container-1",
          siblingIndex: 0,
          createdAt: Date.now(),
        },
      ],
    };

    // Provide UI file content in payload
    ctx.payload.uiFileContent = ui;

    // Execute import flow using the new refactored handler
    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    // Validate CSS injected
    const styleEl = document.getElementById("rx-components-styles");
    expect(styleEl).toBeTruthy();
    const cssText = styleEl?.textContent || "";
    expect(cssText).toContain(".rx-button");
    expect(cssText).toContain(".rx-container");

    // DOM verified above; selection forwarding is covered by import.selection.spec.ts
    const container = document.getElementById(
      "container-1"
    ) as HTMLElement | null;
    const btn = document.getElementById("btn-1") as HTMLElement | null;
    expect(container).toBeTruthy();
    expect(btn).toBeTruthy();

    // Parent/child relationship
    expect(btn?.parentElement?.id).toBe("container-1");

    // Classes and layout styles
    expect(container?.classList.contains("rx-container")).toBe(true);
    expect(btn?.classList.contains("rx-button")).toBe(true);
    expect(btn?.style.position).toBe("absolute");
    expect(btn?.style.left).toBe("30px");
    expect(btn?.style.top).toBe("40px");
    expect(btn?.style.width).toBe("120px");
    expect(btn?.style.height).toBe("40px");

    // Template.style properties applied
    expect(btn?.style.background).toBe("rgb(0, 122, 204)");
    expect(btn?.style.color).toBe("rgb(255, 255, 255)");
    expect(btn?.style.padding).toBe("8px 16px");

    // Content properties applied
    expect(btn?.textContent).toBe("Submit Form");
    expect((btn as HTMLButtonElement)?.disabled).toBe(false);

    // KV registered for both
    const puts = ctx._ops.filter((o: any[]) => o[0] === "kv.put");
    expect(puts.length).toBe(2);
    const ids = puts.map(([, id]) => id);
    expect(ids).toEqual(expect.arrayContaining(["container-1", "btn-1"]));

    // Verify content was stored in KV
    const btnKvCall = puts.find((call: any) => call[1] === "btn-1");
    expect(btnKvCall).toBeDefined();
    expect(btnKvCall[2].content).toBeDefined();
    expect(btnKvCall[2].content.content).toBe("Submit Form");
  });

  it("orders siblings by siblingIndex when applying hierarchy", async () => {
    const ctx = makeCtx();
    const ui = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {},
      components: [
        {
          id: "parent",
          type: "container",
          template: {
            tag: "div",
            classRefs: ["rx-comp", "rx-container"],
            style: {},
          },
          layout: { x: 0, y: 0, width: 300, height: 100 },
          parentId: null,
          siblingIndex: 0,
        },
        {
          id: "child-b",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-comp", "rx-button"],
            style: {},
          },
          layout: { x: 0, y: 0, width: 80, height: 30 },
          parentId: "parent",
          siblingIndex: 1,
        },
        {
          id: "child-a",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-comp", "rx-button"],
            style: {},
          },
          layout: { x: 0, y: 0, width: 80, height: 30 },
          parentId: "parent",
          siblingIndex: 0,
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    await handlers.parseUiFile({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const parent = document.getElementById("parent") as HTMLElement;
    const order = Array.from(parent.children).map((c) => (c as HTMLElement).id);
    expect(order).toEqual(["child-a", "child-b"]);
  });

  it("NEW: uses createComponentsSequentially to call canvas.component.create for each component", async () => {
    const ctx = makeCtx();
    const ui = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {
        "rx-comp": {
          name: "rx-comp",
          content: ".rx-comp { position: absolute; box-sizing: border-box; }",
        },
        "rx-button": {
          name: "rx-button",
          content: ".rx-button { background: #3b82f6; color: white; }",
        },
      },
      components: [
        {
          id: "btn-new-1",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-comp", "rx-button"],
            style: {
              background: "rgb(0, 122, 204)",
              color: "rgb(255, 255, 255)",
            },
          },
          content: {
            text: "New Button",
          },
          layout: { x: 50, y: 60, width: 100, height: 35 },
          parentId: null,
          siblingIndex: 0,
          createdAt: Date.now(),
        },
      ],
    };

    ctx.payload.uiFileContent = ui;

    // Execute new import flow using createComponentsSequentially
    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    // Verify that canvas.component.create was called
    const conductorCalls = ctx._ops.filter(
      (o: any[]) => o[0] === "conductor.play"
    );
    expect(conductorCalls.length).toBe(1);
    expect(conductorCalls[0][1]).toBe("CanvasComponentPlugin");
    expect(conductorCalls[0][2]).toBe("canvas-component-create-symphony");

    // Verify the data transformation was correct
    const createPayload = conductorCalls[0][3];
    expect(createPayload.component.template.tag).toBe("button");
    expect(createPayload.component.template.classes).toEqual([
      "rx-comp",
      "rx-button",
    ]);
    expect(createPayload.component.template.text).toBe("New Button");
    expect(createPayload.position).toEqual({ x: 50, y: 60 });
    expect(createPayload._overrideNodeId).toBe("btn-new-1");
    expect(createPayload.component.template.dimensions).toEqual({
      width: 100,
      height: 35,
    });

    // Verify that interaction handlers are passed (like library drop flow)
    expect(createPayload.onComponentCreated).toBeUndefined(); // Import doesn't need this
    expect(createPayload.onDragStart).toBeDefined();
    expect(createPayload.onDragMove).toBeDefined();
    expect(createPayload.onDragEnd).toBeDefined();
    expect(createPayload.onSelected).toBeDefined();

    // Verify the component was created in DOM (through mocked create symphony)
    const btn = document.getElementById("btn-new-1") as HTMLElement | null;
    expect(btn).toBeTruthy();
    expect(btn?.tagName.toLowerCase()).toBe("button");

    // Verify createdComponents tracking
    expect(ctx.payload.createdComponents).toBeDefined();
    expect(ctx.payload.createdComponents.length).toBe(1);
    expect(ctx.payload.createdComponents[0]).toEqual({
      id: "btn-new-1",
      parentId: null,
      siblingIndex: 0,
    });
  });

  it("should populate css field from component templates for variant components", async () => {
    const ctx = makeCtx();
    setupCanvas();

    // Mock UI file with button component (has variants)
    const ui = {
      version: "1.0.0",
      metadata: { createdAt: "2023-01-01T00:00:00.000Z" },
      cssClasses: {},
      components: [
        {
          id: "test-button",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-button"],
            style: {},
          },
          layout: { x: 100, y: 100, width: 120, height: 40 },
          content: {
            content: "Test Button",
            variant: "primary",
            size: "medium",
          },
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    // Execute parseUiFile
    await handlers.parseUiFile({}, ctx);

    // Verify that the button component has CSS populated
    const importComponents = ctx.payload.importComponents;
    expect(importComponents).toHaveLength(1);

    const buttonComponent = importComponents[0];
    expect(buttonComponent.type).toBe("button");
    expect(buttonComponent.css).toBeDefined();
    expect(typeof buttonComponent.css).toBe("string");

    // Verify CSS contains variant selectors
    expect(buttonComponent.css).toContain(".rx-button");
    expect(buttonComponent.css).toContain("rx-button--primary");
    expect(buttonComponent.css).toContain("rx-button--secondary");
    expect(buttonComponent.css).toContain("rx-button--danger");
    expect(buttonComponent.css).toContain("rx-button--small");
    expect(buttonComponent.css).toContain("rx-button--medium");
    expect(buttonComponent.css).toContain("rx-button--large");
  });

  it("should handle missing component templates gracefully", async () => {
    const ctx = makeCtx();
    setupCanvas();

    // Mock UI file with non-existent component type
    const ui = {
      version: "1.0.0",
      metadata: { createdAt: "2023-01-01T00:00:00.000Z" },
      cssClasses: {},
      components: [
        {
          id: "test-unknown",
          type: "unknown-component",
          template: {
            tag: "div",
            classRefs: [],
            style: {},
          },
          layout: { x: 100, y: 100, width: 100, height: 100 },
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    // Execute parseUiFile - should not throw
    await handlers.parseUiFile({}, ctx);

    // Verify component is still processed but without CSS
    const importComponents = ctx.payload.importComponents;
    expect(importComponents).toHaveLength(1);

    const unknownComponent = importComponents[0];
    expect(unknownComponent.type).toBe("unknown-component");
    expect(unknownComponent.css).toBeUndefined();
  });

  it("should inject template CSS through full sequence flow with conductor", async () => {
    const ctx = makeCtx();
    setupCanvas();

    // Mock UI file with button component (has variants)
    const ui = {
      version: "1.0.0",
      metadata: { createdAt: "2023-01-01T00:00:00.000Z" },
      cssClasses: {},
      components: [
        {
          id: "test-button-sequence",
          type: "button",
          template: {
            tag: "button",
            classRefs: ["rx-button", "rx-button--primary"],
            style: {},
          },
          layout: { x: 150, y: 150, width: 120, height: 40 },
          content: {
            content: "Sequence Test Button",
            variant: "primary",
            size: "medium",
          },
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    // Execute full import sequence flow
    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    // Verify conductor.play was called for canvas.component.create
    const conductorCalls = ctx._ops.filter(
      (o: any[]) =>
        o[0] === "conductor.play" && o[2] === "canvas-component-create-symphony"
    );
    expect(conductorCalls.length).toBeGreaterThan(0);

    // Verify the create payload includes CSS from template
    const createCall = conductorCalls[0];
    const createPayload = createCall[3];
    expect(createPayload.component.template.css).toBeDefined();
    expect(typeof createPayload.component.template.css).toBe("string");
    expect(createPayload.component.template.css).toContain(".rx-button");
    expect(createPayload.component.template.css).toContain(
      "rx-button--primary"
    );

    // Verify the button element was created in DOM
    const buttonElement = document.getElementById("test-button-sequence");
    expect(buttonElement).toBeTruthy();
    expect(buttonElement?.tagName.toLowerCase()).toBe("button");
    expect(buttonElement?.textContent).toBe("Sequence Test Button");

    // Verify CSS was injected into the page
    const styleEl = document.getElementById("rx-components-styles");
    expect(styleEl).toBeTruthy();
    const cssText = styleEl?.textContent || "";
    expect(cssText).toContain(".rx-button");
    expect(cssText).toContain("rx-button--primary");
  });
});
