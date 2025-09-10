import { describe, it, expect } from "vitest";

// Updated: We no longer expect library CSS/vars to override base in the preview model.
// The model should continue to expose base template fields and pass through attributes used by the Library shell.

describe("computePreviewModel — base fields and attribute pass-through", () => {
  it("maps base template fields and leaves library-specific CSS undefined", async () => {
    const { computePreviewModel } = await import(
      "../../packages/renderx-plugin-library/src/ui/preview.model"
    );

    const component = {
      id: "json-input",
      template: {
        tag: "input",
        classes: ["rx-comp", "rx-input"],
        css: ".rx-input { width: var(--width); }",
        cssVariables: { width: "100%", padding: "8px 12px" }
      },
    } as any;

    const model: any = computePreviewModel(component);

    expect(model.tag).toBe("input");
    expect(model.classes).toContain("rx-input");
    expect(model.cssText || "").toContain(".rx-input");
    expect(model.cssVars["--width"]).toBe("100%");
    // Library-only CSS not used by shell
    expect(model.cssTextLibrary).toBeUndefined();
  });

  it("passes through icon attributes from template", async () => {
    const { computePreviewModel } = await import(
      "../../packages/renderx-plugin-library/src/ui/preview.model"
    );

    const component = {
      id: "json-button",
      template: {
        tag: "button",
        classes: ["rx-comp", "rx-button"],
        text: "Click me",
        attributes: {
          "data-icon": "⭐",
          "data-icon-pos": "start",
        },
      },
    } as any;

    const model: any = computePreviewModel(component);

    // Expectation: attributes are passed through to the model
    expect(model.attributes).toEqual({
      "data-icon": "⭐",
      "data-icon-pos": "start",
    });
  });
});
