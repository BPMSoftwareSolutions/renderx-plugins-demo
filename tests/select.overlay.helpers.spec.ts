import { describe, it, expect } from "vitest";
import { CoordinateConverter } from "../packages/canvas-component/src/symphonies/select/select.overlay.helpers";

describe("CoordinateConverter (integration)", () => {
  it("converts svg->pixel and back for default viewBox", () => {
    const rect = { width: 200, height: 100 } as DOMRect;
    const conv = new CoordinateConverter("0 0 100 100", rect);
    const p = conv.svgToPixel(50, 25);
    expect(Math.round(p.x)).toBe(100);
    expect(Math.round(p.y)).toBe(25);
    const s = conv.pixelToSvg(p.x, p.y);
    expect(Math.round(s.x)).toBe(50);
    expect(Math.round(s.y)).toBe(25);
  });
});
