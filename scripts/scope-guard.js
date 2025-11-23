#!/usr/bin/env node
/**
 * scope-guard.js
 * Validates path access (read/write) against PROJECT_SCOPE.json.
 * Usage: node scripts/scope-guard.js --mode=read --path="packages/self-healing/src/telemetry/emitter.ts"
 * Multiple paths: --path=a --path=b
 * Out-of-scope access requires environment variable ALLOW_OUT_OF_SCOPE=1
 */
import fs from 'fs';
import path from 'path';

// Audit log path
const AUDIT_LOG = path.join(process.cwd(), '.generated', 'scope-audit.log');

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'PROJECT_SCOPE.json');

function loadManifest(){
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH,'utf-8')); } catch(e){
    console.error('[scope-guard] Failed to load manifest:', e.message);
    process.exit(2);
  }
}

function toPosix(p){ return p.replace(/\\/g,'/'); }
function normalize(p){ return toPosix(path.relative(ROOT, path.resolve(ROOT, p))); }
function globToRegex(glob){
  // Escape regex special chars except * and **
  let re = glob.replace(/[.+^${}()|\\]/g,'\\$&');
  re = re.replace(/\*\*\//g,'(?:.+/)?');
  re = re.replace(/\*\*/g,'.+');
  re = re.replace(/\*/g,'[^/]*');
  return new RegExp('^' + re + '$');
}

function matchesAny(p, patterns){
  return patterns.some(g=>globToRegex(g).test(p));
}

function ensureGenerated(){
  const genDir = path.join(process.cwd(), '.generated');
  if(!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });
}

function logDecision(entry){
  try {
    ensureGenerated();
    fs.appendFileSync(AUDIT_LOG, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
  } catch(e){
    console.error('[scope-guard] Failed to write audit log:', e.message);
  }
}

function main(){
  const args = process.argv.slice(2);
  const modeArg = args.find(a=>a.startsWith('--mode='));
  const mode = (modeArg?.split('=')[1]||'read');
  const paths = args.filter(a=>a.startsWith('--path=')).map(a=>a.split('=')[1]);
  if(!paths.length){ console.error('[scope-guard] No paths provided'); process.exit(2); }
  const explain = args.some(a=>a === '--explain');
  const manifest = loadManifest();
  const allowRead = manifest.allowed.read;
  const allowWrite = manifest.allowed.write;
  const blocked = manifest.blocked || [];
  const confirmEnv = manifest.confirmationEnvVar || 'ALLOW_OUT_OF_SCOPE';
  const outOfScope = [];
  const evaluations = [];
  for(const raw of paths){
    const rel = normalize(raw);
    if(blocked.includes(rel)) { outOfScope.push({ path: rel, reason: 'blocked-explicit' }); evaluations.push({ path: rel, matched: false, reason: 'blocked-explicit', tested: { allow: mode==='write'?allowWrite:allowRead } }); continue; }
    const allowedSet = mode === 'write' ? allowWrite : allowRead;
    const matched = matchesAny(rel, allowedSet);
    if(!matched) {
      outOfScope.push({ path: rel, reason: 'not-matched' });
    }
    evaluations.push({ path: rel, matched, tested: { allow: allowedSet }, reason: matched ? 'ok' : 'not-matched' });
  }
  if(outOfScope.length){
    if(process.env[confirmEnv] === '1'){
      console.warn('[scope-guard] Out-of-scope access permitted via env override:', JSON.stringify(outOfScope));
      outOfScope.forEach(e=>logDecision({ outcome: 'override', mode, ...e }));
      process.exit(0);
    } else {
      console.error('[scope-guard] DENIED. Out-of-scope paths:', JSON.stringify(outOfScope,null,2));
      if(explain){
        console.error('[scope-guard] Evaluation trace:', JSON.stringify(evaluations,null,2));
      }
      console.error(`[scope-guard] Set ${confirmEnv}=1 to override intentionally.`);
      outOfScope.forEach(e=>logDecision({ outcome: 'denied', mode, ...e }));
      process.exit(3);
    }
  } else {
    console.log('[scope-guard] OK');
    evaluations.forEach(e=>logDecision({ outcome: 'ok', mode, ...e }));
    if(explain){
      console.log('[scope-guard] Evaluation trace:', JSON.stringify(evaluations,null,2));
    }
  }
}

if (process.argv[1].endsWith('scope-guard.js')) main();
