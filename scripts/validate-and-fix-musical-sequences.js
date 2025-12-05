#!/usr/bin/env node
// Script: validate-and-fix-musical-sequences.js
// Performs schema validation across discovered MusicalSequence JSON files,
// emits a machine-readable report (.generated/musical-sequence-validation-report.json)
// and runs best-effort auto-fixes on invalid files, then re-validates.

import fs from 'fs/promises';
import path from 'path';
import AjvModule from 'ajv';
import { fileURLToPath } from 'url';

const Ajv = (AjvModule && AjvModule.default) || AjvModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const SCHEMA_PATH = path.join(repoRoot, 'docs', 'schemas', 'musical-sequence.schema.json');
const REPORT_DIR = path.join(repoRoot, '.generated');
const REPORT_FILE = path.join(REPORT_DIR, 'musical-sequence-validation-report.json');

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

async function discoverPackageSequenceDirs(packagesRoot) {
  const dirs = [];
  try {
    const entries = await fs.readdir(packagesRoot, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const candidate = path.join(packagesRoot, ent.name, 'json-sequences');
      if (await pathExists(candidate)) dirs.push(candidate);
    }
  } catch {}
  return dirs;
}

function looksLikeMusicalSequence(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (Array.isArray(obj.movements)) return true;
  if (typeof obj.id === 'string' && typeof obj.name === 'string' && obj.movements) return true;
  if (obj.musicalSequence && typeof obj.musicalSequence === 'object') return true; // some files wrap under musicalSequence
  return false;
}

async function loadSchema() {
  const raw = await fs.readFile(SCHEMA_PATH, 'utf8');
  return JSON.parse(raw);
}

