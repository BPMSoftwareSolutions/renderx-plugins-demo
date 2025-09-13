import { describe, it, expect } from "vitest";

// Validate that the host plugin manifest references Canvas UI/runtime and Canvas-Component runtime
// via workspace package specifiers (no repo-relative handlers).

describe("plugin manifest — canvas entries", () => {
  it("includes Canvas UI via @renderx-plugins/canvas and Canvas-Component runtime via @renderx-plugins/canvas-component", async () => {
    // Prefer fs read of public/plugins to match preview/CI behavior
    const fs: any = await import("fs/promises");
    const path: any = await import("path");
    const cwd = (process as any).cwd?.() || process.cwd();
    const p = path.join(cwd, "public", "plugins", "plugin-manifest.json");
    const raw = await fs.readFile(p, "utf-8");
    const manifest = JSON.parse(raw);

    const get = (id: string) => manifest.plugins.find((x: any) => x.id === id);

    const canvas = get("CanvasPlugin");
    expect(canvas?.ui?.slot).toBe("canvas");
    expect(canvas?.ui?.module).toBe("@renderx-plugins/canvas");
    expect(canvas?.ui?.export).toBe("CanvasPage");
    // runtime entry for Canvas UI package is allowed but not strictly required here
    expect(canvas?.runtime?.module).toBe("@renderx-plugins/canvas");
    expect(canvas?.runtime?.export).toBe("register");

    const canvasComp = get("CanvasComponentPlugin");
    expect(canvasComp?.runtime?.module).toBe("@renderx-plugins/canvas-component");
    expect(canvasComp?.runtime?.export).toBe("register");
  });
});

