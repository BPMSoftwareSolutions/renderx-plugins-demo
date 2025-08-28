import { describe, it, expect } from "vitest";

// We will import the mapper utility once implemented
import {
  getTagForType,
  computeTagFromJson,
} from "../../src/component-mapper/mapper";

// Minimal JSON stubs to simulate component JSONs
const makeHeadingJson = (level?: string) => ({
  metadata: { type: "heading", name: "Heading" },
  integration: { properties: { defaultValues: { level } } },
});

const _makeGenericJson = (type: string) => ({ metadata: { type } });

describe("Component mapper tag rules", () => {
  it("maps container → div", () => {
    expect(getTagForType("container")).toBe("div");
  });

  it("maps input → input", () => {
    expect(getTagForType("input")).toBe("input");
  });

  it("maps image → img", () => {
    expect(getTagForType("image")).toBe("img");
  });

  it("maps line → svg", () => {
    // Both by type and by full JSON
    expect(getTagForType("line")).toBe("svg");
  });

  it("maps heading using defaultValues.level with validation and lowercase", () => {
    expect(computeTagFromJson(makeHeadingJson("H3"))).toBe("h3");
    expect(computeTagFromJson(makeHeadingJson("h7"))).toBe("h2"); // fallback
    expect(computeTagFromJson(makeHeadingJson(undefined))).toBe("h2");
  });

  it("falls back to type or div when unknown", () => {
    expect(getTagForType("section")).toBe("section");
    expect(getTagForType("")).toBe("div");
  });

  it("respects JSON override when provided", () => {
    const json = { metadata: { type: "custom" }, runtime: { tag: "section" } };
    expect(computeTagFromJson(json as any)).toBe("section");
  });
});
