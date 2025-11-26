/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";

import { getCurrentTheme, toggleTheme } from "@src/symphonies/ui/ui.stage-crew";

describe("ui.stage-crew handlers", () => {
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
      error: null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    ctx = null;
  });
  beforeEach(() => {
    // Reset DOM and storage
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
  });

  it("getCurrentTheme applies DOM attribute and persists", () => {
    const ctx: { payload: Record<string, unknown> } = { payload: {} };

    // No theme preset -> defaults to dark, sets DOM and storage
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "dark" });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(ctx.payload.currentTheme).toBe("dark");
  });

  it("getCurrentTheme respects existing DOM attribute first", () => {
    const ctx: { payload: Record<string, unknown> } = { payload: {} };
    document.documentElement.setAttribute("data-theme", "light");

    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "light" });
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggleTheme flips and persists theme", async () => {
    const ctx: { payload: Record<string, unknown> } = { payload: {} };
    document.documentElement.setAttribute("data-theme", "light");

    const res1 = toggleTheme({ theme: "dark" }, ctx);
    expect(res1).toEqual({ theme: "dark" });
    // May be applied on next rAF; ensure attribute eventually updated
    expect(localStorage.getItem("theme")).toBe("dark");

    const res2 = toggleTheme({ theme: "light" }, ctx);
    expect(res2).toEqual({ theme: "light" });
    expect(localStorage.getItem("theme")).toBe("light");
  });
});

