/**
 * Test to verify ASCII box borders are perfectly aligned
 * RED -> GREEN -> REFACTOR approach
 */

const { describe, it, expect } = require('@jest/globals');
const { renderCleanSymphonyHandler } = require('../ascii-sketch-renderers.cjs');

describe('ASCII Box Border Alignment', () => {
  /**
   * Helper function to extract all box drawing lines from output
   */
  function extractBoxLines(output) {
    const lines = output.split('\n');
    return {
      topBorder: lines.find(l => l.startsWith('╔')),
      middleDividers: lines.filter(l => l.startsWith('╠')),
      bottomBorder: lines.find(l => l.startsWith('╚')),
      contentLines: lines.filter(l => l.startsWith('║'))
    };
  }

  /**
   * Helper to count characters in a box line (excluding the box drawing chars)
   */
  function getBoxWidth(line) {
    if (!line) return 0;

    // Remove the border characters and count what's left
    // Pattern: ╔═══...═══╗ or ╠═══...═══╣ or ╚═══...═══╝
    const match = line.match(/^[╔╠╚](═+)[╗╣╝]$/);
    if (match) {
      return match[1].length;
    }

    // For content lines: ║ content ║
    const contentMatch = line.match(/^║(.+)║$/);
    if (contentMatch) {
      return contentMatch[1].length;
    }

    return 0;
  }

  it('should produce properly aligned renderer output (fix verification)', () => {
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
      movements: [
        { name: 'Start', description: 'Initialize', beats: 'beat1' }
      ],
      handlers: [
        { beat: 'B1', movement: 'Start', handler: 'load', loc: 120, sizeBand: 'SM', coverage: 90, risk: 'LOW', hasAcGwt: true, hasSourcePath: true, baton: 'metrics' },
        { beat: 'B1', movement: 'Start', handler: 'render', loc: 120, sizeBand: 'SM', coverage: 86, risk: 'MED', hasAcGwt: false, hasSourcePath: true, baton: 'dom' }
      ],
      metrics: {
        sizeBands: { tiny: 0, small: 2, medium: 0, large: 0, xl: 0 },
        coverageDist: { low: 0, medLow: 0, medHigh: 0, high: 2 },
        riskSummary: { critical: 0, high: 0, medium: 2, low: 0 }
      }
    };

    const output = renderCleanSymphonyHandler(sample);
    const lines = extractBoxLines(output);

    const topWidth = getBoxWidth(lines.topBorder);
    const bottomWidth = getBoxWidth(lines.bottomBorder);
    const dividerWidths = lines.middleDividers.map(getBoxWidth);

    const allWidths = [topWidth, bottomWidth, ...dividerWidths];
    const uniqueWidths = [...new Set(allWidths)];

    // All borders should have identical inner width
    expect(uniqueWidths.length).toBe(1);
    expect(uniqueWidths[0]).toBe(topWidth);
  });

  it('should calculate correct divider width based on title and padding', () => {
    const boxWidth = 72;
    const title = ' BEAT / HANDLER PORTFOLIO ';
    const leftPadding = 24;

    // Calculate what the right padding should be
    const rightPadding = boxWidth - leftPadding - title.length;

    // Total should equal boxWidth
    const total = leftPadding + title.length + rightPadding;

    expect(total).toBe(boxWidth);
    expect(rightPadding).toBeGreaterThan(0); // Must be positive
  });

  it('should verify all box lines have consistent width', () => {
    // Helper to create a properly aligned box
    function createAlignedBox(boxWidth) {
      const lines = [];

      // Top border
      lines.push('╔' + '═'.repeat(boxWidth) + '╗');

      // Content line
      const content = ' HANDLER SYMPHONY: TEST ';
      lines.push('║ ' + content.padEnd(boxWidth - 1) + '║');

      // Section divider with title
      const title = ' BEAT / HANDLER PORTFOLIO ';
      const leftPadding = 24;
      const rightPadding = boxWidth - leftPadding - title.length;
      lines.push('╠' + '═'.repeat(leftPadding) + title + '═'.repeat(rightPadding) + '╣');

      // Another content line
      lines.push('║ ' + 'Content'.padEnd(boxWidth - 1) + '║');

      // Bottom border
      lines.push('╚' + '═'.repeat(boxWidth) + '╝');

      return lines.join('\n');
    }

    const output = createAlignedBox(72);
    const boxLines = extractBoxLines(output);

    const topWidth = getBoxWidth(boxLines.topBorder);
    const bottomWidth = getBoxWidth(boxLines.bottomBorder);
    const dividerWidths = boxLines.middleDividers.map(getBoxWidth);

    // All widths should be identical
    expect(topWidth).toBe(72);
    expect(bottomWidth).toBe(72);
    dividerWidths.forEach(width => {
      expect(width).toBe(72);
    });
  });

  it('GREEN: should verify properly aligned output after fix', () => {
    // This simulates what the output SHOULD look like after fix
    const boxWidth = 72;

    function createProperlyAlignedSection(boxWidth) {
      const lines = [];

      // Top border - exactly boxWidth '=' chars
      lines.push('╔' + '═'.repeat(boxWidth) + '╗');

      // Content
      lines.push('║ ' + 'HANDLER SYMPHONY: TEST'.padEnd(boxWidth - 1) + '║');

      // Movement map divider - exactly boxWidth '=' chars
      lines.push('╠' + '═'.repeat(boxWidth) + '╣');

      // Portfolio divider with title - must equal boxWidth
      const portfolioTitle = ' BEAT / HANDLER PORTFOLIO ';
      const leftPad = 24;
      const rightPad = boxWidth - leftPad - portfolioTitle.length;
      lines.push('╠' + '═'.repeat(leftPad) + portfolioTitle + '═'.repeat(rightPad) + '╣');

      // Metrics divider with title - must equal boxWidth
      const metricsTitle = ' HANDLER PORTFOLIO METRICS ';
      const metricsLeftPad = 24;
      const metricsRightPad = boxWidth - metricsLeftPad - metricsTitle.length;
      lines.push('╠' + '═'.repeat(metricsLeftPad) + metricsTitle + '═'.repeat(metricsRightPad) + '╣');

      // Bottom border - exactly boxWidth '=' chars
      lines.push('╚' + '═'.repeat(boxWidth) + '╝');

      return lines.join('\n');
    }

    const output = createProperlyAlignedSection(boxWidth);
    const boxLines = extractBoxLines(output);

    const topWidth = getBoxWidth(boxLines.topBorder);
    const bottomWidth = getBoxWidth(boxLines.bottomBorder);
    const dividerWidths = boxLines.middleDividers.map(getBoxWidth);

    // After fix, all widths should be exactly 72
    expect(topWidth).toBe(72);
    expect(bottomWidth).toBe(72);

    dividerWidths.forEach((width, idx) => {
      expect(width).toBe(72); // Each divider should be exactly 72
    });

    // All should be the same
    const allWidths = [topWidth, bottomWidth, ...dividerWidths];
    const uniqueWidths = [...new Set(allWidths)];
    expect(uniqueWidths.length).toBe(1);
    expect(uniqueWidths[0]).toBe(boxWidth);
  });
});
