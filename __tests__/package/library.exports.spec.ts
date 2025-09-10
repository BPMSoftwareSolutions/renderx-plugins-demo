import { describe, it, expect } from "vitest";
import path from "node:path";
import { readFile } from "node:fs/promises";

function toFileUrl(p: string) {
  const resolved = path.resolve(p);
  const normalized = resolved.replace(/\\/g, "/");
  return new URL(`file://${normalized}`);
}

describe("@renderx-plugins/library package exports (dist)", () => {
  it("package.json exports and sideEffects are configured as expected", async () => {
    const pkgPath = path.resolve("packages/renderx-plugin-library/package.json");
    const raw = await readFile(pkgPath, "utf8");
    const pkg = JSON.parse(raw);

    expect(pkg.main).toBe("./dist/index.js");
    expect(pkg.module).toBe("./dist/index.js");
    expect(pkg.exports["."].import).toBe("./dist/index.js");
    expect(pkg.exports["./symphonies/*"].import).toBe("./dist/symphonies/*.js");

    expect(Array.isArray(pkg.sideEffects)).toBe(true);
    expect(pkg.sideEffects).toContain("./dist/**/*.css");
  });

  it("dist/index.js exposes LibraryPanel, handlers, and register", async () => {
    const distUrl = toFileUrl("packages/renderx-plugin-library/dist/index.js");
    const mod: any = await import(distUrl.href);

    expect(mod).toBeTruthy();
    expect(typeof mod.LibraryPanel).toBe("function");
    expect(typeof mod.register).toBe("function");
    expect(typeof mod.handlers).toBe("object");
    expect(typeof mod.handlers.loadComponents).toBe("function");
  });
});

