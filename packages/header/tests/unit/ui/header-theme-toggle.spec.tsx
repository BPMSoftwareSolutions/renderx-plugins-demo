/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

// Setup (loads @renderx/host-sdk mock)
import "@setup/vitest.setup";

// Helper to wait for text changes (small polling window)
async function waitForText(el: HTMLElement, expected: string, timeout = 400) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (el.textContent?.trim() === expected) return;
    await new Promise((res) => setTimeout(res, 10));
  }
  expect(el.textContent?.trim()).toBe(expected);
}

describe("HeaderThemeToggle (plugin unit): button text and toggle behavior", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root!.unmount());
      root = null;
    }
    document.body.removeChild(container);
  });

  it("shows 'Dark' label in light mode (switch TO dark)", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    const { HeaderThemeToggle } = await import("@src/ui/HeaderThemeToggle");

    root = createRoot(container);
    act(() => { root!.render(<HeaderThemeToggle />); });

    await new Promise((r) => setTimeout(r, 30));
    const btn = container.querySelector(".header-theme-button") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe("🌙 Dark");
  });

  it("shows 'Light' label in dark mode (switch TO light)", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { HeaderThemeToggle } = await import("@src/ui/HeaderThemeToggle");

    root = createRoot(container);
    act(() => { root!.render(<HeaderThemeToggle />); });

    await new Promise((r) => setTimeout(r, 30));
    const btn = container.querySelector(".header-theme-button") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe("🌞 Light");
  });

  it("toggles back and forth correctly", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    const { HeaderThemeToggle } = await import("@src/ui/HeaderThemeToggle");

    root = createRoot(container);
    act(() => { root!.render(<HeaderThemeToggle />); });

    await new Promise((r) => setTimeout(r, 30));
    const btn = container.querySelector(".header-theme-button") as HTMLButtonElement;
    expect(btn).toBeTruthy();

    // Initial light -> shows 'Dark'
    expect(btn.textContent?.trim()).toBe("🌙 Dark");

    // Click to dark -> shows 'Light'
    act(() => { btn.click(); });
    await waitForText(btn, "🌞 Light");

    // Click back to light -> shows 'Dark'
    act(() => { btn.click(); });
    await waitForText(btn, "🌙 Dark");
  });
});

