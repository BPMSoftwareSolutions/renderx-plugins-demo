import { describe, it, expect } from "vitest";
import path from "node:path";
import { readFile } from "node:fs/promises";

describe("@renderx-plugins/library package manifest/exports", () => {
  it("package.json has correct name and exports fields", async () => {
    const pkgPath = path.resolve(__dirname, "../package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

    expect(pkg.name).toBe("@renderx-plugins/library");
    expect(pkg.main).toBe("dist/index.js");
    expect(pkg.module ?? pkg.main).toBe("dist/index.js");

    // Exports map
    expect(pkg.exports["."].import).toMatch(/\.\/dist\/index\.js$/);
    expect(pkg.exports["./symphonies/*"].import).toMatch(/\.\/dist\/symphonies\/*\.js$/);
  });
});

