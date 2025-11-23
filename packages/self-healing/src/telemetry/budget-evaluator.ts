import fs from 'fs';
import path from 'path';
import { BddTelemetryRecord } from './contract';
import { recordAnomaly } from './anomalies';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'shape.budgets.json');

interface BudgetConfigEntry {
  beatsMax?: number;
  durationMsMax?: number;
  batonDiffMax?: number;
}
interface BudgetConfig {
  version: number;
  features: Record<string, BudgetConfigEntry>;
}

function loadConfig(): BudgetConfig | null {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) as BudgetConfig;
  } catch {
    return null;
  }
}

export function evaluateBudgets(rec: BddTelemetryRecord) {
  const cfg = loadConfig();
  if (!cfg) return;
  const entry = cfg.features[rec.feature];
  if (!entry) return;
  let breach = false;
  if (entry.beatsMax !== undefined && rec.beats > entry.beatsMax) breach = true;
  if (entry.durationMsMax !== undefined && (rec.durationMs || 0) > entry.durationMsMax) breach = true;
  if (entry.batonDiffMax !== undefined && (rec.batonDiffCount || 0) > entry.batonDiffMax) breach = true;
  rec.budgetStatus = breach ? 'breach' : 'within';
  if (breach) {
    recordAnomaly({
      type: 'shape.degradation',
      feature: rec.feature,
      correlationId: rec.correlationId,
      detail: { beats: rec.beats, durationMs: rec.durationMs, batonDiffCount: rec.batonDiffCount }
    });
  }
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH);
}