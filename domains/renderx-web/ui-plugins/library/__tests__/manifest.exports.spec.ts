import { describe, it, expect } from "vitest";
import path from "node:path";
import { readFile } from "node:fs/promises";

describe("@renderx-plugins/library package manifest/exports", () => {
  let ctx: any;
  beforeEach(() => {
    ctx = {
      handler: null, // TODO: Import handler
      mocks: {
        database: vi.fn(),
        fileSystem: vi.fn(),
        logger: vi.fn(),
        eventBus: vi.fn()
      },
      input: {},
      output: null,
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("package.json has correct name and exports fields", async () => {
    const pkgPath = path.resolve(__dirname, "../package.json");
    const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

    expect(pkg.name).toBe("@renderx-web/library");
    expect(String(pkg.main)).toMatch(/\.?\/dist\/index\.js$/);
    expect(String(pkg.module ?? pkg.main)).toMatch(/\.?\/dist\/index\.js$/);

    // Exports map
    expect(String(pkg.exports["."].import)).toMatch(/\.\/dist\/index\.js$/);
    const symImport = String(pkg.exports["./symphonies/*"].import);
    expect(symImport.replace(/^\.\//, "")).toBe("dist/symphonies/*.js");
  });
});

