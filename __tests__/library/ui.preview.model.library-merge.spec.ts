import { describe, it, expect } from "vitest";

// Red test: Library-only variables should override base variables in the preview model
// and cssTextLibrary should be surfaced for the Library UI to inject.

describe("computePreviewModel — library overrides (RED)", () => {
  it("merges cssVariables + cssVariablesLibrary (library wins) and exposes cssTextLibrary", async () => {
    const { computePreviewModel } = await import(
      "../../plugins/library/ui/preview.model"
    );

    const component = {
      id: "json-input",
      template: {
        tag: "input",
        classes: ["rx-comp", "rx-input"],
        css: ".rx-input { width: var(--width); }",
        cssVariables: { width: "100%", padding: "8px 12px" },
        // Proposed Library-only overrides (not yet supported):
        cssLibrary: ".rx-lib .rx-input { width: auto; min-width: 160px; }",
        cssVariablesLibrary: { width: "auto" },
      },
    } as any;

    const model: any = computePreviewModel(component);

    // Expectation: library width override should be reflected in cssVars
    expect(model.cssVars["--width"]).toBe("auto"); // Fails until merge is implemented

    // Expectation: model exposes library CSS text for UI injection
    expect(typeof model.cssTextLibrary).toBe("string"); // Fails (currently undefined)
  });
});

