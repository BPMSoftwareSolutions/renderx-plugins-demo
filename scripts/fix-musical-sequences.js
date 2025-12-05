// Script: fix-musical-sequences.js
// Attempt to auto-fix common MusicalSequence JSON schema violations:
// - Add missing top-level `id` from `sequenceId` or name
// - Add missing beat `event` derived from sequence/movement/beat/handler
// - Add missing numeric `beat` field if not present (1-based index)
// - Normalize acceptanceCriteria clauses to arrays
// - Backup files before writing

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
  // parts: array of strings
  const joined = parts.filter(Boolean).join('.');
  return String(joined)
    .toLowerCase()
    .replace(/[#@\/\\]/g, '.')
    .replace(/[^a-z0-9.\-\s]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.|\.$/g, '')
    ;
}

async function backupFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    const bak = `${filePath}.bak-${Date.now()}`;
    await fs.copyFile(filePath, bak);
    return bak;
  } catch (e) {
    return null;
  }
}

function normalizeAcceptanceCriteriaStructured(item) {
  if (!item || typeof item !== 'object') return item;
  const normalize = (v) => {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? x : String(x));
    if (typeof v === 'string') return [v];
    // If it's an object, attempt to extract string values into array
    if (typeof v === 'object') {
      try {
        // flatten values
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

async function fixFile(file) {
  let raw;
  try { raw = await fs.readFile(file, 'utf8'); } catch (err) { return { file, error: `read failed: ${err.message}` }; }
  let json;
  try { json = JSON.parse(raw); } catch (err) { return { file, error: `invalid JSON: ${err.message}` }; }

  let changed = false;

  // Ensure top-level id
  if (!json.id) {
    if (json.sequenceId) {
      json.id = String(json.sequenceId);
      changed = true;
    } else if (json.name) {
      json.id = toId(json.name);
      changed = true;
    } else {
      // fallback to filename
      json.id = toId(path.basename(file, '.json')) || `seq-${Date.now()}`;
      changed = true;
    }
  }

  // Ensure movements array and normalize beats
  if (Array.isArray(json.movements)) {
    for (let mi = 0; mi < json.movements.length; mi++) {
      const movement = json.movements[mi];
      if (!movement) continue;
      if (!movement.name) {
        movement.name = `movement-${mi+1}`;
        changed = true;
      }
      if (!Array.isArray(movement.beats)) continue;
      for (let bi = 0; bi < movement.beats.length; bi++) {
        const beat = movement.beats[bi];
        if (!beat || typeof beat !== 'object') continue;

        // Add numeric beat index if missing
        if (beat.beat == null && beat.number == null) {
          beat.beat = bi + 1;
          changed = true;
        } else if (beat.beat == null && beat.number != null) {
          beat.beat = beat.number;
          changed = true;
        } else if (beat.number == null && beat.beat != null) {
          beat.number = beat.beat;
          changed = true;
        }

        // Add event if missing
        if (!beat.event) {
          let handlerName = null;
          if (typeof beat.handler === 'string') handlerName = beat.handler;
          else if (beat.handler && typeof beat.handler === 'object') handlerName = beat.handler.name || beat.handler.id || null;

          const seqId = json.id || json.sequenceId || toId(path.basename(file, '.json'));
          const eventParts = [seqId, movement.name, beat.name || handlerName || `beat-${bi+1}`];
          beat.event = toEventName(eventParts);
          changed = true;
        }

        // Normalize acceptanceCriteria entries to arrays per clause
        if (beat.acceptanceCriteria) {
          if (Array.isArray(beat.acceptanceCriteria)) {
            const newArr = beat.acceptanceCriteria.map(normalizeAcceptanceCriteriaStructured);
            // detect change (simple stringify compare)
            if (JSON.stringify(newArr) !== JSON.stringify(beat.acceptanceCriteria)) {
              beat.acceptanceCriteria = newArr;
              changed = true;
            }
          } else if (typeof beat.acceptanceCriteria === 'object') {
            // Single object -> wrap in array
            const normalized = normalizeAcceptanceCriteriaStructured(beat.acceptanceCriteria);
            beat.acceptanceCriteria = [normalized];
            changed = true;
          } else if (typeof beat.acceptanceCriteria === 'string') {
            // wrap string into Given array
            beat.acceptanceCriteria = [{ given: [beat.acceptanceCriteria] }];
            changed = true;
          }
        }
      }
    }
  }

  if (!changed) return { file, changed: false };

  // Backup and write
  try {
    const bak = await backupFile(file);
    await fs.writeFile(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
    return { file, changed: true, backup: bak };
  } catch (err) {
    return { file, error: `write failed: ${err.message}` };
  }
}

async function main() {
  console.log('???  Fixing MusicalSequence JSON files (best-effort)');
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
  if (allFiles.length === 0) {
    console.log('??  No candidate JSON files discovered');
    return;
  }

  const results = [];
  for (const f of allFiles) {
    const res = await fixFile(f);
    results.push(res);
    if (res.error) console.error(`? ${path.relative(repoRoot, f)}: ${res.error}`);
    else if (res.changed) console.log(`? Fixed ${path.relative(repoRoot, f)} (backup: ${res.backup ? path.relative(repoRoot, res.backup) : 'none'})`);
  }

  const fixed = results.filter(r => r.changed).length;
  const failed = results.filter(r => r.error).length;
  console.log('\n?? Fix Summary:');
  console.log(`   • Files processed: ${results.length}`);
  console.log(`   • Files changed: ${fixed}`);
  console.log(`   • Errors: ${failed}`);
  console.log('\n??  Review backups (.bak-*) before committing changes');
}

main().catch(err => { console.error('?? Unexpected error:', err); process.exit(2); });
