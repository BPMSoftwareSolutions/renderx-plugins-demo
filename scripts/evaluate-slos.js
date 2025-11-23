#!/usr/bin/env node
// evaluate-slos.js
// Reads aggregated telemetry metrics and SLO config; computes SLIs & reports breaches.
import fs from 'fs';
import path from 'path';

const METRICS_PATH = path.join('packages','self-healing','.generated','telemetry-metrics.json');
const SLO_PATH = path.join('packages','self-healing','docs','service_level.objectives.json');

function fail(msg, details){
  console.error('[SLO-EVAL] FAIL', msg, details||'');
  process.exit(1);
}

if (!fs.existsSync(METRICS_PATH)) fail('Telemetry metrics not found. Run demo or parse first.', METRICS_PATH);
if (!fs.existsSync(SLO_PATH)) fail('SLO config missing', SLO_PATH);

const metricsRaw = JSON.parse(fs.readFileSync(METRICS_PATH,'utf8'));
const slo = JSON.parse(fs.readFileSync(SLO_PATH,'utf8'));
const handlerMetrics = metricsRaw.metrics.handlers || {};
const sequences = metricsRaw.metrics.sequences || {};

let totalCount = 0;
let weightedP95 = 0;
let weightedP99 = 0;
let weightedErrorRate = 0;
for (const h of Object.keys(handlerMetrics)) {
  const m = handlerMetrics[h];
  totalCount += m.count;
  weightedP95 += m.p95Time * m.count;
  weightedP99 += m.p99Time * m.count;
  weightedErrorRate += m.errorRate * m.count;
}
const latency_p95_ms = totalCount ? Math.round(weightedP95 / totalCount) : 0;
const latency_p99_ms = totalCount ? Math.round(weightedP99 / totalCount) : 0;
const error_rate = totalCount ? (weightedErrorRate / totalCount) : 0;
// Throughput placeholder: total events (requires time window for real TPS)
const throughput_min = metricsRaw.metrics.totalEvents || totalCount;
const availability = 1 - error_rate; // placeholder approximation

const sloTargets = slo.objectives;
const breaches = [];
function check(key, actual, comparator, target){
  const passed = comparator(actual, target);
  if (!passed) breaches.push({ key, actual, target, diff: actual - target });
  return passed;
}

check('latency_p95_ms', latency_p95_ms, (a,t)=> a <= t, sloTargets.latency_p95_ms);
check('latency_p99_ms', latency_p99_ms, (a,t)=> a <= t, sloTargets.latency_p99_ms);
check('error_rate', error_rate, (a,t)=> a <= t, sloTargets.error_rate);
check('throughput_min', throughput_min, (a,t)=> a >= t, sloTargets.throughput_min);
check('availability', availability, (a,t)=> a >= t, sloTargets.availability);

const result = {
  timestamp: new Date().toISOString(),
  slis: { latency_p95_ms, latency_p99_ms, error_rate: Number(error_rate.toFixed(4)), throughput_min, availability: Number(availability.toFixed(4)) },
  slo: sloTargets,
  breaches
};

const OUT_PATH = path.join('packages','self-healing','.generated','slo-breaches.json');
fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2),'utf8');

console.log('[SLO-EVAL] SLIs vs SLOs');
for (const [k,v] of Object.entries(result.slis)) {
  const target = sloTargets[k];
  if (target !== undefined) {
    const status = breaches.find(b=>b.key===k) ? 'BREACH' : 'OK';
    console.log(`  ${k}: ${v} (target ${target}) => ${status}`);
  }
}
if (breaches.length) {
  console.warn('[SLO-EVAL] Breaches detected:', breaches.map(b=>`${b.key} diff=${b.diff.toFixed(2)}`).join(', '));
  process.exitCode = 2;
} else {
  console.log('[SLO-EVAL] All SLOs met for this run.');
}