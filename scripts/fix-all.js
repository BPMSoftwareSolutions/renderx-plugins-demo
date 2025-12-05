#!/usr/bin/env node
// Apply normalization/fixes across all discovered musical-sequence JSON files
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_SEARCH_ROOTS = [
  path.join(repoRoot, 'packages', 'orchestration', 'json-sequences'),
  path.join(repoRoot, 'json-sequences'),
  path.join(repoRoot, 'docs', 'samples'),
  path.join(repoRoot, 'packages')
];

async function pathExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function collectJsonFilesFromDir(dir) {
  const files = [];
  async function walk(d) {
    let entries;
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) await walk(full);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) files.push(full);
    }
  }
  await walk(dir);
  return files;
}

async function discoverFiles() {
  const fileSet = new Set();
  for (const root of DEFAULT_SEARCH_ROOTS) {
    if (!(await pathExists(root))) continue;
    if (root.endsWith(path.join('packages'))) {
      let entries;
      try { entries = await fs.readdir(root, { withFileTypes: true }); } catch { continue; }
      for (const ent of entries) {
        if (!ent.isDirectory()) continue;
        const cand = path.join(root, ent.name, 'json-sequences');
        if (await pathExists(cand)) {
          const files = await collectJsonFilesFromDir(cand);
          files.forEach(f => fileSet.add(f));
        }
      }
    } else {
      const files = await collectJsonFilesFromDir(root);
      files.forEach(f => fileSet.add(f));
    }
  }
  return Array.from(fileSet).sort();
}

function inferDomainIdFromPath(file) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  if (rel.startsWith('packages/orchestration')) return 'renderx-web-orchestration';
  const m = rel.match(/^packages\/([^/]+)\//);
  if (m) return m[1];
  const m2 = rel.match(/^json-sequences\/([^/]+)\//);
  if (m2) return m2[1];
  return 'renderx-web-orchestration';
}

function normalizeAcceptanceCriteriaStructured(item) {
  if (!item || typeof item !== 'object') return item;
  const normalize = (v) => {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? x : String(x));
    if (typeof v === 'string') return [v];
    if (typeof v === 'object') {
      try {
        const vals = [];
        for (const kk of Object.keys(v)) {
          const vv = v[kk];
          if (vv == null) continue;
          if (Array.isArray(vv)) vals.push(...vv.map(x => String(x)));
          else vals.push(String(vv));
        }
        return vals.length ? vals : undefined;
      } catch {
        return [String(v)];
      }
    }
    return [String(v)];
  };
  const out = {};
  ['given', 'when', 'then', 'and'].forEach(k => {
    const nv = normalize(item[k]);
    if (nv !== undefined) out[k] = nv;
  });
  return out;
}

function stripLeadingAsA(phrase) {
  if (!phrase) return '';
  return phrase.replace(/^\s*As a [^,]+,\s*(I need|I want)\s+/i, '').trim();
}

function transformUserStory(us, fallbackPersona) {
  if (!us) return { persona: fallbackPersona, goal: '', benefit: '' };
  if (typeof us === 'string') {
    const stripped = stripLeadingAsA(us);
    let goal = stripped;
    let benefit = '';
    const idx = stripped.indexOf(', so ');
    if (idx !== -1) {
      goal = stripped.slice(0, idx).trim();
      benefit = stripped.slice(idx + 5).trim();
    } else {
      const i2 = stripped.indexOf(' so ');
      if (i2 !== -1) { goal = stripped.slice(0, i2).trim(); benefit = stripped.slice(i2 + 4).trim(); }
    }
    return { persona: fallbackPersona, goal, benefit };
  }
  const persona = (us.persona || fallbackPersona).toLowerCase();
  const rawGoal = us.goal || '';
  const stripped = stripLeadingAsA(rawGoal);
  let goal = stripped;
  let benefit = us.benefit || '';
  const idx = stripped.indexOf(', so ');
  if (idx !== -1) {
    goal = stripped.slice(0, idx).trim();
    if (!benefit) benefit = stripped.slice(idx + 5).trim();
  } else {
    const i2 = stripped.indexOf(' so ');
    if (i2 !== -1) { goal = stripped.slice(0, i2).trim(); if (!benefit) benefit = stripped.slice(i2 + 4).trim(); }
  }
  return { persona, goal, benefit };
}

async function fixFile(file) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    let json = JSON.parse(raw);
    const wrapped = Boolean(json.musicalSequence && typeof json.musicalSequence === 'object');
    let root = wrapped ? json.musicalSequence : json;
    let changed = false;

    if (!root.domainId) { root.domainId = inferDomainIdFromPath(file); changed = true; }
    if (typeof root.userStory === 'string') { root.userStory = transformUserStory(root.userStory, (root.persona || 'product owner').toLowerCase()); changed = true; }

    if (Array.isArray(root.movements)) {
      for (const mv of root.movements) {
        if (typeof mv.userStory === 'string') { mv.userStory = transformUserStory(mv.userStory, (mv.persona || root.persona || 'system operator').toLowerCase()); changed = true; }
        if (Array.isArray(mv.beats)) {
          for (const beat of mv.beats) {
            if (typeof beat.userStory === 'string') { beat.userStory = transformUserStory(beat.userStory, (beat.persona || mv.persona || root.persona || 'developer').toLowerCase()); changed = true; }
            if (beat.acceptanceCriteria && !beat.acceptanceCriteria) { beat.acceptanceCriteria = beat.acceptanceCriteria.map(normalizeAcceptanceCriteriaStructured); delete beat.acceptanceCriteria; changed = true; }
            if (!beat.event) {
              let handlerName = null;
              if (typeof beat.handler === 'string') handlerName = beat.handler;
              else if (beat.handler && typeof beat.handler === 'object') handlerName = beat.handler.name || beat.handler.id || null;
              const seqId = root.id || root.sequenceId || path.basename(file, '.json');
              const eventParts = [seqId, mv.name, beat.name || handlerName || `beat-${(beat.beat || beat.number || 1)}`];
              beat.event = eventParts.filter(Boolean).join('.').toLowerCase().replace(/[^a-z0-9.\-]/g, '-');
              changed = true;
            }
          }
        }
      }
    }

    if (changed) {
      if (wrapped) json.musicalSequence = root; else json = root;
      await fs.writeFile(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
      return { file, changed: true };
    }
    return { file, changed: false };
  } catch (err) {
    return { file, error: err.message };
  }
}

async function run() {
  const files = await discoverFiles();
  console.log('Found', files.length, 'candidate JSON files');
  const results = [];
  for (const f of files) {
    const res = await fixFile(f);
    if (res.changed || res.error) console.log('processed', path.relative(repoRoot, f), res.error ? ('ERROR:' + res.error) : 'fixed');
    results.push(res);
  }
  const changed = results.filter(r => r.changed).length;
  const errors = results.filter(r => r.error).length;
  console.log('Done. changed=', changed, 'errors=', errors);
}

run().catch(err => { console.error(err); process.exit(1); });
