/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../../src/domain/css/sanitizeHtml";

describe("HTML sanitization unit tests", () => {
  it("sanitizes SVG content without stripping core structure", () => {
    const sampleSvg = `
      <div>
        <svg width="100" height="100">
          <rect x="10" y="10" width="80" height="80" fill="blue"/>
          <script>alert('malicious')</script>
        </svg>
      </div>
    `;

    const sanitized = sanitizeHtml(sampleSvg);

    expect(sanitized.length).toBeGreaterThan(20);
    expect(sanitized).toMatch(/<svg/i);
    expect(sanitized).toMatch(/<rect/i);
    expect(sanitized).not.toMatch(/<script/i);
  });

  it("preserves animate and gradient elements", () => {
    const animatedSvg = `
      <svg>
        <defs>
          <linearGradient id="grad1">
            <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect fill="url(#grad1)">
          <animate attributeName="x" values="0;100;0" dur="2s" repeatCount="indefinite"/>
        </rect>
      </svg>
    `;

    const sanitized = sanitizeHtml(animatedSvg);

    expect(sanitized).toMatch(/<animate/i);
    expect(sanitized).toMatch(/<linearGradient/i);
  });

});
