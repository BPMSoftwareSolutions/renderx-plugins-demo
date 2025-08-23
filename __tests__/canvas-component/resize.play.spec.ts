/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers as createHandlers } from "../../plugins/canvas-component/symphonies/create/create.symphony";
import { showSelectionOverlay } from "../../plugins/canvas-component/symphonies/select/select.stage-crew";
import { handlers as resizeHandlers } from "../../plugins/canvas-component/symphonies/resize/resize.symphony";

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

describe("canvas-component resize via conductor.play", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative"></div>';
  });

  it("should keep the resized width/height after mouseup (no snap back)", () => {
    // Arrange: create node via symphony
    const ctx: any = { payload: {} };
    const template = makeTemplate();
    createHandlers.resolveTemplate({ component: { template } }, ctx);
    createHandlers.createNode({ position: { x: 10, y: 20 } }, ctx);

    const id = ctx.payload.nodeId;
    const el = document.getElementById(id)! as HTMLElement;

    // Conductor stub that executes ALL beats sequentially (mimics current runner behavior without event filtering)
    const conductor = {
      play: (_pluginId: string, _seqId: string, payload: any) => {
        // Intentionally run start, move, end in order for every call
        try {
          (resizeHandlers as any).startResize?.(payload, {});
        } catch {}
        try {
          (resizeHandlers as any).updateSize?.(payload, {});
        } catch {}
        try {
          (resizeHandlers as any).endResize?.(payload, {});
        } catch {}
      },
    };

    // Show overlay with our conductor
    showSelectionOverlay({ id }, { conductor });

    const overlay = document.getElementById("rx-selection-overlay")!;
    const se = overlay.querySelector(".rx-handle.se")!;

    // Sanity check initial dimensions
    expect(el.style.width).toBe("100px");
    expect(el.style.height).toBe("50px");

    // Act: drag the SE handle by +20,+30
    dispatchMouse(se, "mousedown", { clientX: 200, clientY: 200, button: 0 });
    document.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 220, clientY: 230, bubbles: true })
    );

    // After move, element should be resized
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("80px");

    // Mouse up triggers another play() call — with this naive runner it will also run updateSize with dx/dy=0,
    // currently causing a snap back. This test asserts desired behavior: no snap back.
    document.dispatchEvent(
      new MouseEvent("mouseup", { clientX: 220, clientY: 230, bubbles: true })
    );

    // Expected: should remain at resized size (will FAIL with current bug)
    expect(el.style.width).toBe("120px");
    expect(el.style.height).toBe("80px");
  });
});
