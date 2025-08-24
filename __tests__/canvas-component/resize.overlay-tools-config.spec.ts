/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select/select.stage-crew";

function dispatchMouse(el: Element, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("resize overlay driven by template tools config", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("shows only handles listed in data-resize-handles", () => {
    const ctx: any = { payload: {} };
    const template = {
      tag: "div",
      text: "",
      classes: ["rx-comp", "rx-box"],
      css: ".rx-box { background: #eee; }",
      cssVariables: {},
      dimensions: { width: 100, height: 60 },
      // new: attach attributes that mirror JSON ui.tools.resize mapping
      attributes: {
        "data-resize-enabled": "true",
        "data-resize-handles": "e,se,s",
      },
    } as any;

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;

    // When overlay is shown, it should respect handle list
    showSelectionOverlay({ id });

    const overlay = document.getElementById("rx-selection-overlay")! as HTMLDivElement;
    const handles = Array.from(overlay.querySelectorAll(".rx-handle")) as HTMLDivElement[];

    const visible = handles.filter(h => (h.style.display || "") !== "none").map(h =>
      Array.from(h.classList).find(c => ["n","s","e","w","nw","ne","sw","se"].includes(c))
    );

    expect(new Set(visible)).toEqual(new Set(["e", "se", "s"]));
  });

  it("enforces min width/height constraints from data attributes during resize", () => {
    const ctx: any = { payload: {} };
    const template = {
      tag: "div",
      text: "",
      classes: ["rx-comp", "rx-box"],
      css: ".rx-box { background: #eee; }",
      cssVariables: {},
      dimensions: { width: 100, height: 50 },
      attributes: {
        "data-resize-enabled": "true",
        "data-resize-handles": "nw,ne,se,sw,n,s,e,w",
        "data-resize-min-w": "80",
        "data-resize-min-h": "30",
      },
    } as any;

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;
    showSelectionOverlay({ id });

    const overlay = document.getElementById("rx-selection-overlay")! as HTMLDivElement;
    const nw = overlay.querySelector(".rx-handle.nw")! as HTMLDivElement;

    // Drag NW inward by +40 x, +30 y (attempting to shrink below min)
    dispatchMouse(nw, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 240, clientY: 230, bubbles: true }));
    document.dispatchEvent(new MouseEvent("mouseup", { clientX: 240, clientY: 230, bubbles: true }));

    const el = document.getElementById(id)! as HTMLElement;
    expect(el.style.width).toBe("80px");
    expect(el.style.height).toBe("30px");
  });

  it("disables resizing entirely when data-resize-enabled is false", () => {
    const ctx: any = { payload: {} };
    const template = {
      tag: "div",
      text: "",
      classes: ["rx-comp", "rx-box"],
      css: ".rx-box { background: #eee; }",
      cssVariables: {},
      dimensions: { width: 120, height: 70 },
      attributes: {
        "data-resize-enabled": "false",
        "data-resize-handles": "se", // even if provided, should be ignored when disabled
      },
    } as any;

    createHandlers.resolveTemplate({ component: { template } } as any, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } } as any, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)! as HTMLElement;

    showSelectionOverlay({ id });
    const overlay = document.getElementById("rx-selection-overlay")! as HTMLDivElement;
    const se = overlay.querySelector(".rx-handle.se")! as HTMLDivElement;

    // Try to resize
    dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    document.dispatchEvent(new MouseEvent("mousemove", { clientX: 240, clientY: 240, bubbles: true }));
    document.dispatchEvent(new MouseEvent("mouseup", { clientX: 240, clientY: 240, bubbles: true }));

    // Expect unchanged
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("70px");
  });
});

