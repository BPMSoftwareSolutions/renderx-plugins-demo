import { describe, it, expect } from "vitest";
import { handlers } from "../../plugins/library/symphonies/load.symphony";

describe("Library loads Container JSON component", () => {
  it("includes the Container component in the loaded list", async () => {
    const ctx: any = { payload: {} };
    const oldFetch: any = (globalThis as any).fetch;
    try {
      // Force Node/test path (no fetch) so we import from repo json-components
      // jsdom provides fetch which would try browser path and may fall back.
      (globalThis as any).fetch = undefined;
      await handlers.loadComponents({}, ctx);
    } finally {
      (globalThis as any).fetch = oldFetch;
    }
    const list = ctx.payload.components || [];
    const found = list.find((c: any) => {
      const classes = Array.isArray(c?.template?.classes)
        ? c.template.classes
        : Array.isArray(c?.classes)
        ? c.classes
        : [];
      const hasClass = classes.includes("rx-container");
      const isWrapperId = c?.id === "json-container";
      const hasDataRole =
        c?.template?.attributes?.["data-role"] === "container" ||
        c?.attributes?.["data-role"] === "container";
      return hasClass || isWrapperId || hasDataRole;
    });
    expect(
      found,
      "container component should be present in library list"
    ).toBeTruthy();
  });
});
