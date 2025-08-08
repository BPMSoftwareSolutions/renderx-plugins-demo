#!/usr/bin/env node

/**
 * Plugin Bundle Watcher for MusicalConductor E2E Tests
 * 
 * This script watches plugin source files and automatically rebuilds bundles
 * when changes are detected. Useful for development workflows.
 * 
 * Usage:
 *   node scripts/watch-plugin-bundles.js
 *   npm run watch:plugins
 */

const fs = require('fs');
const path = require('path');
const { buildAllBundles } = require('./build-plugin-bundles.js');

// Configuration
const PLUGINS_DIR = path.join(__dirname, '..', 'test-app', 'plugins');
const SOURCE_FILENAME = 'index.js';
const WATCH_DEBOUNCE_MS = 500; // Debounce multiple rapid changes

let watchTimeout = null;
let isBuilding = false;

/**
 * Debounced build function
 */
function debouncedBuild() {
  if (watchTimeout) {
    clearTimeout(watchTimeout);
  }
  
  watchTimeout = setTimeout(() => {
    if (isBuilding) {
      console.log('⏳ Build already in progress, skipping...');
      return;
    }
    
    isBuilding = true;
    console.log('\n🔄 Source file changed, rebuilding bundles...');
    
    try {
      buildAllBundles({ force: false, verbose: false });
      console.log('✅ Rebuild complete, watching for changes...\n');
    } catch (error) {
      console.error('❌ Rebuild failed:', error.message);
    } finally {
      isBuilding = false;
    }
  }, WATCH_DEBOUNCE_MS);
}

/**
 * Get all plugin source files to watch
 */
function getWatchFiles() {
  const watchFiles = [];
  
  try {
    const pluginDirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);
    
    for (const pluginName of pluginDirs) {
      const sourceFile = path.join(PLUGINS_DIR, pluginName, SOURCE_FILENAME);
      if (fs.existsSync(sourceFile)) {
        watchFiles.push(sourceFile);
      }
    }
  } catch (error) {
    console.error('❌ Error scanning plugin directories:', error.message);
    process.exit(1);
  }
  
  return watchFiles;
}

/**
 * Start watching plugin source files
 */
function startWatching() {
  console.log('👀 MusicalConductor Plugin Bundle Watcher');
  console.log('=========================================');
  
  const watchFiles = getWatchFiles();
  
  if (watchFiles.length === 0) {
    console.log('⚠️  No plugin source files found to watch');
    process.exit(1);
  }
  
  console.log(`📋 Watching ${watchFiles.length} plugin source files:`);
  watchFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`   📄 ${relativePath}`);
  });
  
  // Initial build
  console.log('\n🔨 Building initial bundles...');
  try {
    buildAllBundles({ force: false, verbose: false });
    console.log('✅ Initial build complete\n');
  } catch (error) {
    console.error('❌ Initial build failed:', error.message);
    process.exit(1);
  }
  
  // Set up file watchers
  const watchers = [];
  
  for (const file of watchFiles) {
    try {
      const watcher = fs.watch(file, (eventType, filename) => {
        if (eventType === 'change') {
          const relativePath = path.relative(process.cwd(), file);
          console.log(`📝 Changed: ${relativePath}`);
          debouncedBuild();
        }
      });
      
      watchers.push(watcher);
    } catch (error) {
      console.error(`❌ Error watching ${file}:`, error.message);
    }
  }
  
  console.log('👁️  Watching for changes... (Press Ctrl+C to stop)');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping watcher...');
    watchers.forEach(watcher => watcher.close());
    console.log('✅ Watcher stopped');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping watcher...');
    watchers.forEach(watcher => watcher.close());
    console.log('✅ Watcher stopped');
    process.exit(0);
  });
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
MusicalConductor Plugin Bundle Watcher

Usage: node watch-plugin-bundles.js

This script watches plugin source files (index.js) and automatically
rebuilds the corresponding bundle files (dist/plugin.js) when changes
are detected.

Features:
- Watches all plugin source files simultaneously
- Debounces rapid changes to avoid excessive rebuilds
- Graceful shutdown with Ctrl+C
- Initial build on startup

Examples:
  node scripts/watch-plugin-bundles.js    # Start watching
  npm run watch:plugins                   # Using npm script
`);
    return;
  }
  
  startWatching();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { startWatching };
