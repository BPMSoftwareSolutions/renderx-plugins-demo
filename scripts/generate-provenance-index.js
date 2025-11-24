#!/usr/bin/env node
/**
 * Provenance Index Generator
 * Maps generated documentation artifacts to their authoritative JSON sources
 * and detects staleness (source modified after generated artifact).
 * Output JSON: .generated/provenance-index.json
 * Output Markdown: docs/generated/provenance-index.md
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const GENERATED_DIR = path.join(ROOT,'docs','generated');
const OUT_JSON = path.join(ROOT,'.generated','provenance-index.json');
const OUT_MD = path.join(GENERATED_DIR,'provenance-index.md');

const MAP = [
  { doc: 'orchestration-domains.md', source: 'orchestration-domains.json', kind: 'registry' },
  { doc: 'orchestration-audit-system-project-plan.md', source: 'orchestration-audit-system-project-plan.json', kind: 'plan' },
  { doc: 'unified-musical-sequence-interface.md', source: 'orchestration-domains.json', kind: 'interface' },
  { doc: 'orchestration-execution-flow.md', source: 'orchestration-domains.json', kind: 'execution-flow' }
];

function hashFile(file){
  const buf = fs.readFileSync(file);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function safeStat(file){
  try { return fs.statSync(file); } catch { return null; }
}

function buildIndex(){
  const entries = [];
  for(const item of MAP){
    const docPath = path.join(GENERATED_DIR,item.doc);
    const srcPath = path.join(ROOT,item.source);
    const docStat = safeStat(docPath);
    const srcStat = safeStat(srcPath);
    const docExists = !!docStat;
    const srcExists = !!srcStat;
    let staleness = false;
    let docHash = null, srcHash = null;
    if(docExists){ docHash = hashFile(docPath); }
    if(srcExists){ srcHash = hashFile(srcPath); }
    if(docExists && srcExists && srcStat.mtimeMs > docStat.mtimeMs){ staleness = true; }
    entries.push({
      doc: item.doc,
      source: item.source,
      kind: item.kind,
      docExists,
      sourceExists: srcExists,
      docHash,
      sourceHash: srcHash,
      staleness,
      docModified: docStat ? docStat.mtime.toISOString() : null,
      sourceModified: srcStat ? srcStat.mtime.toISOString() : null
    });
  }
  return entries;
}

function renderMarkdown(entries){
  const lines = ['# Provenance Index','', '> DO NOT EDIT. Generated from sources', '', '| Doc | Source | Kind | Stale | Doc Hash | Source Hash |', '|-----|--------|------|-------|----------|-------------|'];
  for(const e of entries){
    lines.push(`| ${e.doc} | ${e.source} | ${e.kind} | ${e.staleness ? 'YES':'NO'} | ${(e.docHash||'—').slice(0,12)} | ${(e.sourceHash||'—').slice(0,12)} |`);
  }
  return lines.join('\n')+'\n';
}

function main(){
  if(!fs.existsSync(path.dirname(OUT_JSON))) fs.mkdirSync(path.dirname(OUT_JSON),{recursive:true});
  if(!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR,{recursive:true});
  const entries = buildIndex();
  const payload = { generatedAt: new Date().toISOString(), entries };
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload,null,2));
  fs.writeFileSync(OUT_MD, renderMarkdown(entries));
  console.log('[provenance] Index written:', OUT_JSON, 'and markdown');
}

main();
