/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select/select.stage-crew";

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

function dispatchMouse(el: Element | Document, type: string, opts: any) {
  const ev = new MouseEvent(type, { bubbles: true, cancelable: true, ...opts });
  (el as any).dispatchEvent(ev);
}

describe("canvas-component drag: hides selection overlay during drag and shows on drop", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("hides overlay while dragging and restores visibility on drag end (drop)", () => {
    const ctx: any = { payload: {} };
    const template = makeTemplate();

    // Create a component on the canvas
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId as string;
    const el = document.getElementById(id)! as HTMLElement;

    // Show the selection overlay for the created element
    showSelectionOverlay({ id });

    const overlay = document.getElementById("rx-selection-overlay") as HTMLDivElement;
    expect(overlay).toBeTruthy();

    // Overlay should be visible initially (not hidden)
    expect(overlay.style.display).not.toBe("none");

    // Begin drag on the element
    dispatchMouse(el, "mousedown", { clientX: 50, clientY: 50, button: 0 });
    // Move mouse to trigger drag move handler
    dispatchMouse(document, "mousemove", { clientX: 80, clientY: 90 });

    // EXPECTED (to drive implementation): overlay should hide during drag
    // This will fail with current implementation, since overlay isn't hidden on drag start
    expect(overlay.style.display).toBe("none");

    // End drag (drop)
    dispatchMouse(document, "mouseup", { clientX: 80, clientY: 90 });

    // EXPECTED (to drive implementation): overlay should be visible again after drag ends
    expect(overlay.style.display).not.toBe("none");
  });
});

