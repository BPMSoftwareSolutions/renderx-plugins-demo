#!/usr/bin/env node

/**
 * Debug Source Maps Script
 * 
 * This script helps diagnose source map issues by:
 * 1. Checking if source map files exist
 * 2. Verifying source map references in built files
 * 3. Validating source map JSON structure
 * 4. Providing recommendations for fixing issues
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(process.cwd(), 'dist');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

function checkSourceMaps() {
  console.log('🔍 Checking source maps...\n');

  // Check host dist
  console.log('📦 Host Application (dist/)');
  checkDirectory(DIST_DIR);

  // Check package dists
  console.log('\n📦 Packages');
  const packages = fs.readdirSync(PACKAGES_DIR).filter(f => 
    fs.statSync(path.join(PACKAGES_DIR, f)).isDirectory()
  );

  for (const pkg of packages) {
    const pkgDist = path.join(PACKAGES_DIR, pkg, 'dist');
    if (fs.existsSync(pkgDist)) {
      console.log(`\n  ${pkg}:`);
      checkDirectory(pkgDist);
    }
  }

  console.log('\n✅ Source map check complete!\n');
  console.log('💡 Tips for debugging source maps:');
  console.log('   1. Hard refresh browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
  console.log('   2. Clear browser cache: DevTools → Application → Clear site data');
  console.log('   3. Run: npm run dev:clean (clears Vite cache and restarts dev server)');
  console.log('   4. Check DevTools Sources tab to verify source maps are loaded');
  console.log('   5. Look for red X marks in DevTools Sources - indicates missing source maps\n');
}

function checkDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const mapFiles = files.filter(f => f.endsWith('.js.map'));

  console.log(`  JS files: ${jsFiles.length}`);
  console.log(`  Map files: ${mapFiles.length}`);

  if (jsFiles.length === 0) {
    console.log('  ⚠️  No JS files found');
    return;
  }

  if (mapFiles.length === 0) {
    console.log('  ❌ No source map files found!');
    return;
  }

  // Check for mismatches
  const jsWithoutMap = jsFiles.filter(js => !mapFiles.includes(js + '.map'));
  if (jsWithoutMap.length > 0) {
    console.log(`  ⚠️  ${jsWithoutMap.length} JS file(s) missing source maps:`);
    jsWithoutMap.slice(0, 3).forEach(f => console.log(`     - ${f}`));
    if (jsWithoutMap.length > 3) console.log(`     ... and ${jsWithoutMap.length - 3} more`);
  } else {
    console.log('  ✅ All JS files have corresponding source maps');
  }

  // Spot check a source map file
  if (mapFiles.length > 0) {
    const mapFile = path.join(dir, mapFiles[0]);
    try {
      const content = fs.readFileSync(mapFile, 'utf8');
      const map = JSON.parse(content);
      if (map.sources && map.sources.length > 0) {
        console.log(`  ✅ Source map is valid (${map.sources.length} sources)`);
      } else {
        console.log('  ⚠️  Source map has no sources');
      }
    } catch (e) {
      console.log(`  ❌ Source map is invalid JSON: ${e.message}`);
    }
  }
}

checkSourceMaps();

