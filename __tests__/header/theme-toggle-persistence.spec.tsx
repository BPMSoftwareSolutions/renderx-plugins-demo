/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

// Mock the host SDK same as behavior test: uses DOM attr for current theme
vi.mock("@renderx/host-sdk", () => ({
  useConductor: () => ({
    play: vi.fn().mockImplementation(async (_pluginId, sequenceId, data) => {
      if (sequenceId === "header-ui-theme-get-symphony") {
        const currentTheme =
          document.documentElement.getAttribute("data-theme") || "light";
        return { theme: currentTheme };
      } else if (sequenceId === "header-ui-theme-toggle-symphony") {
        const theme = data?.theme || "light";
        document.documentElement.setAttribute("data-theme", theme);
        return { theme };
      }
      return {};
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

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
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

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and render
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();
    expect(themeButton?.textContent?.trim()).toBe("🌞 Light");
  });
});