function toId(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/[#@\/\\]/g, '.')
    .replace(/[^a-z0-9.\-\s]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/[^a-z0-9.-]/g, '');
}

function toEventName(parts) {
  const joined = parts.filter(Boolean).join('.');
  return String(joined)
    .toLowerCase()
    .replace(/[#@\/\\]/g, '.')
    .replace(/[^a-z0-9.\-\s]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.|\.$/g, '');
}

async function backupFile(filePath) {
  // Backups disabled: rely on git/source control for history. Return null to preserve callers.
  return null;
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

function inferDomainIdFromPath(file) {
  const rel = path.relative(repoRoot, file).replace(/\\/g, '/');
  // If under packages/orchestration -> renderx-web-orchestration
  if (rel.startsWith('packages/orchestration')) return 'renderx-web-orchestration';
  // if under packages/<name> return that name
  const m = rel.match(/^packages\/([^/]+)\//);
  if (m) return m[1];
  // if under json-sequences/<plugin>/ -> plugin name
  const m2 = rel.match(/^json-sequences\/([^/]+)\//);
  if (m2) return m2[1];
  // fallback
  return 'renderx-web-orchestration';
}

function normalizeEventsField(json) {
  if (!('events' in json)) return { changed: false };
  const ev = json.events;
  if (Array.isArray(ev)) return { changed: false };
  // if object, gather nested arrays/strings into flat array
  if (ev && typeof ev === 'object') {
    const out = [];
    for (const k of Object.keys(ev)) {
      const v = ev[k];
      if (Array.isArray(v)) out.push(...v.map(String));
      else if (typeof v === 'string') out.push(v);
    }
    json.events = Array.from(new Set(out));
    return { changed: true };
  }
  // if string, wrap
  if (typeof ev === 'string') {
    json.events = [ev];
    return { changed: true };
  }
  // otherwise remove non-array field
  delete json.events;
  return { changed: true };
}

function applyBestEffortFixesToJson(json, file) {
  let changed = false;
  // allow wrapping under musicalSequence
  let root = json;
  const wrapped = Boolean(json.musicalSequence && typeof json.musicalSequence === 'object');
  if (wrapped) {
    root = json.musicalSequence;
  }

  // Ensure domainId
  if (!root.domainId) {
    root.domainId = inferDomainIdFromPath(file);
    changed = true;
  }

  if (!root.id) {
    if (root.sequenceId) { root.id = String(root.sequenceId); changed = true; }
    else if (root.name) { root.id = toId(root.name); changed = true; }
    else if (root.title) { root.id = toId(root.title); changed = true; }
    else { root.id = toId(path.basename(file, '.json')) || `seq-${Date.now()}`; changed = true; }
  }

  if (!root.name) {
    if (root.title) { root.name = root.title; changed = true; }
    else if (root.id) { root.name = root.id; changed = true; }
  }

  // Convert string userStory -> structured object
  if (typeof root.userStory === 'string') { root.userStory = { goal: root.userStory }; changed = true; }

  // Normalize events field
  const evRes = normalizeEventsField(root);
  if (evRes.changed) changed = true;

  if (Array.isArray(root.movements)) {
    for (let mi = 0; mi < root.movements.length; mi++) {
      const movement = root.movements[mi];
      if (!movement) continue;
      if (!movement.name && movement.title) { movement.name = movement.title; changed = true; }
      if (!movement.name) { movement.name = `movement-${mi+1}`; changed = true; }

      // Convert movement userStory string
      if (typeof movement.userStory === 'string') { movement.userStory = { goal: movement.userStory }; changed = true; }

      if (!Array.isArray(movement.beats)) continue;
      for (let bi = 0; bi < movement.beats.length; bi++) {
        const beat = movement.beats[bi];
        if (!beat || typeof beat !== 'object') continue;
        if (beat.beat == null && beat.number == null) { beat.beat = bi+1; changed = true; }
        else if (beat.beat == null && beat.number != null) { beat.beat = beat.number; changed = true; }
        else if (beat.number == null && beat.beat != null) { beat.number = beat.beat; changed = true; }

        // Convert beat userStory string
        if (typeof beat.userStory === 'string') { beat.userStory = { goal: beat.userStory }; changed = true; }

        if (!beat.event) {
          let handlerName = null;
          if (typeof beat.handler === 'string') handlerName = beat.handler;
          else if (beat.handler && typeof beat.handler === 'object') handlerName = beat.handler.name || beat.handler.id || null;
          const seqId = root.id || root.sequenceId || toId(path.basename(file, '.json'));
          const eventParts = [seqId, movement.name, beat.name || handlerName || `beat-${bi+1}`];
          beat.event = toEventName(eventParts);
          changed = true;
        }

        if (beat.acceptanceCriteriaStructured) {
          if (Array.isArray(beat.acceptanceCriteriaStructured)) {
            const newArr = beat.acceptanceCriteriaStructured.map(normalizeAcceptanceCriteriaStructured);
            beat.acceptanceCriteriaStructured = newArr;
            changed = true;
          } else if (typeof beat.acceptanceCriteriaStructured === 'object') {
            const normalized = normalizeAcceptanceCriteriaStructured(beat.acceptanceCriteriaStructured);
            beat.acceptanceCriteriaStructured = [normalized];
            changed = true;
          } else if (typeof beat.acceptanceCriteriaStructured === 'string') {
            beat.acceptanceCriteriaStructured = [{ given: [beat.acceptanceCriteriaStructured] }];
            changed = true;
          }
        }
      }
    }
  }
  // If original json wrapped musicalSequence, put back
  if (wrapped) {
    json.musicalSequence = root;
  } else {
    json = root;
  }
  return { json, changed };
}

async function fixFile(file) {
  let raw;
  try { raw = await fs.readFile(file, 'utf8'); } catch (err) { return { file, error: `read failed: ${err.message}` }; }
  let json;
  try { json = JSON.parse(raw); } catch (err) { return { file, error: `invalid JSON: ${err.message}` }; }

  const { json: newJson, changed } = applyBestEffortFixesToJson(json, file);
  if (!changed) return { file, changed: false };

  try {
    const bak = await backupFile(file);
    await fs.writeFile(file, JSON.stringify(newJson, null, 2) + '\n', 'utf8');
    return { file, changed: true, backup: bak };
  } catch (err) {
    return { file, error: `write failed: ${err.message}` };
  }
}

async function main() {
  console.log('?? Running validation and best-effort fixes for MusicalSequence JSON files');
  if (!(await pathExists(SCHEMA_PATH))) { console.error('? Schema file not found at', SCHEMA_PATH); process.exit(2); }
  const schema = await loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const fileSet = new Set();
  for (const root of DEFAULT_SEARCH_ROOTS) {
    if (!(await pathExists(root))) continue;
    if (root.endsWith(path.join('packages'))) {
      const pkgDirs = await discoverPackageSequenceDirs(root);
      for (const d of pkgDirs) {
        const files = await collectJsonFilesFromDir(d);
        files.forEach(f => fileSet.add(f));
      }
    } else {
      const files = await collectJsonFilesFromDir(root);
      files.forEach(f => fileSet.add(f));
    }
  }

  const allFiles = Array.from(fileSet).sort();
  if (allFiles.length === 0) { console.log('?? No candidate JSON files discovered'); return; }

  const report = {
    timestamp: new Date().toISOString(),
    totalScanned: allFiles.length,
    files: []
  };

  for (const f of allFiles) {
    const entry = { file: f, relative: path.relative(repoRoot, f), status: 'unknown', errors: null };
    let raw;
    try { raw = await fs.readFile(f, 'utf8'); } catch (err) { entry.status = 'read-error'; entry.errors = [err.message]; report.files.push(entry); continue; }
    let json;
    try { json = JSON.parse(raw); } catch (err) { entry.status = 'invalid-json'; entry.errors = [err.message]; report.files.push(entry); continue; }

    // allow wrapped musicalSequence
    const candidate = json.musicalSequence && typeof json.musicalSequence === 'object' ? json.musicalSequence : json;
    if (!looksLikeMusicalSequence(candidate)) { entry.status = 'skipped'; report.files.push(entry); continue; }

    const ok = validate(candidate);
    if (ok) {
      entry.status = 'valid';
      report.files.push(entry);
    } else {
      entry.status = 'invalid';
      entry.errors = (validate.errors || []).map(e => ({ path: e.instancePath || e.dataPath || '(root)', message: e.message }));
      report.files.push(entry);
    }
  }

  // ensure report dir
  try { await fs.mkdir(REPORT_DIR, { recursive: true }); } catch {}
  await fs.writeFile(REPORT_FILE, JSON.stringify({ ...report, phase: 'pre-fix' }, null, 2) + '\n', 'utf8');
  console.log(`?? Report written: ${path.relative(repoRoot, REPORT_FILE)}`);

  // Now attempt fixes on invalid files
  const invalidFiles = report.files.filter(f => f.status === 'invalid').map(f => f.file);
  const fixResults = [];
  for (const f of invalidFiles) {
    console.log(`???  Fixing: ${path.relative(repoRoot, f)}`);
    const res = await fixFile(f);
    fixResults.push(res);
    if (res.error) console.error(`   ? ${path.relative(repoRoot, f)}: ${res.error}`);
    else if (res.changed) console.log(`   ? Fixed (backup: ${res.backup ? path.relative(repoRoot, res.backup) : 'none'})`);
    else console.log(`   ??  No changes needed`);
  }

  // Re-validate the previously invalid files and update report
  for (const entry of report.files) {
    if (entry.status !== 'invalid') continue;
    const f = entry.file;
    try {
      const raw = await fs.readFile(f, 'utf8');
      const json = JSON.parse(raw);
      const candidate = json.musicalSequence && typeof json.musicalSequence === 'object' ? json.musicalSequence : json;
      const ok = validate(candidate);
      if (ok) {
        entry.status = 'fixed';
        entry.postFixErrors = null;
      } else {
        entry.status = 'still-invalid';
        entry.postFixErrors = (validate.errors || []).map(e => ({ path: e.instancePath || e.dataPath || '(root)', message: e.message }));
      }
    } catch (err) {
      entry.status = 'postfix-read-error';
      entry.postFixErrors = [String(err.message)];
    }
  }

  // Attach fixResults and write final report
  const finalReport = { ...report, phase: 'post-fix', fixResults };
  await fs.writeFile(REPORT_FILE, JSON.stringify(finalReport, null, 2) + '\n', 'utf8');
  console.log(`?? Final report written: ${path.relative(repoRoot, REPORT_FILE)}`);

  // summary
  const counts = finalReport.files.reduce((acc, f) => { acc[f.status] = (acc[f.status] || 0) + 1; return acc; }, {});
  console.log('\n?? Summary:');
  console.log(`   • Total scanned: ${finalReport.totalScanned}`);
  for (const [k,v] of Object.entries(counts)) console.log(`   • ${k}: ${v}`);
  console.log(`   • Fix attempts: ${fixResults.length}`);

  const remaining = finalReport.files.filter(f => f.status === 'still-invalid' || f.status === 'invalid');
  if (remaining.length) {
    console.error('\n? Remaining invalid files:');
    remaining.forEach(r => console.error(`   - ${r.relative} (${r.postFixErrors ? r.postFixErrors.length : (r.errors ? r.errors.length : 0)} errors)`));
    process.exit(1);
  }

  console.log('\n? All discovered MusicalSequence files validated or fixed');
}

main().catch(err => { console.error('?? Unexpected error:', err); process.exit(2); });
