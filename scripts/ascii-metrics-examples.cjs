#!/usr/bin/env node

/**
 * ASCII Metrics Box Generator - Usage Examples
 * Demonstrates various ways to use the data-driven metrics box generator
 */

const { generateMetricsBox, createMetricsBox } = require('./generate-ascii-metrics.cjs');

console.log('═'.repeat(120));
console.log('ASCII METRICS BOX GENERATOR - EXAMPLES');
console.log('═'.repeat(120));
console.log();

// Example 1: Your original codebase metrics
console.log('Example 1: Codebase Metrics (Your Example)');
console.log(generateMetricsBox({
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
}));
console.log();

// Example 2: API Performance Metrics
console.log('Example 2: API Performance Metrics');
console.log(generateMetricsBox({
  title: 'API PERFORMANCE DASHBOARD',
  icon: '⚡',
  metrics: {
    'Requests/sec': '1,245',
    'Avg Response': '45ms',
    'Error Rate': '0.02%',
    'Uptime': '99.99%'
  },
  width: 100
}));
console.log();

// Example 3: Database Statistics
console.log('Example 3: Database Statistics');
console.log(generateMetricsBox({
  title: 'DATABASE HEALTH MONITOR',
  icon: '💾',
  metrics: {
    'Total Records': '2.5M',
    'Active Connections': '42',
    'Query Time': '12ms',
    'Cache Hit Rate': '94.5%'
  },
  width: 110
}));
console.log();

// Example 4: Build Metrics
console.log('Example 4: Build Metrics');
console.log(generateMetricsBox({
  title: 'BUILD SUMMARY',
  icon: '🔨',
  metrics: {
    'Duration': '2m 34s',
    'Tests Passed': '1,247/1,250',
    'Bundle Size': '342 KB',
    'Status': 'SUCCESS'
  },
  width: 100
}));
console.log();

// Example 5: E-Commerce Dashboard
console.log('Example 5: E-Commerce Dashboard');
console.log(generateMetricsBox({
  title: 'SALES METRICS - DAILY SUMMARY',
  icon: '💰',
  metrics: {
    'Revenue': '$45,230',
    'Orders': '342',
    'Conversion': '3.2%',
    'Avg Order': '$132.25'
  },
  width: 105
}));
console.log();

// Example 6: Security Scan Results
console.log('Example 6: Security Scan Results');
console.log(generateMetricsBox({
  title: 'SECURITY AUDIT REPORT',
  icon: '🔒',
  metrics: {
    'Vulnerabilities': '0',
    'Warnings': '3',
    'Files Scanned': '1,234',
    'Risk Level': 'LOW'
  },
  width: 95
}));
console.log();

// Example 7: No icon
console.log('Example 7: Without Icon');
console.log(generateMetricsBox({
  title: 'DEPLOYMENT STATISTICS',
  metrics: {
    'Environment': 'Production',
    'Version': 'v2.5.0',
    'Instances': '12',
    'Health': 'Healthy'
  },
  width: 95
}));
console.log();

// Example 8: No divider
console.log('Example 8: Without Divider Line');
console.log(generateMetricsBox({
  title: 'SYSTEM RESOURCES',
  icon: '🖥️',
  metrics: {
    'CPU': '45%',
    'Memory': '8.2 GB',
    'Disk': '120 GB',
    'Network': '125 Mbps'
  },
  showDivider: false,
  width: 90
}));
console.log();

// Example 9: Custom border style (heavy)
console.log('Example 9: Heavy Border Style');
console.log(generateMetricsBox({
  title: 'CRITICAL ALERTS',
  icon: '⚠️',
  metrics: {
    'High Priority': '2',
    'Medium Priority': '5',
    'Low Priority': '12',
    'Total': '19'
  },
  topBorder: '━',
  bottomBorder: '━',
  leftBorder: '┃',
  rightBorder: '┃',
  topLeftCorner: '┏',
  topRightCorner: '┓',
  bottomLeftCorner: '┗',
  bottomRightCorner: '┛',
  width: 90
}));
console.log();

// Example 10: Classic ASCII style
console.log('Example 10: Classic ASCII Style');
console.log(generateMetricsBox({
  title: 'TEST EXECUTION REPORT',
  metrics: {
    'Total Tests': '245',
    'Passed': '242',
    'Failed': '3',
    'Duration': '45s'
  },
  topBorder: '-',
  bottomBorder: '-',
  leftBorder: '|',
  rightBorder: '|',
  topLeftCorner: '+',
  topRightCorner: '+',
  bottomLeftCorner: '+',
  bottomRightCorner: '+',
  separator: '|',
  width: 85
}));
console.log();

// Example 11: Minimal metrics
console.log('Example 11: Minimal Metrics');
console.log(generateMetricsBox({
  title: 'STATUS',
  icon: '✓',
  metrics: {
    'State': 'Active',
    'Version': '1.0.0'
  },
  width: 60
}));
console.log();

// Example 12: Many metrics
console.log('Example 12: Extended Metrics');
console.log(generateMetricsBox({
  title: 'COMPREHENSIVE SYSTEM OVERVIEW',
  icon: '📈',
  metrics: {
    'Nodes': '24',
    'CPU': '32%',
    'RAM': '45%',
    'Disk': '67%',
    'Network': '12 MB/s',
    'Processes': '1,234'
  },
  width: 130
}));
console.log();

// Example 13: Using convenience function
console.log('Example 13: Convenience Function');
console.log(createMetricsBox(
  'QUICK METRICS',
  {
    'Metric A': '100',
    'Metric B': '200',
    'Metric C': '300'
  },
  { icon: '📊', width: 80 }
));
console.log();

// Example 14: Programmatic generation
console.log('Example 14: Programmatically Generated Metrics');
const services = [
  { name: 'Auth Service', requests: '1.2K', latency: '23ms', errors: '0.01%' },
  { name: 'Payment Service', requests: '845', latency: '67ms', errors: '0.05%' },
  { name: 'Notification Service', requests: '3.4K', latency: '12ms', errors: '0.00%' }
];

services.forEach(service => {
  console.log(generateMetricsBox({
    title: service.name.toUpperCase(),
    icon: '🔧',
    metrics: {
      'Requests': service.requests,
      'Latency': service.latency,
      'Error Rate': service.errors
    },
    width: 80
  }));
  console.log();
});

// Example 15: Different domains
console.log('Example 15: Various Domains');

// Machine Learning
console.log(generateMetricsBox({
  title: 'MODEL TRAINING METRICS',
  icon: '🤖',
  metrics: {
    'Accuracy': '94.2%',
    'Loss': '0.058',
    'Epochs': '50',
    'Time': '2h 15m'
  },
  width: 95
}));
console.log();

// DevOps
console.log(generateMetricsBox({
  title: 'CI/CD PIPELINE STATUS',
  icon: '🚀',
  metrics: {
    'Build': 'PASSING',
    'Tests': '100%',
    'Deploy': 'SUCCESS',
    'Time': '8m 42s'
  },
  width: 95
}));
console.log();

// Gaming
console.log(generateMetricsBox({
  title: 'GAME SERVER STATISTICS',
  icon: '🎮',
  metrics: {
    'Players Online': '1,234',
    'Avg FPS': '144',
    'Ping': '15ms',
    'Uptime': '99.9%'
  },
  width: 95
}));
console.log();

console.log('═'.repeat(120));
console.log('All examples complete! The generator is fully data-driven and domain-agnostic.');
console.log('═'.repeat(120));
