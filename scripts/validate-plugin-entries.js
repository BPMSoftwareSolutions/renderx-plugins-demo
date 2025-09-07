#!/usr/bin/env node
// Validates that all plugin manifest entry points exist and use .js extension
const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(process.cwd(), 'public', 'plugins', 'plugin-manifest.json');
// const pluginsDir = path.resolve(process.cwd(), 'public', 'plugins');
let failed = false;

function checkEntry(modulePath) {
  if (!modulePath.endsWith('.js')) {
    console.error(`❌ Manifest entry does not use .js extension: ${modulePath}`);
    failed = true;
  }
  const absPath = path.join(process.cwd(), modulePath.startsWith('/') ? modulePath.slice(1) : modulePath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ Manifest entry points to missing file: ${absPath}`);
    failed = true;
  }
}

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  for (const plugin of manifest.plugins || []) {
    if (plugin.ui?.module) checkEntry(plugin.ui.module);
    if (plugin.runtime?.module) checkEntry(plugin.runtime.module);
  }
} catch (e) {
  console.error('❌ Failed to read or parse plugin-manifest.json:', e);
  process.exit(1);
}
if (!failed) {
  console.log('✅ All plugin manifest entry points use .js and exist.');
  process.exit(0);
} else {
  process.exit(1);
}
