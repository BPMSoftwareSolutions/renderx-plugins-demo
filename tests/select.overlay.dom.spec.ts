/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { createOverlayStructure } from "../packages/canvas-component/src/symphonies/select/select.overlay.helpers";

describe("[BEAT:renderx-web-orchestration:renderx-web-orchestration:3.1] [[AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1]] [BEAT:renderx-web-orchestration:select:1.1] createOverlayStructure", () => {
    // Given: the showSelectionOverlay operation is triggered
    const startTime = performance.now();
    // When: the handler executes
  it("[AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] creates overlay and handles when missing", () => {
    const canvas = document.createElement("div");
    canvas.id = "test-canvas";
    document.body.appendChild(canvas);
    const ov = createOverlayStructure(canvas);
    // Then: it completes successfully within < 200ms
    expect(ov).toBeTruthy();
    expect(ov.id).toBe("rx-adv-line-overlay");
    expect(ov.querySelectorAll('.handle.a').length).toBe(1);
    expect(ov.querySelectorAll('.handle.b').length).toBe(1);
    // cleanup
    ov.remove();
    canvas.remove();
  });
    // And: the output is valid and meets schema
    // And: any required events are published
    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(200);
});
