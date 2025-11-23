import { TelemetryEvent, Anomaly, TelemetryMetrics, SeverityLevel } from '../../types';
import * as fs from 'fs';
import * as path from 'path';

export interface DetectSloBreachesResult extends TelemetryEvent {
  context: {
    slis: Record<string, number>;
    sloTargets: Record<string, number>;
    breaches: { key: string; actual: number; target: number; diff: number }[];
    anomalies: Anomaly[];
    configPath: string;
    missingConfig: boolean;
  };
}

function resolveSloConfigPath(): string {
  return path.resolve(process.cwd(), 'packages', 'self-healing', 'docs', 'service_level.objectives.json');
}

function severityForBreach(key: string, actual: number, target: number): SeverityLevel {
  const ratio = target === 0 ? 0 : actual / target;
  switch (key) {
    case 'latency_p95_ms':
    case 'latency_p99_ms':
      if (ratio >= 2.0) return 'critical';
      if (ratio >= 1.5) return 'high';
      if (ratio >= 1.2) return 'medium';
      return 'low';
    case 'error_rate': {
      if (ratio >= 2.0) return 'critical';
      if (ratio >= 1.5) return 'high';
      if (ratio >= 1.2) return 'medium';
      return 'low';
    }
    case 'throughput_min': {
      const pct = actual / target; // lower is worse
      if (pct <= 0.3) return 'critical';
      if (pct <= 0.5) return 'high';
      if (pct <= 0.8) return 'medium';
      return 'low';
    }
    case 'availability': {
      const deficit = target - actual; // e.g. 0.995 - 0.97 = 0.025
      if (deficit >= 0.02) return 'critical';
      if (deficit >= 0.01) return 'high';
      if (deficit >= 0.005) return 'medium';
      return 'low';
    }
    default:
      return 'low';
  }
}

function anomalyTypeForKey(key: string): Anomaly['type'] {
  switch (key) {
    case 'latency_p95_ms':
    case 'latency_p99_ms':
    case 'throughput_min':
      return 'performance';
    case 'error_rate':
    case 'availability':
      return 'error';
    default:
      return 'state';
  }
}

function generateId(key: string): string { return `slo-breach-${key}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }

export function detectSloBreaches(metrics: TelemetryMetrics): DetectSloBreachesResult {
  if (!metrics) throw new Error('metrics required');
  const configPath = resolveSloConfigPath();
  let sloTargets: any = {};
  let missingConfig = false;
  try {
    if (!fs.existsSync(configPath)) {
      missingConfig = true;
    } else {
      const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      sloTargets = raw?.objectives || {};
    }
  } catch {
    missingConfig = true;
  }
  // Aggregate handler metrics into weighted latency & error rate
  const handlerMetrics = metrics.handlers || {};
  let totalCount = 0, weightedP95 = 0, weightedP99 = 0, weightedErr = 0;
  for (const h of Object.keys(handlerMetrics)) {
    const m = handlerMetrics[h];
    totalCount += m.count;
    weightedP95 += m.p95Time * m.count;
    weightedP99 += m.p99Time * m.count;
    weightedErr += m.errorRate * m.count;
  }
  const latency_p95_ms = totalCount ? Math.round(weightedP95 / totalCount) : 0;
  const latency_p99_ms = totalCount ? Math.round(weightedP99 / totalCount) : 0;
  const error_rate = totalCount ? (weightedErr / totalCount) : 0;
  const throughput_min = metrics.totalEvents || totalCount; // placeholder
  const availability = 1 - error_rate; // placeholder
  const slis = { latency_p95_ms, latency_p99_ms, error_rate: Number(error_rate.toFixed(4)), throughput_min, availability: Number(availability.toFixed(4)) };

  const breaches: { key: string; actual: number; target: number; diff: number }[] = [];
  const anomalies: Anomaly[] = [];

  function consider(key: keyof typeof slis, comparator: (actual: number, target: number)=> boolean) {
    const target = sloTargets[key];
    if (target === undefined) return; // target not defined
    const actual = slis[key];
    const ok = comparator(actual, target);
    if (!ok) {
      const diff = actual - target;
      breaches.push({ key, actual, target, diff });
      const severity = severityForBreach(key, actual, target);
      anomalies.push({
        id: generateId(key),
        type: anomalyTypeForKey(key),
        severity,
        description: `SLO breach: ${key} actual=${actual} target=${target}`,
        metrics: { key, actual, target, diff, slis },
        detectedAt: new Date().toISOString(),
        confidence: 0.9
      });
    }
  }

  consider('latency_p95_ms', (a,t)=> a <= t);
  consider('latency_p99_ms', (a,t)=> a <= t);
  consider('error_rate', (a,t)=> a <= t);
  consider('throughput_min', (a,t)=> a >= t);
  consider('availability', (a,t)=> a >= t);

  // Persist breaches (optional alignment with standalone script)
  try {
    const outDir = path.resolve(process.cwd(), 'packages', 'self-healing', '.generated');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'slo-breaches.json');
    fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), slis, slo: sloTargets, breaches }, null, 2));
  } catch {/* ignore persistence errors */}

  return {
    timestamp: new Date().toISOString(),
    handler: 'detectSloBreaches',
    event: 'anomaly.detect.slo',
    context: { slis, sloTargets, breaches, anomalies, configPath, missingConfig }
  };
}

export default detectSloBreaches;