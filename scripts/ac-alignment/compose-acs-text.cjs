#!/usr/bin/env node
/**
 * Compose ACs.txt from handlers.json
 */
const fs = require('fs');
const path = require('path');

function loadHandlers(jsonPath) {
  let raw = fs.readFileSync(jsonPath, 'utf8');
  // Sanitize potential BOM or control chars from PowerShell encodings
  raw = raw.replace(/^\uFEFF/, '').replace(/[\u0000-\u001F]/g, (c) => {
    // Preserve newlines and tabs; remove other control chars
    return c === '\n' || c === '\r' || c === '\t' ? c : '';
  });
  const data = JSON.parse(raw);
  return data.handlers || [];
}

function toTitle(handler) {
  const name = handler.name;
  const file = handler.file;
  const base = path.basename(file).replace(/\.(ts|tsx|js|jsx)$/, '');
  return `${name} (${base})`;
}

function toAC(handler, idx) {
  const id = `AC-H-${idx + 1}`;
  const title = toTitle(handler);
  return [
    `Title: ${title} | ${id}`,
    `Given: handler ${handler.name} is available`,
    `When: ${handler.name} executes under normal conditions`,
    `Then: it performs its expected orchestration logic`,
    `And: emits expected side effects or returns expected value`,
    ''
  ].join('\n');
}

function main() {
  const root = process.cwd();
  const input = path.join(root, '.generated', 'ac-alignment', 'handlers.json');
  if (!fs.existsSync(input)) {
    console.error('handlers.json not found. Run scan-handlers first.');
    process.exit(1);
  }
  const handlers = loadHandlers(input);
  const lines = [];
  handlers.forEach((h, i) => {
    lines.push(toAC(h, i));
  });
  const outFile = path.join(root, 'docs', 'ACs.txt');
  fs.writeFileSync(outFile, lines.join('\n'));
  console.log(outFile);
}

main();
