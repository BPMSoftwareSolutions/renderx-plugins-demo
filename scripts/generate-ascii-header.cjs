#!/usr/bin/env node

/**
 * Data-Driven ASCII Header Generator
 * Generates beautiful ASCII box headers without domain knowledge
 *
 * Usage:
 *   node generate-ascii-header.cjs "Line 1" "Line 2" "Line 3"
 *   node generate-ascii-header.cjs --json '{"lines": ["Line 1", "Line 2"], "width": 120}'
 */

/**
 * Generate a centered ASCII header box
 * @param {Object} config - Configuration object
 * @param {string[]} config.lines - Array of text lines to display
 * @param {number} [config.width=120] - Total width of the box (including borders)
 * @param {string} [config.topBorder='═'] - Character for top border
 * @param {string} [config.bottomBorder='═'] - Character for bottom border
 * @param {string} [config.leftBorder='║'] - Character for left border
 * @param {string} [config.rightBorder='║'] - Character for right border
 * @param {string} [config.topLeftCorner='╔'] - Character for top left corner
 * @param {string} [config.topRightCorner='╗'] - Character for top right corner
 * @param {string} [config.bottomLeftCorner='╚'] - Character for bottom left corner
 * @param {string} [config.bottomRightCorner='╝'] - Character for bottom right corner
 * @param {string} [config.padding=' '] - Character for padding
 * @param {boolean} [config.center=true] - Whether to center text
 * @returns {string} The generated ASCII header
 */
function generateHeader(config) {
  const {
    lines = [],
    width = 120,
    topBorder = '═',
    bottomBorder = '═',
    leftBorder = '║',
    rightBorder = '║',
    topLeftCorner = '╔',
    topRightCorner = '╗',
    bottomLeftCorner = '╚',
    bottomRightCorner = '╝',
    padding = ' ',
    center = true
  } = config;

  // Calculate inner width (excluding border characters)
  const innerWidth = width - 2;

  // Generate top border
  const topLine = topLeftCorner + topBorder.repeat(innerWidth) + topRightCorner;

  // Generate content lines
  const contentLines = lines.map(line => {
    const textLength = line.length;

    if (center) {
      // Center the text
      const totalPadding = innerWidth - textLength;
      const leftPadding = Math.floor(totalPadding / 2);
      const rightPadding = totalPadding - leftPadding;

      return leftBorder +
             padding.repeat(leftPadding) +
             line +
             padding.repeat(rightPadding) +
             rightBorder;
    } else {
      // Left-align with padding
      const rightPadding = innerWidth - textLength;
      return leftBorder + line + padding.repeat(rightPadding) + rightBorder;
    }
  });

  // Generate bottom border
  const bottomLine = bottomLeftCorner + bottomBorder.repeat(innerWidth) + bottomRightCorner;

  // Combine all lines
  return [topLine, ...contentLines, bottomLine].join('\n');
}

/**
 * Generate a simple centered ASCII header (convenience function)
 * @param {...string} lines - Lines of text
 * @returns {string} The generated ASCII header
 */
function createHeader(...lines) {
  return generateHeader({ lines });
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-ascii-header.cjs "Line 1" "Line 2" ...');
    console.error('   Or: node generate-ascii-header.cjs --json \'{"lines": ["Line 1"], "width": 120}\'');
    process.exit(1);
  }

  let config;

  // Check if JSON config is provided
  if (args[0] === '--json') {
    try {
      config = JSON.parse(args[1]);
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      process.exit(1);
    }
  } else {
    // Use command-line arguments as lines
    config = { lines: args };
  }

  const header = generateHeader(config);
  console.log(header);
}

// Export for use as a module
module.exports = {
  generateHeader,
  createHeader
};

// Run CLI if called directly
if (require.main === module) {
  main();
}
