#!/usr/bin/env node

/**
 * 🔍 Log Trace Mapper
 * 
 * Maps telemetry events from renderx-web-telemetry.json back to their original
 * log file entries in .logs/ folder.
 * 
 * Shows:
 * - Which log files contain each event
 * - Exact line numbers where events appear
 * - Original log entry text
 * - Complete lineage from event → log source
 * 
 * Usage:
 *   node scripts/trace-telemetry-to-logs.js [eventId]
 * 
 * Examples:
 *   node scripts/trace-telemetry-to-logs.js                        (all events)
 *   node scripts/trace-telemetry-to-logs.js canvas:render:performance:throttle
 *   node scripts/trace-telemetry-to-logs.js --format=json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const TELEMETRY_FILE = path.join(WORKSPACE_ROOT, '.generated/renderx-web-telemetry.json');
const LOGS_DIR = path.join(WORKSPACE_ROOT, '.logs');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, '.generated/log-traceability');

// ============================================================================
// LOG TRACE MAPPER
// ============================================================================

class LogTraceMapper {
  constructor() {
    this.telemetry = null;
    this.logIndex = new Map(); // eventId → [{file, line, content, timestamp}, ...]
    this.traces = [];
  }

  // Load telemetry data
  loadTelemetry() {
    try {
      const content = fs.readFileSync(TELEMETRY_FILE, 'utf8');
      this.telemetry = JSON.parse(content);
      console.log(`✅ Loaded ${this.telemetry.anomalies.length} events from telemetry`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to load telemetry: ${error.message}`);
      return false;
    }
  }

  // Scan all log files
  scanLogFiles() {
    console.log('\n🔍 Scanning log files...');
    
    if (!fs.existsSync(LOGS_DIR)) {
      console.error(`❌ Logs directory not found: ${LOGS_DIR}`);
      return false;
    }

    const logFiles = fs.readdirSync(LOGS_DIR).filter(f => f.endsWith('.log'));
    console.log(`📁 Found ${logFiles.length} log files`);

    let totalLinesScanned = 0;

    logFiles.forEach((logFile, idx) => {
      const filePath = path.join(LOGS_DIR, logFile);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        totalLinesScanned += lines.length;

        lines.forEach((line, lineNum) => {
          // Search for telemetry events in log entries
          this.telemetry.anomalies.forEach(anomaly => {
            const eventPattern = this.createEventPattern(anomaly.event);
            if (eventPattern.test(line)) {
              const key = anomaly.event;
              if (!this.logIndex.has(key)) {
                this.logIndex.set(key, []);
              }
              
              this.logIndex.get(key).push({
                file: logFile,
                filePath,
                lineNum: lineNum + 1,
                content: line.substring(0, 200), // First 200 chars
                fullLine: line,
                timestamp: this.extractTimestamp(line),
                component: anomaly.component,
                severity: anomaly.severity
              });
            }
          });
        });

        if ((idx + 1) % 20 === 0) {
          console.log(`  Scanned ${idx + 1}/${logFiles.length} files...`);
        }
      } catch (error) {
        console.warn(`  ⚠️ Error reading ${logFile}: ${error.message}`);
      }
    });

    console.log(`✅ Scanned ${totalLinesScanned.toLocaleString()} log lines`);
    return true;
  }

  // Create regex pattern for event matching
  createEventPattern(eventId) {
    // Match event ID in various formats
    const escaped = eventId
      .replace(/:/g, '[:\\.]')  // Match : or .
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    return new RegExp(escaped, 'i');
  }

  // Extract timestamp from log line
  extractTimestamp(line) {
    const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
    return timestampMatch ? timestampMatch[1] : null;
  }

  // Generate complete trace for one event
  traceEvent(eventId) {
    const anomaly = this.telemetry.anomalies.find(a => a.event === eventId);
    if (!anomaly) {
      return null;
    }

    const logEntries = this.logIndex.get(eventId) || [];

    return {
      event: eventId,
      component: anomaly.component,
      severity: anomaly.severity,
      occurrences: anomaly.occurrences,
      fromTelemetry: anomaly,
      foundInLogs: logEntries.length,
      logEntries
    };
  }

  // Generate comprehensive traceability report
  generateTraceReport() {
    console.log('\n📊 Generating traceability report...');

    this.ensureOutputDir();

    // Report 1: Complete trace index
    const traceIndex = {
      totalEvents: this.telemetry.anomalies.length,
      eventsWithLogMatches: this.logIndex.size,
      eventsWithoutMatches: this.telemetry.anomalies.length - this.logIndex.size,
      traces: []
    };

    this.telemetry.anomalies.forEach(anomaly => {
      const trace = this.traceEvent(anomaly.event);
      if (trace) {
        traceIndex.traces.push({
          event: trace.event,
          component: trace.component,
          severity: trace.severity,
          occurrences: trace.occurrences,
          foundInLogs: trace.foundInLogs,
          logFiles: [...new Set(trace.logEntries.map(e => e.file))]
        });
      }
    });

    const indexPath = path.join(OUTPUT_DIR, 'log-trace-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(traceIndex, null, 2));
    console.log(`✅ log-trace-index.json`);

    // Report 2: Detailed traces with line numbers
    const detailedTraces = [];
    this.telemetry.anomalies.forEach(anomaly => {
      const trace = this.traceEvent(anomaly.event);
      if (trace && trace.logEntries.length > 0) {
        detailedTraces.push(trace);
      }
    });

    const detailedPath = path.join(OUTPUT_DIR, 'detailed-log-traces.json');
    fs.writeFileSync(detailedPath, JSON.stringify(detailedTraces, null, 2));
    console.log(`✅ detailed-log-traces.json (${detailedTraces.length} events with log matches)`);

    // Report 3: Markdown guide with examples
    const guide = this.generateMarkdownGuide(traceIndex);
    const guidePath = path.join(OUTPUT_DIR, 'log-traceability-guide.md');
    fs.writeFileSync(guidePath, guide);
    console.log(`✅ log-traceability-guide.md`);

    // Report 4: Event by component
    const byComponent = this.groupByComponent(detailedTraces);
    const componentPath = path.join(OUTPUT_DIR, 'traces-by-component.json');
    fs.writeFileSync(componentPath, JSON.stringify(byComponent, null, 2));
    console.log(`✅ traces-by-component.json`);

    // Report 5: Quick lookup CSV
    const csv = this.generateCSV(detailedTraces);
    const csvPath = path.join(OUTPUT_DIR, 'event-log-mapping.csv');
    fs.writeFileSync(csvPath, csv);
    console.log(`✅ event-log-mapping.csv`);
  }

  // Group traces by component
  groupByComponent(traces) {
    const result = {};
    traces.forEach(trace => {
      const comp = trace.component;
      if (!result[comp]) {
        result[comp] = [];
      }
      result[comp].push({
        event: trace.event,
        severity: trace.severity,
        occurrences: trace.occurrences,
        foundInLogs: trace.foundInLogs,
        logFiles: [...new Set(trace.logEntries.map(e => e.file))]
      });
    });
    return result;
  }

  // Generate markdown guide
  generateMarkdownGuide(traceIndex) {
    let guide = `# Log Traceability Guide

## Overview

This guide shows how to trace renderx-web telemetry events back to their original log file entries.

**Summary:**
- Total Events in Telemetry: ${traceIndex.totalEvents}
- Events Found in Logs: ${traceIndex.eventsWithLogMatches}
- Events Without Log Matches: ${traceIndex.eventsWithoutMatches}
- Coverage: ${((100 * traceIndex.eventsWithLogMatches) / traceIndex.totalEvents).toFixed(1)}%

## How to Use

### 1. Find an Event in the Telemetry

Look up an event from \`renderx-web-telemetry.json\`:
\`\`\`json
{
  "event": "canvas:render:performance:throttle",
  "component": "canvas-component",
  "severity": "critical",
  "occurrences": 187,
  "source": "component-canvas-2025-11-23.log:4521"
}
\`\`\`

### 2. Look Up in This Guide

Find the event in the trace index to see:
- Which log files contain it
- How many times it appears
- Exact line numbers

### 3. Open Log Files

Go to \`.logs/\` and open the log files to see original entries.

## Event Traces

\`\`\`
`;

    // Add top 10 events by occurrence
    const sorted = traceIndex.traces
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);

    sorted.forEach((trace, idx) => {
      guide += `\n### ${idx + 1}. ${trace.event}\n`;
      guide += `- **Component:** ${trace.component}\n`;
      guide += `- **Severity:** ${trace.severity}\n`;
      guide += `- **Occurrences:** ${trace.occurrences}\n`;
      guide += `- **Found in Logs:** ${trace.foundInLogs} times\n`;
      guide += `- **Log Files:** ${trace.logFiles.join(', ')}\n`;
    });

    guide += `\n\`\`\`

## Detailed Lookup

For complete line numbers and content, see:
- \`detailed-log-traces.json\` - All events with exact line numbers
- \`traces-by-component.json\` - Events grouped by component
- \`event-log-mapping.csv\` - Quick CSV lookup

## Statistics by Component

\`\`\`json
`;

    const byComponent = this.groupByComponent(traceIndex.traces);
    Object.entries(byComponent).forEach(([comp, events]) => {
      guide += `\n### ${comp}\n`;
      guide += `- Events: ${events.length}\n`;
      guide += `- Log Matches: ${events.filter(e => e.foundInLogs > 0).length}\n`;
      guide += `- Total Occurrences: ${events.reduce((s, e) => s + e.occurrences, 0)}\n`;
    });

    guide += `\n\`\`\``;

    return guide;
  }

  // Generate CSV for quick lookup
  generateCSV(traces) {
    let csv = 'Event,Component,Severity,Occurrences,FoundInLogs,LogFiles\n';

    traces.forEach(trace => {
      csv += `"${trace.event}","${trace.component}","${trace.severity}",${trace.occurrences},${trace.foundInLogs},"${trace.logEntries.map(e => e.file).join(';')}"\n`;
    });

    return csv;
  }

  // Print summary to console
  printSummary() {
    console.log('\n' + '='.repeat(90));
    console.log('📊 LOG TRACEABILITY MAPPING COMPLETE');
    console.log('='.repeat(90));

    console.log(`\n📈 Statistics:`);
    console.log(`   Total Events: ${this.telemetry.anomalies.length}`);
    console.log(`   Events with Log Matches: ${this.logIndex.size}`);
    console.log(`   Coverage: ${((100 * this.logIndex.size) / this.telemetry.anomalies.length).toFixed(1)}%`);

    console.log(`\n🔗 Top Events by Log Occurrences:`);
    const sorted = Array.from(this.logIndex.entries())
      .map(([event, entries]) => ({ event, count: entries.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    sorted.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.event}: ${item.count} log entries`);
    });

    console.log(`\n📁 Output Files:`);
    console.log(`   .generated/log-traceability/`);
    console.log(`   ├── log-trace-index.json (summary)`);
    console.log(`   ├── detailed-log-traces.json (complete traces)`);
    console.log(`   ├── log-traceability-guide.md (this guide)`);
    console.log(`   ├── traces-by-component.json (grouped)`);
    console.log(`   └── event-log-mapping.csv (quick lookup)`);

    console.log('\n' + '='.repeat(90));
  }

  ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  }

  // Main execution
  async execute() {
    console.log('\n' + '='.repeat(90));
    console.log('🔍 LOG TRACE MAPPER - Map Telemetry Events to Original Log Files');
    console.log('='.repeat(90));

    if (!this.loadTelemetry()) {
      return false;
    }

    if (!this.scanLogFiles()) {
      return false;
    }

    this.generateTraceReport();
    this.printSummary();

    return true;
  }
}

// ============================================================================
// Main
// ============================================================================

const mapper = new LogTraceMapper();
await mapper.execute();
