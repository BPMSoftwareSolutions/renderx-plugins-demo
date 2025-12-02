#!/usr/bin/env node
/**
 * Convert docs/ACs.txt (Title/Given/When/Then/And blocks) into an apply file
 * compatible with scripts/apply-acceptance-criteria-from-text.js.
 *
 * Output: docs/renderx-web/ac.apply.txt
 * Sections:
 * [relative\\path\\to\\json]
 * beat: <number> handler: <handlerName>
 * - Given ...
 * - When ...
 * - Then ...
 * - And ...
 */
const fs = require('fs');
const path = require('path');

function parseBlocks(text) {
  const blocks = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  return blocks.map(b => {
    const lines = b.split(/\n/);
    const titleLine = lines.find(l => l.startsWith('Title:')) || '';
    const given = lines.filter(l => l.startsWith('Given:')).map(l => l.replace('Given: ', ''));
    const when = lines.filter(l => l.startsWith('When:')).map(l => l.replace('When: ', ''));
    const then = lines.filter(l => l.startsWith('Then:')).map(l => l.replace('Then: ', ''));
    const and = lines.filter(l => l.startsWith('And:')).map(l => l.replace('And: ', ''));
    const title = titleLine.replace('Title: ', '');
    return { title, given, when, then, and };
  });
}

function indexBeatsByHandler(jsonRoots) {
  const fs = require('fs');
  const path = require('path');
  const index = new Map(); // handlerName(lower) -> [{ file, beatIndex, handlerName }]
  const toArray = (v) => (Array.isArray(v) ? v : [v]);
  for (const dir of jsonRoots) {
    if (!fs.existsSync(dir)) continue;
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && entry.name.endsWith('.json')) {
          try {
            const obj = JSON.parse(fs.readFileSync(full, 'utf8'));
            const m = obj && obj.movements && obj.movements[0];
            const beats = m && Array.isArray(m.beats) ? m.beats : [];
            beats.forEach((b, idx) => {
              const h = b && b.handler;
              const name = typeof h === 'string' ? h : (h && h.name);
              if (!name) return;
              const simple = String(name).split('#').pop().split('/').pop();
              const key = simple.toLowerCase();
              const arr = index.get(key) || [];
              arr.push({ file: full, beatIndex: idx + 1, handlerName: name });
              index.set(key, arr);
            });
          } catch {}
        }
      }
    };
    walk(dir);
  }
  return index;
}

function toApplyText(acs, handlerIndex, rootDir) {
  const path = require('path');
  const grouped = new Map(); // file -> [{beatIndex, handlerName, lines}]
  let matched = 0;
  let unmatched = 0;

  for (const ac of acs) {
    // Extract handler name from title (before space or '(' or '|')
    const m = ac.title && String(ac.title).match(/^([^\s(|]+)/);
    const handlerSimple = m ? m[1].toLowerCase() : '';
    const targets = handlerIndex.get(handlerSimple);
    if (!targets || targets.length === 0) {
      unmatched++;
      continue;
    }
    // Prefer first match (deterministic). Could be improved to disambiguate.
    const t = targets[0];
    matched++;
    const rel = path.relative(rootDir, t.file).replace(/\\/g, '/');
    const arr = grouped.get(rel) || [];
    const lines = [
      ...ac.given.map(g => `- Given ${g}`),
      ...ac.when.map(w => `- When ${w}`),
      ...ac.then.map(tn => `- Then ${tn}`),
      ...ac.and.map(a => `- And ${a}`)
    ];
    arr.push({ beatIndex: t.beatIndex, handlerName: t.handlerName, lines });
    grouped.set(rel, arr);
  }

  let out = '';
  for (const [file, items] of grouped.entries()) {
    out += `[${file}]\n`;
    items.sort((a, b) => a.beatIndex - b.beatIndex).forEach(it => {
      out += `beat: ${it.beatIndex} handler: ${it.handlerName}\n`;
      out += it.lines.join('\n') + '\n\n';
    });
  }
  return { text: out.trim() + (out ? '\n' : ''), stats: { matched, unmatched, files: grouped.size } };
}

function main() {
  const root = process.cwd();
  const inputFile = path.join(root, 'docs', 'ACs.txt');
  if (!fs.existsSync(inputFile)) {
    console.error('docs/ACs.txt not found. Run compose-acs-text first.');
    process.exit(1);
  }
  const text = fs.readFileSync(inputFile, 'utf8');
  const acs = parseBlocks(text);
  const jsonRoots = [
    path.join(root, 'packages', 'canvas-component', 'json-sequences'),
    path.join(root, 'packages', 'control-panel', 'json-sequences'),
    path.join(root, 'packages', 'header', 'json-sequences'),
    path.join(root, 'packages', 'library', 'json-sequences'),
    path.join(root, 'packages', 'library-component', 'json-sequences')
  ];
  const handlerIdx = indexBeatsByHandler(jsonRoots);
  const { text: applyText, stats } = toApplyText(acs, handlerIdx, root);
  const outDir = path.join(root, 'docs', 'renderx-web');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'ac.apply.txt');
  fs.writeFileSync(outFile, applyText, 'utf8');
  console.log(outFile);
  console.log(`Matched: ${stats.matched} | Unmatched: ${stats.unmatched} | Files: ${stats.files}`);
}

main();
