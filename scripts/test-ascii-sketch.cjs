#!/usr/bin/env node

/**
 * Test suite for ASCII Sketch Generator
 * Ensures JavaScript implementation matches Python behavior
 */

const { generateSketch, createSketch, parseSketch } = require('./generate-ascii-sketch.cjs');

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

console.log('Running ASCII Sketch Generator Tests...\n');

// Test 1: Basic box generation
console.log('Test Suite: Basic box generation');
const basic = generateSketch({
  title: 'TEST',
  metrics: { 'Key': 'Value' }
});
const basicLines = basic.split('\n');
assertEquals(basicLines.length, 3, 'Should have 3 lines (top, content, bottom)');
assert(basicLines[0].startsWith('┌'), 'Top should start with ┌');
assert(basicLines[0].endsWith('┐'), 'Top should end with ┐');
assert(basicLines[1].startsWith('│'), 'Content should start with │');
assert(basicLines[1].endsWith('│'), 'Content should end with │');
assert(basicLines[2].startsWith('└'), 'Bottom should start with └');
assert(basicLines[2].endsWith('┘'), 'Bottom should end with ┘');
assertContains(basic, 'TEST', 'Should contain title');
assertContains(basic, 'Key', 'Should contain key');
assertContains(basic, 'Value', 'Should contain value');
console.log();

// Test 2: With icon
console.log('Test Suite: With icon');
const withIcon = generateSketch({
  title: 'METRICS',
  metrics: { 'Count': '100' },
  icon: '📊'
});
assertContains(withIcon, '📊', 'Should contain icon');
assertContains(withIcon, 'METRICS', 'Should contain title');
console.log();

// Test 3: Multiple metrics
console.log('Test Suite: Multiple metrics');
const multiMetrics = generateSketch({
  title: 'MULTI',
  metrics: {
    'A': '1',
    'B': '2',
    'C': '3'
  }
});
assertContains(multiMetrics, 'A: 1', 'Should contain A: 1');
assertContains(multiMetrics, 'B: 2', 'Should contain B: 2');
assertContains(multiMetrics, 'C: 3', 'Should contain C: 3');
assertContains(multiMetrics, '│', 'Should have separators');
console.log();

// Test 4: Line style
console.log('Test Suite: Line style');
const lineStyle = generateSketch({
  title: 'LINE TEST',
  metrics: { 'Key': 'Val' },
  style: 'line'
});
const lineLines = lineStyle.split('\n');
assertEquals(lineLines.length, 3, 'Line style should have 3 lines');
assert(!lineLines[0].includes('┌'), 'Line style should not have box borders');
assertContains(lineStyle, '─', 'Line style should have dashes');
console.log();

// Test 5: Line style with icon
console.log('Test Suite: Line style with icon');
const lineIcon = generateSketch({
  title: 'METRICS',
  metrics: { 'A': '1' },
  style: 'line',
  icon: '📊'
});
assertContains(lineIcon, '📊', 'Should contain icon in line style');
assertContains(lineIcon, 'METRICS', 'Should contain title in line style');
console.log();

// Test 6: Convenience function
console.log('Test Suite: Convenience function');
const convenience = createSketch('TITLE', { 'Key': 'Value' }, { icon: '✓' });
assertContains(convenience, 'TITLE', 'Should contain title');
assertContains(convenience, '✓', 'Should contain icon');
assertContains(convenience, 'Key', 'Should contain key');
console.log();

// Test 7: Your exact example
console.log('Test Suite: Exact example format');
const example = generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285',
    'Avg': '18.13',
    'Coverage': '80.38%'
  },
  icon: '📊'
});
assertContains(example, 'CODEBASE METRICS', 'Should contain title');
assertContains(example, '📊', 'Should contain icon');
assertContains(example, 'Files: 791', 'Should contain Files metric');
assertContains(example, 'Coverage: 80.38%', 'Should contain Coverage metric');
const exampleLines = example.split('\n');
assertEquals(exampleLines.length, 3, 'Should have exactly 3 lines');
console.log();

