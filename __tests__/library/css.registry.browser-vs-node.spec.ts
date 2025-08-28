import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library/symphonies/load.symphony";
import { cssRegistry } from "../../plugins/control-panel/state/css-registry.store";

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
  it("browser path registers CSS correctly (this should pass)", async () => {
    // Clear any existing CSS first
    if (cssRegistry.hasClass("rx-button")) {
      cssRegistry.updateClass(
        "rx-button",
        ".rx-button { /* built-in only */ }"
      );
    }

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

    // This should pass but currently fails because CSS registration doesn't work in browser path
    const buttonClass = cssRegistry.getClass("rx-button");
    expect(buttonClass).toBeDefined();

    console.log("Components loaded:", ctx.payload.components?.length);
    console.log(
      "First component structure:",
      JSON.stringify(ctx.payload.components?.[0], null, 2)
    );
    console.log(
      "Button CSS content:",
      buttonClass?.content?.substring(0, 100) + "..."
    );

    // These assertions will fail because CSS registration doesn't work with wrapped structure
    expect(buttonClass?.content).toContain(".rx-button--primary");
    expect(buttonClass?.content).toContain(".rx-button--secondary");
    expect(buttonClass?.content).toContain(".rx-button--danger");
  });
});
