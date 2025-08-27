/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ComponentRuleEngine } from "../../src/component-mapper/rule-engine";
import { handlers as updateHandlers } from "../../plugins/control-panel/symphonies/update/update.symphony";
import { handlers as selectionHandlers } from "../../plugins/control-panel/symphonies/selection/selection.symphony";

describe("Control Panel: Heading Level Sync (Issue #50)", () => {
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

  it("should extract correct heading level when selecting a heading element", () => {
    // Arrange: Create a heading element with H3 level
    const canvas = document.getElementById("rx-canvas")!;
    const heading = document.createElement("h3");
    heading.id = "test-heading";
    heading.className = "rx-comp rx-heading rx-heading--level-h3";
    heading.textContent = "Test Heading";
    canvas.appendChild(heading);

    // Act: Derive selection model (simulates selecting the heading)
    selectionHandlers.deriveSelectionModel({ id: "test-heading" }, mockCtx);

    // Assert: Selection model should include correct level
    const selectionModel = mockCtx.payload.selectionModel;
    expect(selectionModel).toBeDefined();
    expect(selectionModel.header.type).toBe("heading");
    expect(selectionModel.content.level).toBe("h3");
    expect(selectionModel.content.content).toBe("Test Heading");
  });

  it("should extract updated heading level after rule engine changes", () => {
    // Arrange: Create a heading element with H2 level
    const canvas = document.getElementById("rx-canvas")!;
    const heading = document.createElement("h2");
    heading.id = "test-heading";
    heading.className = "rx-comp rx-heading rx-heading--level-h2";
    heading.textContent = "Test Heading";
    canvas.appendChild(heading);

    // Act 1: Apply level change via rule engine (simulates control panel change)
    const applied = ruleEngine.applyUpdate(heading, "level", "h1");
    expect(applied).toBe(true);

    // Verify DOM was updated correctly
    expect(heading.classList.contains("rx-heading--level-h1")).toBe(true);
    expect(heading.classList.contains("rx-heading--level-h2")).toBe(false);

    // Act 2: Update control panel from element (simulates refresh after change)
    updateHandlers.updateFromElement(
      { id: "test-heading", source: "attribute-update" },
      mockCtx
    );

    // Assert: Control panel model should reflect the new level
    const selectionModel = mockCtx.payload.selectionModel;
    expect(selectionModel).toBeDefined();
    expect(selectionModel.header.type).toBe("heading");
    expect(selectionModel.content.level).toBe("h1"); // This should be "h1", not "h2"
    expect(selectionModel.content.content).toBe("Test Heading");
  });

  it("should handle heading level extraction from tagName when no class variant", () => {
    // Arrange: Create a heading element without level class variant
    const canvas = document.getElementById("rx-canvas")!;
    const heading = document.createElement("h4");
    heading.id = "test-heading";
    heading.className = "rx-comp rx-heading";
    heading.textContent = "Test Heading";
    canvas.appendChild(heading);

    // Act: Derive selection model
    selectionHandlers.deriveSelectionModel({ id: "test-heading" }, mockCtx);

    // Assert: Should extract level from tagName
    const selectionModel = mockCtx.payload.selectionModel;
    expect(selectionModel).toBeDefined();
    expect(selectionModel.content.level).toBe("h4");
  });

  it("should preserve fast path for drag/resize operations", () => {
    // Arrange: Create a heading element
    const canvas = document.getElementById("rx-canvas")!;
    const heading = document.createElement("h2");
    heading.id = "test-heading";
    heading.className = "rx-comp rx-heading rx-heading--level-h2";
    heading.textContent = "Test Heading";
    heading.style.left = "100px";
    heading.style.top = "50px";
    heading.style.width = "200px";
    heading.style.height = "40px";
    canvas.appendChild(heading);

    // Act: Update from element with drag source (should use fast path)
    updateHandlers.updateFromElement(
      { id: "test-heading", source: "drag" },
      mockCtx
    );

    // Assert: Should have layout info but minimal content (fast path)
    const selectionModel = mockCtx.payload.selectionModel;
    expect(selectionModel).toBeDefined();
    expect(selectionModel.header.type).toBe("heading");
    expect(selectionModel.layout.x).toBe(100);
    expect(selectionModel.layout.y).toBe(50);
    // Fast path should not include full content extraction
    expect(selectionModel.content).toBeUndefined();
  });
});
