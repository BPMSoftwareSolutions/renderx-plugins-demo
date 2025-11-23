#!/usr/bin/env node

/**
 * 🎵 Sequence Log Batch Analysis Helper
 * 
 * Provides utilities for managing sequence log analysis workflows:
 * - Organize logs by date/component
 * - Generate reports with customizable grouping
 * - Create analysis dashboards
 * - Track analysis trends over time
 * 
 * Usage:
 *   node scripts/sequence-log-utils.js <command> [options]
 * 
 * Commands:
 *   organize   - Organize logs into categorized directories
 *   dashboard  - Generate analysis dashboard summary
 *   compare    - Compare sequence metrics across logs
 *   timeline   - Create performance timeline from logs
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Command: organize
// ============================================================================

function organizeCommand(options) {
  console.log('📁 Organizing logs...');
  
  const inputDir = options.input || './logs';
  const outputDir = options.output || './.generated/logs-organized';
  
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    return;
  }
  
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.log'));
  
  // Create organized structure by component
  const componentMap = new Map();
  
  for (const file of files) {
    // Extract component name from filename (e.g., "control-panel-2025-11-23.log" → "control-panel")
    const match = file.match(/^([^-]+(?:-[^-]+)*)-(\d{4}-\d{2}-\d{2})/);
    const component = match ? match[1] : 'other';
    const date = match ? match[2] : 'unknown-date';
    
    if (!componentMap.has(component)) {
      componentMap.set(component, []);
    }
    componentMap.get(component).push({ file, date });
  }
  
  // Create directory structure
  for (const [component, logs] of componentMap) {
    const componentDir = path.join(outputDir, component);
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true });
    }
    
    // Copy files
    for (const log of logs) {
      const src = path.join(inputDir, log.file);
      const dst = path.join(componentDir, log.file);
      fs.copyFileSync(src, dst);
      console.log(`  ✅ ${component}/${log.file}`);
    }
  }
  
  console.log(`\n✅ Logs organized in: ${outputDir}`);
}

// ============================================================================
// Command: dashboard
// ============================================================================

function dashboardCommand(options) {
  console.log('📊 Generating analysis dashboard...');
  
  const inputDir = options.input || './.generated/sequence-interpretations';
  
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    return;
  }
  
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.md'));
  
  const dashboard = [];
  dashboard.push('# 📊 Sequence Analysis Dashboard');
  dashboard.push('');
  dashboard.push(`**Generated:** ${new Date().toISOString()}`);
  dashboard.push(`**Reports:** ${files.length}`);
  dashboard.push('');
  
  dashboard.push('## 📑 Analysis Reports');
  dashboard.push('');
  
  let totalAnomalies = 0;
  let criticalCount = 0;
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(inputDir, file), 'utf-8');
    const anomalies = (content.match(/❌|⚠️/g) || []).length;
    const isCritical = content.includes('❌ Critical');
    
    totalAnomalies += anomalies;
    if (isCritical) criticalCount++;
    
    const status = anomalies === 0 ? '✅' : anomalies > 2 ? '❌' : '⚠️';
    dashboard.push(`- ${status} [${file}](./${file}) - ${anomalies} issue(s)`);
  }
  
  dashboard.push('');
  dashboard.push('## 📈 Summary Statistics');
  dashboard.push('');
  dashboard.push('| Metric | Value |');
  dashboard.push('|--------|-------|');
  dashboard.push(`| Total Reports | ${files.length} |`);
  dashboard.push(`| Total Issues | ${totalAnomalies} |`);
  dashboard.push(`| Critical | ${criticalCount} |`);
  dashboard.push(`| Healthy | ${files.length - criticalCount} |`);
  dashboard.push('');
  
  dashboard.push('## ✅ Healthy Logs');
  dashboard.push('');
  for (const file of files) {
    const content = fs.readFileSync(path.join(inputDir, file), 'utf-8');
    if (!content.includes('❌') && !content.includes('⚠️')) {
      dashboard.push(`- ${file}`);
    }
  }
  dashboard.push('');
  
  const dashboardPath = path.join(inputDir, 'DASHBOARD.md');
  fs.writeFileSync(dashboardPath, dashboard.join('\n'), 'utf-8');
  console.log(`✅ Dashboard created: ${dashboardPath}`);
}

// ============================================================================
// Command: compare
// ============================================================================

function compareCommand(options) {
  console.log('📊 Comparing sequence metrics...');
  
  const log1 = options.log1 || process.argv[3];
  const log2 = options.log2 || process.argv[4];
  
  if (!log1 || !log2) {
    console.error('❌ Usage: node script.js compare <log1> <log2>');
    return;
  }
  
  if (!fs.existsSync(log1) || !fs.existsSync(log2)) {
    console.error('❌ One or both log files not found');
    return;
  }
  
  const comparison = [];
  comparison.push('# 📊 Sequence Metrics Comparison');
  comparison.push('');
  comparison.push(`**Log 1:** ${path.basename(log1)}`);
  comparison.push(`**Log 2:** ${path.basename(log2)}`);
  comparison.push('');
  
  comparison.push('| Metric | Log 1 | Log 2 | Δ |');
  comparison.push('|--------|-------|-------|---|');
  
  // Count lines
  const lines1 = fs.readFileSync(log1, 'utf-8').split('\n').length;
  const lines2 = fs.readFileSync(log2, 'utf-8').split('\n').length;
  const lineDiff = ((lines2 - lines1) / lines1 * 100).toFixed(1);
  comparison.push(`| Lines | ${lines1} | ${lines2} | ${lineDiff}% |`);
  
  // Count events
  const events1 = (fs.readFileSync(log1, 'utf-8').match(/control:/g) || []).length;
  const events2 = (fs.readFileSync(log2, 'utf-8').match(/control:/g) || []).length;
  const eventDiff = ((events2 - events1) / events1 * 100).toFixed(1);
  comparison.push(`| Events | ${events1} | ${events2} | ${eventDiff}% |`);
  
  // Count anomalies
  const anom1 = (fs.readFileSync(log1, 'utf-8').match(/❌|⚠️/g) || []).length;
  const anom2 = (fs.readFileSync(log2, 'utf-8').match(/❌|⚠️/g) || []).length;
  const anomDiff = ((anom2 - anom1) / (anom1 || 1) * 100).toFixed(1);
  comparison.push(`| Issues | ${anom1} | ${anom2} | ${anomDiff}% |`);
  
  comparison.push('');
  
  const outputPath = path.join(
    path.dirname(log1),
    `COMPARISON_${Date.now()}.md`
  );
  fs.writeFileSync(outputPath, comparison.join('\n'), 'utf-8');
  console.log(`✅ Comparison saved: ${outputPath}`);
}

// ============================================================================
// Command: timeline
// ============================================================================

function timelineCommand(options) {
  console.log('⏱️ Creating performance timeline...');
  
  const inputDir = options.input || './logs';
  
  if (!fs.existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    return;
  }
  
  const files = fs.readdirSync(inputDir)
    .filter(f => f.endsWith('.log'))
    .sort();
  
  const timeline = [];
  timeline.push('# ⏱️ Performance Timeline');
  timeline.push('');
  timeline.push('| Date | File | Performance | Status |');
  timeline.push('|------|------|-------------|--------|');
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(inputDir, file), 'utf-8');
    const hasIssues = content.includes('❌') || content.includes('⚠️');
    const status = hasIssues ? '⚠️ Issues' : '✅ Healthy';
    
    // Extract date from filename
    const match = file.match(/(\d{4}-\d{2}-\d{2})/);
    const date = match ? match[1] : 'unknown';
    
    // Estimate performance from file size (rough heuristic)
    const size = fs.statSync(path.join(inputDir, file)).size;
    const perf = size > 100000 ? '🔴 Slow' : size > 50000 ? '🟡 Medium' : '🟢 Fast';
    
    timeline.push(`| ${date} | ${file} | ${perf} | ${status} |`);
  }
  
  timeline.push('');
  
  const outputPath = path.join(inputDir, 'TIMELINE.md');
  fs.writeFileSync(outputPath, timeline.join('\n'), 'utf-8');
  console.log(`✅ Timeline created: ${outputPath}`);
}

// ============================================================================
// Main CLI
// ============================================================================

function printHelp() {
  console.log('🎵 Sequence Log Analysis Utilities');
  console.log('');
  console.log('Usage: node scripts/sequence-log-utils.js <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('');
  console.log('  organize');
  console.log('    Organize logs into categorized directories');
  console.log('    Options: --input=<dir> --output=<dir>');
  console.log('');
  console.log('  dashboard');
  console.log('    Generate analysis dashboard from reports');
  console.log('    Options: --input=<dir>');
  console.log('');
  console.log('  compare');
  console.log('    Compare metrics between two logs');
  console.log('    Usage: compare <log1> <log2>');
  console.log('');
  console.log('  timeline');
  console.log('    Create performance timeline from logs');
  console.log('    Options: --input=<dir>');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/sequence-log-utils.js organize');
  console.log('  node scripts/sequence-log-utils.js dashboard --input=.generated/sequence-interpretations');
  console.log('  node scripts/sequence-log-utils.js compare logs/log1.log logs/log2.log');
  console.log('  node scripts/sequence-log-utils.js timeline --input=logs');
}

function parseArgs() {
  const command = process.argv[2];
  const options = {};
  
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value;
    }
  }
  
  return { command, options };
}

function main() {
  const { command, options } = parseArgs();
  
  switch (command) {
    case 'organize':
      organizeCommand(options);
      break;
    case 'dashboard':
      dashboardCommand(options);
      break;
    case 'compare':
      compareCommand(options);
      break;
    case 'timeline':
      timelineCommand(options);
      break;
    default:
      printHelp();
  }
}

main();
