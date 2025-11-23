#!/usr/bin/env node

/**
 * Lineage Query Tool
 * 
 * Query the data lineage to understand origin, transformations, and audit trail
 * of any generated artifact.
 * 
 * Usage:
 *   node scripts/query-lineage.js trace test-health-report.md
 *   node scripts/query-lineage.js changes test-health-report.md --since 7days
 *   node scripts/query-lineage.js audit --full
 *   node scripts/query-lineage.js timeline
 * 
 * Commands:
 *   trace <artifact>     - Trace origin of artifact to source data
 *   changes <artifact>   - Show what changed since last generation
 *   audit [--full]       - Show complete audit trail
 *   timeline             - Show chronological pipeline executions
 */

const fs = require('fs');
const path = require('path');

class LineageQueryEngine {
  constructor() {
    this.lineageDir = './.generated/lineage/';
    this.auditLog = this.loadAuditLog();
  }

  loadAuditLog() {
    const auditPath = path.join(this.lineageDir, 'lineage-audit.json');
    if (fs.existsSync(auditPath)) {
      try {
        return JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
      } catch (e) {
        console.warn('⚠️  Could not load audit log:', e.message);
        return null;
      }
    }
    return null;
  }

  trace(artifact) {
    console.log(`\n🔍 LINEAGE TRACE: ${artifact}\n`);

    if (!this.auditLog) {
      console.log('❌ No audit log found. Run pipeline first.');
      return;
    }

    const { lineageChain, sourceDataCount, transformationCount } = this.auditLog;

    console.log('📊 Pipeline Summary:');
    console.log(`  Execution: ${this.auditLog.executionStarted}`);
    console.log(`  Duration: ${this.calculateDuration(
      this.auditLog.executionStarted,
      this.auditLog.executionCompleted
    )}`);
    console.log(`  Source Files: ${sourceDataCount}`);
    console.log(`  Transformations: ${transformationCount}\n`);

    console.log('🔗 Lineage Chain:\n');

    for (const step of lineageChain) {
      this.printLineageStep(step);
    }

    console.log('\n📋 Source Data Checksums (for verification):\n');
    if (this.auditLog.sourceDataCount > 0) {
      for (const step of lineageChain.filter(s => s.stage === 'data_acquisition')) {
        console.log(`  ${step.key}:`);
        console.log(`    File: ${step.source}`);
        console.log(`    Hash: ${step.checksum}`);
        console.log(`    ID:   ${step.lineageId}\n`);
      }
    }

    console.log('💡 To verify this artifact is current:');
    console.log('  npm run verify:no-drift\n');
  }

  changes(artifact, options = {}) {
    console.log(`\n📈 CHANGES: ${artifact}\n`);

    if (!this.auditLog) {
      console.log('❌ No audit log found.');
      return;
    }

    const since = options.since || '7days';
    const sinceDate = this.parseTimeDelta(since);

    console.log(`Showing changes since: ${sinceDate.toISOString()}\n`);

    // Find previous audit logs
    const previousLogs = this.findPreviousAuditLogs(sinceDate);

    if (previousLogs.length === 0) {
      console.log('ℹ️  No previous audit logs found in timeframe.');
      return;
    }

    console.log(`Found ${previousLogs.length} previous pipeline execution(s):\n`);

    for (const prevLog of previousLogs) {
      this.compareAuditLogs(this.auditLog, prevLog);
    }
  }

  compareAuditLogs(currentLog, previousLog) {
    const currentTime = new Date(currentLog.executionCompleted);
    const previousTime = new Date(previousLog.executionCompleted);

    console.log(`Execution: ${previousTime.toLocaleString()} → ${currentTime.toLocaleString()}`);
    console.log(`Duration: ${this.calculateDuration(previousTime, currentTime)}`);

    // Find changes in transformations
    const currentTfs = new Map(
      (currentLog.transformations || []).map(t => [t.transformationId, t])
    );
    const previousTfs = new Map(
      (previousLog.transformations || []).map(t => [t.transformationId, t])
    );

    console.log('\nTransformation Changes:');
    for (const [tfId, currentTf] of currentTfs) {
      const previousTf = previousTfs.get(tfId);
      if (!previousTf) {
        console.log(`  ✨ NEW: ${tfId}`);
      } else if (currentTf.outputChecksum !== previousTf.outputChecksum) {
        console.log(`  📝 CHANGED: ${tfId}`);
        console.log(`     Output: ${previousTf.outputChecksum} → ${currentTf.outputChecksum}`);
      }
    }

    console.log('\n');
  }

