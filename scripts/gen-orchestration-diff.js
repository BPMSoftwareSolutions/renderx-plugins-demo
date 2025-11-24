#!/usr/bin/env node
/**
 * Generate structural diff between previous orchestration-domains baseline and current.
 *
 * Outputs:
 *  - .generated/orchestration-domains-diff.json
 *  - .generated/ORCHESTRATION_DOMAINS_DIFF.md
 *  - Updates baseline: .generated/baselines/orchestration-domains.prev.json
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd());
const CURRENT_FILE = path.join(ROOT, 'orchestration-domains.json');
const GENERATED_DIR = path.join(ROOT, '.generated');
const BASELINE_DIR = path.join(GENERATED_DIR, 'baselines');
const BASELINE_FILE = path.join(BASELINE_DIR, 'orchestration-domains.prev.json');
const DIFF_JSON = path.join(GENERATED_DIR, 'orchestration-domains-diff.json');
const DIFF_MD = path.join(GENERATED_DIR, 'ORCHESTRATION_DOMAINS_DIFF.md');
const CHANGELOG = path.join(GENERATED_DIR, 'orchestration-evolution-changelog.md');

function ensureDir(d){ if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true}); }
function loadJson(file){ return JSON.parse(fs.readFileSync(file,'utf-8')); }
function safeLoad(file){ try { return loadJson(file); } catch(e){ return null; } }

function extractDomainShape(domain){
  return {
    id: domain.id,
    movements: domain.movements || 0,
    beats: domain.beats || 0,
    tempo: domain.tempo || null,
    key: domain.key || null,
    timeSignature: domain.timeSignature || null,
    category: domain.category || null
  };
}

function buildIndex(domains){
  const map = {};
  domains.forEach(d => { map[d.id] = extractDomainShape(d); });
  return map;
}

function diffDomains(prevIndex, currIndex){
  const added = []; const removed = []; const changed = []; const unchanged = [];
  const domainChanges = {};
  const prevIds = new Set(Object.keys(prevIndex));
  const currIds = new Set(Object.keys(currIndex));

  // Added / changed / unchanged
  for(const id of currIds){
    if(!prevIds.has(id)) {
      added.push(id);
      domainChanges[id] = { status: 'added', after: currIndex[id] };
      continue;
    }
    const prev = prevIndex[id];
    const curr = currIndex[id];
    const movementsDelta = (curr.movements||0) - (prev.movements||0);
    const beatsDelta = (curr.beats||0) - (prev.beats||0);
    const metadataChanged = prev.tempo !== curr.tempo || prev.key !== curr.key || prev.timeSignature !== curr.timeSignature;
    if(movementsDelta !== 0 || beatsDelta !== 0 || metadataChanged){
      changed.push(id);
      domainChanges[id] = { status: 'changed', before: prev, after: curr, diff: { movementsDelta, beatsDelta, metadataChanged } };
    } else {
      unchanged.push(id);
    }
  }
  // Removed
  for(const id of prevIds){
    if(!currIds.has(id)) {
      removed.push(id);
      domainChanges[id] = { status: 'removed', before: prevIndex[id] };
    }
  }
  return { added, removed, changed, unchanged, domainChanges };
}

function writeJson(file, obj){ fs.writeFileSync(file, JSON.stringify(obj, null, 2),'utf-8'); }

function renderMarkdown(diff){
  const { summary, addedDomains, removedDomains, changedDomains, domainChanges } = diff;
  let md = '# Orchestration Domains Structural Diff\n\n';
  md += `Generated At: ${diff.generatedAt}\n\n`;
  md += '## Summary\n\n';
  md += '| Metric | Value |\n|--------|-------|\n';
  md += `| Domains Before | ${summary.domainsTotalBefore} |\n`;
  md += `| Domains After | ${summary.domainsTotalAfter} |\n`;
  md += `| Added | ${summary.added} |\n`;
  md += `| Removed | ${summary.removed} |\n`;
  md += `| Changed | ${summary.changed} |\n`;
  md += `| Unchanged | ${summary.unchanged} |\n\n`;

  if(addedDomains.length){
    md += '## Added Domains\n\n| Domain | Movements | Beats | Tempo | Key | TimeSig |\n|--------|-----------|-------|-------|-----|---------|\n';
    addedDomains.forEach(id => {
      const a = domainChanges[id].after;
      md += `| ${id} | ${a.movements} | ${a.beats} | ${a.tempo||''} | ${a.key||''} | ${a.timeSignature||''} |\n`;
    });
    md += '\n';
  }
  if(removedDomains.length){
    md += '## Removed Domains\n\n| Domain | Movements | Beats | Tempo | Key | TimeSig |\n|--------|-----------|-------|-------|-----|---------|\n';
    removedDomains.forEach(id => {
      const a = domainChanges[id].before;
      md += `| ${id} | ${a.movements} | ${a.beats} | ${a.tempo||''} | ${a.key||''} | ${a.timeSignature||''} |\n`;
    });
    md += '\n';
  }
  if(changedDomains.length){
    md += '## Changed Domains\n\n| Domain | Movements Δ | Beats Δ | Metadata Changed |\n|--------|-------------|---------|------------------|\n';
    changedDomains.forEach(id => {
      const d = domainChanges[id].diff;
      md += `| ${id} | ${d.movementsDelta} | ${d.beatsDelta} | ${d.metadataChanged ? 'yes':'no'} |\n`;
    });
    md += '\n';
  }

  md += '## Governance Actions\n\n';
  if(addedDomains.length){ md += '- Lock new domains and regenerate docs.\n'; }
  if(changedDomains.length){ md += '- Verify updated movement/beat counts in ASCII sketches.\n'; }
  if(removedDomains.length){ md += '- Remove orphaned documentation sections and integrity locks.\n'; }
  if(!addedDomains.length && !changedDomains.length && !removedDomains.length){ md += '- No structural changes detected; no governance action required.\n'; }

  md += '\n---\n\nDO NOT EDIT — GENERATED\n';
  return md;
}

function appendChangelog(diff){
  const lines = [];
  const ts = diff.generatedAt;
  const { addedDomains, removedDomains, changedDomains } = diff;
  if(!addedDomains.length && !removedDomains.length && !changedDomains.length) return; // no entry
  lines.push(`### ${ts}`);
  if(addedDomains.length) lines.push(`Added: ${addedDomains.join(', ')}`);
  if(removedDomains.length) lines.push(`Removed: ${removedDomains.join(', ')}`);
  if(changedDomains.length) lines.push(`Changed: ${changedDomains.join(', ')}`);
  lines.push('');
  const entry = lines.join('\n');
  fs.appendFileSync(CHANGELOG, entry, 'utf-8');
}

function main(){
  console.log('🔍 Generating orchestration domains structural diff...');
  ensureDir(GENERATED_DIR); ensureDir(BASELINE_DIR);
  if(!fs.existsSync(CURRENT_FILE)) { console.error('Current orchestration-domains.json missing'); process.exit(1); }
  const current = loadJson(CURRENT_FILE);
  const previous = safeLoad(BASELINE_FILE);
  const currDomains = current.domains || [];
  const prevDomains = previous ? (previous.domains || []) : [];
  const prevIndex = buildIndex(prevDomains);
  const currIndex = buildIndex(currDomains);
  const diffCore = diffDomains(prevIndex, currIndex);
  const summary = {
    domainsTotalBefore: prevDomains.length,
    domainsTotalAfter: currDomains.length,
    added: diffCore.added.length,
    removed: diffCore.removed.length,
    changed: diffCore.changed.length,
    unchanged: diffCore.unchanged.length
  };
  const diff = {
    generatedAt: new Date().toISOString(),
    baselineExists: !!previous,
    previousGeneratedAt: previous?.metadata?.generated || null,
    summary,
    addedDomains: diffCore.added,
    removedDomains: diffCore.removed,
    changedDomains: diffCore.changed,
    domainChanges: diffCore.domainChanges
  };
  writeJson(DIFF_JSON, diff);
  fs.writeFileSync(DIFF_MD, renderMarkdown(diff),'utf-8');
  appendChangelog(diff);
  // Update baseline AFTER diff
  writeJson(BASELINE_FILE, current);
  console.log('✅ Diff JSON:', path.relative(ROOT, DIFF_JSON));
  console.log('✅ Diff Markdown:', path.relative(ROOT, DIFF_MD));
  console.log('✅ Baseline Updated:', path.relative(ROOT, BASELINE_FILE));
  console.log('✨ Done');
}

// Execute immediately when invoked as a script
try { main(); } catch(e){ console.error('❌ Diff generation failed', e); process.exit(1); }
