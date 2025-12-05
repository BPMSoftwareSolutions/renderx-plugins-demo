#!/usr/bin/env node

/**
 * Data-Driven ASCII Metrics Box Generator
 * Generates beautiful ASCII boxes with title and metrics without domain knowledge
 *
 * Usage:
 *   node generate-ascii-metrics.cjs --json '{"title": "...", "metrics": {...}}'
 */

/**
 * Generate a metrics box with title and key-value pairs
 * @param {Object} config - Configuration object
 * @param {string} [config.title] - Title text (optional)
 * @param {string} [config.icon] - Icon/emoji for title (optional)
 * @param {Object} config.metrics - Key-value pairs of metrics
 * @param {number} [config.width=120] - Total width of the box
 * @param {string} [config.topBorder='─'] - Character for top border
 * @param {string} [config.bottomBorder='─'] - Character for bottom border
 * @param {string} [config.leftBorder='│'] - Character for left border
 * @param {string} [config.rightBorder='│'] - Character for right border
 * @param {string} [config.topLeftCorner='┌'] - Character for top left corner
 * @param {string} [config.topRightCorner='┐'] - Character for top right corner
 * @param {string} [config.bottomLeftCorner='└'] - Character for bottom left corner
 * @param {string} [config.bottomRightCorner='┘'] - Character for bottom right corner
 * @param {string} [config.separator='│'] - Character for metric separators
 * @param {string} [config.dividerChar='═'] - Character for title divider line
 * @param {number} [config.padding=2] - Padding around content
 * @param {boolean} [config.showDivider=true] - Show divider after title
 * @returns {string} The generated ASCII metrics box
 */
function generateMetricsBox(config) {
  const {
    title = '',
    icon = '',
    metrics = {},
    width = 120,
    topBorder = '─',
    bottomBorder = '─',
    leftBorder = '│',
    rightBorder = '│',
    topLeftCorner = '┌',
    topRightCorner = '┐',
    bottomLeftCorner = '└',
    bottomRightCorner = '┘',
    separator = '│',
    dividerChar = '═',
    padding = 2,
    showDivider = true
  } = config;

  const lines = [];
  const innerWidth = width - 2;
  const padStr = ' '.repeat(padding);

  // Top border
  lines.push(topLeftCorner + topBorder.repeat(innerWidth) + topRightCorner);

  // Title line (if provided)
  if (title) {
    const titleText = icon ? `${icon} ${title}` : title;
    const titlePadding = innerWidth - titleText.length - (padding * 2);
    const titleLine = leftBorder + padStr + titleText + ' '.repeat(titlePadding) + padStr + rightBorder;
    lines.push(titleLine);

    // Divider line (if enabled)
    if (showDivider) {
      const dividerLine = leftBorder + padStr + dividerChar.repeat(innerWidth - (padding * 2)) + padStr + rightBorder;
      lines.push(dividerLine);
    }
  }

  // Metrics line
  const metricEntries = Object.entries(metrics);
  if (metricEntries.length > 0) {
    const metricParts = metricEntries.map(([key, value]) => `${key}: ${value}`);
    const metricsText = padStr + separator + ' ' + metricParts.join(` ${separator} `) + padStr;

    // Calculate padding to center or fit the metrics
    const metricsLength = metricsText.length;
    const availableSpace = innerWidth - (padding * 2);

    let metricsLine;
    if (metricsLength <= availableSpace) {
      // Metrics fit - pad to fill width
      const remainingSpace = innerWidth - metricsLength;
      metricsLine = leftBorder + metricsText + ' '.repeat(remainingSpace) + rightBorder;
    } else {
      // Metrics too long - truncate or wrap (for now, truncate)
      metricsLine = leftBorder + padStr + metricsText.slice(0, availableSpace - padding * 2) + padStr + rightBorder;
    }

    lines.push(metricsLine);

    // Bottom border for metrics (decorative)
    const decorativeInnerWidth = innerWidth - (padding * 2);
    const bottomMetricLine = leftBorder + padStr + '╰' + '─'.repeat(decorativeInnerWidth - 2) + ' '.repeat(2) + padStr + rightBorder;
    lines.push(bottomMetricLine);
  }

  // Bottom border
  lines.push(bottomLeftCorner + bottomBorder.repeat(innerWidth) + bottomRightCorner);

  return lines.join('\n');
}

/**
 * Generate a simple metrics box (convenience function)
 * @param {string} title - Title text
 * @param {Object} metrics - Key-value pairs
 * @param {Object} options - Additional options
 * @returns {string} The generated ASCII metrics box
 */
function createMetricsBox(title, metrics, options = {}) {
  return generateMetricsBox({ title, metrics, ...options });
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-ascii-metrics.cjs --json \'{"title": "Title", "metrics": {"Key": "Value"}}\'');
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
    console.error('Error: Please provide --json argument');
    process.exit(1);
  }

  const metricsBox = generateMetricsBox(config);
  console.log(metricsBox);
}

// Export for use as a module
module.exports = {
  generateMetricsBox,
  createMetricsBox
};

// Run CLI if called directly
if (require.main === module) {
  main();
}
