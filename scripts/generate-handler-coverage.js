#!/usr/bin/env node
/**
 * Handler Coverage Extraction (placeholder)
 * Attempts to read coverage summary and compute handler test coverage percentage.
 * Output: .generated/handler-coverage.json
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OUT = path.join(ROOT,'.generated','handler-coverage.json');
// Common coverage summary locations
const CANDIDATES = [
  path.join(ROOT,'coverage','coverage-summary.json'),
  path.join(ROOT,'coverage','coverage-final.json'),
  path.join(ROOT,'coverage','lcov-report','index.html') // fallback parse maybe later
];

function exists(p){return fs.existsSync(p);} 

let coveragePercent = null;
for(const c of CANDIDATES){
  if(exists(c)){
    try {
      if(c.endsWith('.json')){
        const data = JSON.parse(fs.readFileSync(c,'utf-8'));
        // use lines pct if exists
        const pct = data.total?.lines?.pct ?? data.total?.statements?.pct;
        coveragePercent = typeof pct === 'number'? pct/100 : null;
      }
    } catch {}
    if(coveragePercent!==null) break;
  }
}

const report = { generatedAt: new Date().toISOString(), percent: coveragePercent, sourceFound: coveragePercent!==null };
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT, JSON.stringify(report,null,2));
console.log('[handler-coverage] Report written', OUT);
