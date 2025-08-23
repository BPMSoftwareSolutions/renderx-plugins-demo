/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select.stage-crew";

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

function makeCtx() {
  return { payload: {} } as any;
}

function dispatchMouse(el: Element, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("canvas-component resize (DOM-only)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("resizes the element via SE handle drag", () => {
    const ctx: any = makeCtx();
    const template = makeTemplate();

    handlers.resolveTemplate({ component: { template } } as any, ctx);
    handlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)!;

    // Show overlay (creates handles)
    showSelectionOverlay({ id });

    const overlay = document.getElementById("rx-selection-overlay")!;
    const se = overlay.querySelector(".rx-handle.se")!;

    // initial size
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("50px");

    // Start drag near bottom-right
    dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    // Move mouse by +20,+30
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 220, clientY: 230, bubbles: true }));
    // End
    document.dispatchEvent(new MouseEvent("mouseup", { clientX: 220, clientY: 230, bubbles: true }));

    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("80px");
  });
});

