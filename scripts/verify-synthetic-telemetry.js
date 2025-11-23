#!/usr/bin/env node
// verify-synthetic-telemetry.js
// Scans .logs for synthetic demo artifacts and enforces path/name conventions.
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const LOGS_ROOT = path.join(ROOT, '.logs');
const ALLOW = process.env.ALLOW_DEMO_SYNTHETIC === '1';
const STRICT = process.env.STRICT_SYNTHETIC_BLOCK === '1';

function listFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) results.push(...listFiles(full));
      else results.push(full);
    } catch {/* ignore */}
  }
  return results;
}

function isSyntheticName(name) {
  return /demo-synthetic-|self-healing-demo-sample|synthetic/i.test(name);
}

const files = listFiles(LOGS_ROOT);
const synthetic = files.filter(f => isSyntheticName(path.basename(f)));
const violations = synthetic.filter(f => {
  // Allowed directory for synthetic logs: .logs/demo/ OR root for self-healing-demo-sample.log
  const rel = path.relative(LOGS_ROOT, f).replace(/\\/g,'/');
  const base = path.basename(f);
  if (base === 'self-healing-demo-sample.log') return false; // permitted at root
  return !rel.startsWith('demo/');
});

if (!synthetic.length) {
  console.log('[SYNTHETIC-TELEMETRY] PASS (no synthetic artifacts found)');
  process.exit(0);
}

if (!ALLOW) {
  console.warn('[SYNTHETIC-TELEMETRY] WARN synthetic artifacts present but ALLOW_DEMO_SYNTHETIC not set');
}

if (violations.length) {
  console[STRICT ? 'error' : 'warn']('[SYNTHETIC-TELEMETRY] ' + (STRICT ? 'FAIL' : 'WARN') + ' invalid synthetic artifact locations:', violations.map(v => path.relative(ROOT,v)));
  if (STRICT) process.exit(1);
}

console.log('[SYNTHETIC-TELEMETRY] Summary');
console.log('  Total synthetic files:', synthetic.length);
console.log('  Violations:', violations.length);
console.log('  Mode:', STRICT ? 'STRICT' : 'LENIENT');
console.log('  Allow flag:', ALLOW ? 'ENABLED' : 'DISABLED');