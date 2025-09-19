/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { ComponentRuleEngine } from "../../src/domain/mapping/component-mapper/rule-engine";
import { sanitizeHtml } from "../../src/domain/css/sanitizeHtml";

describe("HTML component sanitizer + rule-engine integration", () => {
  it("sanitizeHtml strips scripts and event handlers", () => {
    const dirty = `<p onclick=alert(1)>Hi<script>alert(2)</script><img src=javascript:alert(3)><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA" /></p>`;
    const clean = sanitizeHtml(dirty);
    expect(clean).toMatch(/Hi/);
    expect(clean).not.toMatch(/script/);
    expect(clean).not.toMatch(/onclick/);
    expect(clean).not.toMatch(/javascript:alert/);
    expect(clean).toMatch(/data:image\/png;base64/);
  });

  it("applyContent uses sanitizer for html type", () => {
    const engine = new ComponentRuleEngine();
    const div = document.createElement("div");
    div.className = "rx-comp rx-html";
    engine.applyContent(div, "html", {
      markup: "<p><script>bad()</script><b>Bold</b></p>",
    });
    expect(div.innerHTML).toBe("<p><b>Bold</b></p>");
  });

  it("applyUpdate uses sanitizer for html type", () => {
    const engine = new ComponentRuleEngine();
    const div = document.createElement("div");
    div.className = "rx-comp rx-html";
    // ensure update rule exists: markup -> innerHtml
    engine.applyUpdate(
      div,
      "markup",
      "<p onclick=x><i>Italics</i><script>x()</script></p>"
    );
    expect(div.innerHTML).toBe("<p><i>Italics</i></p>");
  });
});
