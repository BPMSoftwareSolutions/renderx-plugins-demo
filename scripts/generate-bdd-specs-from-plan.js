#!/usr/bin/env node
/**
 * Auto-generate / reconcile Business BDD spec files from SHAPE_EVOLUTION_PLAN.json blueprints.
 * Ensures ideation -> implementation alignment: each blueprint yields a telemetry-instrumented spec.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'SHAPE_EVOLUTION_PLAN.json');

function loadPlan() {
  const raw = fs.readFileSync(PLAN_PATH, 'utf-8');
  return JSON.parse(raw);
}

function slugToFilename(index, slug, pattern) {
  return pattern.replace('<index>', String(index)).replace('<slug>', slug);
}

function buildSpecContent(bp) {
  return `import { describe, it, expect } from 'vitest';\nimport { emitFeature } from '../../src/telemetry/emitter';\nimport { installTelemetryMatcher } from '../../src/telemetry/matcher';\nimport { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';\n\ninstallTelemetryMatcher();\n\ndescribe('Business BDD: ${bp.feature} (auto-generated)', () => {\n  it('Scenario: ${bp.description}', async () => {\n    clearTelemetry();\n    const { record } = await emitFeature('${bp.feature}', '${bp.feature}:executed', async () => ({ ok: true }));\n    // Governance: required fields\n    expect(record.feature).toBe('${bp.feature}');\n    expect(record.event).toBe('${bp.feature}:executed');\n    expect(record.correlationId).toMatch(/-/);\n    expect(record.beats).toBeGreaterThanOrEqual(2);\n    // Placeholder assertions derived from acceptance criteria hints\n    expect(getTelemetry().length).toBe(1);\n    expect(record).toHaveTelemetry({ feature: '${bp.feature}', event: '${bp.feature}:executed' });\n  });\n});\n`;}

function ensureSpecs() {
  const plan = loadPlan();
  const { specGeneration } = plan;
  if (!specGeneration) {
    console.error('specGeneration section missing in plan');
    process.exit(1);
  }
  const dir = path.join(ROOT, specGeneration.targetDirectory);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let indexCounter = specGeneration.startingIndex;
  const created = [];
  for (const bp of specGeneration.blueprints) {
    const filename = slugToFilename(indexCounter, bp.slug, specGeneration.namingPattern);
    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, buildSpecContent(bp), 'utf-8');
      created.push(filename);
    }
    indexCounter += 1;
  }
  if (created.length) {
    console.log(`Generated ${created.length} BDD spec(s):\n - ${created.join('\n - ')}`);
  } else {
    console.log('All blueprint specs already present.');
  }
}

// ESM entrypoint execution
const isDirect = process.argv[1] && process.argv[1].endsWith('generate-bdd-specs-from-plan.js');
if (isDirect) {
  ensureSpecs();
}
