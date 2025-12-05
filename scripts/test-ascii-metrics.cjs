#!/usr/bin/env node

/**
 * Manual test suite for ASCII Metrics Box Generator
 */

const { generateMetricsBox, createMetricsBox } = require('./generate-ascii-metrics.cjs');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    failed++;
  }
}

function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual: ${actual}`);
    failed++;
  }
}

function assertContains(haystack, needle, message) {
  if (haystack.includes(needle)) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    console.log(`  String does not contain: ${needle}`);
    failed++;
  }
}

console.log('Running ASCII Metrics Box Generator Tests...\n');

// Test 1: Basic metrics box
console.log('Test Suite: Basic metrics box');
const basic = generateMetricsBox({
  title: 'Test Title',
  metrics: { 'Key1': 'Value1', 'Key2': 'Value2' }
});
const basicLines = basic.split('\n');
assert(basicLines.length > 0, 'Should generate output');
assertContains(basic, 'Test Title', 'Should contain title');
assertContains(basic, 'Key1', 'Should contain Key1');
assertContains(basic, 'Value1', 'Should contain Value1');
assertContains(basic, 'Key2', 'Should contain Key2');
assertContains(basic, 'Value2', 'Should contain Value2');
console.log();

// Test 2: With icon
console.log('Test Suite: With icon');
const withIcon = generateMetricsBox({
  title: 'Metrics',
  icon: '📊',
  metrics: { 'Count': '100' }
});
assertContains(withIcon, '📊', 'Should contain icon');
assertContains(withIcon, 'Metrics', 'Should contain title');
console.log();

// Test 3: Custom width
console.log('Test Suite: Custom width');
const customWidth = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1' },
  width: 80
});
const widthLines = customWidth.split('\n');
assertEquals(widthLines[0].length, 80, 'Top border should be 80 chars');
assertEquals(widthLines[widthLines.length - 1].length, 80, 'Bottom border should be 80 chars');
console.log();

// Test 4: Without divider
console.log('Test Suite: Without divider');
const noDivider = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1' },
  showDivider: false
});
const dividerCount = (noDivider.match(/═/g) || []).length;
assertEquals(dividerCount, 0, 'Should have no divider characters');
console.log();

// Test 5: With divider (default)
console.log('Test Suite: With divider');
const withDivider = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1' },
  showDivider: true
});
const hasDivider = withDivider.includes('═');
assert(hasDivider, 'Should have divider line');
console.log();

// Test 6: Multiple metrics
console.log('Test Suite: Multiple metrics');
const multiMetrics = generateMetricsBox({
  title: 'Multi',
  metrics: {
    'Metric1': 'Val1',
    'Metric2': 'Val2',
    'Metric3': 'Val3',
    'Metric4': 'Val4'
  }
});
assertContains(multiMetrics, 'Metric1', 'Should contain Metric1');
assertContains(multiMetrics, 'Metric2', 'Should contain Metric2');
assertContains(multiMetrics, 'Metric3', 'Should contain Metric3');
assertContains(multiMetrics, 'Metric4', 'Should contain Metric4');
console.log();

// Test 7: Custom border characters
console.log('Test Suite: Custom borders');
const customBorders = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1' },
  topBorder: '━',
  bottomBorder: '━',
  leftBorder: '┃',
  rightBorder: '┃',
  topLeftCorner: '┏',
  topRightCorner: '┓',
  bottomLeftCorner: '┗',
  bottomRightCorner: '┛'
});
assertContains(customBorders, '┏', 'Should use custom top-left corner');
assertContains(customBorders, '┓', 'Should use custom top-right corner');
assertContains(customBorders, '┗', 'Should use custom bottom-left corner');
assertContains(customBorders, '┛', 'Should use custom bottom-right corner');
console.log();

// Test 8: Classic ASCII style
console.log('Test Suite: Classic ASCII style');
const classicStyle = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1' },
  topBorder: '-',
  bottomBorder: '-',
  leftBorder: '|',
  rightBorder: '|',
  topLeftCorner: '+',
  topRightCorner: '+',
  bottomLeftCorner: '+',
  bottomRightCorner: '+'
});
const classicLines = classicStyle.split('\n');
assert(classicLines[0].startsWith('+'), 'Should start with +');
assert(classicLines[0].includes('-'), 'Should have - border');
console.log();

// Test 9: Convenience function
console.log('Test Suite: Convenience function');
const convenience = createMetricsBox('Title', { 'Key': 'Value' }, { width: 90 });
assertContains(convenience, 'Title', 'Should contain title');
assertContains(convenience, 'Key', 'Should contain key');
assertContains(convenience, 'Value', 'Should contain value');
console.log();

// Test 10: Your exact example
console.log('Test Suite: Example format validation');
const example = generateMetricsBox({
  title: 'CODEBASE METRICS FOUNDATION',
  icon: '📊',
  metrics: {
    'Total Files': '791',
    'Total LOC': '5168',
    'Handlers': '285',
    'Avg LOC/Handler': '18.13',
    'Coverage': '80.38%'
  },
  width: 115
});
assertContains(example, 'CODEBASE METRICS FOUNDATION', 'Should contain title');
assertContains(example, '📊', 'Should contain icon');
assertContains(example, 'Total Files: 791', 'Should contain Total Files');
assertContains(example, 'Coverage: 80.38%', 'Should contain Coverage');
console.log();

// Test 11: Empty metrics
console.log('Test Suite: Empty metrics');
const emptyMetrics = generateMetricsBox({
  title: 'Empty',
  metrics: {}
});
assertContains(emptyMetrics, 'Empty', 'Should still contain title');
console.log();

// Test 12: No title
console.log('Test Suite: No title');
const noTitle = generateMetricsBox({
  metrics: { 'Key': 'Value' }
});
assertContains(noTitle, 'Key', 'Should contain metrics');
console.log();

// Test 13: Data-driven - multiple domains
console.log('Test Suite: Data-driven (domain agnostic)');
const domains = [
  { title: 'API METRICS', metrics: { 'Requests': '1K', 'Latency': '50ms' } },
  { title: 'DB STATS', metrics: { 'Records': '1M', 'Queries': '500/s' } },
  { title: 'BUILD INFO', metrics: { 'Status': 'PASS', 'Time': '2m' } }
];

domains.forEach((config, index) => {
  const result = generateMetricsBox(config);
  assertContains(result, config.title, `Domain ${index + 1} should contain title`);
  Object.keys(config.metrics).forEach(key => {
    assertContains(result, key, `Domain ${index + 1} should contain ${key}`);
  });
});
console.log();

// Test 14: Consistent width across all lines
console.log('Test Suite: Consistent width');
const consistent = generateMetricsBox({
  title: 'CONSISTENT WIDTH TEST',
  metrics: { 'A': '1', 'B': '2', 'C': '3' },
  width: 100
});
const consistentLines = consistent.split('\n');
const widths = consistentLines.map(line => line.length);
const allSameWidth = widths.every(w => w === widths[0]);
assert(allSameWidth, 'All lines should have consistent width');
assertEquals(widths[0], 100, 'Width should match specified width');
console.log();

// Test 15: Separator character
console.log('Test Suite: Custom separator');
const customSeparator = generateMetricsBox({
  title: 'Test',
  metrics: { 'A': '1', 'B': '2' },
  separator: '|'
});
assertContains(customSeparator, '|', 'Should use custom separator');
console.log();

// Summary
console.log('═'.repeat(80));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(80));

process.exit(failed > 0 ? 1 : 0);
