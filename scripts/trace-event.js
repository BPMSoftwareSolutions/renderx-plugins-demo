#!/usr/bin/env node

/**
 * 🔗 Interactive Event Tracer
 * 
 * Quickly trace any event from telemetry back to its original log files
 * with timestamps, line numbers, and full context.
 * 
 * Usage:
 *   node scripts/trace-event.js <event-name>
 *   node scripts/trace-event.js canvas:render:performance:throttle
 *   node scripts/trace-event.js all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const TELEMETRY_FILE = path.join(WORKSPACE_ROOT, '.generated/renderx-web-telemetry.json');
const LINEAGE_FILE = path.join(WORKSPACE_ROOT, '.generated/log-source-lineage/component-lineage-breakdown.json');
const TEST_MAPPING_FILE = path.join(WORKSPACE_ROOT, '.generated/event-test-mapping.json');

// ============================================================================
// INTERACTIVE EVENT TRACER
// ============================================================================

class InteractiveEventTracer {
  constructor() {
    this.telemetry = null;
    this.lineage = null;
    this.testMapping = null;
  }

  load() {
    try {
      this.telemetry = JSON.parse(fs.readFileSync(TELEMETRY_FILE, 'utf8'));
      this.lineage = JSON.parse(fs.readFileSync(LINEAGE_FILE, 'utf8'));
      
      // Test mapping is optional
      try {
        this.testMapping = JSON.parse(fs.readFileSync(TEST_MAPPING_FILE, 'utf8'));
      } catch {
        this.testMapping = {};
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to load required files: ${error.message}`);
      return false;
    }
  }

  traceEvent(eventName) {
    console.log('\n' + '='.repeat(100));
    console.log(`🔗 TRACING EVENT: ${eventName}`);
    console.log('='.repeat(100));

    if (eventName.toLowerCase() === 'all') {
      return this.traceAll();
    }

    // Find event in telemetry
    let event = null;
    let component = null;

    for (const anomaly of this.telemetry.anomalies) {
      if (anomaly.event === eventName || anomaly.event.includes(eventName)) {
        event = anomaly;
        component = anomaly.component.toLowerCase().replace(/\s+/g, '-');
        break;
      }
    }

    if (!event) {
      console.error(`\n❌ Event not found: ${eventName}`);
      console.log(`\n📋 Available events:`);
      this.telemetry.anomalies.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.event} (${a.component})`);
      });
      return;
    }

    // Print event details from telemetry
    console.log('\n📊 TELEMETRY EVENT');
    console.log('─'.repeat(100));
    console.log(`   Component: ${event.component}`);
    console.log(`   Event: ${event.event}`);
    console.log(`   Severity: ${this.getSeverityEmoji(event.severity)} ${event.severity.toUpperCase()}`);
    console.log(`   Occurrences: ${event.occurrences}`);
    console.log(`   Source: ${event.source}`);

    // Find log references
    const componentLineage = this.lineage[component];
    if (!componentLineage) {
      console.log(`\n⚠️ No log references found for component: ${component}`);
      return;
    }

    console.log('\n📁 LOG FILE REFERENCES');
    console.log('─'.repeat(100));

    if (componentLineage.logReferences.length === 0) {
      console.log(`   No direct log references found (may have been extracted and synthesized)`);
    } else {
      componentLineage.logReferences.slice(0, 5).forEach((ref, idx) => {
        console.log(`\n   [${idx + 1}] File: ${ref.file}`);
        console.log(`       Line: ${ref.lineNum}`);
        if (ref.timestamp) {
          console.log(`       Time: ${ref.timestamp}`);
        }
        console.log(`       Preview: ${ref.preview.substring(0, 80)}...`);
      });

      if (componentLineage.logReferences.length > 5) {
        console.log(`\n   ... and ${componentLineage.logReferences.length - 5} more references`);
      }
    }

    // Print test coverage
    console.log('\n🧪 TEST COVERAGE');
    console.log('─'.repeat(100));

    const testInfo = this.testMapping[event.event];
    if (testInfo) {
      console.log(`   Tests Written: ${testInfo.tests.length}`);
      testInfo.tests.slice(0, 3).forEach((test, idx) => {
        console.log(`   ${idx + 1}. ${test}`);
      });

      if (testInfo.tests.length > 3) {
        console.log(`   ... and ${testInfo.tests.length - 3} more`);
      }

      if (testInfo.gaps && testInfo.gaps.length > 0) {
        console.log(`\n   Coverage Gaps: ${testInfo.gaps.length}`);
        testInfo.gaps.slice(0, 2).forEach((gap, idx) => {
          console.log(`   ${idx + 1}. ${gap}`);
        });
      }

      console.log(`\n   Overall Coverage: ${testInfo.coverage}%`);
    } else {
      console.log(`   Tests: To be defined`);
    }

    // Print recommendations
    console.log('\n📋 HOW TO TRACE');
    console.log('─'.repeat(100));
    console.log(`   1. Open file: .logs/${componentLineage.logReferences[0]?.file || '{log-file}'}`);
    if (componentLineage.logReferences[0]) {
      console.log(`   2. Go to line: ${componentLineage.logReferences[0].lineNum}`);
    }
    console.log(`   3. See event in production: See timestamp and full context`);
    console.log(`   4. Check test coverage: Review tests in __tests__/ directory`);
    console.log(`   5. Implement fix: See implementation-roadmap.md`);

    console.log('\n');
  }

  traceAll() {
    console.log('\n📊 ALL EVENTS TRACE');
    console.log('─'.repeat(100));
    console.log(`\nTotal Events: ${this.telemetry.anomalies.length}\n`);

    this.telemetry.anomalies.forEach((event, idx) => {
      const component = event.component.toLowerCase().replace(/\s+/g, '-');
      const lineage = this.lineage[component];
      const testInfo = this.testMapping[event.event];

      console.log(`${idx + 1}. ${event.event}`);
      console.log(`   Component: ${event.component}`);
      console.log(`   Severity: ${this.getSeverityEmoji(event.severity)} ${event.severity.toUpperCase()}`);
      console.log(`   Occurrences: ${event.occurrences}`);
      console.log(`   Log References: ${lineage?.logReferences?.length || 0}`);
      console.log(`   Test Coverage: ${testInfo?.coverage || 0}%`);
      console.log(`   Status: ${this.getStatusEmoji(testInfo?.coverage || 0)} ${this.getStatus(testInfo?.coverage || 0)}`);
      console.log('');
    });
  }

  getSeverityEmoji(severity) {
    const map = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢', info: '🔵' };
    return map[severity.toLowerCase()] || '⚪';
  }

  getStatusEmoji(coverage) {
    if (coverage >= 90) return '✅';
    if (coverage >= 70) return '🟡';
    if (coverage >= 50) return '🟠';
    return '🔴';
  }

  getStatus(coverage) {
    if (coverage >= 90) return 'Well Tested';
    if (coverage >= 70) return 'Partially Tested';
    if (coverage >= 50) return 'Needs Tests';
    return 'Critical Gap';
  }

  printHelp() {
    console.log(`
🔗 Interactive Event Tracer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trace any telemetry event back to original log files, tests, and recommendations.

USAGE:
  node scripts/trace-event.js <event-name>

EXAMPLES:
  # Trace specific event
  node scripts/trace-event.js canvas:render:performance:throttle
  
  # Trace all events
  node scripts/trace-event.js all
  
  # Partial match
  node scripts/trace-event.js canvas
  node scripts/trace-event.js control
  node scripts/trace-event.js library

OUTPUT SHOWS:
  ✓ Event details (severity, occurrence count)
  ✓ Original log file references
  ✓ Line numbers and timestamps
  ✓ Test coverage information
  ✓ How to trace the event step-by-step
  ✓ Gap analysis and recommendations

FILES USED:
  • .generated/renderx-web-telemetry.json (12 anomalies)
  • .generated/log-source-lineage/component-lineage-breakdown.json (log refs)
  • .generated/event-test-mapping.json (test coverage)
  • .logs/*.log (87 original log files)
    `);
  }
}

// ============================================================================
// Main
// ============================================================================

const tracer = new InteractiveEventTracer();

if (!tracer.load()) {
  console.error('❌ Failed to load required files');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.length === 0) {
  tracer.printHelp();
} else {
  const eventName = args.join(' ');
  tracer.traceEvent(eventName);
}
