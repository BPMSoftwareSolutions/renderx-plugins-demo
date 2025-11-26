#!/usr/bin/env node

/**
 * Symphonia Violation Cleanup - Phase 2: Contract Schema Fixer
 * 
 * Fixes MAJOR violations in contract definitions:
 * - Missing hash strategies
 * - Missing optional fields documentation
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Symphonia Violation Cleanup - Phase 2: Contract Schemas\n');

const CONTRACTS_DIR = './contracts';
const contractFiles = fs.readdirSync(CONTRACTS_DIR).filter(f => f.endsWith('.contract.json'));

let fixed = 0;

contractFiles.forEach(file => {
  const filePath = path.join(CONTRACTS_DIR, file);
  const contract = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updates = {};
  let hasUpdates = false;

  // Fix 1: Add hash strategy if missing
  if (!contract.hashStrategy) {
    contract.hashStrategy = 'sha256(serializedWithoutMeta)';
    updates.hashStrategy = contract.hashStrategy;
    hasUpdates = true;
  }

  // Fix 2: Add optional fields if missing
  if (!contract.optional) {
    contract.optional = ['durationMs', 'correlationId', 'coverageId', 'metadata', 'context'];
    updates.optional = 'added standard optional fields';
    hasUpdates = true;
  }

  // Fix 3: Ensure required fields are defined
  if (!contract.required || contract.required.length === 0) {
    contract.required = ['feature', 'event', 'beats', 'status', 'shapeHash'];
    updates.required = 'added standard required fields';
    hasUpdates = true;
  }

  // Fix 4: Ensure version is set
  if (typeof contract.version !== 'number' || contract.version < 1) {
    contract.version = 1;
    updates.version = contract.version;
    hasUpdates = true;
  }

  // Fix 5: Add metadata if missing
  if (!contract.meta) {
    contract.meta = {
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    updates.meta = 'added metadata';
    hasUpdates = true;
  }

  if (hasUpdates) {
    fs.writeFileSync(filePath, JSON.stringify(contract, null, 2));
    fixed++;
    console.log(`✓ Fixed ${file}`);
    console.log(`  Updates: ${Object.keys(updates).join(', ')}`);
  }
});

console.log(`
✅ Cleanup Complete!

Fixed: ${fixed}/${contractFiles.length} contracts

Changes:
- Added hash strategies (sha256(serializedWithoutMeta))
- Added optional fields documentation
- Ensured required fields are defined
- Standardized versions to 1
- Added metadata timestamps

Next: Run audit to verify improvements
  npm run audit:symphonia:conformity
`);

process.exit(0);
