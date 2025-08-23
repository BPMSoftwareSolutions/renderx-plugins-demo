/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { LibraryPanel, LibraryPreview } from "../../plugins/library/ui/LibraryPanel";

describe("Library preview — library CSS injection (RED)", () => {
  it("renders LibraryPanel with rx-lib class wrapper", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);
    // Mock conductor - LibraryPanel uses it for loading components
    const mockConductor = {
      play: () => {} // Mock play method
    };
    
    root.render(<LibraryPanel />);

    // The LibraryPanel root should have rx-lib class for scoping
    const libraryPanel = container.querySelector(".rx-lib");
    expect(libraryPanel).toBeTruthy(); // Should pass - we added rx-lib class
    expect(libraryPanel?.classList.contains("p-3")).toBe(true);
    expect(libraryPanel?.classList.contains("h-full")).toBe(true);
  });

  it("injects library-specific CSS when component has cssTextLibrary", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    // Component with library-specific CSS (like our enhanced button)
    const component = {
      id: "json-button",
      name: "Button",
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
        cssVariables: { "bg-color": "#007acc", "text-color": "#ffffff" },
        // Library-specific overrides that should be injected
        cssLibrary: ".rx-lib .rx-button { transform: scale(0.95); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }",
        cssVariablesLibrary: { "bg-color": "#0056b3" },
      },
    };

    const root = createRoot(container);
    // conductor can be null; LibraryPreview doesn't use it except for onDragStart
    root.render(<LibraryPreview component={component as any} conductor={null as any} />);

    // Should have TWO style tags: one for base CSS, one for library CSS
    const styleTags = container.querySelectorAll("style");
    expect(styleTags.length).toBeGreaterThanOrEqual(2); // Base + Library CSS

    // Library CSS should be present
    const hasLibraryCss = Array.from(styleTags).some((s) =>
      (s.textContent || "").includes(".rx-lib .rx-button")
    );
    expect(hasLibraryCss).toBe(true); // Should pass - we inject cssTextLibrary

    // Library variables should override base ones (bg-color should be #0056b3, not #007acc)
    const previewLi = container.querySelector("li");
    expect(previewLi).toBeTruthy();
    
    // Check that CSS custom property is set to library value
    const computedStyle = getComputedStyle(previewLi!);
    const bgColor = computedStyle.getPropertyValue("--bg-color").trim();
    expect(bgColor).toBe("#0056b3"); // Library override should win
  });

  it("applies library CSS transforms and styling in browser context (FAILING - reproduction test)", async () => {
    // This test reproduces the issue from the screenshot where library CSS isn't applied
    const container = document.createElement("div");
    container.className = "rx-lib"; // Simulate LibraryPanel wrapper
    document.body.appendChild(container);

    // Load actual button component from JSON (like the loader does)
    const buttonMod = await import("../../json-components/button.json", {
      with: { type: "json" }
    } as any);
    const buttonJson = (buttonMod as any)?.default || buttonMod;

    // Simulate mapJsonComponentToTemplate transformation
    const component = {
      id: "json-button",
      name: "Button", 
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        css: buttonJson?.ui?.styles?.css,
        cssVariables: buttonJson?.ui?.styles?.variables || {},
        cssLibrary: buttonJson?.ui?.styles?.library?.css,
        cssVariablesLibrary: buttonJson?.ui?.styles?.library?.variables || {},
      },
    };

    const root = createRoot(container);
    root.render(<LibraryPreview component={component as any} conductor={null as any} />);

    // Verify library CSS is injected
    const libraryStyleTag = container.querySelector("style:last-of-type");
    expect(libraryStyleTag?.textContent).toContain(".rx-lib .rx-button");
    expect(libraryStyleTag?.textContent).toContain("transform: scale(0.95)");
    expect(libraryStyleTag?.textContent).toContain("🔘"); // Icon should be present

    // Verify the button element exists and has expected classes
    const buttonEl = container.querySelector("button.rx-button");
    expect(buttonEl).toBeTruthy();
    expect(buttonEl?.textContent).toBe("Click me");

    // This is the key test - library variables should override base ones
    const previewLi = container.querySelector("li");
    const computedStyle = getComputedStyle(previewLi!);
    
    // Library font-size (12px) should override base font-size (14px)
    expect(computedStyle.getPropertyValue("--font-size").trim()).toBe("12px");
    
    // Library padding should override base padding
    expect(computedStyle.getPropertyValue("--padding").trim()).toBe("6px 12px");
  });
});
