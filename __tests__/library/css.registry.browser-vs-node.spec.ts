import { describe, it, expect, vi } from "vitest";
import { handlers } from "@renderx-plugins/library";

// Mock JSON component with CSS variants
const mockJsonButton = {
  metadata: {
    type: "button",
    name: "Button",
    replaces: "button",
  },
  ui: {
    styles: {
      css: ".rx-button { background: var(--bg-color); } .rx-button--primary { --bg-color: #007bff; } .rx-button--secondary { --bg-color: #6c757d; } .rx-button--danger { --bg-color: #dc3545; }",
    },
  },
};

describe("CSS registration works in both browser and Node.js paths", () => {
  it("browser path loads components and exposes JSON CSS via payload (registry handled by UI)", async () => {
    // Mock browser environment with fetch
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ components: ["button.json"] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonButton),
      });

    const ctx: any = {
      payload: {},
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    await handlers.loadComponents({}, ctx);

    // Assert the component list is populated and the raw CSS is present in the item
    expect(Array.isArray(ctx.payload.components)).toBe(true);
    expect(ctx.payload.components.length).toBeGreaterThan(0);
    const first = ctx.payload.components[0];
    // ui.styles.css carries JSON CSS for UI to route to Control Panel
    expect(first?.ui?.styles?.css || "").toContain(".rx-button--primary");
    expect(first?.ui?.styles?.css || "").toContain(".rx-button--secondary");
    expect(first?.ui?.styles?.css || "").toContain(".rx-button--danger");
  });
});
