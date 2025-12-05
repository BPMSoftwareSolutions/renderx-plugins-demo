// Script: validate-musical-sequences.js
// Validates all discovered MusicalSequence JSON files against
// docs/schemas/musical-sequence.schema.json using Ajv.

import fs from 'fs/promises';
import path from 'path';
import AjvModule from 'ajv';
import { fileURLToPath } from 'url';

const Ajv = (AjvModule && AjvModule.default) || AjvModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const SCHEMA_PATH = path.join(repoRoot, 'docs', 'schemas', 'musical-sequence.schema.json');

// Default places to look for sequence JSONs
const DEFAULT_SEARCH_ROOTS = [
  path.join(repoRoot, 'packages', 'orchestration', 'json-sequences'),
  path.join(repoRoot, 'json-sequences'),
  path.join(repoRoot, 'docs', 'samples'),
  path.join(repoRoot, 'packages') // we'll explore packages/*/json-sequences
];

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function collectJsonFilesFromDir(dir) {
  const files = [];
  async function walk(d) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.json')) {
        files.push(full);
      }
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
  } catch {
    // ignore
  }
  return dirs;
}

function looksLikeMusicalSequence(obj) {
  if (!obj || typeof obj !== 'object') return false;
  // Basic heuristics: top-level movements array and id or name
  if (Array.isArray(obj.movements)) return true;
  if (typeof obj.id === 'string' && typeof obj.name === 'string' && obj.movements) return true;
  return false;
}

async function loadSchema() {
  const raw = await fs.readFile(SCHEMA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  console.log('?? Validating MusicalSequence JSON files against schema');

  if (!(await pathExists(SCHEMA_PATH))) {
    console.error('? Schema file not found at', SCHEMA_PATH);
    process.exit(2);
  }

  const schema = await loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  // Build list of files to validate
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
    console.log('??  No candidate JSON files discovered to validate');
    process.exit(0);
  }

  let total = 0;
  let validated = 0;
  let skipped = 0;
  const failures = [];

  for (const f of allFiles) {
    total++;
    let raw;
    try {
      raw = await fs.readFile(f, 'utf8');
    } catch (err) {
      console.warn(`   ??  Could not read ${f}: ${err.message}`);
      continue;
    }

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.warn(`   ??  Skipping invalid JSON file ${f}: ${err.message}`);
      skipped++;
      continue;
    }

    // Only validate objects that look like MusicalSequence
    if (!looksLikeMusicalSequence(json)) {
      // skip non-sequence JSONs
      skipped++;
      continue;
    }

    const ok = validate(json);
    if (ok) {
      validated++;
      console.log(`   ? ${path.relative(repoRoot, f)}`);
    } else {
      const errors = (validate.errors || []).map(e => {
        const p = e.instancePath || e.dataPath || '(root)';
        return `${p} ${e.message || ''}`.trim();
      });
      failures.push({ file: f, errors });
      console.error(`   ? ${path.relative(repoRoot, f)} — ${errors.length} errors`);
      errors.forEach(e => console.error(`      - ${e}`));
    }
  }

  console.log('\n?? Summary:');
  console.log(`   • Total candidate files scanned: ${total}`);
  console.log(`   • Validated (matched & passed): ${validated}`);
  console.log(`   • Skipped (not a sequence or invalid JSON): ${skipped}`);
  console.log(`   • Failures: ${failures.length}`);

  if (failures.length > 0) {
    console.error('\n? MusicalSequence schema validation failed for some files');
    process.exit(1);
  }

  console.log('\n? All discovered MusicalSequence files conform to the schema');
  process.exit(0);
}

main().catch(err => {
  console.error('?? Unexpected error:', err);
  process.exit(2);
});
