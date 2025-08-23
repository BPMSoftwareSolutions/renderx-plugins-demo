/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select/select.stage-crew";

function makeTemplate() {
  return {
    tag: "div",
    text: "",
    classes: ["rx-comp", "rx-box"],
    css: ".rx-box { background: #eee; }",
    cssVariables: {},
    dimensions: { width: 100, height: 50 },
  };
}

function dispatchMouse(el: Element | Document, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("canvas-component resize: uses correct plugin ids for start/move/end", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("routes to CanvasComponentResize{Start,Move,End}Plugin during handle drag", () => {
    const ctx: any = { payload: {} };
    const template = makeTemplate();

    // Create a component
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId as string;

    // Spy conductor to capture play invocations
    const calls: Array<{ pluginId: string; seqId: string }> = [];
    const conductor = {
      play: vi.fn((pluginId: string, seqId: string) => {
        calls.push({ pluginId, seqId });
      }),
    };

    // Show overlay (attaches resize handlers with provided conductor)
    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay") as HTMLDivElement;
    const se = overlay.querySelector(".rx-handle.se")!;

    // Trigger drag to resize
    dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    dispatchMouse(document, "mousemove", { clientX: 230, clientY: 220 });
    dispatchMouse(document, "mouseup", { clientX: 230, clientY: 220 });

    // Expected plugin routing according to plugins/canvas-component/index.ts registration
    const expected = [
      "CanvasComponentResizeStartPlugin",
      "CanvasComponentResizeMovePlugin",
      "CanvasComponentResizeEndPlugin",
    ];

    // This assertion is expected to FAIL with current implementation
    // because it incorrectly uses "CanvasComponentPlugin" for all calls.
    expect(calls.map((c) => c.pluginId)).toEqual(expected);
  });
});

