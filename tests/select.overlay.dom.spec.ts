/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { createOverlayStructure } from "../packages/canvas-component/src/symphonies/select/select.overlay.helpers";

describe("[BEAT:renderx-web-orchestration:select:1.1] createOverlayStructure", () => {
  it("[AC:renderx-web-orchestration:select:1.1:1] creates overlay and handles when missing", () => {
    const canvas = document.createElement("div");
    canvas.id = "test-canvas";
    document.body.appendChild(canvas);
    const ov = createOverlayStructure(canvas);
    expect(ov).toBeTruthy();
    expect(ov.id).toBe("rx-adv-line-overlay");
    expect(ov.querySelectorAll('.handle.a').length).toBe(1);
    expect(ov.querySelectorAll('.handle.b').length).toBe(1);
    // cleanup
    ov.remove();
    canvas.remove();
  });
});
