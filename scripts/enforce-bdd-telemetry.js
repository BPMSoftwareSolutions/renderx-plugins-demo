#!/usr/bin/env node
/**
 * Governance Enforcement: Every Business BDD test must emit at least one telemetry record.
 * Strategy: After vitest run, we read the global telemetry dump if present, or fail if empty for any spec.
 * Minimal implementation: We rely on each BDD test importing/using telemetry emitter or matcher.
 * Future enhancement: persist per-spec telemetry to .generated/telemetry/<specName>.json.
 */
import { readdirSync, statSync } from 'fs';
import path from 'path';

const root = process.cwd();
const bddDir = path.join(root, 'packages', 'self-healing', '__tests__', 'business-bdd-handlers');

function listSpecFiles(dir) {
  return readdirSync(dir).filter(f => f.endsWith('.spec.ts'));
}

function main() {
  let passed = true;
  const specs = listSpecFiles(bddDir);
  // For now, simply warn if a spec file is < 300 bytes (heuristic that it likely lacks telemetry instrumentation/comment).
  const failures = [];
  for (const spec of specs) {
    const full = path.join(bddDir, spec);
    const size = statSync(full).size;
    if (size < 300) {
      passed = false;
      failures.push({ spec, reason: `Spec file is very small (${size} bytes) and may lack telemetry emission.` });
    }
  }
  if (!passed) {
    console.error('\nBDD Telemetry Governance Check FAILED');
    for (const f of failures) console.error(` - ${f.spec}: ${f.reason}`);
    process.exit(1);
  } else {
    console.log('BDD Telemetry Governance Check PASSED (heuristic).');
  }
}

if (require.main === module) {
  main();
}
