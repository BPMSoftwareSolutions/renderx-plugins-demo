#!/usr/bin/env node
/**
 * verify-bdd-assertion-completeness.js
 * Enforces minimum implementation progress for the SLO dashboard generated BDD scenario tests.
 * Focus: Detect excessive TODO placeholders indicating missing business assertion coverage.
 *
 * Heuristics:
 *  - Count total test cases (it(...)).
 *  - Count test cases still containing a canonical TODO marker.
 *  - Compute TODO ratio.
 *  - Warn if any implemented test lacks an expect(...).
 *
 * Environment overrides:
 *  - ASSERTION_COMPLETENESS_MAX_TODO_RATIO (default 0.70)
 *  - ASSERTION_COMPLETENESS_MIN_IMPLEMENTED (default 1)
 *  - ASSERTION_COMPLETENESS_FILE (optional path override)
 *  - ASSERTION_COMPLETENESS_STRICT=1 (fail on warnings)
 *
 * Exit codes:
 *  0 pass
 *  1 failure
 */
import fs from 'fs';
import path from 'path';

const STRICT = process.env.ASSERTION_COMPLETENESS_STRICT === '1';
// Tightened threshold post initial enrichment (was 0.70)
const MAX_TODO_RATIO = Number(process.env.ASSERTION_COMPLETENESS_MAX_TODO_RATIO || '0.40');
const MIN_IMPLEMENTED = Number(process.env.ASSERTION_COMPLETENESS_MIN_IMPLEMENTED || '1');
const FILE = process.env.ASSERTION_COMPLETENESS_FILE || path.join('packages','slo-dashboard','__tests__','business-bdd','slo-dashboard-scenarios.generated.spec.ts');

function fail(reason, details){
  console.error('\n[assertion-completeness] FAIL');
  console.error('Reason:', reason);
  if(details) console.error('Details:', details);
  process.exit(1);
}

if(!fs.existsSync(FILE)){
  fail('Scenario test file missing', FILE);
}
const content = fs.readFileSync(FILE,'utf-8');
const testMatches = Array.from(content.matchAll(/\bit\(\s*['"]/g));
const totalTests = testMatches.length;
if(totalTests === 0){
  fail('No test cases detected (it(...)) in file', FILE);
}
const todoRegex = /TODO: Implement validation logic mapping business assertions to handler\/unit checks/gi;
const todos = Array.from(content.matchAll(todoRegex)).length;
const implemented = totalTests - todos;
const todoRatio = todos / totalTests;

// Detect implemented tests lacking expect(
// Approach: naive split by it( and inspect body for expect(
const segments = content.split(/\bit\(/g).slice(1); // discard preamble
let missingExpect = 0;
segments.forEach(seg => {
  const hasTodo = /TODO: Implement validation logic/i.test(seg);
  if(!hasTodo){
    if(!/expect\s*\(/.test(seg)) missingExpect++;
  }
});

let warnings = [];
if(todoRatio > MAX_TODO_RATIO){
  warnings.push(`TODO ratio ${(todoRatio*100).toFixed(1)}% exceeds max ${(MAX_TODO_RATIO*100).toFixed(1)}%`);
}
if(implemented < MIN_IMPLEMENTED){
  warnings.push(`Implemented scenarios ${implemented} below minimum ${MIN_IMPLEMENTED}`);
}
if(missingExpect){
  warnings.push(`Implemented tests missing expect(): ${missingExpect}`);
}

if(warnings.length && (STRICT || todoRatio > MAX_TODO_RATIO || implemented < MIN_IMPLEMENTED)){
  fail('Assertion completeness below threshold', { totalTests, todos, implemented, todoRatio: todoRatio.toFixed(3), warnings });
}

console.log('[assertion-completeness] PASS');
console.log('Total tests:', totalTests);
console.log('Implemented:', implemented);
console.log('TODO placeholders:', todos);
console.log('TODO ratio:', (todoRatio*100).toFixed(1)+'%');
if(warnings.length){
  console.log('Warnings:', warnings);
}
