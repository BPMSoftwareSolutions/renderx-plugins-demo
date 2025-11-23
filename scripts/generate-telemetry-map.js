#!/usr/bin/env node
/**
 * Generate simple SVG telemetry map (nodes only) sized by run count and colored by budget status.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, '.generated', 'telemetry', 'index.json');
const OUT_PATH = path.join(ROOT, 'telemetry-map.svg');

function loadIndex() { try { return JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8')); } catch { return null; } }

function colorForBudget(status) {
  if (status === 'breach') return '#ff4d4f';
  if (status === 'within') return '#4caf50';
  return '#999999';
}

function main() {
  const index = loadIndex();
  if (!index) {
    fs.writeFileSync(OUT_PATH, '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="10" y="20">No telemetry</text></svg>');
    console.log('[telemetry-map] no index; wrote placeholder');
    return;
  }
  const features = Object.keys(index.features || {});
  const width = 100 + features.length * 120;
  const height = 220;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Arial" font-size="12">`;
  svg += '<rect width="100%" height="100%" fill="#ffffff" />';
  let x = 60;
  const y = 100;
  for (const f of features) {
    const entry = index.features[f];
    const runs = entry.runs.length;
    // Attempt to read budgetStatus from latest run file
    const latest = entry.runs[0];
    let status = 'unknown';
    let breachCount = 0;
    try {
      const rec = JSON.parse(fs.readFileSync(path.join(ROOT, '.generated', 'telemetry', latest.file), 'utf-8'));
      status = rec.budgetStatus || 'unknown';
      // Count breaches across runs
      for (const r of entry.runs) {
        try {
          const rr = JSON.parse(fs.readFileSync(path.join(ROOT, '.generated', 'telemetry', r.file), 'utf-8'));
          if (rr.budgetStatus === 'breach') breachCount += 1;
        } catch {}
      }
    } catch {}
    const radius = 20 + Math.min(runs, 10);
    const color = colorForBudget(status);
    svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="#333" />`;
    svg += `<text x="${x - radius}" y="${y + radius + 14}" fill="#000">${f} runs:${runs} breaches:${breachCount} status:${status}</text>`;
    x += 120;
  }
  svg += '</svg>';
  fs.writeFileSync(OUT_PATH, svg);
  console.log('[telemetry-map] generated:', OUT_PATH);
}

if (process.argv[1].endsWith('generate-telemetry-map.js')) main();