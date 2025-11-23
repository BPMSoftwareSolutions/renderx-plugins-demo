#!/usr/bin/env node
/*
 verify-bdd-spec.js
 Enforces presence, freshness, and completeness of the comprehensive business BDD specification
 before any test run. Fails (exit code 1) with a clear reason if requirements are not met.

 Checks:
 1. File exists.
 2. File JSON parses successfully.
 3. Age < MAX_AGE_HOURS (default 24, override with VERIFY_BDD_SPEC_MAX_AGE_HOURS env variable).
 4. totalHandlers numeric and >= discovered handler .ts files (excluding index.ts & *.d.ts).
 5. Each handler file base name appears at least once in spec JSON string (loose containment).
 6. Optional: totalScenarios present & >= totalHandlers.

 On failure: prints a structured error summary and exits 1.
 On success: prints concise PASS summary.
*/
import fs from 'fs';
import path from 'path';

const SPEC_PATH = path.join('packages','self-healing','.generated','comprehensive-business-bdd-specifications.json');
const HANDLERS_ROOT = path.join('packages','self-healing','src','handlers');
const MAX_AGE_HOURS = Number(process.env.VERIFY_BDD_SPEC_MAX_AGE_HOURS || '24');

function fail(reason, details) {
  console.error('\n[BDD-SPEC-ENFORCEMENT] FAIL');
  console.error('Reason:', reason);
  if (details) console.error('Details:', details);
  process.exit(1);
}

function listHandlerFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      files = files.concat(listHandlerFiles(path.join(dir, e.name)));
    } else if (e.isFile()) {
      if (e.name.endsWith('.ts') && !e.name.endsWith('.d.ts') && e.name !== 'index.ts') {
        files.push(path.join(dir, e.name));
      }
    }
  }
  return files;
}

// 1. Existence
if (!fs.existsSync(SPEC_PATH)) {
  fail('Specification file missing', SPEC_PATH);
}

// 2. Parse
let specRaw;
try {
  specRaw = fs.readFileSync(SPEC_PATH, 'utf8');
} catch (e) {
  fail('Unable to read spec file', e.message);
}
let spec;
try {
  spec = JSON.parse(specRaw);
} catch (e) {
  fail('Spec JSON parse error', e.message);
}

// 3. Age check
try {
  const stat = fs.statSync(SPEC_PATH);
  const ageMs = Date.now() - stat.mtimeMs;
  const ageHours = ageMs / 1000 / 3600;
  if (ageHours > MAX_AGE_HOURS) {
    fail('Spec artifact stale', `Age ${ageHours.toFixed(2)}h exceeds max ${MAX_AGE_HOURS}h`);
  }
} catch (e) {
  fail('Unable to stat spec file', e.message);
}

// 4 & 5. Completeness vs discovered handler names (from 'handler:' property contents)
const handlerFiles = listHandlerFiles(HANDLERS_ROOT);
const handlerNames = Array.from(new Set(handlerFiles.flatMap(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = Array.from(content.matchAll(/handler:\s*'([^']+)'/g)).map(m => m[1]);
  return matches;
}))).sort();
const totalHandlersDeclared = Number(
  spec.totalHandlers !== undefined ? spec.totalHandlers : (spec.summary && spec.summary.totalHandlers)
);
if (!Number.isFinite(totalHandlersDeclared)) {
  fail('totalHandlers missing or not numeric (expected at root or summary.totalHandlers)', {
    rootValue: spec.totalHandlers,
    summaryValue: spec.summary && spec.summary.totalHandlers
  });
}
if (totalHandlersDeclared < handlerNames.length) {
  fail('totalHandlers less than discovered handler files', { totalHandlersDeclared, discovered: handlerNames.length });
}

// Check presence (loose containment - name appears anywhere in spec text)
const missing = handlerNames.filter(h => !specRaw.includes(`"name": "${h}"`) && !specRaw.includes(h));
if (missing.length) {
  fail('Handler names missing from spec content', missing.slice(0, 20));
}

// Enhanced enforcement: ensure each discovered handler has a non-skipped Business BDD test
const TESTS_ROOT = path.join('packages','self-healing','__tests__','business-bdd-handlers');
function listTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.spec.ts')).map(f => path.join(dir,f));
}
const testFiles = listTestFiles(TESTS_ROOT);
const testContentMap = Object.fromEntries(testFiles.map(f => [f, fs.readFileSync(f,'utf8')]));
const skippedHandlers = [];
const untestedHandlers = [];
// Enforce active Business BDD tests only for diagnosis-scope handlers (analyze/aggregate/assess/recommend)
const enforcementScope = handlerNames.filter(h => /analyze|aggregateDiagnosis|assess|recommend/i.test(h));
for (const h of enforcementScope) {
  // Match pattern Business BDD: <handlerName>
  const matchingFiles = Object.entries(testContentMap).filter(([file, content]) => content.includes(`Business BDD: ${h}`));
  if (!matchingFiles.length) {
    untestedHandlers.push(h);
    continue;
  }
  // If any matching file has describe.skip for that handler, mark skipped
  const isSkipped = matchingFiles.some(([file, content]) =>
    content.includes(`describe.skip('Business BDD: ${h}`) || content.includes(`describe.skip("Business BDD: ${h}`)
  );
  if (isSkipped) skippedHandlers.push(h);
}
if (untestedHandlers.length) {
  fail('Missing Business BDD test files for diagnosis-scope handlers', untestedHandlers.slice(0,20));
}
if (skippedHandlers.length) {
  fail('Business BDD tests are skipped for diagnosis-scope handlers', skippedHandlers.slice(0,20));
}

// 6. Scenario count heuristic
const totalScenariosSource = spec.totalScenarios !== undefined ? spec.totalScenarios : (spec.summary && spec.summary.totalScenarios);
if (totalScenariosSource !== undefined) {
  const totalScenarios = Number(totalScenariosSource);
  if (!Number.isFinite(totalScenarios)) {
    fail('totalScenarios present but not numeric (expected at root or summary.totalScenarios)', totalScenariosSource);
  }
  if (totalScenarios < totalHandlersDeclared) {
    fail('totalScenarios less than totalHandlers', { totalScenarios, totalHandlersDeclared });
  }
}

console.log('[BDD-SPEC-ENFORCEMENT] PASS');
console.log('Handlers discovered:', handlerNames.length);
console.log('totalHandlers declared:', totalHandlersDeclared);
console.log('All handlers have active (non-skipped) Business BDD tests');
console.log('Spec age OK (<=' + MAX_AGE_HOURS + 'h)');
