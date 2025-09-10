/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { LibraryPreview } from "../../packages/renderx-plugin-library/src/ui/LibraryPreview";

function render(el: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(el);
  });
  return container;
}

describe("LibraryPreview — JSON-driven attributes", () => {
  it("mirrors data-* attributes to the preview card host and renders name/description text", () => {
    const component = {
      id: "json-input",
      name: "Input",
      metadata: { name: "Input", description: "Text input component" },
      template: {
        tag: "input",
        classes: ["rx-comp", "rx-input"],
        attributes: {
          "data-icon": "📝",
          "data-icon-pos": "start",
          "data-description": "Text input component",
        },
      },
    } as any;

    const container = render(
      <div className="rx-lib">
        <LibraryPreview component={component} conductor={null as any} />
      </div>
    );

    const host = container.querySelector(".library-component-item") as HTMLElement | null;
    expect(host).toBeTruthy();
    // Host should mirror data-* attributes
    expect(host?.getAttribute("data-icon")).toBe("📝");
    expect(host?.getAttribute("data-icon-pos")).toBe("start");
    expect(host?.getAttribute("data-description")).toBe("Text input component");

    // JSON-driven text content present
    const nameEl = container.querySelector(".library-component-name");
    const descEl = container.querySelector(".library-component-description");
    expect(nameEl?.textContent).toContain("Input");
    expect(descEl?.textContent).toContain("Text input component");
  });
});
