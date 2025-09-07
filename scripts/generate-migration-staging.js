#!/usr/bin/env node
/**
 * Automation helper: populate .thin-host-migration and .plugins-migration with curated subsets.
 * Idempotent: clears and re-copies target directories.
 */
import { rmSync, mkdirSync, cpSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const thinDir = join(root, '.thin-host-migration');
const plugDir = join(root, '.plugins-migration');

function emptyDir(dir) {
  try { rmSync(dir, { recursive: true, force: true }); } catch {}
  mkdirSync(dir, { recursive: true });
}

function copyIf(srcRel, destBase, destRel = srcRel) {
  const src = join(root, srcRel);
  if (!existsSync(src)) return;
  const dest = join(destBase, destRel);
  mkdirSync(join(dest, '..'), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log('Copied', srcRel, '→', dest.replace(root + '\\',''));
}

function writeList(dir, name, items) {
  writeFileSync(join(dir, name), items.map(s=>'- '+s).join('\n')+'\n');
}

console.log('🛠 Populating migration staging folders...');
emptyDir(join(thinDir, 'staged'));
emptyDir(join(plugDir, 'staged'));

// Thin host: runtime code + host-sdk + minimal public assets (NO raw json-* sources)
const thinTargets = [
  'src',
  'packages/host-sdk',
  'packages/manifest-tools',
  'packages/schema-contract',
  'public/index.html',
  'scripts/validate-artifacts.js',
  'scripts/build-artifacts.js', // optional: keep initially; can be removed after full externalization
  'scripts/hash-public-api.js',
  'public/plugins/plugin-manifest.json',
  'README.md',
  'tsconfig.json',
  'package.json',
  'vitest.config.ts',
  'eslint.config.js'
];
for (const t of thinTargets) copyIf(t, join(thinDir,'staged'));

// Plugins repo: raw json-* trees + plugin source + build & signing scripts
const pluginTargets = [
  'json-components',
  'json-sequences',
  'json-interactions',
  'json-topics',
  'json-plugins',
  'json-layout',
  'plugins',
  'scripts/build-artifacts.js',
  'scripts/pack-artifacts.js',
  'scripts/validate-artifacts.js',
  'scripts/verify-artifact-signature.js',
  'scripts/hash-public-api.js',
  'packages/manifest-tools',
  'packages/schema-contract',
  'README.md',
  'package.json'
];
for (const t of pluginTargets) copyIf(t, join(plugDir,'staged'));

// Lists for sanity
writeList(thinDir, 'STAGED_FILES.txt', thinTargets);
writeList(plugDir, 'STAGED_FILES.txt', pluginTargets);

console.log('✅ Migration staging populated. Review .thin-host-migration/staged and .plugins-migration/staged');