/* @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { mapJsonComponentToTemplate } from "../../src/jsonComponent.mapper";

import lineJsonMod from "../../json-components/line.json" with { type: "json" };

const lineJson: any = (lineJsonMod as any).default || (lineJsonMod as any);

describe("JSON → Template mapping for Line (SVG)", () => {
  it("maps line.json to tag=svg and provides CSS for .rx-line .segment using CSS vars", () => {
    const tpl = mapJsonComponentToTemplate(lineJson);

    expect(tpl.tag).toBe("svg");
    expect(tpl.classes).toContain("rx-comp");
    expect(tpl.classes).toContain("rx-line");

    const css = tpl.css || "";
    expect(css).toContain(".rx-line .segment");
    // Verify defaults are encoded via CSS vars (actual values can be overridden)
    const vars = tpl.cssVariables || {};
    expect(Object.prototype.hasOwnProperty.call(vars, "stroke")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(vars, "thickness")).toBe(true);
  });
});

