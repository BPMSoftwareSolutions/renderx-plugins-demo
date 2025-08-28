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
    io: { kv: { put: vi.fn(async (...a: any[]) => ops.push(["kv.put", ...a])) } },
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    conductor: {
      play: vi.fn(async (pluginId: string, sequenceId: string, data: any) => {
        ops.push(["conductor.play", pluginId, sequenceId, data]);
        if (sequenceId === "canvas-component-create-symphony") {
          const createCtx = { payload: {}, io: { kv: { put: vi.fn() } } } as any;
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

describe("import variant toggle applies via rule engine", () => {
  beforeEach(setupCanvas);

  it("applies rx-button--<variant> from content.variant even if classRefs lacked it", async () => {
    const ctx = makeCtx();
    const ui = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {
        "rx-comp": { name: "rx-comp", content: ".rx-comp { position:absolute; }" },
        "rx-button": { name: "rx-button", content: ".rx-button { } .rx-button--primary { }" },
      },
      components: [
        {
          id: "btn-v1",
          type: "button",
          template: { tag: "button", classRefs: ["rx-comp", "rx-button"], style: {} },
          content: { text: "Hello", variant: "primary" },
          layout: { x: 1, y: 2, width: 10, height: 10 },
        },
      ],
    } as any;

    ctx.payload.uiFileContent = ui;

    await handlers.parseUiFile({}, ctx);
    await handlers.injectCssClasses({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    const btn = document.getElementById("btn-v1") as HTMLElement;
    expect(btn).toBeTruthy();
    expect(btn.classList.contains("rx-button")).toBe(true);
    expect(btn.classList.contains("rx-button--primary")).toBe(true);
  });
});

