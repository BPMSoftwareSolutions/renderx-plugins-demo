/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/import/import.symphony";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";

function setupCanvas() {
  document.body.innerHTML = `<div id="rx-canvas" style="position:absolute; left:0; top:0; width:1200px; height:800px;"></div>`;
}

function makeCtx() {
  const ops: any[] = [];
  return {
    payload: {},
    io: {
      kv: { put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])) },
    },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
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

describe("canvas-component import: nested structures", () => {
  beforeEach(setupCanvas);

  it("imports container inside container", async () => {
    const ctx = makeCtx();
    ctx.payload.uiFileContent = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {
        "rx-container": {
          name: "rx-container",
          content: ".rx-container{position:relative}",
        },
      },
      components: [
        {
          id: "outer",
          type: "container",
          template: { tag: "div", classRefs: ["rx-comp", "rx-container"] },
          layout: { x: 10, y: 10, width: 400, height: 300 },
          parentId: null,
          siblingIndex: 0,
        },
        {
          id: "inner",
          type: "container",
          template: { tag: "div", classRefs: ["rx-comp", "rx-container"] },
          layout: { x: 20, y: 20, width: 200, height: 150 },
          parentId: "outer",
          siblingIndex: 0,
        },
      ],
    };
    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const inner = document.getElementById("inner")!;
    expect(inner.parentElement?.id).toBe("outer");
    expect((document.getElementById("outer") as HTMLElement).dataset.role).toBe(
      "container"
    );
    expect((document.getElementById("inner") as HTMLElement).dataset.role).toBe(
      "container"
    );
  });

  it("imports grandchild component in nested container", async () => {
    const ctx = makeCtx();
    ctx.payload.uiFileContent = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {
        "rx-container": {
          name: "rx-container",
          content: ".rx-container{position:relative}",
        },
        "rx-button": {
          name: "rx-button",
          content: ".rx-button{background:#3b82f6;color:#fff}",
        },
      },
      components: [
        {
          id: "outer",
          type: "container",
          template: { tag: "div", classRefs: ["rx-comp", "rx-container"] },
          layout: { x: 0, y: 0, width: 500, height: 400 },
          parentId: null,
          siblingIndex: 0,
        },
        {
          id: "inner",
          type: "container",
          template: { tag: "div", classRefs: ["rx-comp", "rx-container"] },
          layout: { x: 20, y: 20, width: 300, height: 200 },
          parentId: "outer",
          siblingIndex: 0,
        },
        {
          id: "btn",
          type: "button",
          template: { tag: "button", classRefs: ["rx-comp", "rx-button"] },
          layout: { x: 10, y: 10, width: 120, height: 40 },
          parentId: "inner",
          siblingIndex: 0,
        },
      ],
    };

    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const btn = document.getElementById("btn")!;
    expect(btn.parentElement?.id).toBe("inner");
    expect(btn.classList.contains("rx-button")).toBe(true);
    const cssText =
      document.getElementById("rx-components-styles")?.textContent || "";
    expect(cssText).toContain(".rx-button");
  });
});