// Test 8: Parse sketch
console.log('Test Suite: Parse sketch');
const sketchToParse = `┌─ 📊 CODEBASE METRICS ──────────────────────────────────────────────────────────┐
│ Files: 791  │  LOC: 5168  │  Handlers: 285  │  Avg: 18.13  │  Coverage: 80.38% │
└────────────────────────────────────────────────────────────────────────────────┘`;
const parsed = parseSketch(sketchToParse);
assertContains(parsed.title, 'CODEBASE METRICS', 'Parsed title should contain title text');
assertEquals(parsed.metrics['Files'], '791', 'Should parse Files metric');
assertEquals(parsed.metrics['LOC'], '5168', 'Should parse LOC metric');
assertEquals(parsed.metrics['Coverage'], '80.38%', 'Should parse Coverage metric');
console.log();

// Test 9: Consistent width across lines
console.log('Test Suite: Consistent width');
const consistent = generateSketch({
  title: 'WIDTH TEST',
  metrics: { 'A': '1', 'B': '2' }
});
const consistentLines = consistent.split('\n');
const widths = consistentLines.map(line => line.length);
const allSame = widths.every(w => w === widths[0]);
assert(allSame, 'All lines should have same width');
console.log();

// Test 10: Data-driven - multiple domains
console.log('Test Suite: Data-driven (domain agnostic)');
const domains = [
  { title: 'API METRICS', metrics: { 'Requests': '1K', 'Latency': '50ms' } },
  { title: 'DB STATS', metrics: { 'Records': '1M', 'Queries': '500/s' } },
  { title: 'BUILD', metrics: { 'Status': 'PASS', 'Time': '2m' } }
];

domains.forEach((config, index) => {
  const result = generateSketch(config);
  assertContains(result, config.title, `Domain ${index + 1} should contain title`);
  Object.entries(config.metrics).forEach(([key, value]) => {
    assertContains(result, `${key}: ${value}`, `Domain ${index + 1} should contain ${key}: ${value}`);
  });
});
console.log();

// Test 11: Empty metrics
console.log('Test Suite: Empty metrics');
const emptyMetrics = generateSketch({
  title: 'EMPTY',
  metrics: {}
});
assertContains(emptyMetrics, 'EMPTY', 'Should still contain title');
assertContains(emptyMetrics, '│ │', 'Should have empty content');
console.log();

// Test 12: Single metric
console.log('Test Suite: Single metric');
const singleMetric = generateSketch({
  title: 'SINGLE',
  metrics: { 'Only': 'One' }
});
assertContains(singleMetric, 'Only: One', 'Should contain single metric');
console.log();

// Test 13: Title alignment in border
console.log('Test Suite: Title alignment');
const titleAlign = generateSketch({
  title: 'SHORT',
  metrics: { 'A': '1', 'B': '2', 'C': '3' }
});
assertContains(titleAlign, '┌─ SHORT', 'Title should be in top border');
console.log();

// Test 14: Metrics separator
console.log('Test Suite: Metrics separator');
const separator = generateSketch({
  title: 'TEST',
  metrics: { 'A': '1', 'B': '2' }
});
assertContains(separator, '│  ', 'Should have double-space separator between metrics');
console.log();

// Test 15: Various metric counts
console.log('Test Suite: Various metric counts');
for (let count = 1; count <= 5; count++) {
  const metrics = {};
  for (let i = 1; i <= count; i++) {
    metrics[`M${i}`] = `V${i}`;
  }
  const result = generateSketch({ title: 'TEST', metrics });
  const lines = result.split('\n');
  assert(lines.every(l => l.length === lines[0].length), `${count} metrics should have consistent width`);
}
console.log();

// Summary
console.log('═'.repeat(80));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(80));

process.exit(failed > 0 ? 1 : 0);
