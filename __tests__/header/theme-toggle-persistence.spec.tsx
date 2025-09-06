/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

// Mock the host SDK same as behavior test: uses DOM attr for current theme
vi.mock("@renderx/host-sdk", () => ({
  useConductor: () => ({
    play: vi
      .fn()
      .mockImplementation(async (_pluginId, sequenceId, data, callback) => {
        let result = {};
        if (sequenceId === "header-ui-theme-get-symphony") {
          const currentTheme =
            document.documentElement.getAttribute("data-theme") || "light";
          result = { theme: currentTheme };
        } else if (sequenceId === "header-ui-theme-toggle-symphony") {
          const theme = data?.theme || "light";
          document.documentElement.setAttribute("data-theme", theme);
          result = { theme };
        }

        // If callback provided, call it with the result
        if (callback && typeof callback === "function") {
          callback(result);
        }

        return result;
      }),
  }),
  resolveInteraction: (interaction: string) => {
    if (interaction === "app.ui.theme.get") {
      return {
        pluginId: "HeaderThemePlugin",
        sequenceId: "header-ui-theme-get-symphony",
      };
    }
    return {
      pluginId: "HeaderThemePlugin",
      sequenceId: "header-ui-theme-toggle-symphony",
    };
  },
}));

describe("HeaderThemeToggle persistence across sessions", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    // Ensure React tree is properly unmounted before DOM teardown to avoid
    // async React work running against a removed container (was causing
    // unhandled TypeError in react-dom commit phase).
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    document.body.removeChild(container);
    document.documentElement.removeAttribute("data-theme");
  });

  it("when persisted dark, on new session shows 'Light' with sun icon", async () => {
    // Simulate previous session choosing dark
    localStorage.setItem("theme", "dark");

    // New session: simulate index.html early script applying stored theme
    const stored = localStorage.getItem("theme");
    const t = stored === "dark" || stored === "light" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", t);

    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    root = createRoot(container);
    act(() => {
      root!.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and render
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();
    expect(themeButton?.textContent?.trim()).toBe("🌞 Light");
  });

  it("when persisted light, on new session shows 'Dark' with moon icon", async () => {
    // Simulate previous session choosing light
    localStorage.setItem("theme", "light");

    // New session: simulate index.html early script applying stored theme
    const stored = localStorage.getItem("theme");
    const t = stored === "dark" || stored === "light" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", t);

    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    root = createRoot(container);
    act(() => {
      root!.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and render
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();
    expect(themeButton?.textContent?.trim()).toBe("🌙 Dark");
  });

  it("FIXED: component loads theme via useEffect callback and shows correct label immediately", async () => {
    // Simulate light mode persisted and applied by index.html script
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");

    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    root = createRoot(container);
    act(() => {
      root!.render(<HeaderThemeToggle />);
    });

    // In test environment, callback executes synchronously
    // This means no flash of wrong content - the fix is working!
    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton?.textContent?.trim()).toBe("🌙 Dark");
  });

  it("FIXED: reproduces the original browser issue that is now resolved", async () => {
    // This test reproduces the exact scenario from the browser console log:
    // - DOM is in light mode (data-theme="light")
    // - localStorage has "light"
    // - Button was showing "🌞 Light" (wrong!)
    // - Expected: "🌙 Dark"

    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");

    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    root = createRoot(container);
    act(() => {
      root!.render(<HeaderThemeToggle />);
    });

    // Small delay for callback to execute
    await new Promise((r) => setTimeout(r, 10));

    const themeButton = container.querySelector(".header-theme-button");

    // BEFORE FIX: This would have been "🌞 Light" (wrong!)
    // AFTER FIX: This should be "🌙 Dark" (correct!)
    expect(themeButton?.textContent?.trim()).toBe("🌙 Dark");

    // Verify the logic: when DOM is "light", button should show "Dark" (to switch TO dark)
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
