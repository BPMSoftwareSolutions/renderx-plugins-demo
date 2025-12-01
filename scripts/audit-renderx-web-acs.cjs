#!/usr/bin/env node
/*
Audit renderx-web sequence files for acceptance criteria status.
Purpose:
  1. Identify any remaining legacy `acceptanceCriteria` arrays (should be migrated).
  2. Identify beats missing `acceptanceCriteriaStructured` (coverage gaps).
Notes:
  - Legacy field detection is retained intentionally for regression monitoring.
  - Single-item arrays in structured AC should already be inlined by upstream updater.
*/
const fs = require('fs');
const path = require('path');

const roots = [
  'packages/canvas-component/json-sequences/canvas-component',
  'packages/control-panel/json-sequences',
  'packages/header/json-sequences/header',
  'packages/library/json-sequences/library',
  'packages/library-component/json-sequences/library-component',
];

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...listJsonFiles(full));
    } else if (e.isFile() && e.name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

const report = [];
let totals = { files: 0, beats: 0, legacyBeats: 0, missingStructured: 0 };

for (const root of roots) {
  const files = listJsonFiles(root);
  for (const file of files) {
    const json = readJson(file);
    if (!json || !json.movements || !Array.isArray(json.movements) || !json.movements[0] || !Array.isArray(json.movements[0].beats)) {
      continue; // skip non-standard
    }
    totals.files++;
    const beats = json.movements[0].beats;
    beats.forEach((b, idx) => {
      totals.beats++;
      const hasLegacy = Object.prototype.hasOwnProperty.call(b, 'acceptanceCriteria');
      const hasStructured = Object.prototype.hasOwnProperty.call(b, 'acceptanceCriteriaStructured');
      if (hasLegacy) totals.legacyBeats++;
      if (!hasStructured) totals.missingStructured++;
      if (hasLegacy || !hasStructured) {
        report.push({ file, beatIndex: idx + 1, handler: b.handler, hasLegacy, hasStructured });
      }
    });
  }
}

// Group report by file
const grouped = report.reduce((acc, r) => {
  acc[r.file] = acc[r.file] || [];
  acc[r.file].push(r);
  return acc;
}, {});

console.log('RenderX-Web AC Audit');
console.log('====================');
console.log(`Files scanned: ${totals.files}`);
console.log(`Beats scanned: ${totals.beats}`);
console.log(`Beats with legacy acceptanceCriteria (should be 0): ${totals.legacyBeats}`);
console.log(`Beats missing acceptanceCriteriaStructured: ${totals.missingStructured}`);
console.log('');
for (const [file, items] of Object.entries(grouped)) {
  console.log(file);
  for (const it of items) {
    console.log(`  beat ${it.beatIndex} handler:${it.handler} legacy:${it.hasLegacy ? 'yes' : 'no'} structured:${it.hasStructured ? 'yes' : 'no'}`);
  }
}
