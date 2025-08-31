/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { getCurrentTheme, toggleTheme } from "../../plugins/header/symphonies/ui/ui.stage-crew";

// Minimal ctx mock with payload and logger
const makeCtx = () => ({ payload: {} as any, logger: { warn: () => {} } });

describe("theme persistence and defaults", () => {
  beforeEach(() => {
    // Reset DOM state and storage between tests
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-theme");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("defaults to dark when nothing stored and no attribute is set", () => {
    const ctx = makeCtx();
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "dark" });
    expect(ctx.payload.currentTheme).toBe("dark");
  });

  it("uses persisted theme from localStorage when available (light)", () => {
    localStorage.setItem("theme", "light");
    const ctx = makeCtx();
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "light" });
    expect(ctx.payload.currentTheme).toBe("light");
  });

  it("uses persisted theme from localStorage when available (dark)", () => {
    localStorage.setItem("theme", "dark");
    const ctx = makeCtx();
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "dark" });
    expect(ctx.payload.currentTheme).toBe("dark");
  });

  it("falls back to dark when localStorage has invalid value", () => {
    localStorage.setItem("theme", "blue");
    const ctx = makeCtx();
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "dark" });
    expect(ctx.payload.currentTheme).toBe("dark");
  });

  it("toggleTheme writes to localStorage and updates DOM", async () => {
    const ctx = makeCtx();
    const res = toggleTheme({ theme: "dark" }, ctx);
    expect(res).toEqual({ theme: "dark" });

    // await rAF if present
    await new Promise<void>((resolve) =>
      typeof window !== "undefined" && (window as any).requestAnimationFrame
        ? (window as any).requestAnimationFrame(() => resolve())
        : setTimeout(() => resolve(), 0)
    );

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("getCurrentTheme uses last toggled value from storage", () => {
    // Simulate prior toggle persisted
    localStorage.setItem("theme", "dark");
    const ctx = makeCtx();
    const res = getCurrentTheme({}, ctx);
    expect(res).toEqual({ theme: "dark" });
  });
});

