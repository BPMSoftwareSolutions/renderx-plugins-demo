import { describe, it, expect } from "vitest";

// Helper to load JSON from public or source as raw depending on environment if needed
async function loadJson(path: string): Promise<any> {
  // Try runtime import first (Vite raw import in dev/test)
  try {
    // @ts-ignore
    const mod = await import(/* @vite-ignore */ `${path}?raw`);
    const txt: string = (mod as any)?.default || (mod as any) || "{}";
    return JSON.parse(txt);
  } catch {
    // Fallback to fetch when running in browser-like env with dev server
    if (typeof fetch === "function") {
      const res = await fetch(path);
      if (res.ok) return await res.json();
    }
    throw new Error(`Unable to load JSON at ${path}`);
  }
}

describe("Canvas externalization (issue #129)", () => {
  it("plugin-manifest: Canvas UI should be loaded via package specifier", async () => {
    // Prefer catalog-generated manifest (present in repo/CI), fallback to public for local dev
    const manifest = await loadJson(
      "../catalog/json-plugins/.generated/plugin-manifest.json"
    ).catch(() => loadJson("../public/plugins/plugin-manifest.json"));
    const canvas = (manifest.plugins || []).find(
      (p: any) => p?.id === "CanvasPlugin"
    );
    expect(canvas).toBeTruthy();
    const uiMod: string = canvas.ui?.module;
    expect(typeof uiMod).toBe("string");
    expect(uiMod.startsWith("@renderx-plugins/canvas")).toBe(true);
  });

  it("json-sequences: canvas-component handlers should be bare package specifiers", async () => {
    const idx = await loadJson("../json-sequences/canvas-component/index.json");
    const seqs: Array<{ file: string; handlersPath: string }> =
      idx.sequences || [];
    expect(seqs.length).toBeGreaterThan(0);
    for (const s of seqs) {
      expect(typeof s.handlersPath).toBe("string");
      expect(
        s.handlersPath.startsWith("@renderx-plugins/canvas-component/")
      ).toBe(true);
    }
  });
});
