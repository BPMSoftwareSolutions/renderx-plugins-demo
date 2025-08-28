/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from "vitest";
import { ComponentRuleEngine } from "../../src/component-mapper/rule-engine";

/**
 * Regression tests for Issue #57: variant/size clobbering on button
 * Ensures toggle class model treats each dimension independently.
 */
describe("RuleEngine: button variant/size toggles are independent (#57)", () => {
  let el: HTMLElement;
  let engine: ComponentRuleEngine;

  beforeEach(() => {
    engine = new ComponentRuleEngine();
    el = document.createElement("button");
    el.className = "rx-comp rx-button";
  });

  it("changing size keeps variant intact", () => {
    // Arrange: start with both size and variant classes
    el.classList.add("rx-button--medium", "rx-button--primary");

    // Act: change size only
    const applied = engine.applyUpdate(el, "size", "large");

    // Assert: rule applied and variant preserved
    expect(applied).toBe(true);
    expect(el.classList.contains("rx-button--large")).toBe(true);
    expect(el.classList.contains("rx-button--medium")).toBe(false);
    expect(el.classList.contains("rx-button--primary")).toBe(true); // variant untouched
  });

  it("changing variant keeps size intact", () => {
    // Arrange: start with both size and variant classes
    el.classList.add("rx-button--small", "rx-button--secondary");

    // Act: change variant only
    const applied = engine.applyUpdate(el, "variant", "danger");

    // Assert: rule applied and size preserved
    expect(applied).toBe(true);
    expect(el.classList.contains("rx-button--danger")).toBe(true);
    expect(el.classList.contains("rx-button--secondary")).toBe(false);
    expect(el.classList.contains("rx-button--small")).toBe(true); // size untouched
  });

  it("legacy single-dash classes are respected and not clobbered across dimensions", () => {
    // Arrange: simulate older markup using single-dash variant classes
    el.classList.add("rx-button-primary", "rx-button--medium");

    // Act: change variant only
    const applied = engine.applyUpdate(el, "variant", "secondary");

    // Assert: rule applied, legacy variant cleared, size preserved
    expect(applied).toBe(true);
    expect(el.classList.contains("rx-button--secondary")).toBe(true);
    expect(el.classList.contains("rx-button-primary")).toBe(false);
    expect(el.classList.contains("rx-button--medium")).toBe(true);
  });
});

