#!/usr/bin/env node

/**
 * Clean All Caches Script
 * 
 * Removes all build caches and temporary files to ensure a fresh start:
 * - Vite cache (.vite/)
 * - Build outputs (dist/, packages/*/dist/)
 * - Node modules cache
 * - TypeScript incremental build cache
 */

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const dirsToClean = [
  'node_modules/.vite',
  'dist',
  '.tsbuildinfo',
];

// Add package dist directories
const packagesDir = path.join(cwd, 'packages');
if (fs.existsSync(packagesDir)) {
  const packages = fs.readdirSync(packagesDir).filter(f => 
    fs.statSync(path.join(packagesDir, f)).isDirectory()
  );
  packages.forEach(pkg => {
    dirsToClean.push(`packages/${pkg}/dist`);
    dirsToClean.push(`packages/${pkg}/.tsbuildinfo`);
  });
}

console.log('🧹 Cleaning all caches...\n');

let cleaned = 0;
let failed = 0;

for (const dir of dirsToClean) {
  const fullPath = path.join(cwd, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dir}`);
      cleaned++;
    } catch (e) {
      console.log(`❌ Failed to remove ${dir}: ${e.message}`);
      failed++;
    }
  }
}

console.log(`\n✨ Cleaned ${cleaned} cache(s)`);
if (failed > 0) {
  console.log(`⚠️  Failed to clean ${failed} cache(s)`);
}

console.log('\n💡 Next steps:');
console.log('   1. npm install (to reinstall dependencies)');
console.log('   2. npm run build:packages (to rebuild packages)');
console.log('   3. npm run dev (to start dev server with fresh caches)\n');

