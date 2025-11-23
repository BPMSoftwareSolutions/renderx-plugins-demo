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

function buildRedPhaseScaffold(bp) {
  const failMsg = bp.redFailMessage || `Feature ${bp.feature} not yet implemented.`;
  return `  it('TDD RED: ${bp.feature} scaffold', () => {\n    // This test intentionally fails until implementation satisfies GREEN criteria.\n    expect(() => { throw new Error('${failMsg}') }).toThrow();\n    // Force RED state (will flip to GREEN when acceptance criteria are implemented)\n    expect(true).toBe(false);\n  });`;
}

function buildGreenAssertions(bp) {
  // Minimal heuristic mapping from acceptance criteria phrases to code assertions.
  const lines = [];
  if (bp.acceptanceCriteria?.some(c => c.includes('Generates run-* telemetry file'))) {
    lines.push(`    const telemetryDir = path.join(process.cwd(), '.generated', 'telemetry', '${bp.feature}');`);
    lines.push(`    const files = fs.existsSync(telemetryDir) ? fs.readdirSync(telemetryDir) : [];`);
    lines.push(`    expect(files.some(f => /^run-\\d+\.json$/.test(f))).toBe(true);`);
  }
  if (bp.acceptanceCriteria?.some(c => c.includes('Updates index'))) {
    lines.push(`    const indexPath = path.join(process.cwd(), '.generated', 'telemetry', 'index.json');`);
    lines.push(`    expect(fs.existsSync(indexPath)).toBe(true);`);
  }
  if (bp.acceptanceCriteria?.some(c => c.includes('Contract file present'))) {
    lines.push(`    const contractPath = path.join(process.cwd(), 'contracts', '${bp.feature}.contract.json');`);
    lines.push(`    expect(fs.existsSync(contractPath)).toBe(true);`);
  }
  if (bp.acceptanceCriteria?.some(c => c.includes('Contains shapeHash'))) {
    lines.push(`    expect(record.shapeHash).toMatch(/[a-f0-9]{16,}/); // simplistic hash presence check`);
  }
  if (bp.acceptanceCriteria?.some(c => c.includes('coverageId present'))) {
    lines.push(`    expect(record.coverageId).toMatch(/[a-f0-9]{12,}/); // coverageId scaffold presence`);
  }
  if (bp.acceptanceCriteria?.some(c => c.includes('reproducible'))) {
    lines.push(`    // Hash reproducibility check: emit same feature again and expect identical hash`);
    lines.push(`    const { record: second } = await emitFeature('${bp.feature}', '${bp.feature}:executed', async () => ({ ok: true }));`);
    lines.push(`    expect(second.shapeHash).toBe(record.shapeHash);`);
  }
  return lines.join('\n');
}

function buildSpecContent(bp) {
  const isRed = bp.tddPhase === 'RED';
  const redScaffold = isRed ? buildRedPhaseScaffold(bp) : '';
  const greenExtra = !isRed ? buildGreenAssertions(bp) : '';
  return `import fs from 'fs';\nimport path from 'path';\nimport { describe, it, expect } from 'vitest';\nimport { emitFeature } from '../../src/telemetry/emitter';\nimport { installTelemetryMatcher } from '../../src/telemetry/matcher';\nimport { clearTelemetry, getTelemetry } from '../../src/telemetry/collector';\n\ninstallTelemetryMatcher();\n\ndescribe('Business BDD: ${bp.feature} (auto-generated)', () => {\n${redScaffold}\n  it('Scenario: ${bp.description}', async () => {\n    clearTelemetry();\n    const { record } = await emitFeature('${bp.feature}', '${bp.feature}:executed', async () => ({ ok: true }));\n    // Governance: required fields\n    expect(record.feature).toBe('${bp.feature}');\n    expect(record.event).toBe('${bp.feature}:executed');\n    expect(record.correlationId).toMatch(/-/);\n    expect(record.beats).toBeGreaterThanOrEqual(2);\n    expect(getTelemetry().length).toBe(1);\n    expect(record).toHaveTelemetry({ feature: '${bp.feature}', event: '${bp.feature}:executed' });\n${greenExtra}\n  });\n});\n`;}

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
  const updated = [];
  for (const bp of specGeneration.blueprints) {
    const filename = slugToFilename(indexCounter, bp.slug, specGeneration.namingPattern);
    const fullPath = path.join(dir, filename);
    const desired = buildSpecContent(bp);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, desired, 'utf-8');
      created.push(filename);
    } else {
      const current = fs.readFileSync(fullPath, 'utf-8');
      if (current !== desired) {
        fs.writeFileSync(fullPath, desired, 'utf-8');
        updated.push(filename);
      }
    }
    indexCounter += 1;
  }
  if (created.length) {
    console.log(`Generated ${created.length} BDD spec(s):\n - ${created.join('\n - ')}`);
  }
  if (updated.length) {
    console.log(`Updated ${updated.length} BDD spec(s):\n - ${updated.join('\n - ')}`);
  }
  if (!created.length && !updated.length) {
    console.log('All blueprint specs already present and up to date.');
  }
}

// ESM entrypoint execution
const isDirect = process.argv[1] && process.argv[1].endsWith('generate-bdd-specs-from-plan.js');
if (isDirect) {
  ensureSpecs();
}
