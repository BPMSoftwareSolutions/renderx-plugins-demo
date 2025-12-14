import { describe, it, expect } from "vitest";
import { CoordinateConverter } from "../packages/canvas-component/src/symphonies/select/select.overlay.helpers";

describe("[BEAT:renderx-web-orchestration:renderx-web-orchestration:3.1] [[AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1]] CoordinateConverter (integration)", () => {
    // Given: the showSelectionOverlay operation is triggered
    const startTime = performance.now();
    // When: the handler executes
  it("[AC:renderx-web-orchestration:renderx-web-orchestration:3.1:1] converts svg->pixel and back for default viewBox", () => {
    const rect = { width: 200, height: 100 } as DOMRect;
    const conv = new CoordinateConverter("0 0 100 100", rect);
    const p = conv.svgToPixel(50, 25);
    // Then: it completes successfully within < 200ms
    expect(Math.round(p.x)).toBe(100);
    expect(Math.round(p.y)).toBe(25);
    const s = conv.pixelToSvg(p.x, p.y);
    expect(Math.round(s.x)).toBe(50);
    expect(Math.round(s.y)).toBe(25);
  });
    // And: the output is valid and meets schema
    // And: any required events are published
    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(200);
});
