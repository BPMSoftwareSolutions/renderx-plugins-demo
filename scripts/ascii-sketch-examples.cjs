#!/usr/bin/env node

/**
 * ASCII Sketch Generator - Usage Examples
 * Demonstrates the data-driven bordered ASCII box generator
 */

const { generateSketch, createSketch, parseSketch } = require('./generate-ascii-sketch.cjs');

console.log('═'.repeat(100));
console.log('ASCII SKETCH GENERATOR - EXAMPLES');
console.log('═'.repeat(100));
console.log();

// Example 1: Codebase Metrics (with icon)
console.log('Example 1: Codebase Metrics (Box Style with Icon)');
console.log(generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285',
    'Avg': '18.13',
    'Coverage': '80.38%'
  },
  style: 'box',
  icon: '📊'
}));
console.log();

// Example 2: Without icon
console.log('Example 2: Codebase Metrics (Without Icon)');
console.log(generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285',
    'Avg': '18.13',
    'Coverage': '80.38%'
  },
  style: 'box'
}));
console.log();

// Example 3: Line style with icon
console.log('Example 3: Line Style (with Icon)');
console.log(generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285'
  },
  style: 'line',
  icon: '📊'
}));
console.log();

// Example 4: API Performance Metrics
console.log('Example 4: API Performance Metrics');
console.log(generateSketch({
  title: 'API PERFORMANCE',
  metrics: {
    'Requests/sec': '1,245',
    'Avg Response': '45ms',
    'Error Rate': '0.02%',
    'Uptime': '99.99%'
  },
  icon: '⚡'
}));
console.log();

// Example 5: Database Statistics
console.log('Example 5: Database Statistics');
console.log(generateSketch({
  title: 'DATABASE HEALTH',
  metrics: {
    'Records': '2.5M',
    'Connections': '42',
    'Query Time': '12ms',
    'Cache Hit': '94.5%'
  },
  icon: '💾'
}));
console.log();

// Example 6: Build Summary
console.log('Example 6: Build Summary');
console.log(generateSketch({
  title: 'BUILD SUMMARY',
  metrics: {
    'Duration': '2m 34s',
    'Tests': '1,247/1,250',
    'Size': '342 KB',
    'Status': 'SUCCESS'
  },
  icon: '🔨'
}));
console.log();

// Example 7: E-Commerce Dashboard
console.log('Example 7: E-Commerce Dashboard');
console.log(generateSketch({
  title: 'SALES METRICS',
  metrics: {
    'Revenue': '$45,230',
    'Orders': '342',
    'Conversion': '3.2%',
    'Avg Order': '$132'
  },
  icon: '💰'
}));
console.log();

// Example 8: Security Audit
console.log('Example 8: Security Audit');
console.log(generateSketch({
  title: 'SECURITY SCAN',
  metrics: {
    'Vulnerabilities': '0',
    'Warnings': '3',
    'Files': '1,234',
    'Risk': 'LOW'
  },
  icon: '🔒'
}));
console.log();

// Example 9: System Resources
console.log('Example 9: System Resources');
console.log(generateSketch({
  title: 'SYSTEM RESOURCES',
  metrics: {
    'CPU': '45%',
    'Memory': '8.2 GB',
    'Disk': '120 GB',
    'Network': '125 Mbps'
  },
  icon: '🖥️'
}));
console.log();

// Example 10: Minimal Metrics
console.log('Example 10: Minimal Metrics');
console.log(generateSketch({
  title: 'STATUS',
  metrics: {
    'State': 'Active',
    'Version': '1.0.0'
  },
  icon: '✓'
}));
console.log();

// Example 11: Many Metrics
console.log('Example 11: Extended Metrics');
console.log(generateSketch({
  title: 'SYSTEM OVERVIEW',
  metrics: {
    'Nodes': '24',
    'CPU': '32%',
    'RAM': '45%',
    'Disk': '67%',
    'Network': '12 MB/s',
    'Processes': '1,234'
  },
  icon: '📈'
}));
console.log();

// Example 12: Using convenience function
console.log('Example 12: Convenience Function');
console.log(createSketch(
  'QUICK METRICS',
  {
    'A': '100',
    'B': '200',
    'C': '300'
  },
  { icon: '📊' }
));
console.log();

// Example 13: Programmatic generation for multiple services
console.log('Example 13: Programmatically Generated Metrics');
const services = [
  { name: 'Auth Service', requests: '1.2K', latency: '23ms', errors: '0.01%' },
  { name: 'Payment Service', requests: '845', latency: '67ms', errors: '0.05%' },
  { name: 'Notification Service', requests: '3.4K', latency: '12ms', errors: '0.00%' }
];

services.forEach(service => {
  console.log(generateSketch({
    title: service.name.toUpperCase(),
    metrics: {
      'Requests': service.requests,
      'Latency': service.latency,
      'Errors': service.errors
    },
    icon: '🔧'
  }));
  console.log();
});

// Example 14: Different domains
console.log('Example 14: Various Domains');

// Machine Learning
console.log(generateSketch({
  title: 'MODEL TRAINING',
  metrics: {
    'Accuracy': '94.2%',
    'Loss': '0.058',
    'Epochs': '50',
    'Time': '2h 15m'
  },
  icon: '🤖'
}));
console.log();

// DevOps
console.log(generateSketch({
  title: 'CI/CD PIPELINE',
  metrics: {
    'Build': 'PASSING',
    'Tests': '100%',
    'Deploy': 'SUCCESS',
    'Time': '8m 42s'
  },
  icon: '🚀'
}));
console.log();

// Gaming
console.log(generateSketch({
  title: 'GAME SERVER',
  metrics: {
    'Players': '1,234',
    'FPS': '144',
    'Ping': '15ms',
    'Uptime': '99.9%'
  },
  icon: '🎮'
}));
console.log();

// Example 15: Parse existing sketch
console.log('Example 15: Parse Existing Sketch');
const existingSketch = `┌─ 📊 CODEBASE METRICS ──────────────────────────────────────────────────────────┐
│ Files: 791  │  LOC: 5168  │  Handlers: 285  │  Avg: 18.13  │  Coverage: 80.38% │
└────────────────────────────────────────────────────────────────────────────────┘`;

const parsed = parseSketch(existingSketch);
console.log('Parsed title:', parsed.title);
console.log('Parsed metrics:', JSON.stringify(parsed.metrics, null, 2));
console.log();

// Example 16: Line style variations
console.log('Example 16: Line Style Variations');
console.log(generateSketch({
  title: 'DEPLOYMENT STATUS',
  metrics: {
    'Environment': 'Production',
    'Version': 'v2.5.0',
    'Status': 'Live'
  },
  style: 'line',
  icon: '🌐'
}));
console.log();

console.log('═'.repeat(100));
console.log('All examples complete! Generator matches Python implementation exactly.');
console.log('═'.repeat(100));
