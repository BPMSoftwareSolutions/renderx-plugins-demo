/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ComponentRuleEngine } from "../../src/component-mapper/rule-engine";
import { handlers as updateHandlers } from "../../plugins/control-panel/symphonies/update/update.symphony";
import { handlers as selectionHandlers } from "../../plugins/control-panel/symphonies/selection/selection.symphony";

describe("Control Panel: Bidirectional Sync (Auto-generated Tests)", () => {
  let mockCtx: any;
  let ruleEngine: ComponentRuleEngine;

  beforeEach(() => {
    document.body.innerHTML =
      '<div id="rx-canvas" style="position:relative"></div>';
    mockCtx = {
      payload: {},
      logger: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
    };
    ruleEngine = new ComponentRuleEngine();
    vi.clearAllMocks();
  });

  // Auto-generated test cases for all components with bidirectional rules
  const testCases = [
    {
      componentType: "button",
      tagName: "button",
      baseClasses: "rx-comp rx-button",
      testCases: [
        {
          property: "variant",
          initialValue: "primary",
          updatedValue: "danger",
          initialClasses: "rx-comp rx-button rx-button-primary",
          expectedClasses: "rx-comp rx-button rx-button-danger",
        },
        {
          property: "size",
          initialValue: "medium",
          updatedValue: "large",
          initialClasses: "rx-comp rx-button rx-button-medium",
          expectedClasses: "rx-comp rx-button rx-button-large",
        },
      ],
    },
    {
      componentType: "heading",
      tagName: "h2",
      baseClasses: "rx-comp rx-heading",
      testCases: [
        {
          property: "level",
          initialValue: "h2",
          updatedValue: "h1",
          initialClasses: "rx-comp rx-heading rx-heading--level-h2",
          expectedClasses: "rx-comp rx-heading rx-heading--level-h1",
        },
      ],
    },
    {
      componentType: "image",
      tagName: "img",
      baseClasses: "rx-comp rx-image",
      testCases: [
        {
          property: "variant",
          initialValue: "primary",
          updatedValue: "secondary",
          initialClasses: "rx-comp rx-image rx-image-primary",
          expectedClasses: "rx-comp rx-image rx-image-secondary",
        },
      ],
    },
    {
      componentType: "input",
      tagName: "input",
      baseClasses: "rx-comp rx-input",
      testCases: [
        {
          property: "variant",
          initialValue: "primary",
          updatedValue: "secondary",
          initialClasses: "rx-comp rx-input rx-input-primary",
          expectedClasses: "rx-comp rx-input rx-input-secondary",
        },
      ],
    },
    {
      componentType: "paragraph",
      tagName: "p",
      baseClasses: "rx-comp rx-paragraph",
      testCases: [
        {
          property: "variant",
          initialValue: "primary",
          updatedValue: "secondary",
          initialClasses: "rx-comp rx-paragraph rx-paragraph-primary",
          expectedClasses: "rx-comp rx-paragraph rx-paragraph-secondary",
        },
      ],
    },
  ];

  // Generate tests for each component and property
  testCases.forEach(({ componentType, tagName, testCases: propertyTests }) => {
    describe(`${componentType} component`, () => {
      propertyTests.forEach(({ property, initialValue, updatedValue, initialClasses, expectedClasses }) => {
        it(`should extract correct ${property} when selecting element`, () => {
          // Arrange: Create element with initial value
          const canvas = document.getElementById("rx-canvas")!;
          const element = document.createElement(tagName);
          element.id = `test-${componentType}`;
          element.className = initialClasses;
          element.textContent = `Test ${componentType}`;
          if (tagName === "img") {
            (element as HTMLImageElement).src = "test.jpg";
            (element as HTMLImageElement).alt = "Test image";
          }
          canvas.appendChild(element);

          // Act: Derive selection model
          selectionHandlers.deriveSelectionModel({ id: `test-${componentType}` }, mockCtx);

          // Assert: Selection model should include correct initial value
          const selectionModel = mockCtx.payload.selectionModel;
          expect(selectionModel).toBeDefined();
          expect(selectionModel.header.type).toBe(componentType);
          expect(selectionModel.content[property]).toBe(initialValue);
        });

        it(`should extract updated ${property} after rule engine changes`, () => {
          // Arrange: Create element with initial value
          const canvas = document.getElementById("rx-canvas")!;
          const element = document.createElement(tagName);
          element.id = `test-${componentType}`;
          element.className = initialClasses;
          element.textContent = `Test ${componentType}`;
          if (tagName === "img") {
            (element as HTMLImageElement).src = "test.jpg";
            (element as HTMLImageElement).alt = "Test image";
          }
          canvas.appendChild(element);

          // Act 1: Apply property change via rule engine
          const applied = ruleEngine.applyUpdate(element, property, updatedValue);
          expect(applied).toBe(true);

          // Verify DOM was updated correctly
          expect(element.className).toBe(expectedClasses);

          // Act 2: Update control panel from element
          updateHandlers.updateFromElement(
            { id: `test-${componentType}`, source: "attribute-update" },
            mockCtx
          );

          // Assert: Control panel model should reflect the new value
          const selectionModel = mockCtx.payload.selectionModel;
          expect(selectionModel).toBeDefined();
          expect(selectionModel.header.type).toBe(componentType);
          expect(selectionModel.content[property]).toBe(updatedValue);
        });
      });
    });
  });

  it("should preserve fast path for drag/resize operations", () => {
    // Test that drag/resize operations don't trigger full content extraction
    const canvas = document.getElementById("rx-canvas")!;
    const button = document.createElement("button");
    button.id = "test-button";
    button.className = "rx-comp rx-button rx-button-primary";
    button.textContent = "Test Button";
    button.style.left = "100px";
    button.style.top = "50px";
    button.style.width = "120px";
    button.style.height = "40px";
    canvas.appendChild(button);

    // Act: Update from element with drag source (should use fast path)
    updateHandlers.updateFromElement(
      { id: "test-button", source: "drag" },
      mockCtx
    );

    // Assert: Should have layout info but minimal content (fast path)
    const selectionModel = mockCtx.payload.selectionModel;
    expect(selectionModel).toBeDefined();
    expect(selectionModel.header.type).toBe("button");
    expect(selectionModel.layout.x).toBe(100);
    expect(selectionModel.layout.y).toBe(50);
    // Fast path should not include full content extraction
    expect(selectionModel.content).toBeUndefined();
  });
});
