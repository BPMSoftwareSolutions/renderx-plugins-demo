/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { handlers } from "../../plugins/canvas-component/symphonies/drag/drag.symphony";

function makeCtx() {
  return { payload: {} } as any;
}

describe("canvas-component drag — transform path (flag)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="rx-canvas"></div>';
  });

  it("falls back to left/top when flag off", () => {
    const el = document.createElement("div");
    el.id = "node1";
    el.style.position = "absolute";
    el.style.left = "0px";
    el.style.top = "0px";
    document.getElementById("rx-canvas")!.appendChild(el);

    const ctx = makeCtx();
    const moveData = { id: "node1", position: { x: 10, y: 20 } };
    const result = (handlers as any).updatePosition(moveData, ctx);
    expect(result.success).toBe(true);
    expect(el.style.left).toBe("10px");
    expect(el.style.top).toBe("20px");
    expect(el.style.transform || "").toBe("");
  });

  it("uses CSS vars when perf.drag.use-transform is ON (by setFlagOverride)", async () => {
    const el = document.createElement("div");
    el.id = "node2";
    el.style.position = "absolute";
    el.style.left = "0px";
    el.style.top = "0px";
    document.getElementById("rx-canvas")!.appendChild(el);

    const mod = await import("../../src/feature-flags/flags");
    mod.setFlagOverride("perf.drag.use-transform", true);

    const ctx = makeCtx();
    const moveData = { id: "node2", position: { x: 15, y: 25 } };
    const result = (handlers as any).updatePosition(moveData, ctx);
    expect(result.success).toBe(true);
    expect(el.style.getPropertyValue("--rx-x")).toBe("15px");
    expect(el.style.getPropertyValue("--rx-y")).toBe("25px");
    // left/top unchanged in transform path
    expect(el.style.left).toBe("0px");
    expect(el.style.top).toBe("0px");

    mod.clearFlagOverrides();
  });
});
