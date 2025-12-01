#!/usr/bin/env node
/**
 * Apply Acceptance Criteria from a plain-text file to JSON sequence files.
 *
 * Input format (ac.txt):
 * [relative\path\to\json]
 * beat: <number> handler: <name>
 * - line 1
 * - line 2
 * ...
 * (blank line separates beats)
 *
 * Usage:
 *   node scripts/apply-acceptance-criteria-from-text.js --file docs/renderx-web/ac.txt
 */
import fs from 'node:fs';
import path from 'node:path';

function parseAcFile(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = null;
  let beat = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      // blank line: commit current beat if any
      if (current && beat) {
        current.beats.push(beat);
        beat = null;
      }
      continue;
    }
    const sectionMatch = line.match(/^\[(.+\.json)\]$/);
    if (sectionMatch) {
      // close previous beat
      if (current && beat) {
        current.beats.push(beat);
        beat = null;
      }
      current = { file: sectionMatch[1], beats: [] };
      sections.push(current);
      continue;
    }
    const beatHeader = line.match(/^beat:\s*(\d+)\s*handler:\s*(.+)$/);
    if (beatHeader) {
      // close previous beat
      if (current && beat) {
        current.beats.push(beat);
      }
      beat = { index: Number(beatHeader[1]), handler: beatHeader[2].trim(), criteria: [] };
      continue;
    }
    if (line.startsWith('- ')) {
      if (!beat) {
        throw new Error('Criteria line found without an active beat header: ' + line);
      }
      beat.criteria.push(line.slice(2));
      continue;
    }
    // ignore other lines
  }
  if (current && beat) {
    current.beats.push(beat);
  }
  return sections;
}

function applyToJson(rootDir, section) {
  const jsonPath = path.resolve(rootDir, section.file);
  if (!fs.existsSync(jsonPath)) {
    console.warn('[WARN] JSON not found:', section.file);
    return false;
  }
  const content = fs.readFileSync(jsonPath, 'utf8');
  const obj = JSON.parse(content);
  if (!obj.movements || !obj.movements[0] || !Array.isArray(obj.movements[0].beats)) {
    console.warn('[WARN] Unexpected schema (no movements[0].beats):', section.file);
    return false;
  }
  const beats = obj.movements[0].beats;
  for (const b of section.beats) {
    const target = beats.find(x => Number(x.beat) === b.index);
    if (!target) {
      console.warn(`[WARN] Beat ${b.index} not found in ${section.file}`);
      continue;
    }
    if (b.handler && target.handler && b.handler !== target.handler) {
      console.warn(`[INFO] Handler mismatch at beat ${b.index} (${target.handler} vs ${b.handler}) — applying criteria by index.`);
    }
    // Ensure we only keep structured ACs per schema preference
    if (Object.prototype.hasOwnProperty.call(target, 'acceptanceCriteria')) {
      delete target.acceptanceCriteria;
    }
    // Structured ACs: group contiguous Given/When/Then/And lines into objects
    const structured = [];
    let current = { given: [], when: [], then: [], and: [] };
    const commit = () => {
      if (current.given.length || current.when.length || current.then.length || current.and.length) {
        structured.push(current);
      }
      current = { given: [], when: [], then: [], and: [] };
    };
    for (const line of b.criteria) {
      const l = line.trim();
      if (/^Given\b/i.test(l)) {
        // start a new scenario when encountering a Given after existing content
        if (current.given.length || current.when.length || current.then.length || current.and.length) commit();
        current.given.push(l.replace(/^Given\s*/i, '').trim());
      } else if (/^When\b/i.test(l)) {
        current.when.push(l.replace(/^When\s*/i, '').trim());
      } else if (/^Then\b/i.test(l)) {
        current.then.push(l.replace(/^Then\s*/i, '').trim());
      } else if (/^And\b/i.test(l)) {
        current.and.push(l.replace(/^And\s*/i, '').trim());
      } else {
        // Non-GWT lines, append to 'and' for completeness
        current.and.push(l);
      }
    }
    commit();
    target.acceptanceCriteriaStructured = structured;
  }
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  console.log('[OK] Updated', section.file);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  if (fileArgIdx === -1 || !args[fileArgIdx + 1]) {
    console.error('Usage: node scripts/apply-acceptance-criteria-from-text.js --file <path-to-ac.txt>');
    process.exit(1);
  }
  const filePath = args[fileArgIdx + 1];
  const rootDir = process.cwd();
  const text = fs.readFileSync(path.resolve(rootDir, filePath), 'utf8');
  const sections = parseAcFile(text);
  let updated = 0;
  for (const s of sections) {
    if (applyToJson(rootDir, s)) updated++;
  }
  console.log(`\nSummary: ${updated}/${sections.length} JSON sequence file(s) updated.`);
}

main();
