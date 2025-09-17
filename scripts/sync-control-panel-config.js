#!/usr/bin/env node

/**
 * Copy the Control Panel schema JSON from the package source to public/plugins/
 * so the UI can fetch it at runtime: /plugins/control-panel/config/control-panel.schema.json
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function copyFile(src, dest) {
  const buf = await readFile(src);
  await writeFile(dest, buf);
}

async function main() {
  const src = join(rootDir, 'packages', 'control-panel', 'src', 'config', 'control-panel.schema.json');
  const outDir = join(rootDir, 'public', 'plugins', 'control-panel', 'config');
  const dest = join(outDir, 'control-panel.schema.json');
  try {
    console.log('🔄 Syncing Control Panel schema to public/plugins/control-panel/config ...');
    await ensureDir(outDir);
    await copyFile(src, dest);
    console.log('  ✅ Copied control-panel.schema.json');
  } catch (err) {
    console.error('❌ Failed to sync Control Panel schema:', err?.message || err);
    process.exit(1);
  }
}

main();

