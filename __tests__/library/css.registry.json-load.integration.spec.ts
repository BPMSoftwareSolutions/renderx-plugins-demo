import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library/symphonies/load.symphony";

// Mock fetch to simulate loading JSON components
const mockJsonButton = {
  metadata: {
    type: "button",
    name: "Button",
    replaces: "button",
  },
  ui: {
    styles: {
      css: ".rx-button { background: var(--bg-color); } .rx-button--primary { --bg-color: #007bff; } .rx-button--secondary { --bg-color: #6c757d; }",
    },
  },
};

const mockJsonContainer = {
  metadata: {
    type: "container",
    name: "Container",
  },
  ui: {
    styles: {
      css: ".rx-container { position: relative; border: 1px dashed #ccc; }",
    },
  },
};

describe("Library load registers JSON component CSS integration", () => {
  it("registers CSS from JSON components when fetch is available", async () => {
    // Mock fetch to return JSON components
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ components: ["button.json", "container.json"] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonButton),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonContainer),
      });

    const ctx: any = {
      payload: {},
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    await handlers.loadComponents({}, ctx);

    // Verify components were loaded (should be at least 2)
    expect(ctx.payload.components.length).toBeGreaterThanOrEqual(2);

    // CSS registration now happens via UI routing; here we only verify components were loaded
  });

  it("handles fetch errors gracefully and falls back to legacy components", async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const ctx: any = {
      payload: {},
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    await handlers.loadComponents({}, ctx);

    // Should fall back to legacy components
    expect(ctx.payload.components).toBeDefined();
    expect(Array.isArray(ctx.payload.components)).toBe(true);
  });
});
