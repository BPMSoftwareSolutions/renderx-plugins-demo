#!/usr/bin/env node
/**
 * generate-bdd-stubs.js
 * Generates vitest test stubs from a business BDD spec JSON.
 * Usage: node scripts/generate-bdd-stubs.js <specPath> <outFile>
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function slug(s){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

const [,, specPath, outFile] = process.argv;
if(!specPath || !outFile){
  console.error('Usage: node scripts/generate-bdd-stubs.js <specPath> <outFile>');
  process.exit(1);
}

if(!fs.existsSync(specPath)){
  console.error('Spec file not found:', specPath);
  process.exit(1);
}

const raw = fs.readFileSync(specPath,'utf-8');
let spec;
try { spec = JSON.parse(raw); } catch(e){
  console.error('Failed to parse JSON spec:', e.message); process.exit(1);
}
if(!Array.isArray(spec.scenarios)){
  console.error('Spec missing scenarios array.'); process.exit(1);
}

const specHash = crypto.createHash('sha256').update(raw).digest('hex');
const header = `/**\n * AUTO-GENERATED BDD SCENARIO TEST STUBS\n * Source Spec: ${path.relative(process.cwd(), specPath)}\n * Source Hash: ${specHash}\n * Generated: ${new Date().toISOString()}\n * DO NOT EDIT MANUALLY - regenerate via: npm run generate:bdd:stubs:slo-dashboard\n */\n`;

const lines = [header, "import { describe, it } from 'vitest';", '', "describe('SLO Dashboard Business Scenarios', () => {"]; 

for(const scenario of spec.scenarios){
  const id = slug(scenario.title || 'scenario');
  const given = scenario.given?.replace(/`/g,'\\`') || 'N/A';
  const when = scenario.when?.replace(/`/g,'\\`') || 'N/A';
  const then = scenario.then?.replace(/`/g,'\\`') || 'N/A';
  lines.push(`  it('${id}', async () => {`);
  lines.push(`    // Given: ${given}`);
  lines.push(`    // When: ${when}`);
  lines.push(`    // Then: ${then}`);
  lines.push('    // TODO: Implement validation logic mapping business assertions to handler/unit checks');
  lines.push('  });');
  lines.push('');
}
lines.push('});');

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'));
console.log(`[bdd-stubs] Generated ${spec.scenarios.length} scenario stubs -> ${outFile}`);
