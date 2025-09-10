import { describe, it, expect, vi } from "vitest";
import { handlers } from "../../plugins/library/symphonies/load.symphony";

describe("Debug CSS registration in browser scenario", () => {
  it("exposes JSON CSS in payload; registry updates are handled by UI routing", async () => {
    // Mock the exact scenario from your browser debugging
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ components: ["button.json"] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            metadata: {
              type: "button",
              name: "Button",
              replaces: "button",
            },
            ui: {
              styles: {
                css: ".rx-button { background-color: var(--bg-color); color: var(--text-color); border: var(--border); padding: var(--padding); border-radius: var(--border-radius); cursor: pointer; font-size: var(--font-size); font-weight: 500; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; user-select: none; } .rx-button:hover:not(:disabled) { background-color: var(--hover-bg); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15); } .rx-button:active:not(:disabled) { transform: translateY(0); box-shadow: 0 1px 4px rgba(0,0,0,0.1); } .rx-button:disabled { opacity: 0.6; cursor: not-allowed; } .rx-button--primary { --bg-color: #007bff; --text-color: #ffffff; --hover-bg: #0056b3; --border: none; } .rx-button--secondary { --bg-color: #6c757d; --text-color: #ffffff; --hover-bg: #545b62; --border: none; } .rx-button--danger { --bg-color: #dc3545; --text-color: #ffffff; --hover-bg: #c82333; --border: none; } .rx-button--small { --padding: 4px 8px; --font-size: 12px; --border-radius: 3px; } .rx-button--medium { --padding: 8px 16px; --font-size: 14px; --border-radius: 4px; } .rx-button--large { --padding: 12px 24px; --font-size: 16px; --border-radius: 6px; }",
              },
            },
          }),
      });

    const ctx: any = {
      payload: {},
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
      },
    };

    await handlers.loadComponents({}, ctx);

    // Ensure payload populated and contains JSON CSS for UI to route downstream
    expect(Array.isArray(ctx.payload.components)).toBe(true);
    expect(ctx.payload.components.length).toBeGreaterThan(0);
    const first = ctx.payload.components[0];
    const css = first?.ui?.styles?.css || "";
    expect(css).toContain(".rx-button--primary");
    expect(css).toContain(".rx-button--secondary");
    expect(css).toContain(".rx-button--danger");
    expect(css).toContain(".rx-button--small");
    expect(css).toContain(".rx-button--medium");
    expect(css).toContain(".rx-button--large");
  });
});
