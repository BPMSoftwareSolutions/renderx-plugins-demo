/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { LibraryPanel } from "../../plugins/library/ui/LibraryPanel";
import { LibraryPreview } from "../../plugins/library/ui/LibraryPreview";

describe("Library preview — JSON-driven fields (icon, name, description)", () => {
  it("renders LibraryPanel shell (rx-lib wrapper present)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);
    act(() => {
      root.render(<LibraryPanel />);
    });

    // The LibraryPanel should provide an rx-lib scoping wrapper for preview CSS
    const libraryPanel = container.querySelector(".rx-lib");
    expect(libraryPanel).toBeTruthy();
  });

  it("drives icon, name, and description from component JSON", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const component = {
      id: "json-button",
      name: "Button",
      metadata: { name: "Button", description: "Interactive button component" },
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        attributes: { "data-icon": "📘", "data-description": "Interactive button component" },
      },
    } as any;

    const root = createRoot(container);
    act(() => {
      root.render(
        <LibraryPreview component={component as any} conductor={null as any} />
      );
    });

    // JSON-driven icon
    const host = container.querySelector(".library-component-item");
    expect(host).toBeTruthy();
    expect(host?.getAttribute("data-icon")).toBe("📘");

    // JSON-driven name and description should be available via component/name and data-description
    const nameEl = container.querySelector(".library-component-name");
    const descEl = container.querySelector(".library-component-description");
    expect(nameEl?.textContent).toContain("Button");
    expect(descEl?.textContent).toContain("Interactive button component");
  });

  it("does not depend on component-provided library CSS for library display", async () => {
    const container = document.createElement("div");
    container.className = "rx-lib"; // Simulate LibraryPanel wrapper
    document.body.appendChild(container);

    const component = {
      id: "json-button",
      name: "Button",
      metadata: { name: "Button", description: "Interactive button component" },
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        attributes: { "data-icon": "📘", "data-description": "Interactive button component" }
      },
    } as any;

    const root = createRoot(container);
    act(() => {
      root.render(
        <LibraryPreview component={component as any} conductor={null as any} />
      );
    });

    // Verify the preview uses JSON-driven fields only
    const host = container.querySelector(".library-component-item");
    expect(host).toBeTruthy();
    expect(host?.getAttribute("data-icon")).toBe("📘");

    const namePresent = container.querySelector(".library-component-name")?.textContent || "";
    const descPresent = container.querySelector(".library-component-description")?.textContent || "";
    expect(namePresent).toContain("Button");
    expect(descPresent).toContain("Interactive button component");
  });
});
