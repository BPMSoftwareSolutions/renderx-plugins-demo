/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

// Mock the host SDK
vi.mock("@renderx/host-sdk", () => ({
  useConductor: () => ({
    play: vi
      .fn()
      .mockImplementation(async (pluginId, sequenceId, data, callback) => {
        let result = {};
        // Handle different sequence types
        if (sequenceId === "header-ui-theme-get-symphony") {
          // Get current theme from DOM
          const currentTheme =
            document.documentElement.getAttribute("data-theme") || "light";
          result = { theme: currentTheme };
        } else if (sequenceId === "header-ui-theme-toggle-symphony") {
          // Simulate the actual theme toggle behavior
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

describe("HeaderThemeToggle Button Text and Icon Updates", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Add the CSS for theme button styling
    const style = document.createElement("style");
    style.textContent = `
      .header-container {
        height: 100%;
        background: transparent;
        display: flex;
        align-items: center;
      }
      
      .header-theme-toggle {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        width: 100%;
      }
      
      .header-theme-button {
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #374151;
        border-radius: 6px;
        background: #1f2937;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      [data-theme="dark"] .header-theme-button {
        background: #f59e0b;
        color: #1f2937;
        border-color: #333344;
      }
    `;
    document.head.appendChild(style);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.removeAttribute("data-theme");
    // Clean up added styles
    const styles = document.head.querySelectorAll("style");
    styles.forEach((style) => {
      if (style.textContent?.includes("header-theme-button")) {
        document.head.removeChild(style);
      }
    });
  });

  it("shows 'Dark' button in light mode (to switch TO dark)", async () => {
    // Set light theme
    document.documentElement.setAttribute("data-theme", "light");

    // Import the actual component
    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and update state
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();

    // In light mode, should show "Dark" to indicate you can switch TO dark mode
    expect(themeButton?.textContent?.trim()).toBe("🌙 Dark");
  });

  it("shows 'Light' button in dark mode (to switch TO light)", async () => {
    // Set dark theme
    document.documentElement.setAttribute("data-theme", "dark");

    // Import the actual component
    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    // Wait for component to initialize theme state
    await new Promise((resolve) => setTimeout(resolve, 10));

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();

    // In dark mode, should show "Light" to indicate you can switch TO light mode
    expect(themeButton?.textContent?.trim()).toBe("🌞 Light");
  });

  it("updates button text and icon when clicked", async () => {
    // Start in light mode
    document.documentElement.setAttribute("data-theme", "light");

    // Import the actual component
    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and update state
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(
      ".header-theme-button"
    ) as HTMLButtonElement;
    expect(themeButton).toBeTruthy();

    // Initially should show "Dark" in light mode
    expect(themeButton.textContent?.trim()).toBe("🌙 Dark");

    // Click the button to toggle
    act(() => {
      themeButton.click();
    });

    // Wait for MutationObserver to process the change
    await new Promise((resolve) => setTimeout(resolve, 10));

    // After click, should show "Light" (because we're now in dark mode)
    expect(themeButton.textContent?.trim()).toBe("🌞 Light");
  });

  it("toggles back and forth correctly", async () => {
    // Start in light mode
    document.documentElement.setAttribute("data-theme", "light");

    // Import the actual component
    const { HeaderThemeToggle } = await import(
      "../../plugins/header/ui/HeaderThemeToggle"
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    // Allow effect to fetch current theme and update state
    await new Promise((r) => setTimeout(r, 50));

    const themeButton = container.querySelector(
      ".header-theme-button"
    ) as HTMLButtonElement;
    expect(themeButton).toBeTruthy();

    // Initially: light mode shows "Dark" button
    expect(themeButton.textContent?.trim()).toBe("🌙 Dark");

    // First click: switch to dark mode, should show "Light" button
    act(() => {
      themeButton.click();
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(themeButton.textContent?.trim()).toBe("🌞 Light");

    // Second click: switch back to light mode, should show "Dark" button
    act(() => {
      themeButton.click();
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(themeButton.textContent?.trim()).toBe("🌙 Dark");
  });
});
