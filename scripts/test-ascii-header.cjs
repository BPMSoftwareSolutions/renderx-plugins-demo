#!/usr/bin/env node

/**
 * Manual test suite for ASCII Header Generator
 */

const { generateHeader, createHeader } = require('./generate-ascii-header.cjs');

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

console.log('Running ASCII Header Generator Tests...\n');

// Test 1: Simple header creation
console.log('Test Suite: createHeader()');
const simple = createHeader('Hello World');
const simpleLines = simple.split('\n');
assertEquals(simpleLines.length, 3, 'Should create 3 lines (top, content, bottom)');
assertContains(simple, 'Hello World', 'Should contain the text');
assert(simpleLines[0].startsWith('╔'), 'Top border should start with ╔');
assert(simpleLines[0].endsWith('╗'), 'Top border should end with ╗');
assert(simpleLines[2].startsWith('╚'), 'Bottom border should start with ╚');
assert(simpleLines[2].endsWith('╝'), 'Bottom border should end with ╝');
console.log();

// Test 2: Multiple lines
console.log('Test Suite: Multiple lines');
const multiLine = createHeader('Line 1', 'Line 2', 'Line 3');
const multiLines = multiLine.split('\n');
assertEquals(multiLines.length, 5, 'Should create 5 lines (top + 3 content + bottom)');
assertContains(multiLine, 'Line 1', 'Should contain Line 1');
assertContains(multiLine, 'Line 2', 'Should contain Line 2');
assertContains(multiLine, 'Line 3', 'Should contain Line 3');
console.log();

// Test 3: Custom width
console.log('Test Suite: Custom width');
const customWidth = generateHeader({ lines: ['Test'], width: 80 });
const widthLines = customWidth.split('\n');
assertEquals(widthLines[0].length, 80, 'Top border should be exactly 80 chars');
assertEquals(widthLines[1].length, 80, 'Content line should be exactly 80 chars');
assertEquals(widthLines[2].length, 80, 'Bottom border should be exactly 80 chars');
console.log();

// Test 4: Custom border characters
console.log('Test Suite: Custom border characters');
const customBorders = generateHeader({
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
const borderLines = customBorders.split('\n');
assert(borderLines[0].startsWith('+'), 'Should use custom top-left corner');
assert(borderLines[0].includes('-'), 'Should use custom top border');
assert(borderLines[1].startsWith('|'), 'Should use custom left border');
assert(borderLines[2].startsWith('+'), 'Should use custom bottom-left corner');
console.log();

// Test 5: Left-aligned text
console.log('Test Suite: Left-aligned text');
const leftAligned = generateHeader({
  lines: ['Test'],
  center: false,
  width: 20
});
assertContains(leftAligned, '║Test ', 'Should be left-aligned (no leading spaces)');
console.log();

// Test 6: Empty lines
console.log('Test Suite: Empty lines array');
const empty = generateHeader({ lines: [] });
const emptyLines = empty.split('\n');
assertEquals(emptyLines.length, 2, 'Should only have top and bottom borders');
console.log();

// Test 7: The exact example format
console.log('Test Suite: Example format validation');
const example = generateHeader({
  lines: [
    'SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION',
    'Enhanced Handler Portfolio & Orchestration Framework'
  ],
  width: 120
});
const exampleLines = example.split('\n');
assertEquals(exampleLines.length, 4, 'Should have 4 lines total');
assertContains(example, 'SYMPHONIC CODE ANALYSIS', 'Should contain title text');
assertContains(example, 'Enhanced Handler Portfolio', 'Should contain subtitle text');
assert(exampleLines[0].startsWith('╔'), 'Should start with proper corner');
assert(exampleLines[0].endsWith('╗'), 'Should end with proper corner');
console.log();

// Test 8: Data-driven - multiple domains
console.log('Test Suite: Data-driven (domain agnostic)');
const domains = [
  ['E-Commerce Platform', 'User Authentication System'],
  ['Database Migration Tool', 'Schema Version Manager'],
  ['Machine Learning Pipeline', 'Model Training & Deployment']
];

domains.forEach((lines, index) => {
  const result = generateHeader({ lines });
  lines.forEach(line => {
    assertContains(result, line, `Domain ${index + 1} should contain "${line}"`);
  });
});
console.log();

// Test 9: Centering validation
console.log('Test Suite: Text centering');
const centered = createHeader('Test');
const centeredLines = centered.split('\n');
const contentLine = centeredLines[1];
const content = contentLine.slice(1, -1); // Remove borders
const leftSpaces = (content.match(/^ */) || [''])[0].length;
const rightSpaces = (content.match(/ *$/) || [''])[0].length;
assert(
  Math.abs(leftSpaces - rightSpaces) <= 1,
  'Text should be centered (left and right padding within 1 char)'
);
console.log();

// Test 10: Consistent width across all lines
console.log('Test Suite: Consistent width');
const mixed = generateHeader({
  lines: ['Short', 'Much Longer Line Here', 'X'],
  width: 100
});
const mixedLines = mixed.split('\n');
const widths = mixedLines.map(line => line.length);
const allSameWidth = widths.every(w => w === widths[0]);
assert(allSameWidth, 'All lines should have consistent width');
assertEquals(widths[0], 100, 'Width should match specified width');
console.log();

// Summary
console.log('═'.repeat(80));
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(80));

process.exit(failed > 0 ? 1 : 0);
