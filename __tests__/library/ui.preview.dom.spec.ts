import { describe, it, expect } from "vitest";

// Unit-level spec: validate the preview model derived from component.template

describe("computePreviewModel", () => {
  it("maps tag, classes, css, and cssVariables into a PreviewModel", async () => {
    const { computePreviewModel } = await import(
      "../../plugins/library/ui/preview.model"
    );

    const component = {
      id: "json-button",
      template: {
        tag: "button",
        text: "Click me",
        classes: ["rx-comp", "rx-button"],
        css: ".rx-button { background: var(--bg-color); color: var(--text-color); }",
        cssVariables: { "bg-color": "rgb(17,34,51)", "text-color": "white" },
      },
    } as any;

    const model = computePreviewModel(component);

    expect(model.tag).toBe("button");
    expect(model.classes).toContain("rx-comp");
    expect(model.classes).toContain("rx-button");
    expect(model.cssText || "").toContain(".rx-button");
    expect(model.text).toBe("Click me");
    expect(model.cssVars["--bg-color"]).toBe("rgb(17,34,51)");
    expect(model.cssVars["--text-color"]).toBe("white");
  });
});
