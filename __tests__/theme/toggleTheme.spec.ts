/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { toggleTheme } from "../../plugins/header/symphonies/ui/ui.stage-crew";

// Minimal ctx mock with payload and logger
const makeCtx = () => ({ payload: {} as any, logger: { warn: () => {} } });

describe("toggleTheme stage-crew handler", () => {
  beforeEach(() => {
    // Reset attribute between tests
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-theme");
    }
  });

  it("applies data-theme attribute on documentElement and returns theme", async () => {
    const ctx = makeCtx();
    const res = toggleTheme({ theme: "dark" }, ctx);
    expect(res).toEqual({ theme: "dark" });
    // allow rAF path to run in handler
    await new Promise<void>((resolve) =>
      typeof window !== "undefined" && (window as any).requestAnimationFrame
        ? (window as any).requestAnimationFrame(() => resolve())
        : setTimeout(() => resolve(), 0)
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(ctx.payload.theme).toBe("dark");
  });

  it("defaults to light when no theme provided", async () => {
    const ctx = makeCtx();
    const res = toggleTheme({}, ctx);
    expect(res).toEqual({ theme: "light" });
    await new Promise<void>((resolve) =>
      typeof window !== "undefined" && (window as any).requestAnimationFrame
        ? (window as any).requestAnimationFrame(() => resolve())
        : setTimeout(() => resolve(), 0)
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(ctx.payload.theme).toBe("light");
  });
});
