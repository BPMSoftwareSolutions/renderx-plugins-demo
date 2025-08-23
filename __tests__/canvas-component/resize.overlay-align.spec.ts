/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select.stage-crew";
import { handlers as resizeStartHandlers } from "../../plugins/canvas-component/symphonies/resize.start.symphony";
import { handlers as resizeMoveHandlers } from "../../plugins/canvas-component/symphonies/resize.move.symphony";
import { handlers as resizeEndHandlers } from "../../plugins/canvas-component/symphonies/resize.end.symphony";

function makeTemplate() {
  return {
    tag: "button",
    text: "Click me",
    classes: ["rx-comp", "rx-button"],
    css: ".rx-button { background: #007acc; color: #fff; }",
    cssVariables: {},
    dimensions: { width: 100, height: 50 },
  };
}

function dispatchMouse(el: Element, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("selection overlay remains aligned with component after resize (conductor)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("keeps overlay aligned with element's width/height after dragging SE handle", () => {
    const ctx: any = { payload: {} };
    const template = makeTemplate();
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)! as HTMLElement;

    const conductor = {
      play: (_pluginId: string, seqId: string, payload: any) => {
        if (seqId === "canvas-component-resize-start-symphony") {
          resizeStartHandlers.startResize?.(payload, {});
        } else if (seqId === "canvas-component-resize-move-symphony") {
          resizeMoveHandlers.updateSize?.(payload, {});
        } else if (seqId === "canvas-component-resize-end-symphony") {
          resizeEndHandlers.endResize?.(payload, {});
        }
      },
    };

    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay") as HTMLDivElement;
    const se = overlay.querySelector(".rx-handle.se")!;

    // drag to resize: +30 width, +20 height
    dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 230, clientY: 220, bubbles: true }));
    document.dispatchEvent(new MouseEvent("mouseup", { clientX: 230, clientY: 220, bubbles: true }));

    // Failing expectation (current behavior in jsdom: overlay width/height derive from getBoundingClientRect: 0)
    // Desired: overlay style matches element style
    expect(overlay.style.width).toBe(el.style.width);
    expect(overlay.style.height).toBe(el.style.height);
    expect(overlay.style.left).toBe(el.style.left);
    expect(overlay.style.top).toBe(el.style.top);
  });
});

