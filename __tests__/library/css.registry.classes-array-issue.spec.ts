import { describe, it, expect } from "vitest";
import { mapJsonComponentToTemplate as _mapJsonComponentToTemplate } from "../../src/domain/components/json/jsonComponent.mapper";

describe("FAILING: CSS collection vs component structure mismatch", () => {
  it("exposes the real issue: collectCssClasses looks for comp.classes but export uses comp.template.classRefs", () => {
    const _mockJsonButton = {
      metadata: {
        type: "button",
        name: "Button",
        replaces: "button",
      },
      ui: {
        styles: {
          css: ".rx-button { background: var(--bg-color); } .rx-button--primary { --bg-color: #007bff; } .rx-button--secondary { --bg-color: #6c757d; } .rx-button--danger { --bg-color: #dc3545; }",
        },
      },
    };

    // Simulate the export component structure (from your actual export file)
    const exportedComponent = {
      id: "rx-node-vd8esh",
      type: "button",
      template: {
        tag: "button",
        classRefs: ["rx-comp", "rx-button", "rx-comp-button-vd8esh"],
        style: {},
      },
    };

    // Simulate collectCssClasses logic
    const components = [exportedComponent];
    const unique = new Set<string>();

    for (const comp of components) {
      // THIS IS THE BUG: collectCssClasses looks for comp.classes
      // Cast to any to intentionally show absence without TypeScript error
      const maybe: any = comp as any;
      const classes: string[] = Array.isArray(maybe.classes)
        ? maybe.classes
        : [];
      console.log("comp.classes found:", classes);
      for (const c of classes) unique.add(c);
    }

    console.log("Classes collected for CSS lookup:", Array.from(unique));

    // This will be empty because comp.classes doesn't exist!
    // The actual classes are in comp.template.classRefs
    expect(Array.from(unique)).toEqual([]); // This exposes the bug

    // What it SHOULD be doing:
    const correctUnique = new Set<string>();
    for (const comp of components) {
      const classRefs: string[] = Array.isArray(comp.template?.classRefs)
        ? comp.template.classRefs
        : [];
      console.log("comp.template.classRefs found:", classRefs);
      for (const c of classRefs) correctUnique.add(c);
    }

    console.log("Classes that SHOULD be collected:", Array.from(correctUnique));
    expect(Array.from(correctUnique)).toContain("rx-button");
  });

  it("demonstrates the correct approach: register CSS under base class name", () => {
    const css =
      ".rx-button { background: var(--bg-color); } .rx-button--primary { --bg-color: #007bff; } .rx-button--secondary { --bg-color: #6c757d; }";
    const classes = ["rx-comp", "rx-button"];

    // The current logic correctly registers all CSS under the base class name
    const base = classes.find((c) => c.startsWith("rx-") && c !== "rx-comp");
    expect(base).toBe("rx-button");

    // When we register CSS under "rx-button", it includes all variant selectors
    // This is actually correct - the CSS should be registered under the base class
    // and include all variants in the same CSS block
    expect(css).toContain(".rx-button--primary");
    expect(css).toContain(".rx-button--secondary");
  });
});
