#!/usr/bin/env node
/**
 * Demo Execution Telemetry Capture Hook
 * 
 * Wraps demo execution (npm run demo:output:enhanced) for a specific sprint.
 * Captures telemetry events/metrics emitted during demo execution.
 * Stores captured telemetry for signature validation.
 * 
 * Usage: node scripts/capture-demo-telemetry.js <sprint-id>
 * Example: node scripts/capture-demo-telemetry.js 0
 */
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import crypto from 'crypto';

const ROOT = process.cwd();
const PLAN_FILE = path.join(ROOT, 'orchestration-audit-system-project-plan.json');
const CAPTURE_DIR = path.join(ROOT, '.generated', 'sprint-telemetry-capture');
const VALIDATION_REPORT = path.join(ROOT, '.generated', 'telemetry-validation-report.json');

function load(p) { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; } }
function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

class TelemetryCapture {
  constructor(sprintId) {
    this.sprintId = sprintId;
    this.plan = load(PLAN_FILE);
    this.sprint = this.plan?.sprints?.find(s => s.id === sprintId);
    this.capturedEvents = [];
    this.capturedMetrics = [];
    this.timestamps = [];
  }

  validate() {
    if (!this.plan) throw new Error('Plan file missing');
    if (!this.sprint) throw new Error(`Sprint ${this.sprintId} not found in plan`);
    if (!this.sprint.telemetry?.signatures?.length) {
      throw new Error(`Sprint ${this.sprintId} has no telemetry signatures defined`);
    }
  }

  // Parse stdout/stderr for telemetry events (custom format)
  parseOutput(data) {
    const str = data.toString();
    const lines = str.split('\n');
    for (const line of lines) {
      // Look for telemetry markers: [TELEMETRY_EVENT], [TELEMETRY_METRIC]
      if (line.includes('[TELEMETRY_EVENT]')) {
        const match = line.match(/\[TELEMETRY_EVENT\]\s+([a-z0-9._-]+)(?:\s+(.+))?/i);
        if (match) {
          this.capturedEvents.push({
            signature: match[1],
            details: match[2] || '',
            timestamp: new Date().toISOString()
          });
        }
      }
      if (line.includes('[TELEMETRY_METRIC]')) {
        const match = line.match(/\[TELEMETRY_METRIC]\s+([a-z0-9._-]+)\s*=\s*(.+)/i);
        if (match) {
          this.capturedMetrics.push({
            name: match[1],
            value: match[2],
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  runDemo() {
    return new Promise((resolve, reject) => {
      console.log(`[telemetry-capture] Starting demo for sprint ${this.sprintId}...`);
      
      // Run demo:output:enhanced which executes the core demo logic
      const proc = spawn('npm', ['run', 'demo:output:enhanced'], {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        this.parseOutput(data);
        process.stdout.write(data); // passthrough
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        this.parseOutput(data);
        process.stderr.write(data); // passthrough
      });

      proc.on('close', (code) => {
        if (code !== 0) {
          console.error(`[telemetry-capture] Demo exited with code ${code}`);
          reject(new Error(`Demo execution failed with code ${code}`));
        } else {
          console.log(`[telemetry-capture] Demo completed successfully`);
          resolve({ stdout, stderr });
        }
      });
    });
  }

  validateSignatures() {
    const required = this.sprint.telemetry.signatures || [];
    const captured = this.capturedEvents.map(e => e.signature);
    const missing = required.filter(sig => !captured.includes(sig));
    const coverage = (captured.length / required.length);
    
    return {
      required,
      captured,
      missing,
      coverage,
      allPresent: missing.length === 0
    };
  }

  save() {
    ensureDir(CAPTURE_DIR);
    const timestamp = new Date().toISOString();
    const validation = this.validateSignatures();
    
    const capture = {
      sprint: this.sprintId,
      name: this.sprint.name,
      capturedAt: timestamp,
      demoCommand: 'npm run demo:output:enhanced',
      events: this.capturedEvents,
      metrics: this.capturedMetrics,
      validation,
      telemetryHash: crypto.createHash('sha256')
        .update(JSON.stringify(this.capturedEvents.map(e => e.signature).sort()))
        .digest('hex')
    };

    const filePath = path.join(CAPTURE_DIR, `sprint-${this.sprintId}-capture.json`);
    fs.writeFileSync(filePath, JSON.stringify(capture, null, 2));
    console.log(`[telemetry-capture] Saved capture to ${filePath}`);
    
    return capture;
  }

  static generateValidationReport() {
    ensureDir(path.dirname(VALIDATION_REPORT));
    const captureDir = CAPTURE_DIR;
    if (!fs.existsSync(captureDir)) {
      console.log('[telemetry-capture] No capture directory; skipping validation report');
      return;
    }

    const files = fs.readdirSync(captureDir).filter(f => f.endsWith('.json'));
    const rows = [];
    for (const f of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(captureDir, f), 'utf-8'));
        if (data.validation) {
          rows.push({
            sprint: data.sprint,
            name: data.name,
            capturedAt: data.capturedAt,
            eventsCount: data.events.length,
            metricsCount: data.metrics.length,
            signaturesCovered: data.validation.captured.length,
            signaturesRequired: data.validation.required.length,
            coverage: (data.validation.coverage * 100).toFixed(1) + '%',
            allPresent: data.validation.allPresent,
            missing: data.validation.missing,
            status: data.validation.allPresent ? 'PASS' : 'PENDING'
          });
        }
      } catch (e) {
        console.error(`[telemetry-capture] Error reading ${f}:`, e.message);
      }
    }

    const report = {
      generatedAt: new Date().toISOString(),
      totalSprints: rows.length,
      passCount: rows.filter(r => r.status === 'PASS').length,
      rows
    };

    fs.writeFileSync(VALIDATION_REPORT, JSON.stringify(report, null, 2));
    console.log(`[telemetry-capture] Wrote validation report to ${VALIDATION_REPORT}`);
  }
}

async function main() {
  const sprintId = process.argv[2];
  if (!sprintId) {
    console.error('Usage: node scripts/capture-demo-telemetry.js <sprint-id>');
    process.exit(1);
  }

  try {
    const capture = new TelemetryCapture(sprintId);
    capture.validate();
    await capture.runDemo();
    const result = capture.save();
    
    console.log(`\n[telemetry-capture] Summary:`);
    console.log(`  Required Signatures: ${result.validation.required.length}`);
    console.log(`  Captured Events: ${result.capturedEvents.length}`);
    console.log(`  Coverage: ${(result.validation.coverage * 100).toFixed(1)}%`);
    console.log(`  Status: ${result.validation.allPresent ? 'PASS' : 'PENDING'}`);
    
    if (result.validation.missing.length) {
      console.log(`  Missing: ${result.validation.missing.join(', ')}`);
    }

    // Generate validation report after capture
    TelemetryCapture.generateValidationReport();
    
    process.exit(result.validation.allPresent ? 0 : 1);
  } catch (err) {
    console.error('[telemetry-capture] Error:', err.message);
    process.exit(1);
  }
}

main();
