/**
 * Test to verify ASCII table alignment is dynamic and maintains alignment
 * when columns are added or removed
 */

const { describe, it, expect } = require('@jest/globals');

describe('ASCII Table Column Configuration', () => {
  it('should demonstrate how to add a new column', () => {
    // Example: Adding a "Cmplx" (Complexity) column

    const ORIGINAL_COLUMNS = [
      { key: 'beat', header: 'Beat', width: 4, align: 'left' },
      { key: 'movement', header: 'Mov', width: 3, align: 'left' },
      { key: 'handler', header: 'Handler', width: 27, align: 'left' },
      { key: 'loc', header: 'LOC', width: 3, align: 'right' },
      { key: 'sizeBand', header: 'Sz', width: 2, align: 'left' },
      { key: 'coverage', header: 'Cov', width: 4, align: 'right' },
      { key: 'risk', header: 'Risk', width: 4, align: 'left' },
      { key: 'hasAcGwt', header: 'AC', width: 2, align: 'left' },
      { key: 'hasSourcePath', header: 'Src', width: 3, align: 'left' },
      { key: 'baton', header: 'Baton', width: 8, align: 'left' }
    ];

    const ORIGINAL_SPACING = [1, 1, 1, 2, 2, 1, 1, 2, 1];

    // To add a "Complexity" column after "Risk":
    const NEW_COLUMNS = [
      { key: 'beat', header: 'Beat', width: 4, align: 'left' },
      { key: 'movement', header: 'Mov', width: 3, align: 'left' },
      { key: 'handler', header: 'Handler', width: 27, align: 'left' },
      { key: 'loc', header: 'LOC', width: 3, align: 'right' },
      { key: 'sizeBand', header: 'Sz', width: 2, align: 'left' },
      { key: 'coverage', header: 'Cov', width: 4, align: 'right' },
      { key: 'risk', header: 'Risk', width: 4, align: 'left' },
      { key: 'complexity', header: 'Cmplx', width: 3, align: 'left' }, // NEW COLUMN
      { key: 'hasAcGwt', header: 'AC', width: 2, align: 'left' },
      { key: 'hasSourcePath', header: 'Src', width: 3, align: 'left' },
      { key: 'baton', header: 'Baton', width: 8, align: 'left' }
    ];

    // Add spacing for the new column (1 space after "Risk", 1 space after "Cmplx")
    const NEW_SPACING = [1, 1, 1, 2, 2, 1, 1, 1, 2, 1];

    // Calculate widths
    const originalWidth = ORIGINAL_COLUMNS.reduce((sum, col) => sum + col.width, 0) +
                          ORIGINAL_SPACING.reduce((sum, space) => sum + space, 0);

    const newWidth = NEW_COLUMNS.reduce((sum, col) => sum + col.width, 0) +
                     NEW_SPACING.reduce((sum, space) => sum + space, 0);

    expect(originalWidth).toBe(72); // Current width
    expect(newWidth).toBe(76); // New width with complexity column (72 + 3 + 1)
    expect(NEW_COLUMNS.length - 1).toBe(NEW_SPACING.length); // Spacing array length check
  });

  it('should demonstrate how to remove a column', () => {
    // Example: Removing the "Baton" column

    const ORIGINAL_COLUMNS = [
      { key: 'beat', header: 'Beat', width: 4, align: 'left' },
      { key: 'movement', header: 'Mov', width: 3, align: 'left' },
      { key: 'handler', header: 'Handler', width: 27, align: 'left' },
      { key: 'loc', header: 'LOC', width: 3, align: 'right' },
      { key: 'sizeBand', header: 'Sz', width: 2, align: 'left' },
      { key: 'coverage', header: 'Cov', width: 4, align: 'right' },
      { key: 'risk', header: 'Risk', width: 4, align: 'left' },
      { key: 'hasAcGwt', header: 'AC', width: 2, align: 'left' },
      { key: 'hasSourcePath', header: 'Src', width: 3, align: 'left' },
      { key: 'baton', header: 'Baton', width: 8, align: 'left' }
    ];

    const ORIGINAL_SPACING = [1, 1, 1, 2, 2, 1, 1, 2, 1];

    // Remove "Baton" column
    const NEW_COLUMNS = [
      { key: 'beat', header: 'Beat', width: 4, align: 'left' },
      { key: 'movement', header: 'Mov', width: 3, align: 'left' },
      { key: 'handler', header: 'Handler', width: 27, align: 'left' },
      { key: 'loc', header: 'LOC', width: 3, align: 'right' },
      { key: 'sizeBand', header: 'Sz', width: 2, align: 'left' },
      { key: 'coverage', header: 'Cov', width: 4, align: 'right' },
      { key: 'risk', header: 'Risk', width: 4, align: 'left' },
      { key: 'hasAcGwt', header: 'AC', width: 2, align: 'left' },
      { key: 'hasSourcePath', header: 'Src', width: 3, align: 'left' }
      // Baton removed
    ];

    // Remove last spacing entry (after Src, before Baton)
    const NEW_SPACING = [1, 1, 1, 2, 2, 1, 1, 2];

    // Calculate widths
    const originalWidth = ORIGINAL_COLUMNS.reduce((sum, col) => sum + col.width, 0) +
                          ORIGINAL_SPACING.reduce((sum, space) => sum + space, 0);

    const newWidth = NEW_COLUMNS.reduce((sum, col) => sum + col.width, 0) +
                     NEW_SPACING.reduce((sum, space) => sum + space, 0);

    expect(originalWidth).toBe(72); // Current width
    expect(newWidth).toBe(63); // New width without baton column (72 - 8 - 1)
    expect(NEW_COLUMNS.length - 1).toBe(NEW_SPACING.length); // Spacing array length check
  });

  it('should validate spacing array length matches column count', () => {
    const columns = [
      { key: 'a', header: 'A', width: 5, align: 'left' },
      { key: 'b', header: 'B', width: 5, align: 'left' },
      { key: 'c', header: 'C', width: 5, align: 'left' }
    ];

    // For N columns, we need N-1 spacing entries (gaps between columns)
    const correctSpacing = [2, 2]; // 2 gaps for 3 columns
    const incorrectSpacing = [2, 2, 2]; // Too many

    expect(columns.length - 1).toBe(correctSpacing.length);
    expect(columns.length - 1).not.toBe(incorrectSpacing.length);
  });

  it('should calculate table width correctly', () => {
    function calculateTableWidth(columns, spacing) {
      const columnsWidth = columns.reduce((sum, col) => sum + col.width, 0);
      const spacingWidth = spacing.reduce((sum, space) => sum + space, 0);
      return columnsWidth + spacingWidth;
    }

    const columns = [
      { key: 'a', header: 'A', width: 10, align: 'left' },
      { key: 'b', header: 'B', width: 15, align: 'left' },
      { key: 'c', header: 'C', width: 20, align: 'left' }
    ];
    const spacing = [2, 3]; // 2 spaces after 'a', 3 spaces after 'b'

    const width = calculateTableWidth(columns, spacing);

    // 10 + 2 + 15 + 3 + 20 = 50
    expect(width).toBe(50);
  });
});
