#!/usr/bin/env node

/**
 * ASCII Sketch Generator - Data-driven bordered ASCII boxes with auto-alignment
 * JavaScript port matching the Python implementation exactly
 *
 * Usage:
 *   node generate-ascii-sketch.cjs --json '{"title": "...", "metrics": {...}, "icon": "..."}'
 */

/**
 * Calculate visual width accounting for wide characters (emojis, etc.)
 * @param {string} str - String to measure
 * @returns {number} Visual width
 */
function visualWidth(str) {
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Emoji and wide characters typically use surrogate pairs or are in certain Unicode ranges
    if (code >= 0x1F300 && code <= 0x1F9FF) {
      width += 2; // Emoji
    } else if (code >= 0xD800 && code <= 0xDFFF) {
      // Surrogate pair - count as 2
      width += 2;
      i++; // Skip the next surrogate
    } else {
      width += 1;
    }
  }
  return width;
}

/**
 * Generate a clean ASCII sketch with proper alignment
 * @param {Object} config - Configuration object
 * @param {string} config.title - Header title for the sketch
 * @param {Object} config.metrics - Dict of metric_name: metric_value pairs
 * @param {string} [config.style='box'] - "box" (bordered) or "line" (simple line)
 * @param {string} [config.icon=''] - Optional emoji or icon to prepend to title
 * @returns {string} Formatted ASCII sketch string
 */
function generateSketch(config) {
  const {
    title,
    metrics = {},
    style = 'box',
    icon = ''
  } = config;

  // Format metrics into a single line
  const metricPairs = Object.entries(metrics).map(([name, value]) => `${name}: ${value}`);
  const contentLine = metricPairs.join('  │  ');
  const content = `│ ${contentLine} │`;

  // Build title section with optional icon
  const titleWithIcon = icon ? `${icon} ${title}` : title;
  const titleSection = `─ ${titleWithIcon} `;
  const contentWidth = content.length;

  if (style === 'box') {
    const titleVisualWidth = visualWidth(titleSection);

    // Top border: ┌─ ICON TITLE ─────...─┐
    const remainingWidth = contentWidth - titleVisualWidth - 2; // -2 for ┌ and ┐
    const topBorder = `┌${titleSection}${'─'.repeat(Math.max(0, remainingWidth))}┐`;

    // Bottom border matches top border visual width exactly
    const bottomDashes = contentWidth - 2; // -2 for └ and ┘
    const bottomBorder = `└${'─'.repeat(bottomDashes)}┘`;

    return `${topBorder}\n${content}\n${bottomBorder}`;
  } else if (style === 'line') {
    // Simple line style: just title and content
    const separator = '─'.repeat(contentWidth);
    return `${titleWithIcon}\n${separator}\n${content}`;
  }

  return '';
}

/**
 * Convenience function for creating sketches
 * @param {string} title - Header title
 * @param {Object} metrics - Metrics object
 * @param {Object} options - Additional options (style, icon)
 * @returns {string} Formatted ASCII sketch
 */
function createSketch(title, metrics, options = {}) {
  return generateSketch({ title, metrics, ...options });
}

/**
 * Parse an existing ASCII sketch to extract title and metrics
 * @param {string} sketchString - Multi-line ASCII sketch
 * @returns {Object} Object with 'title' and 'metrics' keys
 */
function parseSketch(sketchString) {
  const lines = sketchString.trim().split('\n');

  // Extract title from first line (between ┌─ and first space before ─)
  const titleLine = lines[0] || '';
  let title = '';

  if (titleLine.includes('┌─')) {
    const startIdx = titleLine.indexOf('┌─') + 2;
    const endIdx = titleLine.lastIndexOf('─');
    if (endIdx > startIdx) {
      title = titleLine.substring(startIdx, endIdx).trim();
    }
  }

  if (!title) {
    title = 'UNKNOWN';
  }

  // Extract metrics from content line
  const contentLine = lines[1] || '';
  const cleanedContent = contentLine.replace(/^│\s*/, '').replace(/\s*│$/, '');

  const metrics = {};
  cleanedContent.split('│').forEach(pair => {
    const trimmed = pair.trim();
    if (trimmed.includes(':')) {
      const [name, ...valueParts] = trimmed.split(':');
      metrics[name.trim()] = valueParts.join(':').trim();
    }
  });

  return { title, metrics };
}

/**
 * CLI entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node generate-ascii-sketch.cjs --json \'{"title": "Title", "metrics": {"Key": "Value"}}\'');
    console.error('');
    console.error('Example:');
    console.error('  node generate-ascii-sketch.cjs --json \'{"title": "CODEBASE METRICS", "metrics": {"Files": "791", "LOC": "5168"}, "icon": "📊"}\'');
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

  const sketch = generateSketch(config);
  console.log(sketch);
}

// Export for use as a module
module.exports = {
  generateSketch,
  createSketch,
  parseSketch
};

// Run CLI if called directly
if (require.main === module) {
  main();
}
