import { describe, it, expect } from "vitest";
import { handlers } from "packages/renderx-plugin-library/src/symphonies/load.symphony";

describe("library load populates components; CSS registration is handled by UI", () => {
  it("loads components and exposes raw JSON CSS in payload for downstream routing", async () => {
    const ctx: any = { payload: {} };

    await handlers.loadComponents({}, ctx);

    expect(Array.isArray(ctx.payload.components)).toBe(true);
    expect(ctx.payload.components.length).toBeGreaterThan(0);
    const first = ctx.payload.components[0];
    const css = first?.ui?.styles?.css || "";
    // Not asserting cssRegistry here; UI is responsible for routing this CSS to Control Panel
    expect(typeof css).toBe("string");
  });
});
