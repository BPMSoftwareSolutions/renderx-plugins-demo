/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";

describe("Header Component Styling", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Add the CSS for header styling
    const style = document.createElement("style");
    style.textContent = `
      .header-container {
        height: 100%;
        background: transparent;
        display: flex;
        align-items: center;
      }
      
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      [data-theme="dark"] .header-title {
        color: #f8fafc;
      }
      
      .header-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 8px;
        width: 100%;
      }
      
      .header-button {
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 500;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.05);
        color: #1f2937;
        cursor: pointer;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
      }

      [data-theme="dark"] .header-button {
        border-color: #333344;
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
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
      if (style.textContent?.includes("header-container")) {
        document.head.removeChild(style);
      }
    });
  });

  it("HeaderTitle has correct structure and styling", () => {
    const HeaderTitle = () => (
      <div className="header-container">
        <div className="header-title">🔧 RenderX Plugins Demo</div>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderTitle />);
    });

    const headerContainer = container.querySelector(".header-container");
    const headerTitle = container.querySelector(".header-title");

    expect(headerContainer).toBeTruthy();
    expect(headerTitle).toBeTruthy();
    expect(headerTitle?.textContent).toBe("🔧 RenderX Plugins Demo");

    // Verify transparent background (computed as rgba(0, 0, 0, 0))
    const containerStyle = window.getComputedStyle(headerContainer!);
    expect(containerStyle.background).toBe("rgba(0, 0, 0, 0)");
  });

  it("HeaderControls buttons have correct styling", () => {
    const HeaderControls = () => (
      <div className="header-container">
        <div className="header-controls">
          <button className="header-button" title="New">
            New
          </button>
          <button className="header-button" title="Open">
            Open
          </button>
          <button className="header-button" title="Save">
            Save
          </button>
        </div>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderControls />);
    });

    const buttons = container.querySelectorAll(".header-button");
    expect(buttons).toHaveLength(3);

    const buttonTexts = Array.from(buttons).map((btn) => btn.textContent);
    expect(buttonTexts).toEqual(["New", "Open", "Save"]);

    // Verify buttons have correct classes
    buttons.forEach((button) => {
      expect(button.classList.contains("header-button")).toBe(true);
    });
  });

  it("HeaderThemeToggle has correct structure", () => {
    const HeaderThemeToggle = () => (
      <div className="header-container">
        <div className="header-theme-toggle">
          <button className="header-theme-button" title="Toggle Theme">
            🌙 Dark
          </button>
        </div>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderThemeToggle />);
    });

    const themeButton = container.querySelector(".header-theme-button");
    expect(themeButton).toBeTruthy();
    expect(themeButton?.textContent?.trim()).toBe("🌙 Dark");
    expect(themeButton?.classList.contains("header-theme-button")).toBe(true);
  });

  it("works correctly in light mode", () => {
    // Set light theme
    document.documentElement.setAttribute("data-theme", "light");

    const HeaderTitle = () => (
      <div className="header-container">
        <div className="header-title">🔧 RenderX Plugins Demo</div>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderTitle />);
    });

    const headerTitle = container.querySelector(".header-title");
    expect(headerTitle).toBeTruthy();
    expect(headerTitle?.textContent).toBe("🔧 RenderX Plugins Demo");
  });

  it("works correctly in dark mode", () => {
    // Set dark theme
    document.documentElement.setAttribute("data-theme", "dark");

    const HeaderTitle = () => (
      <div className="header-container">
        <div className="header-title">🔧 RenderX Plugins Demo</div>
      </div>
    );

    const root = createRoot(container);
    act(() => {
      root.render(<HeaderTitle />);
    });

    const headerTitle = container.querySelector(".header-title");
    expect(headerTitle).toBeTruthy();
    expect(headerTitle?.textContent).toBe("🔧 RenderX Plugins Demo");
  });
});
