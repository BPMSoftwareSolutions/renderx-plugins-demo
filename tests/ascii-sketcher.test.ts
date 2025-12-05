import { describe, it, expect } from 'vitest';
const { AsciiSketcher, renderCleanSymphonyHandler } = require('../scripts/ascii-sketch-renderers.cjs');

function extractBorderWidths(doc: string) {
  if (!doc) return [];
  // Use unicode escapes via RegExp constructor to avoid source parse issues
  const re = new RegExp('[\\u2554\\u2560\\u255A](\\u2550+)[\\u2557\\u2563\\u255D]', 'g');
  const widths = [];
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(doc)) !== null) {
    // m[1] will contain the matched run of \u2550 characters encoded as literal chars in the string
    widths.push(m[1].length);
  }
  return widths;
}

describe('AsciiSketcher', () => {
  it('builds a simple card with consistent borders', () => {
    const s = new AsciiSketcher({ boxWidth: 50 });
    s.addCard('My Card', ['Line one', 'Line two']);
    const doc = s.build();

    const widths = extractBorderWidths(doc as string);
    expect(widths.length).toBeGreaterThan(0);
    const unique = Array.from(new Set(widths));
    expect(unique.length).toBe(1);
    expect(unique[0]).toBeGreaterThan(0);
  });

  it('creates a table that fits boxWidth and header aligns', () => {
    const s = new AsciiSketcher({ boxWidth: 60 });
    const columns = [
      { key: 'name', header: 'Name', width: 15 },
      { key: 'loc', header: 'LOC', width: 5, align: 'right' },
      { key: 'cov', header: 'Cov', width: 5, align: 'right' },
      { key: 'risk', header: 'Risk', width: 6 }
    ];
    const rows = [
      { name: 'render', loc: 120, cov: '88%', risk: 'MED' },
      { name: 'load', loc: 80, cov: '92%', risk: 'LOW' }
    ];

    s.addTable(columns, rows, { colSpacing: 2 });
    const out = s.build();

    const widths = extractBorderWidths(out as string);
    const unique = Array.from(new Set(widths));
    expect(widths.length).toBeGreaterThan(0);
    expect(unique.length).toBe(1);
  });

  it('supports pages and newPage boundaries', () => {
    const s = new AsciiSketcher({ boxWidth: 40 });
    s.newPage('First');
    s.addCard('Card A', ['A']);
    s.newPage('Second');
    s.addCard('Card B', ['B']);
    const doc = s.build();

    const pages = (doc as string).split('\n\n');
    expect(pages.length).toBe(2);
    expect(pages[0]).toContain('FIRST');
    expect(pages[1]).toContain('SECOND');
  });

  it('honors setWidth and table reflows', () => {
    const columns = [
      { key: 'a', header: 'A', width: 20 },
      { key: 'b', header: 'B', width: 20 },
      { key: 'c', header: 'C', width: 20 }
    ];
    const rows = [[ 'one', 'two', 'three' ]];

    const s1 = new AsciiSketcher({ boxWidth: 80 });
    s1.addTable(columns, rows);
    const out1 = s1.build();

    const s2 = new AsciiSketcher({ boxWidth: 40 });
    s2.addTable(columns, rows);
    const out2 = s2.build();

    const w1 = extractBorderWidths(out1 as string)[0] || 0;
    const w2 = extractBorderWidths(out2 as string)[0] || 0;
    expect(w1).toBeGreaterThan(0);
    expect(w2).toBeGreaterThan(0);
    expect(w1).toBeGreaterThanOrEqual(w2);
  });

  it('renderCleanSymphonyHandler produces aligned borders', () => {
    const sample = {
      symphonyName: 'Canvas Component Select',
      domainId: 'renderx-web-orchestration',
      packageName: 'renderx-orchestration',
      symphonyCount: 1,
      movementCount: 1,
      beatCount: 1,
      handlerCount: 2,
      totalLoc: 240,
      avgCoverage: 88.3,
      sizeBand: 'SMALL',
      riskLevel: 'MEDIUM',
      movements: [ { name: 'Start', description: 'Initialize', beats: 'beat1' } ],
      handlers: [
        { beat: 'B1', movement: 'Start', handler: 'load', loc: 120, sizeBand: 'SM', coverage: 90, risk: 'LOW', hasAcGwt: true, hasSourcePath: true, baton: 'metrics' },
        { beat: 'B1', movement: 'Start', handler: 'render', loc: 120, sizeBand: 'SM', coverage: 86, risk: 'MED', hasAcGwt: false, hasSourcePath: true, baton: 'dom' }
      ],
      metrics: { sizeBands: { tiny:0, small:2, medium:0, large:0, xl:0 }, coverageDist: { low:0, medLow:0, medHigh:0, high:2 }, riskSummary: { critical:0, high:0, medium:2, low:0 } }
    };

    const output = renderCleanSymphonyHandler(sample);
    const widths = extractBorderWidths(output);
    const unique = Array.from(new Set(widths));
    expect(unique.length).toBe(1);
    expect(unique[0]).toBeGreaterThan(0);
  });
});
