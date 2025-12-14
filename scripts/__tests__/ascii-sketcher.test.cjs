const { describe, it, expect } = require('@jest/globals');
const { AsciiSketcher } = require('../ascii-sketch-renderers.cjs');

function extractBoxLines(output) {
  const lines = output.split('\n');
  return {
    topBorder: lines.find(l => l.startsWith('?')),
    middleDividers: lines.filter(l => l.startsWith('?')),
    bottomBorder: lines.find(l => l.startsWith('?')),
    contentLines: lines.filter(l => l.startsWith('?'))
  };
}

function getBoxWidth(line) {
  if (!line) return 0;
  const match = line.match(/^[???](?+)[???]$/);
  if (match) return match[1].length;
  const contentMatch = line.match(/^?(.+)?$/);
  if (contentMatch) return contentMatch[1].length;
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

    expect(top).toBe(bottom);
    // content lines should match inner width
    lines.contentLines.forEach(l => {
      expect(getBoxWidth(l)).toBe(top);
    });
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
    expect(top).toBe(bottom);

    // header line is first content line
    const header = lines.contentLines[0];
    expect(getBoxWidth(header)).toBe(top);
    // header should contain column headers
    expect(header).toMatch(/Name/);
    expect(header).toMatch(/LOC/);
    expect(header).toMatch(/Cov/);
  });

  it('supports pages and newPage boundaries', () => {
    const s = new AsciiSketcher({ boxWidth: 40 });
    s.newPage('First');
    s.addCard('Card A', ['A']);
    s.newPage('Second');
    s.addCard('Card B', ['B']);
    const doc = s.build();

    // Should contain two pages separated by blank line
    const pages = doc.split('\n\n');
    expect(pages.length).toBe(2);
    expect(pages[0]).toContain('FIRST');
    expect(pages[1]).toContain('SECOND');
  });

  it('honors setWidth and table reflows', () => {
    const s = new AsciiSketcher({ boxWidth: 80 });
    const columns = [
      { key: 'a', header: 'A', width: 20 },
      { key: 'b', header: 'B', width: 20 },
      { key: 'c', header: 'C', width: 20 }
    ];
    const rows = [[ 'one', 'two', 'three' ]];
    s.addTable(columns, rows);
    const out1 = s.build();

    s.setWidth(40);
    s.addTable(columns, rows);
    const out2 = s.build();

    // out1 should have wider top border than out2
    const w1 = getBoxWidth(extractBoxLines(out1).topBorder);
    const w2 = getBoxWidth(extractBoxLines(out2).topBorder);
    expect(w1).toBeGreaterThan(w2);
  });
});
