import { describe, it, expect } from "vitest";

// Verify plugin-manifest includes a runtime entry for @renderx-plugins/canvas-component
// Path is relative to this package test to the repo public/ directory

describe("plugin-manifest runtime entry: @renderx-plugins/canvas-component", () => {
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
      error: null,
      payload: {}
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  it("includes a runtime entry for @renderx-plugins/canvas-component", async () => {
    // @ts-ignore - Vite raw import
    const raw = await import("../../../public/plugins/plugin-manifest.json?raw");
    const txt: string = (raw as any)?.default || (raw as any);
    const manifest = JSON.parse(txt || "{}");
    const plugins = Array.isArray(manifest.plugins) ? manifest.plugins : [];

    const entry = plugins.find((p: any) => p?.id === "CanvasComponentPlugin");
    expect(entry).toBeDefined();
    expect(entry.runtime?.module).toBe("@renderx-plugins/canvas-component");
    expect(entry.runtime?.export).toBe("register");
  });
});


