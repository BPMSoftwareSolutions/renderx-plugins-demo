const { generateHeader, createHeader } = require('../generate-ascii-header.cjs');

describe('ASCII Header Generator', () => {
  describe('createHeader', () => {
    it('should generate a simple centered header with one line', () => {
      const result = createHeader('Hello World');
      const lines = result.split('\n');

      expect(lines).toHaveLength(3); // top border, content, bottom border
      expect(lines[0]).toMatch(/^╔═+╗$/);
      expect(lines[1]).toContain('Hello World');
      expect(lines[2]).toMatch(/^╚═+╝$/);
    });

    it('should generate a header with multiple lines', () => {
      const result = createHeader('Line 1', 'Line 2', 'Line 3');
      const lines = result.split('\n');

      expect(lines).toHaveLength(5); // top + 3 content + bottom
      expect(lines[1]).toContain('Line 1');
      expect(lines[2]).toContain('Line 2');
      expect(lines[3]).toContain('Line 3');
    });

    it('should center text by default', () => {
      const result = createHeader('Test');
      const lines = result.split('\n');
      const contentLine = lines[1];

      // Remove borders
      const content = contentLine.slice(1, -1);
      const leftSpaces = content.match(/^ */)[0].length;
      const rightSpaces = content.match(/ *$/)[0].length;

      // Should be roughly equal (diff of 1 is ok for odd widths)
      expect(Math.abs(leftSpaces - rightSpaces)).toBeLessThanOrEqual(1);
    });
  });

  describe('generateHeader', () => {
    it('should respect custom width', () => {
      const result = generateHeader({
        lines: ['Test'],
        width: 80
      });
      const lines = result.split('\n');

      expect(lines[0].length).toBe(80);
      expect(lines[1].length).toBe(80);
      expect(lines[2].length).toBe(80);
    });

    it('should use custom border characters', () => {
      const result = generateHeader({
        lines: ['Test'],
        topBorder: '-',
        bottomBorder: '-',
        leftBorder: '|',
        rightBorder: '|',
        topLeftCorner: '+',
        topRightCorner: '+',
        bottomLeftCorner: '+',
        bottomRightCorner: '+'
      });
      const lines = result.split('\n');

      expect(lines[0]).toMatch(/^\+-+\+$/);
      expect(lines[1]).toMatch(/^\|.*\|$/);
      expect(lines[2]).toMatch(/^\+-+\+$/);
    });

    it('should support left-aligned text', () => {
      const result = generateHeader({
        lines: ['Test'],
        center: false,
        width: 20
      });
      const lines = result.split('\n');
      const contentLine = lines[1];

      // Should start with border + text (no leading spaces)
      expect(contentLine).toMatch(/^║Test /);
    });

    it('should handle empty lines array', () => {
      const result = generateHeader({ lines: [] });
      const lines = result.split('\n');

      expect(lines).toHaveLength(2); // Only borders
      expect(lines[0]).toMatch(/^╔═+╗$/);
      expect(lines[1]).toMatch(/^╚═+╝$/);
    });

    it('should handle long text that fits within width', () => {
      const longText = 'A'.repeat(100);
      const result = generateHeader({
        lines: [longText],
        width: 120
      });
      const lines = result.split('\n');

      expect(lines[1]).toContain(longText);
      expect(lines[1].length).toBe(120);
    });

    it('should produce the exact format from the example', () => {
      const result = generateHeader({
        lines: [
          'SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION',
          'Enhanced Handler Portfolio & Orchestration Framework'
        ],
        width: 120
      });

      const lines = result.split('\n');
      expect(lines).toHaveLength(4);
      expect(lines[0].startsWith('╔')).toBe(true);
      expect(lines[0].endsWith('╗')).toBe(true);
      expect(lines[1]).toContain('SYMPHONIC CODE ANALYSIS');
      expect(lines[2]).toContain('Enhanced Handler Portfolio');
      expect(lines[3].startsWith('╚')).toBe(true);
      expect(lines[3].endsWith('╝')).toBe(true);
    });
  });

  describe('data-driven capabilities', () => {
    it('should work with any domain without modification', () => {
      const domains = [
        ['E-Commerce Platform', 'User Authentication System'],
        ['Database Migration Tool', 'Schema Version Manager'],
        ['Machine Learning Pipeline', 'Model Training & Deployment'],
        ['API Gateway Service', 'Request Router & Load Balancer']
      ];

      domains.forEach(lines => {
        const result = generateHeader({ lines });
        const resultLines = result.split('\n');

        expect(resultLines.length).toBe(2 + lines.length);
        lines.forEach(line => {
          expect(result).toContain(line);
        });
      });
    });

    it('should handle single-character lines', () => {
      const result = generateHeader({ lines: ['X'] });
      expect(result).toContain('X');
    });

    it('should handle lines with special characters', () => {
      const result = generateHeader({
        lines: ['Test & Development', 'API -> Database -> Cache']
      });
      expect(result).toContain('&');
      expect(result).toContain('->');
    });

    it('should maintain consistent width across all lines', () => {
      const result = generateHeader({
        lines: ['Short', 'Much Longer Line Here', 'X'],
        width: 100
      });
      const lines = result.split('\n');

      const widths = lines.map(line => line.length);
      const allEqual = widths.every(w => w === widths[0]);

      expect(allEqual).toBe(true);
      expect(widths[0]).toBe(100);
    });
  });
});
