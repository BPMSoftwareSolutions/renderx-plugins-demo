#!/usr/bin/env node

/**
 * 🎵 Sequence Log Interpretation Generator
 * 
 * Generates comprehensive sequence log interpretation files from raw logs.
 * Supports single logs, multiple logs, and combined analysis.
 * 
 * Usage:
 *   node scripts/generate-sequence-interpretation.js <logFile|directory> [--combine] [--output=path] [--verbose]
 * 
 * Examples:
 *   # Single log file
 *   node scripts/generate-sequence-interpretation.js demo-logs/sequence.log
 *   
 *   # Multiple log files in directory
 *   node scripts/generate-sequence-interpretation.js demo-logs/
 *   
 *   # Combine multiple logs into single analysis
 *   node scripts/generate-sequence-interpretation.js demo-logs/ --combine
 *   
 *   # Custom output directory
 *   node scripts/generate-sequence-interpretation.js demo-logs/ --output=./analysis
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// ============================================================================
// Configuration & Constants
// ============================================================================

const CONFIG = {
  logPatterns: {
    timestamp: /^\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]/,
    logLevel: /LOG/,
    emoji: /([🎵🥁⏱️🎼📊🎯🕐✅🔄])/,
    componentMarker: /\[([A-Z_\s]+)\]/,
    perfCounter: /perf:\s*([\d.]+)ms/,
    subscriberCount: /Found\s+(\d+)\s+subscriber/,
    executionTime: /took\s+([\d.]+)ms/,
    eventName: /for\s+"([^"]+)"/,
    syncAsync: /\((sync|async)\)/,
    beatNumber: /beat\s+(\d+)\s*\((\d+)\/(\d+)\)/i,
  },
  performanceThresholds: {
    excellent: 10,
    good: 50,
    warning: 100,
    critical: 250,
  },
  defaultOutputDir: '.generated/sequence-interpretations',
};

// ============================================================================
// Log Parser
// ============================================================================

class SequenceLogParser {
  constructor(logContent) {
    this.content = logContent;
    this.lines = logContent.split('\n').filter(l => l.trim());
    this.entries = [];
    this.sequences = new Map();
    this.anomalies = [];
    this.parse();
  }

  parse() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const entry = this.parseLine(line, i);
      if (entry) {
        this.entries.push(entry);
        this.trackSequence(entry);
        this.checkAnomalies(entry);
      }
    }
  }

  parseLine(line, index) {
    const timestampMatch = line.match(CONFIG.logPatterns.timestamp);
    if (!timestampMatch) return null;

    const timestamp = timestampMatch[1];
    const entry = {
      lineNumber: index + 1,
      timestamp,
      originalLine: line,
      components: {},
      metrics: {},
    };

    // Extract component marker
    const componentMatch = line.match(CONFIG.logPatterns.componentMarker);
    if (componentMatch) {
      entry.components.name = componentMatch[1];
    }

    // Extract emoji
    const emojiMatch = line.match(CONFIG.logPatterns.emoji);
    if (emojiMatch) {
      entry.emoji = emojiMatch[1];
      entry.components.type = this.emojiToComponentType(emojiMatch[1]);
    }

    // Extract performance counter
    const perfMatch = line.match(CONFIG.logPatterns.perfCounter);
    if (perfMatch) {
      entry.metrics.cumulative = parseFloat(perfMatch[1]);
    }

    // Extract subscriber count
    const subMatch = line.match(CONFIG.logPatterns.subscriberCount);
    if (subMatch) {
      entry.metrics.subscriberCount = parseInt(subMatch[1]);
    }

    // Extract execution time
    const execMatch = line.match(CONFIG.logPatterns.executionTime);
    if (execMatch) {
      entry.metrics.duration = parseFloat(execMatch[1]);
    }

    // Extract event name
    const eventMatch = line.match(CONFIG.logPatterns.eventName);
    if (eventMatch) {
      entry.event = eventMatch[1];
    }

    // Extract sync/async
    const syncMatch = line.match(CONFIG.logPatterns.syncAsync);
    if (syncMatch) {
      entry.executionModel = syncMatch[1];
    }

    // Extract beat number
    const beatMatch = line.match(CONFIG.logPatterns.beatNumber);
    if (beatMatch) {
      entry.beat = {
        current: parseInt(beatMatch[1]),
        total: parseInt(beatMatch[3]),
      };
    }

    return entry;
  }

  emojiToComponentType(emoji) {
    const mapping = {
      '🎵': 'Beat',
      '🥁': 'MovementExecutor',
      '⏱️': 'PerformanceTracker',
      '🎼': 'Sequence',
      '📊': 'BeatInfo',
      '🎯': 'Event',
      '🕐': 'EventBus',
      '✅': 'Completion',
      '🔄': 'Progress',
    };
    return mapping[emoji] || 'Unknown';
  }

  trackSequence(entry) {
    if (!entry.event) return;

    if (!this.sequences.has(entry.event)) {
      this.sequences.set(entry.event, {
        event: entry.event,
        startTime: entry.timestamp,
        entries: [],
        metrics: { minDuration: Infinity, maxDuration: 0, totalTime: 0 },
      });
    }

    const seq = this.sequences.get(entry.event);
    seq.entries.push(entry);

    if (entry.metrics.duration) {
      seq.metrics.minDuration = Math.min(seq.metrics.minDuration, entry.metrics.duration);
      seq.metrics.maxDuration = Math.max(seq.metrics.maxDuration, entry.metrics.duration);
      seq.metrics.totalTime += entry.metrics.duration;
    }
  }

  checkAnomalies(entry) {
    // Zero subscribers
    if (entry.metrics.subscriberCount === 0) {
      this.anomalies.push({
        type: 'zero-subscribers',
        severity: 'high',
        line: entry.lineNumber,
        event: entry.event,
        message: `No subscribers found for event "${entry.event}"`,
      });
    }

    // Slow execution
    if (entry.metrics.duration && entry.metrics.duration > CONFIG.performanceThresholds.critical) {
      this.anomalies.push({
        type: 'slow-execution',
        severity: 'high',
        line: entry.lineNumber,
        duration: entry.metrics.duration,
        message: `Slow execution: ${entry.metrics.duration}ms (threshold: ${CONFIG.performanceThresholds.critical}ms)`,
      });
    }

    // Multiple subscribers
    if (entry.metrics.subscriberCount && entry.metrics.subscriberCount > 1) {
      this.anomalies.push({
        type: 'multiple-subscribers',
        severity: 'medium',
        line: entry.lineNumber,
        event: entry.event,
        count: entry.metrics.subscriberCount,
        message: `Multiple subscribers (${entry.metrics.subscriberCount}) for event "${entry.event}" - potential race condition`,
      });
    }
  }

  getSummary() {
    const sequenceArray = Array.from(this.sequences.values());
    const totalEvents = sequenceArray.length;
    const avgDuration = sequenceArray.reduce((sum, s) => sum + s.metrics.totalTime, 0) / totalEvents;
    const slowEvents = sequenceArray.filter(s => s.metrics.maxDuration > CONFIG.performanceThresholds.warning);

    return {
      totalLines: this.lines.length,
      totalEntries: this.entries.length,
      totalSequences: totalEvents,
      averageDuration: avgDuration,
      slowSequences: slowEvents.length,
      anomalies: this.anomalies,
      timeSpan: this.getTimeSpan(),
      sequences: sequenceArray,
    };
  }

  getTimeSpan() {
    if (this.entries.length === 0) return null;
    const first = new Date(this.entries[0].timestamp);
    const last = new Date(this.entries[this.entries.length - 1].timestamp);
    return {
      start: first.toISOString(),
      end: last.toISOString(),
      duration: (last - first) / 1000, // seconds
    };
  }
}

// ============================================================================
// Report Generator
// ============================================================================

class InterpretationReportGenerator {
  constructor(parsers, combinedMode = false) {
    this.parsers = Array.isArray(parsers) ? parsers : [parsers];
    this.combinedMode = combinedMode;
  }

  generate() {
    if (this.combinedMode && this.parsers.length > 1) {
      return this.generateCombinedReport();
    }
    return this.parsers.map((p, i) => this.generateSingleReport(p, i === 0));
  }

  generateSingleReport(parser, isFirst = true) {
    const summary = parser.getSummary();
    const report = [];

    report.push('# 🎵 Sequence Log Interpretation Report');
    report.push('');
    report.push(`**Generated:** ${new Date().toISOString()}`);
    report.push(`**Status:** ✅ Analysis Complete`);
    report.push('');

    // Executive Summary
    report.push('## 📊 Executive Summary');
    report.push('');
    report.push('| Metric | Value |');
    report.push('|--------|-------|');
    report.push(`| Total Log Lines | ${summary.totalLines} |`);
    report.push(`| Parsed Entries | ${summary.totalEntries} |`);
    report.push(`| Unique Sequences | ${summary.totalSequences} |`);
    report.push(`| Average Duration | ${summary.averageDuration.toFixed(2)}ms |`);
    report.push(`| Time Span | ${summary.timeSpan?.duration.toFixed(2)}s |`);
    report.push(`| Anomalies Detected | ${summary.anomalies.length} |`);
    report.push('');

    // Time Analysis
    if (summary.timeSpan) {
      report.push('## ⏱️ Time Analysis');
      report.push('');
      report.push(`- **Start:** ${summary.timeSpan.start}`);
      report.push(`- **End:** ${summary.timeSpan.end}`);
      report.push(`- **Duration:** ${summary.timeSpan.duration.toFixed(3)}s`);
      report.push('');
    }

    // Sequence Details
    report.push('## 🎯 Sequence Details');
    report.push('');
    for (const seq of summary.sequences) {
      const health = this.getSequenceHealth(seq);
      report.push(`### ${seq.event}`);
      report.push('');
      report.push(`**Health:** ${health.status}`);
      report.push('');
      report.push('| Metric | Value |');
      report.push('|--------|-------|');
      report.push(`| Duration (Min) | ${seq.metrics.minDuration === Infinity ? 'N/A' : seq.metrics.minDuration.toFixed(2)}ms |`);
      report.push(`| Duration (Max) | ${seq.metrics.maxDuration.toFixed(2)}ms |`);
      report.push(`| Total Time | ${seq.metrics.totalTime.toFixed(2)}ms |`);
      report.push(`| Occurrences | ${seq.entries.length} |`);
      report.push('');
    }

    // Anomalies
    if (summary.anomalies.length > 0) {
      report.push('## ⚠️ Detected Anomalies');
      report.push('');
      for (const anomaly of summary.anomalies) {
        const icon = anomaly.severity === 'high' ? '❌' : '⚠️';
        report.push(`### ${icon} ${anomaly.type} (Line ${anomaly.line})`);
        report.push('');
        report.push(`**Severity:** ${anomaly.severity.toUpperCase()}`);
        report.push('');
        report.push(`**Message:** ${anomaly.message}`);
        report.push('');
      }
    } else {
      report.push('## ✅ No Anomalies Detected');
      report.push('');
      report.push('All sequences are executing normally with expected performance.');
      report.push('');
    }

    // Performance Summary
    report.push('## 📈 Performance Summary');
    report.push('');
    if (summary.slowSequences > 0) {
      report.push(`⚠️ **${summary.slowSequences} slow sequence(s) detected** (>${CONFIG.performanceThresholds.warning}ms)`);
    } else {
      report.push('✅ All sequences within performance budget');
    }
    report.push('');

    // Recommendations
    report.push('## 💡 Recommendations');
    report.push('');
    if (summary.anomalies.length === 0) {
      report.push('✅ No immediate actions needed. Continue monitoring.');
    } else {
      const highSeverity = summary.anomalies.filter(a => a.severity === 'high');
      report.push(`**Priority Items:**`);
      for (const anomaly of highSeverity) {
        report.push(`- **${anomaly.type}:** ${anomaly.message}`);
      }
    }
    report.push('');

    return report.join('\n');
  }

  generateCombinedReport() {
    const reports = [];
    reports.push('# 🎵 Combined Sequence Log Analysis');
    reports.push('');
    reports.push(`**Generated:** ${new Date().toISOString()}`);
    reports.push(`**Mode:** Combined Analysis`);
    reports.push(`**Logs Analyzed:** ${this.parsers.length}`);
    reports.push('');

    // Aggregate metrics
    let totalLines = 0;
    let totalSequences = 0;
    let totalAnomalies = 0;
    let maxDuration = 0;
    let allSequences = new Map();

    for (const parser of this.parsers) {
      const summary = parser.getSummary();
      totalLines += summary.totalLines;
      totalSequences += summary.totalSequences;
      totalAnomalies += summary.anomalies.length;

      for (const seq of summary.sequences) {
        if (!allSequences.has(seq.event)) {
          allSequences.set(seq.event, {
            ...seq,
            occurrences: 1,
            totalDuration: seq.metrics.totalTime,
          });
        } else {
          const existing = allSequences.get(seq.event);
          existing.occurrences++;
          existing.totalDuration += seq.metrics.totalTime;
          existing.metrics.maxDuration = Math.max(
            existing.metrics.maxDuration,
            seq.metrics.maxDuration
          );
        }
        maxDuration = Math.max(maxDuration, seq.metrics.maxDuration);
      }
    }

    // Summary Table
    reports.push('## 📊 Combined Analysis Summary');
    reports.push('');
    reports.push('| Metric | Value |');
    reports.push('|--------|-------|');
    reports.push(`| Total Logs Processed | ${this.parsers.length} |`);
    reports.push(`| Total Log Lines | ${totalLines} |`);
    reports.push(`| Unique Sequences | ${totalSequences} |`);
    reports.push(`| Total Anomalies | ${totalAnomalies} |`);
    reports.push(`| Max Duration Observed | ${maxDuration.toFixed(2)}ms |`);
    reports.push('');

    // Top Sequences
    reports.push('## 🏆 Top Sequences by Frequency');
    reports.push('');
    const topSequences = Array.from(allSequences.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);

    reports.push('| Event | Occurrences | Avg Duration | Max Duration |');
    reports.push('|-------|-------------|--------------|--------------|');
    for (const seq of topSequences) {
      const avgDur = seq.totalDuration / seq.occurrences;
      reports.push(
        `| \`${seq.event}\` | ${seq.occurrences} | ${avgDur.toFixed(2)}ms | ${seq.metrics.maxDuration.toFixed(2)}ms |`
      );
    }
    reports.push('');

    // Anomaly Trends
    reports.push('## 🔍 Anomaly Trends');
    reports.push('');
    const anomalyTypes = new Map();
    for (const parser of this.parsers) {
      const summary = parser.getSummary();
      for (const anomaly of summary.anomalies) {
        if (!anomalyTypes.has(anomaly.type)) {
          anomalyTypes.set(anomaly.type, { count: 0, severity: anomaly.severity });
        }
        anomalyTypes.get(anomaly.type).count++;
      }
    }

    if (anomalyTypes.size === 0) {
      reports.push('✅ No anomalies detected across all logs');
    } else {
      reports.push('| Anomaly Type | Count | Severity |');
      reports.push('|--------------|-------|----------|');
      for (const [type, data] of anomalyTypes) {
        const icon = data.severity === 'high' ? '❌' : '⚠️';
        reports.push(`| ${type} | ${data.count} | ${icon} ${data.severity.toUpperCase()} |`);
      }
    }
    reports.push('');

    // Recommendations
    reports.push('## 💡 Overall Recommendations');
    reports.push('');
    if (totalAnomalies === 0) {
      reports.push('✅ All logs show healthy sequence execution.');
    } else {
      reports.push(`⚠️ ${totalAnomalies} anomalies detected across ${this.parsers.length} logs.`);
      reports.push('Review individual log reports for detailed analysis.');
    }
    reports.push('');

    return reports.join('\n');
  }

  getSequenceHealth(seq) {
    const status =
      seq.metrics.maxDuration > CONFIG.performanceThresholds.critical
        ? '❌ Critical'
        : seq.metrics.maxDuration > CONFIG.performanceThresholds.warning
        ? '⚠️ Warning'
        : seq.metrics.maxDuration > CONFIG.performanceThresholds.good
        ? '✅ Good'
        : '⭐ Excellent';

    return { status };
  }
}

// ============================================================================
// File Operations
// ============================================================================

function getLogFiles(input) {
  const stat = fs.statSync(input);

  if (stat.isFile()) {
    return [input];
  }

  if (stat.isDirectory()) {
    return fs
      .readdirSync(input)
      .filter(f => f.endsWith('.log') || f.endsWith('.txt'))
      .map(f => path.join(input, f));
  }

  throw new Error(`Invalid input: ${input}`);
}

function readLogFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function ensureOutputDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeReport(filePath, content) {
  ensureOutputDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: null,
    combine: false,
    output: CONFIG.defaultOutputDir,
    verbose: false,
  };

  for (const arg of args) {
    if (arg === '--combine') {
      options.combine = true;
    } else if (arg === '--verbose') {
      options.verbose = true;
    } else if (arg.startsWith('--output=')) {
      options.output = arg.replace('--output=', '');
    } else if (!arg.startsWith('--')) {
      options.input = arg;
    }
  }

  if (!options.input) {
    console.error('❌ Error: Input file or directory required');
    console.error('');
    console.error('Usage: node scripts/generate-sequence-interpretation.js <logFile|directory> [--combine] [--output=path] [--verbose]');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/generate-sequence-interpretation.js demo-logs/sequence.log');
    console.error('  node scripts/generate-sequence-interpretation.js demo-logs/ --combine');
    console.error('  node scripts/generate-sequence-interpretation.js demo-logs/ --output=./analysis');
    process.exit(1);
  }

  return options;
}

function main() {
  const startTime = performance.now();
  const options = parseArgs();

  try {
    if (options.verbose) {
      console.log('🎵 Sequence Log Interpretation Generator');
      console.log('');
      console.log(`Input: ${options.input}`);
      console.log(`Mode: ${options.combine ? 'Combined' : 'Individual'}`);
      console.log(`Output: ${options.output}`);
      console.log('');
    }

    const logFiles = getLogFiles(options.input);
    if (options.verbose) {
      console.log(`📂 Found ${logFiles.length} log file(s)`);
    }

    const parsers = logFiles.map(file => {
      if (options.verbose) console.log(`  📄 Processing: ${path.basename(file)}`);
      const content = readLogFile(file);
      return new SequenceLogParser(content);
    });

    const generator = new InterpretationReportGenerator(parsers, options.combine);
    const reports = generator.generate();

    ensureOutputDir(options.output);

    if (options.combine && logFiles.length > 1) {
      const outputFile = path.join(options.output, 'COMBINED_SEQUENCE_ANALYSIS.md');
      writeReport(outputFile, reports);
      if (options.verbose) {
        console.log(`\n✅ Combined report generated: ${outputFile}`);
      } else {
        console.log(`✅ ${outputFile}`);
      }
    } else {
      logFiles.forEach((file, i) => {
        const baseName = path.basename(file, path.extname(file));
        const outputFile = path.join(options.output, `${baseName}_INTERPRETATION.md`);
        writeReport(outputFile, reports[i]);
        if (options.verbose) {
          console.log(`✅ Report generated: ${outputFile}`);
        } else {
          console.log(`✅ ${outputFile}`);
        }
      });
    }

    const endTime = performance.now();
    if (options.verbose) {
      console.log('');
      console.log(`⏱️ Completed in ${(endTime - startTime).toFixed(2)}ms`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
