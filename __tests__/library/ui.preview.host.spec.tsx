/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { LibraryPreview } from "../../plugins/library/ui/LibraryPanel";

function render(el: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(el);
  });
  return container;
}

describe("LibraryPreview — PreviewHost pattern", () => {
  it("mirrors data-* attributes to host and does not inject tag-specific wrappers (RED)", () => {
    const component = {
      id: "json-input",
      template: {
        tag: "input",
        classes: ["rx-comp", "rx-input"],
        attributes: { "data-icon": "📝", "data-icon-pos": "start", placeholder: "Search" },
        css: ".rx-input { padding: 10px 12px; }",
        cssVariables: { padding: "10px 12px" },
        cssLibrary: ".rx-lib .rx-preview-host[data-icon] { position: relative; }",
      },
    } as any;

    const container = render(
      <ul className="rx-lib">
        <LibraryPreview component={component} conductor={null as any} />
      </ul>
    );

    const host = container.querySelector("li.rx-preview-host");
    expect(host).toBeTruthy();
    // Host should mirror data-* attributes
    expect(host?.getAttribute("data-icon")).toBe("📝");
    expect(host?.getAttribute("data-icon-pos")).toBe("start");

    // Host should contain exactly one child element (the rendered input)
    const children = Array.from(host!.children);
    expect(children.length).toBe(1); // Fails until wrapper/spans are removed
    const input = host!.querySelector("input.rx-input");
    expect(input).toBeTruthy();
  });
});

