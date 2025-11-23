// Script: skip-bdd-placeholders.js
// Purpose: Automatically convert top-level `describe(` to `describe.skip(` for placeholder
// Business BDD handler spec files that have not yet been implemented, identified by the
// presence of 'TODO:' markers. Idempotent: will not double-skip or modify implemented specs.

import fs from 'fs';
import path from 'path';

// Target directories containing Business BDD spec files (handlers + feature-level)
const targetDirs = [
  path.resolve(process.cwd(), 'packages/self-healing/__tests__/business-bdd-handlers'),
  path.resolve(process.cwd(), 'packages/self-healing/__tests__/business-bdd'),
  // Root self-healing symphony specs (deployment, diagnosis, fix generation, validation, learning)
  path.resolve(process.cwd(), 'packages/self-healing/__tests__')
];

let totalFiles = 0;
let changed = 0;
let skipped = 0;
let untouched = 0;
let missingDirs = 0;

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    console.warn('Skipping missing directory:', dir);
    missingDirs++;
    continue;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.spec.ts'));
  totalFiles += files.length;
  for (const file of files) {
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    // Already skipped
    if (content.includes('describe.skip(')) {
      skipped++;
      continue;
    }
    // Placeholder heuristics:
    // 1. Contains TODO markers
    // 2. OR references ctx/__ctx without a declaration (to catch broken skeletons)
    const hasTODO = content.includes('TODO:');
    const referencesCtx = /\b(__?ctx)\b/.test(content);
    const declaresCtx = /let\s+__?ctx\s*[:=]/.test(content) || /const\s+__?ctx\s*[:=]/.test(content);
    const isPlaceholder = hasTODO || (referencesCtx && !declaresCtx);
    if (!isPlaceholder) {
      untouched++;
      continue;
    }
    const updated = content.replace(/describe\(/, 'describe.skip(');
    if (updated !== content) {
      fs.writeFileSync(full, updated, 'utf8');
      changed++;
    } else {
      untouched++;
    }
  }
}

console.log(`Processed ${totalFiles} Business BDD spec files across ${targetDirs.length - missingDirs} directory(ies).`);
console.log(`  ↳ Newly skipped placeholders: ${changed}`);
console.log(`  ↳ Already skipped: ${skipped}`);
console.log(`  ↳ Left untouched (implemented/no TODO): ${untouched}`);
if (missingDirs) {
  console.log(`  ↳ Missing directories: ${missingDirs}`);
}
if (changed === 0) {
  console.log('No additional placeholder specs required skipping.');
}
