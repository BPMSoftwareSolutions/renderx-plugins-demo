#!/usr/bin/env node
/**
 * Canonical Hash Report Generator
 * Computes raw vs canonical hashes for governed JSON artifacts, excluding
 * volatile fields (integrity blocks, timestamps) to eliminate false drift.
 * Output: .generated/canonical-hash-report.json
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, '.generated');
const OUT_FILE = path.join(OUT_DIR, 'canonical-hash-report.json');

const ARTIFACTS = [
  'orchestration-domains.json',
  '.generated/context-tree-orchestration-audit-session.json',
  'orchestration-audit-system-project-plan.json'
];

function stableStringify(obj){
  return JSON.stringify(sortDeep(obj), (k,v)=>v, 0); // already sorted
}

function sortDeep(value){
  if(Array.isArray(value)) return value.map(sortDeep);
  if(value && typeof value === 'object'){
    return Object.keys(value).sort().reduce((acc,k)=>{acc[k]=sortDeep(value[k]);return acc;},{});
  }
  return value;
}

function sha256(str){return crypto.createHash('sha256').update(str).digest('hex');}

const VOLATILE_KEYS = new Set([
  'generatedAt','lastUpdated','updatedAt','timestamp'
]);

function stripCanonical(obj){
  if(Array.isArray(obj)) return obj.map(stripCanonical);
  if(obj && typeof obj === 'object'){
    const out = {};
    for(const k of Object.keys(obj)){
      if(k === 'integrity') continue; // remove entire integrity block
      if(VOLATILE_KEYS.has(k)) continue; // remove volatile timestamps
      out[k] = stripCanonical(obj[k]);
    }
    return out;
  }
  return obj;
}

function isJsonFile(p){return p.endsWith('.json');}

function loadJson(file){return JSON.parse(fs.readFileSync(file,'utf-8'));}

function compute(file){
  const raw = loadJson(file);
  const rawStr = stableStringify(raw);
  const rawHash = sha256(rawStr);
  const canonical = stripCanonical(raw);
  const canonicalStr = stableStringify(canonical);
  const canonicalHash = sha256(canonicalStr);
  return {raw, canonical, rawHash, canonicalHash, removedKeys: Array.from(VOLATILE_KEYS)};
}

function main(){
  if(!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR,{recursive:true});
  const report = { generatedAt: new Date().toISOString(), artifacts: [] };
  for(const rel of ARTIFACTS){
    const abs = path.join(ROOT, rel);
    if(!fs.existsSync(abs)){
      report.artifacts.push({file: rel, missing: true});
      continue;
    }
    try {
      const result = compute(abs);
      report.artifacts.push({
        file: rel,
        rawHash: result.rawHash,
        canonicalHash: result.canonicalHash,
        driftFalsePositive: result.rawHash !== result.canonicalHash,
        canonicalHashEqualsRaw: result.rawHash === result.canonicalHash,
        removedKeys: result.removedKeys,
        integrityPresent: !!result.raw.integrity,
        sizeRaw: stableStringify(result.raw).length,
        sizeCanonical: stableStringify(result.canonical).length
      });
    } catch(e){
      report.artifacts.push({file: rel, error: String(e)});
    }
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(report,null,2));
  console.log('[canonical-hash] Report written:', OUT_FILE);
}

main();
