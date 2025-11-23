#!/usr/bin/env node
/**
 * run-self-healing-demo.js
 *
 * Demonstrates end-to-end self-healing flow on local log files:
 *   telemetry parse → anomaly detect → diagnosis (aggregate + impact + recommendations)
 *
 * Usage (PowerShell):
 *   node scripts/run-self-healing-demo.js --logsDir .logs
 *   node scripts/run-self-healing-demo.js --logsDir .logs --maxFiles 50
 *   node scripts/run-self-healing-demo.js --logsDir custom_logs --noSample
 *
 * If the target logs directory is missing or empty and --noSample not provided, a synthetic
 * sample log file will be generated to ensure the demo produces issues and recommendations.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import compiled handler orchestrators from built dist.
// Ensure `npm run build` has been executed so dist artifacts exist.
import {
  runTelemetryParsing,
  runAnomalyDetection,
  runDiagnosisAnalyze
} from '../packages/self-healing/dist/index.js';

function parseArgs(argv) {
  const args = { logsDir: '.logs', maxFiles: 200, noSample: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--noSample') args.noSample = true;
    else if (a.startsWith('--logsDir')) args.logsDir = a.split('=')[1] || argv[++i];
    else if (a.startsWith('--maxFiles')) args.maxFiles = Number(a.split('=')[1] || argv[++i]);
  }
  return args;
}

function ensureSampleLogs(logsDir, noSample) {
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  const entries = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
  if (entries.length > 0 || noSample) return;
  const samplePath = path.join(logsDir, 'self-healing-demo-sample.log');
  const now = new Date().toISOString().replace(/T.*/, '');
  const lines = [
    `${new Date().toISOString()} INFO handler:renderPipeline duration:320ms Start pipeline`,
    `${new Date().toISOString()} ERROR handler:renderPipeline duration:50ms Timeout waiting for GPU`,
    `${new Date().toISOString()} WARN handler:sequenceController out-of-order step detected handler:sequenceController duration:12ms`,
    `${new Date().toISOString()} INFO handler:testCoverage duration:42ms coverage:38% module=core-api`,
    `${new Date().toISOString()} ERROR handler:dbConnector duration:25ms Connection refused`,
    `${new Date().toISOString()} INFO handler:dbConnector duration:230ms query=select * from users`,
    `${new Date().toISOString()} ERROR handler:renderPipeline duration:40ms Re-render failed`,
    `{"timestamp":"${new Date().toISOString()}","handler":"renderPipeline","event":"frame.render","duration":410,"context":{"stage":"final"}}`
  ];
  fs.writeFileSync(samplePath, lines.join('\n'), 'utf8');
}

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

function deriveBaselineFromCurrent(currentMetrics) {
  const baseline = clone(currentMetrics);
  // Make baseline "better" (lower latency & error) so current looks anomalous.
  for (const [h, info] of Object.entries(baseline.handlers)) {
    info.avgTime = Math.max(1, Math.round(info.avgTime * 0.5));
    info.p95Time = Math.max(1, Math.round(info.p95Time * 0.5));
    info.p99Time = Math.max(1, Math.round(info.p99Time * 0.5));
    info.errorRate = Math.max(0, info.errorRate * 0.4); // baseline has fewer errors
  }
  // Sequences: shorten avgTime & reduce errorRate similarly
  for (const [s, info] of Object.entries(baseline.sequences)) {
    info.avgTime = Math.max(1, Math.round(info.avgTime * 0.6));
    info.errorRate = Math.max(0, info.errorRate * 0.4);
  }
  return baseline;
}

function color(code) { return str => `\u001b[${code}m${str}\u001b[0m`; }
const cyan = color('36');
const green = color('32');
const yellow = color('33');
const red = color('31');
const magenta = color('35');

async function main() {
  const args = parseArgs(process.argv);
  const logsDirAbs = path.resolve(process.cwd(), args.logsDir);
  ensureSampleLogs(logsDirAbs, args.noSample);
  console.log(cyan(`\n[DEMO] Using logs directory: ${logsDirAbs}`));
  const telemetry = await runTelemetryParsing({ logsDir: logsDirAbs, maxFiles: args.maxFiles });
  const currentMetrics = telemetry.aggregate.context.metrics;
  const baselineMetrics = deriveBaselineFromCurrent(currentMetrics);
  const anomaly = runAnomalyDetection({ currentMetrics, baselineMetrics, sequenceId: 'anomaly-detect-demo' });
  const diagnosis = runDiagnosisAnalyze({ sequenceId: 'diagnosis-analyze-demo' });
  const slice = diagnosis.slice;
  const recs = slice.recommendations || [];

  // Summary Output
  console.log(magenta('\n=== SELF-HEALING DEMO SUMMARY ==='));
  console.log(green(`Telemetry events parsed: ${telemetry.extract.context.events.length}`));
  console.log(green(`Handlers in metrics: ${Object.keys(currentMetrics.handlers).length}`));
  console.log(yellow(`Anomalies detected (perf/beh/cov/err aggregate): ${anomaly.aggregate.context.anomalies.length}`));
  console.log(red(`Performance issues: ${slice.performanceIssues.length}`));
  console.log(red(`Behavioral issues: ${slice.behavioralIssues.length}`));
  console.log(red(`Coverage issues: ${slice.coverageIssues.length}`));
  console.log(red(`Error issues: ${slice.errorIssues.length}`));
  console.log(magenta(`Overall impact severity: ${slice.impact?.overallSeverity || 'n/a'}`));
  console.log(magenta(`Recommendations: ${recs.length}`));
  const top = recs.slice(0, 5).sort((a,b)=>a.priority-b.priority);
  if (top.length) {
    console.log(cyan('\nTop Recommendations (priority asc):'));
    for (const r of top) {
      console.log(`  [p${r.priority}] (${r.type}) ${r.description} -> effort=${r.estimatedEffort} benefit=${r.expectedBenefit}`);
    }
  } else {
    console.log(yellow('No recommendations generated. Provide more diverse log data.'));
  }

  // Andon triggers check (soft in demo script; pretest handles hard failures).
  if (telemetry.load.context.loadedCount === 0) {
    console.error(red('\n[ANDON] No log files loaded. Add .log files to proceed.'));
    process.exitCode = 2;
  }
  if (!slice.performanceIssues.length && !slice.errorIssues.length) {
    console.warn(yellow('[ANDON] No performance or error issues surfaced; sample may be insufficient.'));
  }

  console.log(green('\n[DEMO] Completed.')); 
}

main().catch(err => {
  console.error('\n[DEMO] Failed:', err?.stack || err);
  process.exit(1);
});
