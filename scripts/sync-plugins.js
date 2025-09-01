#!/usr/bin/env node

/**
 * Sync script to copy json-plugins/ to public/plugins/
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sourceDir = join(rootDir, 'json-plugins');
const targetDir = join(rootDir, 'public', 'plugins');

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function copyFile(source, target) {
  const content = await readFile(source);
  await writeFile(target, content);
}

async function syncPlugins() {
  console.log('🔄 Syncing json-plugins/ to public/plugins/...');
  try {
    await ensureDir(targetDir);

    const files = await readdir(sourceDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const sourcePath = join(sourceDir, file);
      const targetPath = join(targetDir, file);
      await copyFile(sourcePath, targetPath);
      console.log(`  ✅ Copied ${file}`);
    }

    console.log(`✨ Synced ${jsonFiles.length} plugin manifest files`);
  } catch (error) {
    console.error('❌ Failed to sync json-plugins:', error);
    process.exit(1);
  }
}

syncPlugins();

