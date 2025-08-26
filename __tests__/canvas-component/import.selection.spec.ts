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
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    _ops: ops,
  } as any;
}

describe("canvas-component import: selection forwarding", () => {
  beforeEach(setupCanvas);

  it("clicking imported node plays canvas.component.select", async () => {
    const ctx = makeCtx();
    ctx.payload.uiFileContent = {
      version: "1.0.0",
      metadata: {},
      cssClasses: {},
      components: [
        {
          id: "c1",
          type: "container",
          template: { tag: "div", classRefs: ["rx-comp", "rx-container"] },
          layout: { x: 0, y: 0, width: 200, height: 100 },
          parentId: null,
          siblingIndex: 0,
        },
        {
          id: "b1",
          type: "button",
          template: { tag: "button", classRefs: ["rx-comp", "rx-button"] },
          layout: { x: 10, y: 10, width: 80, height: 30 },
          parentId: "c1",
          siblingIndex: 0,
        },
      ],
    };

    await handlers.parseUiFile({}, ctx);
    await handlers.createComponentsSequentially({}, ctx);
    await handlers.applyHierarchyAndOrder({}, ctx);

    document.getElementById("b1")!.click();
    expect(ctx.conductor.play).toHaveBeenCalled();
  });
});
