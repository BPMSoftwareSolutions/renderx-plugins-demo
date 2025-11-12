/**
 * Quick verification of sequence extraction/mapping against the raw log
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logPath = path.join(__dirname, '.logs/web-variant-localhost-1762811808902.log');
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split(/\r?\n/);

const sequences = new Map();

const patterns = [
  /Registered sequence\s+"([^"]+)"\s*\(id:\s*([^\)]+)\)/i,
  /Registered sequence\s+"([^"]+)"/i,
  /Sequence registered:\s*([^\"\']+)/i,
  /Sequence\s+"([^"]+)"\s+validation\s+passed/i,
];

const isoPattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;

lines.forEach(line => {
  if (!/sequence/i.test(line)) return;
  const ts = (line.match(isoPattern) || [])[1] || null;
  for (const p of patterns) {
    const m = line.match(p);
    if (m) {
      const name = m[1].trim();
      const id = (m[2] || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!sequences.has(id)) {
        sequences.set(id, { name, id, timestamps: [] });
      }
      if (ts) {
        sequences.get(id).timestamps.push(ts);
      }
      break;
    }
  }
});

const list = Array.from(sequences.values()).sort((a,b)=>a.name.localeCompare(b.name));
console.log(`\nFound ${list.length} sequences with names:`);
list.slice(0, 20).forEach((s, i) => {
  console.log(`  ${i+1}. ${s.name} (id: ${s.id}) — ${s.timestamps.length} hits`);
});

// Simple semantic guess similar to SEQUENCE_TYPE_MAP
function guessType(name){
  if (/^Library\b/i.test(name)) return 'data';
  if (/^Header UI/i.test(name)) return 'ui';
  if (/^Control Panel UI/i.test(name)) return 'ui';
  if (/^Canvas Component Create/i.test(name)) return 'create';
  if (/Drag|Drop/i.test(name)) return 'interaction';
  return 'sequence';
}

const typeDist = {};
list.forEach(s=>{ const t=guessType(s.name); typeDist[t]=(typeDist[t]||0)+1; });
console.log('\nSemantic type distribution (guessed):');
Object.entries(typeDist).forEach(([t,c])=>console.log(`  ${t}: ${c}`));
