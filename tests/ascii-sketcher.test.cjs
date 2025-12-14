const { describe, it, expect } = require('vitest');
const { AsciiSketcher, renderCleanSymphonyHandler } = require('../scripts/ascii-sketch-renderers.cjs');

function extractBoxLines(output) {
  const lines = output.split('\n');
  return {
    topBorder: lines.find(l => l.startsWith('?')),
    middleDividers: lines.filter(l => l.startsWith('?')),
    bottomBorder: lines.slice().reverse().find(l => l.startsWith('?')),
    contentLines: lines.filter(l => l.startsWith('?'))
  };
}

function getBoxWidth(line) {
  if (!line) return 0;
  // For border lines like '????...????' or '???...?' or '???...?'
  if (line.startsWith('?') || line.startsWith('?') || line.startsWith('?')) {
    // strip first and last char
    return line.length - 2;
  }
  // For content lines '? content ?' -> inner length
  if (line.startsWith('?')) {
    // remove leading '? ' and trailing ' ?' if present
    const inner = line.slice(1, -1);
    return inner.length;
  }
  return 0;
}

describe('AsciiSketcher', () => {
  it('builds a simple card with consistent borders', () => {
    const s = new AsciiSketcher({ boxWidth: 50 });
    s.addCard('My Card', ['Line one', 'Line two']);
    const doc = s.build();

    const lines = extractBoxLines(doc);
    const top = getBoxWidth(lines.topBorder);
    const bottom = getBoxWidth(lines.bottomBorder);

    expect(top).toBeGreaterThan(0);
    expect(top).toBe(bottom);
    lines.contentLines.forEach(l => expect(getBoxWidth(l)).toBe(top));
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

    const lines = extractBoxLines(out);
    const top = getBoxWidth(lines.topBorder);
    const bottom = getBoxWidth(lines.bottomBorder);
    expect(top).toBeGreaterThan(0);
    expect(top).toBe(bottom);
    expect(lines.contentLines.length).toBeGreaterThan(0);
  });

  it('supports pages and newPage boundaries', () => {
    const s = new AsciiSketcher({ boxWidth: 40 });
    s.newPage('First');
    s.addCard('Card A', ['A']);
    s.newPage('Second');
    s.addCard('Card B', ['B']);
    const doc = s.build();

    const pages = doc.split('\n\n');
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

    const w1 = getBoxWidth(extractBoxLines(out1).topBorder);
    const w2 = getBoxWidth(extractBoxLines(out2).topBorder);
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
    const lines = extractBoxLines(output);
    const topWidth = getBoxWidth(lines.topBorder);
    const bottomWidth = getBoxWidth(lines.bottomBorder);
    const dividerWidths = lines.middleDividers.map(getBoxWidth);

    const allWidths = [topWidth, bottomWidth, ...dividerWidths];
    const uniqueWidths = Array.from(new Set(allWidths));

    expect(uniqueWidths.length).toBe(1);
    expect(uniqueWidths[0]).toBe(topWidth);
  });
});
