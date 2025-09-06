/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../../src/sanitizeHtml";

describe("sanitizeHtml extended SVG + dark mode", () => {
  it("preserves allowed extended SVG tags and attributes", () => {
    const snippet = `\n<svg viewBox="0 0 100 50" width="100%">\n  <defs><linearGradient id=\"g\"><stop offset=\"0%\" stop-color=\"#6366f1\"/><stop offset=\"100%\" stop-color=\"#3b82f6\"/></linearGradient></defs>\n  <rect x=0 y=0 width=100 height=50 fill=\"url(#g)\"/>\n  <text x=50 y=25 font-size=\"10\" text-anchor=\"middle\">Hi</text>\n  <polyline points=\"0,40 20,30 40,35 60,20 80,22 100,10\" stroke=\"#fff\" fill=\"none\" stroke-width=2 />\n  <circle cx=20 cy=30 r=4 fill=\"#fff\"><animate attributeName=\"r\" values=\"4;8;4\" dur=\"2s\" repeatCount=\"indefinite\"/></circle>\n</svg>`;
    const out = sanitizeHtml(snippet);
    expect(out).toMatch(/linearGradient/i);
    expect(out).toMatch(/polyline/);
    expect(out).toMatch(/animate/);
    expect(out).not.toMatch(/<script/);
  });

  it("removes disallowed tags but keeps children (except script/style)", () => {
    const snippet = `<div><foreignObject><p>Inside</p></foreignObject><script>bad()</script></div>`;
    const out = sanitizeHtml(snippet);
    // foreignObject is unwrapped (not allowlisted), so its child text or elements survive
    expect(out).toContain("Inside");
    expect(out).not.toMatch(/foreignObject/i);
    expect(out).not.toMatch(/script/);
  });

  it("preserves data-theme attribute on dark mode containers", () => {
    const snippet = `<div data-theme=\"dark\"><p>Night</p></div>`;
    const out = sanitizeHtml(snippet);
    // Currently sanitizer allowlists elements, not attributes; data-* attributes pass through untouched by our logic
    expect(out).toMatch(/data-theme=\"dark\"/);
  });
});
