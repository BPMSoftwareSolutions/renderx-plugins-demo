import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// This test enforces that CanvasPage.css uses CSS variables for core colors
// to support light/dark theming.
describe("CanvasPage.css theming", () => {
  const cssPath = path.resolve(__dirname, "../../node_modules/@renderx-plugins/canvas/dist/index.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  it("uses variables for background and header border", () => {
    expect(css).toMatch(/background:\s*var\(--bg\)/);
    expect(css).toMatch(/border-bottom:\s*1px solid var\(--panel-border\)/);
  });

  it("uses control variables and accent tokens", () => {
    expect(css).toMatch(/background:\s*var\(--control-bg\)/);
    expect(css).toMatch(/background:\s*var\(--control-hover-bg\)/);
    expect(css).toMatch(/background:\s*var\(--panel-bg\)/);
    expect(css).toMatch(/var\(--accent-bg\)/);
    expect(css).toMatch(/var\(--accent-border\)/);
  });

  it("uses themed canvas grid dot color", () => {
    expect(css).toMatch(/var\(--canvas-grid-dot\)/);
  });
});

