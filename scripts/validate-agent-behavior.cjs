#!/usr/bin/env node
/**
 * Validates agent behavior against AGENT_SELF_GOVERNANCE_POLICY.json.
 * Checks for: generator scripts lacking manifest entries, governance markdown without hash header, duplicate authorities.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const POLICY_PATH = path.resolve(__dirname, '../docs/governance/AGENT_SELF_GOVERNANCE_POLICY.json');
const MANIFEST_PATH = path.resolve(__dirname, '../docs/governance/generated-docs-manifest.json');

function loadJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function listFiles(dir,acc=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const full = path.join(dir,entry.name);
    if(entry.isDirectory()) listFiles(full,acc); else acc.push(full);
  }
  return acc;
}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,'/');}

function main(){
  if(!fs.existsSync(POLICY_PATH)){ console.error('Policy missing'); process.exit(1); }
  const policy = loadJson(POLICY_PATH);
  const manifest = fs.existsSync(MANIFEST_PATH) ? loadJson(MANIFEST_PATH) : { generated: [] };
  const manifestSources = new Set(manifest.generated.map(g=> g.source));
  const manifestOutputs = new Set(manifest.generated.map(g=> g.output));

  const files = listFiles(ROOT);
  const generatorScripts = files.filter(f=>/scripts[\\/]+generate-.*\.(cjs|js|mjs)$/.test(f));
  const governanceMarkdown = files.filter(f=>/docs[\\/]governance[\\/].*\.md$/.test(f));
  const authorityJson = files.filter(f=>/docs[\\/]governance[\\/].*AUTHORITY.*\.json$/.test(f));

  let errors = 0; let warnings = 0;

  // Rule: generator must have manifest entry if produces markdown
  for(const gen of generatorScripts){
    // heuristic: look for same base name .md in governance dir
    const base = path.basename(gen).replace(/\.(cjs|js|mjs)$/,'');
    const produced = governanceMarkdown.filter(m=> m.includes(base.replace('generate-','')));
    if(produced.length && !produced.some(p=> manifestOutputs.has(rel(p)))){
      console.error('[ERROR] Generator without manifest entry:', rel(gen)); errors++;
    }
  }

  // Rule: governance markdown must have header if listed in manifest
  for(const md of governanceMarkdown){
    const content = fs.readFileSync(md,'utf8');
    const inManifest = manifestOutputs.has(rel(md));
    if(inManifest && !/GOVERNANCE: AUTO-GENERATED/.test(content)){
      console.error('[ERROR] Missing auto-generated header/hash:', rel(md)); errors++;
    }
    if(!inManifest && !/GOVERNANCE: AUTO-GENERATED/.test(content)){
      console.warn('[WARN] Orphan governance markdown (consider adding manifest or converting to JSON authority):', rel(md)); warnings++;
    }
  }

  // Rule: duplicate authority scope (simple hash of normalized purpose strings)
  const scopeMap = new Map();
  for(const auth of authorityJson){
    const json = loadJson(auth);
    const purpose = (json.preamble && json.preamble.purpose) || json.purpose || rel(auth);
    const key = purpose.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    if(scopeMap.has(key)){
      console.error('[ERROR] Potential duplicate authority scope:', rel(auth),'matches', scopeMap.get(key)); errors++;
    } else {
      scopeMap.set(key, rel(auth));
    }
  }

  if(process.env.ALLOW_AGENT_GOVERNANCE_BYPASS){
    const logPath = path.resolve(ROOT,'.logs/agent-bypass.log');
    const entry = { timestamp: new Date().toISOString(), reason: process.env.BYPASS_REASON||'unspecified', user: process.env.USER||'unknown', errors, warnings };
    fs.mkdirSync(path.dirname(logPath),{recursive:true});
    fs.appendFileSync(logPath, JSON.stringify(entry)+"\n");
    console.warn('[BYPASS] Agent governance bypass active; issues logged but not blocking.');
    process.exit(0);
  }

  if(errors){
    console.error(`Validation failed: ${errors} error(s), ${warnings} warning(s).`);
    process.exit(1);
  }
  console.log('Agent behavior validation passed.', warnings ? `${warnings} warning(s).` : 'No warnings.');
}

main();
