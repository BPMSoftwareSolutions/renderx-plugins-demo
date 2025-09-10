import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Panel CSS files use theme variables", () => {
  const candidates = [
    path.resolve(process.cwd(), "node_modules/@renderx-plugins/library/dist/ui/LibraryPanel.css"),
    path.resolve(__dirname, "../../plugins/control-panel/ui/ControlPanel.css"),
  ];
  const files = candidates.filter((f) => fs.existsSync(f));

  it("headers use panel header variables where present", () => {
    const lib = fs.readFileSync(files[0], "utf-8");
    expect(lib).toMatch(/background:\s*var\(--panel-header-bg\)/);
  });

  it("panels use panel background/border/shadow vars", () => {
    for (const f of files) {
      const css = fs.readFileSync(f, "utf-8");
      expect(css).toMatch(/background:\s*var\(--panel-bg\)/);
      expect(css).toMatch(/border-(left|right|top|bottom):\s*1px solid var\(--panel-border\)/);
    }
  });
});

