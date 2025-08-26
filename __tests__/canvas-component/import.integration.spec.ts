/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/import/import.symphony";

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

    // Execute import flow
    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createOrUpdateNodes({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);
    await handlers.registerInstances({}, ctx);

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
    await handlers.createOrUpdateNodes({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const parent = document.getElementById("parent") as HTMLElement;
    const order = Array.from(parent.children).map((c) => (c as HTMLElement).id);
    expect(order).toEqual(["child-a", "child-b"]);
  });
});
