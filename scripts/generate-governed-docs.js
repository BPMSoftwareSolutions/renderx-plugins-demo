#!/usr/bin/env node
/**
 * generate-governed-docs.js
 * Wraps existing documentation generators, adds provenance banners, updates knowledge-index.json with doc outputs.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function loadJSON(p){ try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return null; } }
function writeJSON(p,obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)+'\n', 'utf8'); }
function sha256(content){ return crypto.createHash('sha256').update(content).digest('hex'); }

const governanceSpecPath = path.join(ROOT, 'governance', 'json-doc-governance-spec.json');
const knowledgeIndexPath = path.join(ROOT, 'knowledge-index.json');
const docsDir = path.join(ROOT, 'docs', 'generated');

function ensureDir(d){ if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); }

function collectCanonicalSources(spec){
  const patterns = spec.canonicalSourcePatterns || [];
  // Very lightweight glob subset: convert ** to simple recursion and * to wildcard match.
  const results = [];
  function walk(dir){
    const entries = fs.readdirSync(dir); 
    for(const e of entries){
      const full = path.join(dir,e);
      const stat = fs.statSync(full);
      if(stat.isDirectory()){ walk(full); continue; }
      for(const pattern of patterns){
        // naive match: replace **/ with '', treat * as wildcard segment
        const regex = new RegExp('^'+pattern
          .replace(/\./g,'\\.')
          .replace(/\*\*/g,'.*')
          .replace(/\*/g,'[^/]*')+'$');
        const rel = path.relative(ROOT, full).replace(/\\/g,'/');
        if(regex.test(rel)){ results.push(rel); break; }
      }
    }
  }
  walk(ROOT);
  return Array.from(new Set(results));
}

function updateKnowledgeIndex(index, canonicalFiles){
  const existing = index.sources || [];
  const map = new Map(existing.map(s=>[s.path,s]));
  for(const f of canonicalFiles){
    if(!map.has(f)) {
      map.set(f, { id: path.basename(f).replace(/\.json$/,''), path: f, layer: null, type: 'canonical', hash: null, lastModified: null, docs: [] });
    }
  }
  index.sources = Array.from(map.values()).sort((a,b)=>a.path.localeCompare(b.path));
  for(const s of index.sources){
    const abs = path.join(ROOT, s.path);
    if(fs.existsSync(abs)){
      const content = fs.readFileSync(abs,'utf8');
      s.hash = sha256(content);
      s.lastModified = fs.statSync(abs).mtime.toISOString();
    }
  }
  index.generated = new Date().toISOString();
  return index;
}

function addProvenanceBanner(filePath, sources, governance){
  const original = fs.readFileSync(filePath,'utf8');
  const docHash = sha256(original);
  const sourceHashes = sources.map(s=>`${s.path}:${s.hash}`).join(', ');
  const banner = governance.provenanceBanner.template
    .replace('{{sources}}', sources.map(s=>s.path).join(', '))
    .replace('{{sourceHashes}}', sourceHashes)
    .replace('{{docHash}}', docHash)
    .replace('{{generated}}', new Date().toISOString());
  const withBanner = banner + '\n\n' + original.replace(/^[\s\r\n]*/, '');
  fs.writeFileSync(filePath, withBanner, 'utf8');
  return docHash;
}

async function run(){
  console.log('[governed-docs] Start');
  const governance = loadJSON(governanceSpecPath);
  if(!governance){ console.error('Missing governance spec'); process.exit(1); }
  let index = loadJSON(knowledgeIndexPath) || { version:1, sources: [] };
  const canonicalFiles = collectCanonicalSources(governance);
  index = updateKnowledgeIndex(index, canonicalFiles);
  ensureDir(docsDir);
  // Invoke existing generators if present
  const sysGen = path.join(ROOT,'scripts','generate-system-documentation.js');
  const advGen = path.join(ROOT,'scripts','generate-advanced-documentation.js');
  for(const gen of [sysGen, advGen]){
    if(fs.existsSync(gen)) {
      console.log('[governed-docs] run', path.basename(gen));
      await import('file://'+gen); // they self-execute
    }
  }
  // Wait for async generation completion (poll for stable modification times)
  function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
  async function waitForDocs(){
    const expected = ['SYSTEM_OVERVIEW.md','SYSTEM_ARCHITECTURE.md'];
    let stableCount = 0; let lastSnapshot = null;
    for(let i=0;i<15;i++){ // up to ~1.5s
      const files = fs.existsSync(docsDir)?fs.readdirSync(docsDir).filter(f=>f.endsWith('.md')):[];
      if(expected.every(e=>files.includes(e))){
        const snapshot = files.map(f=>({f, m: fs.statSync(path.join(docsDir,f)).mtimeMs}));
        if(lastSnapshot){
          const changed = snapshot.some(s=>{
            const prev = lastSnapshot.find(p=>p.f===s.f); return !prev || prev.m!==s.m;
          });
          if(!changed){ stableCount++; } else { stableCount=0; }
          if(stableCount>=2) break; // two stable polls
        }
        lastSnapshot = snapshot;
      }
      await sleep(100);
    }
  }
  await waitForDocs();
  // Apply provenance to generated markdown files.
  const mdFiles = fs.existsSync(docsDir) ? fs.readdirSync(docsDir).filter(f=>f.endsWith('.md')) : [];
  const sourceMeta = index.sources.map(s=>({ path: s.path, hash: s.hash }));
  for(const md of mdFiles){
    const abs = path.join(docsDir, md);
    const docHash = addProvenanceBanner(abs, sourceMeta.slice(0, Math.min(sourceMeta.length, 10)), governance); // limit list for size
    // register doc against first canonical for now (simplified linkage)
    if(index.sources.length){
      index.sources[0].docs.push({ file: path.relative(ROOT, abs), hash: docHash, generated: new Date().toISOString() });
    }
  }
  writeJSON(knowledgeIndexPath, index);
  console.log('[governed-docs] Complete');
}

run().catch(e=>{ console.error('Failed generate governed docs', e); process.exit(1); });
