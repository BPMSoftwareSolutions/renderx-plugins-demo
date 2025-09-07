#!/usr/bin/env node

/**
 * Sync script to copy json-components/ to public/json-components/
 * This ensures the dev server and build process have the latest component definitions.
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.findIndex(a => a === name || a.startsWith(name + '='));
  if (i === -1) return def;
  const eq = args[i].indexOf('=');
  if (eq > -1) return args[i].slice(eq + 1);
  const nxt = args[i + 1];
  if (nxt && !nxt.startsWith('--')) return nxt;
  return def;
}
const srcRoot = getArg('--srcRoot', rootDir);
const outPublic = getArg('--outPublic', join(rootDir, 'public'));

const sourceDir = join(srcRoot, 'json-components');
const targetDir = join(outPublic, 'json-components');

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

async function syncJsonComponents() {
  console.log('🔄 Syncing json-components/ to public/json-components/...');
  
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
    
    console.log(`✨ Synced ${jsonFiles.length} JSON component files`);
  } catch (error) {
    console.error('❌ Failed to sync json-components:', error);
    process.exit(1);
  }
}

syncJsonComponents();
