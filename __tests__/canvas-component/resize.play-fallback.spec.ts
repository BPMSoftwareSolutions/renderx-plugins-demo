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

describe("resize overlay: falls back to DOM updates if conductor.play throws", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("does not throw and updates styles when conductor.play throws TypeError", () => {
    const ctx: any = { payload: {} };
    const template = makeTemplate();

    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId as string;
    const el = document.getElementById(id)! as HTMLElement;

    // Conductor that has a play function but throws like in the logs
    const conductor = {
      play: vi.fn(() => {
        throw new TypeError("Cannot read properties of undefined (reading 'pluginInterface')");
      }),
    };

    // Attach overlay with the throwing conductor
    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay") as HTMLDivElement;
    const se = overlay.querySelector(".rx-handle.se")!;

    // mousedown should not throw; current implementation will throw, making this test RED
    expect(() => {
      dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    }).not.toThrow();

    // Move to trigger DOM fallback path and update sizes
    dispatchMouse(document, "mousemove", { clientX: 230, clientY: 220 });
    dispatchMouse(document, "mouseup", { clientX: 230, clientY: 220 });

    // After move, element should reflect new size via direct style updates
    expect(el.style.width).toBe("130px");
    expect(el.style.height).toBe("70px");

    // Overlay should match element's rect (displayed)
    expect(overlay.style.display).toBe("block");
    expect(overlay.style.width).toBe(el.style.width);
    expect(overlay.style.height).toBe(el.style.height);
  });
});

