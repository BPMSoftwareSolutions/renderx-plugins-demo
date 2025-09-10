import { handlers } from "@renderx-plugins/library";

describe("library-load-symphony", () => {
  it("loads components and notifies UI", async () => {
    const payload: any = {};
    const ctx: any = { payload };
    let got: any[] | null = null;

    await handlers.loadComponents({}, ctx);
    handlers.notifyUi({ onComponentsLoaded: (list: any[]) => (got = list) }, ctx);

    expect(Array.isArray(ctx.payload.components)).toBe(true);
    expect(Array.isArray(got)).toBe(true);
    expect(got!.length).toBeGreaterThan(0);
  });
});

