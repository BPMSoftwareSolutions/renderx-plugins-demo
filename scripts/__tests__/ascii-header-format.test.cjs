const { describe, it, expect } = require('@jest/globals');
const { generateHeader } = require('../generate-ascii-header.cjs');

function innerWidthOfBorderLine(line) {
  // e.g. '?????' -> count of border char between corners
  if (!line) return 0;
  const m = line.match(/^(.)(=+|?+|?+|?+|?+|\-+|\+|\*+|\#+|\++|\~+|\^+)(.)$/u);
  if (m) return m[2].length;
  // generic: count between first and last char
  return Math.max(0, line.length - 2);
}

describe('generateHeader formatting (width=114) - symphonic header', () => {
  it('produces consistent borders and centers provided lines within inner width', () => {
    const cfg = {
      lines: [
        'SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION',
        'Enhanced Handler Portfolio & Orchestration Framework'
      ],
      width: 114
    };

    const out = generateHeader(cfg);
    expect(typeof out).toBe('string');

    const lines = out.split('\n').filter(Boolean);
    // at least 3 lines (top, content, bottom)
    expect(lines.length).toBeGreaterThanOrEqual(3);

    const top = lines[0];
    const bottom = lines[lines.length - 1];

    // Top and bottom must start/end with corner characters
    expect(top[0]).toBe(top[0]); // ensure defined
    expect(top[0]).toMatch(/[\u2500-\u257F\+\-\*]/u); // box-drawing or ascii
    expect(top[top.length - 1]).toMatch(/[\u2500-\u257F\+\-\*]/u);

    // inner width equals width - 2
    const innerWidth = cfg.width - 2;
    expect(top.length).toBe(cfg.width);
    expect(bottom.length).toBe(cfg.width);

    // top border should be composed of corner + repeated border char(s) + corner
    // verify inner width count of border characters
    const topInner = top.substring(1, top.length - 1);
    expect(topInner.length).toBe(innerWidth);
    // ensure topInner contains the same repeated character
    const firstTopChar = topInner[0];
    expect(topInner.split('').every(ch => ch === firstTopChar)).toBe(true);

    // content lines: should start and end with box verticals and have inner width length
    const contentLines = lines.slice(1, -1);
    expect(contentLines.length).toBe(cfg.lines.length);

    contentLines.forEach((ln, idx) => {
      expect(ln.length).toBe(cfg.width);
      expect(ln[0]).toBe('?');
      expect(ln[ln.length - 1]).toBe('?');
      const inner = ln.substring(1, ln.length - 1);
      expect(inner.length).toBe(innerWidth);
      // should contain the expected text somewhere
      expect(inner).toMatch(new RegExp(cfg.lines[idx].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    });
  });
});