  audit(options = {}) {
    console.log('\n📋 COMPLETE AUDIT TRAIL\n');

    if (!this.auditLog) {
      console.log('❌ No audit log found.');
      return;
    }

    const { full } = options;

    // Summary
    console.log('📊 Execution Summary:');
    console.log(`  Pipeline ID: ${this.auditLog.pipelineId}`);
    console.log(`  Started: ${this.auditLog.executionStarted}`);
    console.log(`  Completed: ${this.auditLog.executionCompleted}`);
    console.log(`  Status: ${this.auditLog.validationResults ? 'completed' : 'incomplete'}\n`);

    // Validation results
    if (this.auditLog.validationResults) {
      console.log('✅ Validation Results:\n');
      for (const [key, result] of Object.entries(this.auditLog.validationResults)) {
        const status = result.status === 'pass' ? '✅' : '⚠️ ';
        console.log(`  ${status} ${key}: ${result.status}`);
        if (result.issues && result.issues.length > 0) {
          for (const issue of result.issues) {
            console.log(`      - ${issue}`);
          }
        }
      }
      console.log('');
    }

    // Transformations
    console.log('🔄 Transformations:\n');
    for (const tf of this.auditLog.transformations || []) {
      console.log(`  ${tf.transformationId}:`);
      console.log(`    Status: ${tf.status}`);
      console.log(`    Input:  ${tf.inputChecksum}`);
      console.log(`    Output: ${tf.outputChecksum}`);
      console.log(`    Time:   ${tf.executionTimeMs.toFixed(0)}ms\n`);
    }

    // Detailed lineage chain (if full flag)
    if (full) {
      console.log('🔗 Detailed Lineage Chain:\n');
      for (const step of this.auditLog.lineageChain) {
        this.printLineageStep(step, true);
      }
    }

    // Verification
    console.log('✅ Verification:');
    const verificationPath = path.join(this.lineageDir, 'verification-report.json');
    if (fs.existsSync(verificationPath)) {
      try {
        const verification = JSON.parse(fs.readFileSync(verificationPath, 'utf-8'));
        console.log(`  Status: ${verification.status}`);
        console.log(`  Issues: ${verification.issues.length}`);
        console.log(`  Verified: ${verification.verifiedAt}\n`);
      } catch (e) {
        console.log('  Could not load verification report\n');
      }
    }
  }

  timeline() {
    console.log('\n📅 PIPELINE EXECUTION TIMELINE\n');

    // Find all audit logs
    if (!fs.existsSync(this.lineageDir)) {
      console.log('❌ Lineage directory not found. Run pipeline first.');
      return;
    }

    const files = fs.readdirSync(this.lineageDir);
    const auditFiles = files.filter(f => f.includes('lineage-audit'));

    if (auditFiles.length === 0) {
      console.log('❌ No audit logs found.');
      return;
    }

    const logs = auditFiles
      .map(f => {
        try {
          const data = JSON.parse(
            fs.readFileSync(path.join(this.lineageDir, f), 'utf-8')
          );
          return {
            file: f,
            executed: new Date(data.executionCompleted),
            data,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.executed - b.executed);

    console.log(`Found ${logs.length} pipeline execution(s):\n`);

    for (const log of logs) {
      const duration = this.calculateDuration(
        log.data.executionStarted,
        log.data.executionCompleted
      );
      console.log(`📍 ${log.executed.toLocaleString()}`);
      console.log(`   Duration: ${duration}`);
      console.log(`   ID: ${log.data.pipelineId}`);
      console.log(`   Transformations: ${(log.data.transformations || []).length}`);
      console.log('');
    }

    console.log('💡 To see details of a specific execution:');
    console.log('  npm run lineage:audit -- --full\n');
  }

  // Helper methods

  printLineageStep(step, detailed = false) {
    const status = step.status === 'pass' || step.status === 'success' ? '✅' : '⚠️ ';

    console.log(`  ${status} Step ${step.step}: ${step.stage}`);

    if (step.source) {
      console.log(`     File: ${step.source}`);
    }
    if (step.transformationId) {
      console.log(`     ID: ${step.transformationId}`);
    }
    if (step.inputChecksum) {
      console.log(`     Input: ${step.inputChecksum}`);
    }
    if (step.outputChecksum) {
      console.log(`     Output: ${step.outputChecksum}`);
    }
    if (step.issuesFound !== undefined) {
      console.log(`     Issues: ${step.issuesFound}`);
    }

    if (detailed && step.timestamp) {
      console.log(`     Time: ${step.timestamp}`);
    }

    console.log('');
  }

  calculateDuration(start, end) {
    const ms = new Date(end) - new Date(start);
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }

  parseTimeDelta(delta) {
    const now = new Date();
    const [num, unit] = delta.match(/(\d+)(\w+)/).slice(1);

    const multipliers = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const ms = num * multipliers[unit] || 0;
    return new Date(now - ms);
  }

  findPreviousAuditLogs(sinceDate) {
    if (!fs.existsSync(this.lineageDir)) return [];

    const files = fs.readdirSync(this.lineageDir);
    const auditFiles = files.filter(f => f.includes('lineage-audit'));

    return auditFiles
      .map(f => {
        try {
          const data = JSON.parse(
            fs.readFileSync(path.join(this.lineageDir, f), 'utf-8')
          );
          const execTime = new Date(data.executionCompleted);
          if (execTime >= sinceDate && execTime < new Date()) {
            return data;
          }
        } catch {}
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.executionCompleted) - new Date(a.executionCompleted));
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const arg = args[1];
  const options = {};

  // Parse options
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--since') {
      options.since = args[i + 1];
      i++;
    } else if (args[i] === '--full') {
      options.full = true;
    }
  }

  const engine = new LineageQueryEngine();

  switch (command) {
    case 'trace':
      if (!arg) {
        console.log('Usage: node query-lineage.js trace <artifact>');
        process.exit(1);
      }
      engine.trace(arg);
      break;

    case 'changes':
      if (!arg) {
        console.log('Usage: node query-lineage.js changes <artifact> [--since 7days]');
        process.exit(1);
      }
      engine.changes(arg, options);
      break;

    case 'audit':
      engine.audit(options);
      break;

    case 'timeline':
      engine.timeline();
      break;

    default:
      console.log(`
Lineage Query Engine

Commands:
  trace <artifact>           Trace artifact origin to source data
  changes <artifact>         Show what changed since last generation
  audit [--full]             Show complete audit trail
  timeline                   Show chronological pipeline executions

Examples:
  node query-lineage.js trace test-health-report.md
  node query-lineage.js changes test-health-report.md --since 7days
  node query-lineage.js audit --full
  node query-lineage.js timeline
`);
      break;
  }
}

main();

module.exports = LineageQueryEngine;
