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

describe("import flow injects instance class on DOM elements", () => {
  beforeEach(() => setupCanvas());

  it("adds rx-comp-<tag>-<id> class for imported components", async () => {
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
        "rx-container": {
          name: "rx-container",
          content: ".rx-container { position: relative; }",
        },
      },
      components: [
        {
          id: "container-1",
          type: "container",
          template: { tag: "div", classRefs: ["rx-container"], style: {} },
          layout: { x: 0, y: 0, width: 300, height: 200 },
          parentId: null,
          siblingIndex: 0,
        },
        {
          id: "btn-1",
          type: "button",
          template: { tag: "button", classRefs: ["rx-button"], style: {} },
          content: { text: "Hello" },
          layout: { x: 10, y: 20, width: 120, height: 40 },
          parentId: "container-1",
          siblingIndex: 0,
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const container = document.getElementById("container-1") as HTMLElement;
    const button = document.getElementById("btn-1") as HTMLElement;

    expect(container).toBeTruthy();
    expect(button).toBeTruthy();

    // compute expected instance classes (shortId strips rx-node- prefix if present)
    const containerInstance = `rx-comp-div-container-1`;
    const buttonInstance = `rx-comp-button-btn-1`;

    expect(container.classList.contains(containerInstance)).toBe(true);
    expect(button.classList.contains(buttonInstance)).toBe(true);
  });
});

