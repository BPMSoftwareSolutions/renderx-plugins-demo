#!/usr/bin/env node
/*
  Convert legacy acceptanceCriteria (Given/When/Then text blocks) into
  acceptanceCriteriaStructured for all JSON sequence files under a directory.

  Usage:
    node scripts/convert-acceptance-criteria-to-structured.cjs --dir packages/self-healing/json-sequences
*/

const fs = require('fs');
const path = require('path');

function parseGwtBlock(text) {
  // Split on newlines and extract Given/When/Then/And clauses
  const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const out = { given: [], when: [], then: [], and: [] };
  for (const line of lines) {
    const m = /^(Given|When|Then|And)\s+(.*)$/i.exec(line);
    if (!m) {
      out.and.push(line);
      continue;
    }
    const key = m[1].toLowerCase();
    const val = m[2];
    if (key === 'given') out.given.push(val);
    else if (key === 'when') out.when.push(val);
    else if (key === 'then') out.then.push(val);
    else out.and.push(val);
  }
  // Remove empty keys to keep JSON concise
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v && v.length));
}

function convertFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    console.warn(`[SKIP] Not JSON: ${filePath}`);
    return { changed: false };
  }

  if (!Array.isArray(json.movements)) return { changed: false };

  let changed = false;
  for (const movement of json.movements) {
    if (!movement || !Array.isArray(movement.beats)) continue;
    for (const beat of movement.beats) {
      if (beat && Array.isArray(beat.acceptanceCriteria) && !beat.acceptanceCriteriaStructured) {
        const structured = beat.acceptanceCriteria.map(parseGwtBlock);
        beat.acceptanceCriteriaStructured = structured;
        delete beat.acceptanceCriteria;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", 'utf8');
  }
  return { changed };
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.json')) yield full;
  }
}

function main() {
  const args = process.argv.slice(2);
  const dirFlagIdx = args.indexOf('--dir');
  if (dirFlagIdx === -1 || !args[dirFlagIdx + 1]) {
    console.error('Usage: node scripts/convert-acceptance-criteria-to-structured.cjs --dir <json-sequences-dir>');
    process.exit(1);
  }
  const targetDir = path.resolve(args[dirFlagIdx + 1]);
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    console.error(`[ERROR] Directory not found: ${targetDir}`);
    process.exit(1);
  }

  let files = 0;
  let updated = 0;
  for (const file of walk(targetDir)) {
    files++;
    const res = convertFile(file);
    if (res.changed) {
      updated++;
      console.log(`[UPDATED] ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`Done. Files scanned: ${files}; Files updated: ${updated}`);
}

if (require.main === module) {
  main();
}
