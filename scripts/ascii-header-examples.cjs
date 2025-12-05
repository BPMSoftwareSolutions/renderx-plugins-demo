#!/usr/bin/env node

/**
 * ASCII Header Generator - Usage Examples
 * Demonstrates various ways to use the data-driven ASCII header generator
 */

const { generateHeader, createHeader } = require('./generate-ascii-header.cjs');

console.log('═'.repeat(120));
console.log('ASCII HEADER GENERATOR - EXAMPLES');
console.log('═'.repeat(120));
console.log();

// Example 1: Simple usage with default settings
console.log('Example 1: Simple Header (Default Settings)');
console.log(createHeader('Simple Title', 'Subtitle Here'));
console.log();

// Example 2: Your original example
console.log('Example 2: Symphonic Code Analysis (Your Example)');
console.log(generateHeader({
  lines: [
    'SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION',
    'Enhanced Handler Portfolio & Orchestration Framework'
  ],
  width: 120
}));
console.log();

// Example 3: Different domain - E-commerce
console.log('Example 3: E-Commerce Domain');
console.log(generateHeader({
  lines: [
    'E-COMMERCE PLATFORM ARCHITECTURE',
    'Payment Processing & Order Management System'
  ],
  width: 100
}));
console.log();

// Example 4: Different domain - DevOps
console.log('Example 4: DevOps Domain');
console.log(generateHeader({
  lines: [
    'CI/CD PIPELINE ORCHESTRATION',
    'Automated Testing & Deployment Framework',
    'Multi-Environment Configuration Manager'
  ],
  width: 110
}));
console.log();

// Example 5: Custom box characters (classic ASCII)
console.log('Example 5: Classic ASCII Style');
console.log(generateHeader({
  lines: [
    'CLASSIC ASCII HEADER',
    'Using Simple Characters'
  ],
  topBorder: '-',
  bottomBorder: '-',
  leftBorder: '|',
  rightBorder: '|',
  topLeftCorner: '+',
  topRightCorner: '+',
  bottomLeftCorner: '+',
  bottomRightCorner: '+',
  width: 80
}));
console.log();

// Example 6: Different box style (double line)
console.log('Example 6: Alternative Box Style');
console.log(generateHeader({
  lines: [
    'ALTERNATIVE STYLE HEADER',
    'Different Box Characters'
  ],
  topBorder: '─',
  bottomBorder: '─',
  leftBorder: '│',
  rightBorder: '│',
  topLeftCorner: '┌',
  topRightCorner: '┐',
  bottomLeftCorner: '└',
  bottomRightCorner: '┘',
  width: 90
}));
console.log();

// Example 7: Heavy box style
console.log('Example 7: Heavy Box Style');
console.log(generateHeader({
  lines: [
    'HEAVY BOX HEADER',
    'Bold and Prominent'
  ],
  topBorder: '━',
  bottomBorder: '━',
  leftBorder: '┃',
  rightBorder: '┃',
  topLeftCorner: '┏',
  topRightCorner: '┓',
  bottomLeftCorner: '┗',
  bottomRightCorner: '┛',
  width: 85
}));
console.log();

// Example 8: Left-aligned text
console.log('Example 8: Left-Aligned Text');
console.log(generateHeader({
  lines: [
    'Left-Aligned Header',
    'No centering applied',
    'All text starts from the left'
  ],
  center: false,
  width: 70
}));
console.log();

// Example 9: Narrow header
console.log('Example 9: Narrow Header');
console.log(generateHeader({
  lines: [
    'Small',
    'Box'
  ],
  width: 30
}));
console.log();

// Example 10: Wide header with single line
console.log('Example 10: Wide Single-Line Header');
console.log(generateHeader({
  lines: [
    'VERY WIDE HEADER FOR IMPORTANT ANNOUNCEMENTS'
  ],
  width: 140
}));
console.log();

// Example 11: Practical use case - Database Migration
console.log('Example 11: Database Migration Report');
console.log(generateHeader({
  lines: [
    'DATABASE MIGRATION REPORT',
    'Schema Version 2.5.0 → 2.6.0',
    'Production Environment - 2025-12-04'
  ],
  width: 100
}));
console.log();

// Example 12: Practical use case - API Documentation
console.log('Example 12: API Documentation Header');
console.log(generateHeader({
  lines: [
    'REST API SPECIFICATION',
    'User Management Service v3.0',
    'Authentication & Authorization Endpoints'
  ],
  width: 110
}));
console.log();

// Example 13: Empty header (just borders)
console.log('Example 13: Empty Header (Separator)');
console.log(generateHeader({
  lines: [],
  width: 80
}));
console.log();

// Example 14: Programmatic generation
console.log('Example 14: Programmatically Generated Headers');
const services = [
  { name: 'User Service', version: '1.2.3' },
  { name: 'Payment Gateway', version: '2.0.1' },
  { name: 'Notification Hub', version: '3.1.0' }
];

services.forEach(service => {
  console.log(generateHeader({
    lines: [
      service.name.toUpperCase(),
      `Version ${service.version}`
    ],
    width: 60
  }));
  console.log();
});

console.log('═'.repeat(120));
console.log('All examples complete! The generator is fully data-driven and domain-agnostic.');
console.log('═'.repeat(120));
