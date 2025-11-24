#!/usr/bin/env node

/**
 * Verify Root Cleanliness
 * 
 * Checks that root directory contains ONLY authorized files
 * per docs/governance/ROOT_FILE_PLACEMENT_RULES.md
 * 
 * Usage:
 *   npm run verify:root-cleanliness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Whitelist of files allowed in root
// These are the ONLY files that should be at depth 0
const AUTHORIZED_ROOT_FILES = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.base.json',
  'tsconfig.tsbuildinfo',
  'README.md',
  '.env',
  '.env.example',
  '.gitignore',
  '.npmrc',
  '.nvmrc',
  'LICENSE',
  'renderx-plugins-demo.sln',
  'cypress.config.ts',
  'eslint.config.js',
  'vite.config.js',
  'vitest.config.ts',
  'pyvenv.cfg'
];

// Files to skip (system files)
const SKIP_PATTERNS = [
  /^\./,  // Hidden files/folders
  /^node_modules$/,
  /^\.venv$/,
  /^\.git$/,
  /^\.husky$/,
  /^dist$/,
  /^coverage$/
];

function shouldSkip(name) {
  return SKIP_PATTERNS.some(pattern => pattern.test(name));
}

function main() {
  console.log('\n📋 Root Directory Cleanliness Verification\n');

  try {
    const files = fs.readdirSync(ROOT)
      .filter(name => !shouldSkip(name))
      .filter(name => {
        const fullPath = path.join(ROOT, name);
        return fs.statSync(fullPath).isFile();
      })
      .sort();

    console.log(`📊 Files found in root: ${files.length}\n`);

    let violations = 0;
    let authorized = 0;

    files.forEach(file => {
      const isAuthorized = AUTHORIZED_ROOT_FILES.includes(file);
      
      if (isAuthorized) {
        console.log(`  ✅ ${file}`);
        authorized++;
      } else {
        console.log(`  ❌ ${file} (VIOLATION)`);
        violations++;
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Authorized: ${authorized}`);
    console.log(`  ❌ Violations: ${violations}`);

    if (violations === 0) {
      console.log('\n✅ ROOT CLEANLINESS CHECK PASSED\n');
      process.exit(0);
    } else {
      console.log('\n❌ ROOT CLEANLINESS CHECK FAILED\n');
      console.log('💡 Fix options:');
      console.log('  1. Auto-move violations:');
      console.log('     npm run fix:root-file-violations');
      console.log('  2. Manually move files to proper directories:');
      console.log('     See docs/governance/ROOT_FILE_PLACEMENT_RULES.md\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
  }
}

main();
