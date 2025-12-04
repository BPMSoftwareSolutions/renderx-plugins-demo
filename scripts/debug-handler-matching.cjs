#!/usr/bin/env node
/**
 * Debug script to understand why notifyUi isn't being matched
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Simulate the handler discovery process
function findAllHandlers() {
  const handlers = [];
  const handlerFiles = glob.sync('packages/*/src/**/*.{ts,tsx}', {
    cwd: process.cwd(),
    ignore: ['**/*.d.ts', '**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
  });

  handlerFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Look for exported const/function that might be handlers
    const exportMatches = content.matchAll(/export\s+(?:const|function)\s+(\w+)/g);

    for (const match of exportMatches) {
      const name = match[1];
      handlers.push({ name, file });
    }
  });

  return handlers;
}

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║ HANDLER MATCHING DEBUG                                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Find all handlers
console.log('🔍 Discovering all handlers...\n');
const allHandlers = findAllHandlers();

// Filter to notifyUi handlers
const notifyUiHandlers = allHandlers.filter(h => h.name.toLowerCase() === 'notifyui');

console.log(`Found ${notifyUiHandlers.length} notifyUi handler(s):\n`);
notifyUiHandlers.forEach(h => {
  console.log(`   Name: ${h.name}`);
  console.log(`   File: ${h.file}`);
  console.log('');
});

// Load create sequence
const createSeqPath = 'packages/canvas-component/json-sequences/canvas-component/create.json';
const createSeq = JSON.parse(fs.readFileSync(createSeqPath, 'utf8'));

console.log('\n📋 Create sequence handlers:\n');
createSeq.movements[0].beats.forEach(beat => {
  console.log(`   Beat ${beat.beat}: ${beat.handler}`);
});

// Simulate the matching logic
console.log('\n\n🔧 Simulating handler lookup...\n');

// Build handler lookup
const handlerLookup = new Map();
notifyUiHandlers.forEach(handler => {
  let handlerName = handler.name;
  const pathParts = handler.file.split('/');
  const fileName = pathParts[pathParts.length - 1].replace(/\.(ts|tsx|js|jsx)$/, '');

  console.log(`   Processing handler:`);
  console.log(`     - handler.name: ${handlerName}`);
  console.log(`     - fileName: ${fileName}`);
  console.log(`     - Stored key: ${handlerName.toLowerCase()}`);

  handlerLookup.set(handlerName.toLowerCase(), handler);
});

console.log('\n   Lookup map contains:');
handlerLookup.forEach((value, key) => {
  console.log(`     - "${key}" -> ${value.file}`);
});

// Try to match notifyUi
const sequenceHandler = 'notifyUi';
console.log(`\n\n🔍 Looking up "${sequenceHandler}"...`);
console.log(`   Lookup key: ${sequenceHandler.toLowerCase()}`);

const matched = handlerLookup.get(sequenceHandler.toLowerCase());

if (matched) {
  console.log(`   ✅ MATCHED: ${matched.file}`);
} else {
  console.log(`   ❌ NOT MATCHED`);
}

// Check if case sensitivity is the issue
console.log('\n\n🔬 Case sensitivity check:');
console.log(`   "notifyui" === "${sequenceHandler.toLowerCase()}": ${"notifyui" === sequenceHandler.toLowerCase()}`);

notifyUiHandlers.forEach(h => {
  console.log(`   "${h.name.toLowerCase()}" === "${sequenceHandler.toLowerCase()}": ${h.name.toLowerCase() === sequenceHandler.toLowerCase()}`);
});
