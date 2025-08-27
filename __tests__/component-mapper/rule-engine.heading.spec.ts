/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { ComponentRuleEngine } from "../../src/component-mapper/rule-engine";

describe("RuleEngine: heading content extract/apply", () => {
  let el: HTMLElement;
  let engine: ComponentRuleEngine;

  beforeEach(() => {
    engine = new ComponentRuleEngine();
    el = document.createElement("h3");
    el.className = "rx-comp rx-heading";
    el.textContent = "Section Title";
  });

  it("extracts level and content for heading", () => {
    const content = engine.extractContent(el, "heading");
    expect(content.content).toBe("Section Title");
    expect(content.level).toBe("h3");
  });

  it("applies content.text for heading when provided as 'content'", () => {
    const h2 = document.createElement("h2");
    h2.className = "rx-comp rx-heading";
    engine.applyContent(h2 as any, "heading", { content: "New Heading" });
    expect(h2.textContent).toBe("New Heading");
  });
});
