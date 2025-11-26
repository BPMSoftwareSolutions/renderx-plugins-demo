#!/usr/bin/env node

/**
 * Fix All Symphonia Sequence Violations
 * 
 * Fixes all violations in json-sequences files across all packages:
 * - Adds missing sequence IDs
 * - Adds missing names  
 * - Adds missing beat counts
 */

const fs = require('fs');
const path = require('path');

function walkDir(dir, ext = '.json', ignore = []) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...walkDir(fullPath, ext, ignore));
    } else if (file.endsWith(ext) && !ignore.includes(file)) {
      results.push(fullPath);
    }
  }
  return results;
}

let fixedCount = 0;
let skippedCount = 0;
const fixedFiles = [];

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║   Symphonia Critical Fixes: All Sequence Violations        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Find all json-sequences directories
const packagesPath = path.join(process.cwd(), 'packages');
let allFiles = [];

if (fs.existsSync(packagesPath)) {
  const packages = fs.readdirSync(packagesPath);
  for (const pkg of packages) {
    const seqDir = path.join(packagesPath, pkg, 'json-sequences');
    if (fs.existsSync(seqDir)) {
      const files = walkDir(seqDir, '.json', ['index.json', 'package.json']);
      allFiles.push(...files);
    }
  }
}

// Also check root json-sequences
const rootSeqDir = path.join(process.cwd(), 'json-sequences');
if (fs.existsSync(rootSeqDir)) {
  const files = walkDir(rootSeqDir, '.json', ['index.json', 'package.json']);
  allFiles.push(...files);
}

// Remove duplicates
allFiles = [...new Set(allFiles)];

console.log(`Found ${allFiles.length} sequence files to process\n`);

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let sequence = JSON.parse(content);
    let modified = false;
    const changes = [];
    
    const filename = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Calculate total beats from movements
    let totalBeats = 0;
    if (sequence.movements && Array.isArray(sequence.movements)) {
      sequence.movements.forEach(movement => {
        if (movement.beats && Array.isArray(movement.beats)) {
          totalBeats += movement.beats.length;
        }
      });
    }
    
    // Rule 1: Add missing ID
    if (!sequence.id) {
      const fileBase = path.basename(filePath, '.json');
      const dir = path.basename(path.dirname(filePath));
      let generatedId = fileBase;
      if (dir !== 'json-sequences') {
        generatedId = `${dir}-${fileBase}`.replace(/\./g, '-');
      }
      sequence.id = generatedId;
      changes.push(`ID: ${sequence.id}`);
      modified = true;
    }
    
    // Rule 2: Add missing name
    if (!sequence.name) {
      const idParts = (sequence.id || filename).split('-').filter(p => p);
      sequence.name = idParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      changes.push(`Name: ${sequence.name}`);
      modified = true;
    }
    
    // Rule 3: Add missing beats
    if ((!sequence.beats || sequence.beats <= 0) && totalBeats > 0) {
      sequence.beats = totalBeats;
      changes.push(`Beats: ${totalBeats}`);
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(sequence, null, 2), 'utf-8');
      fixedCount++;
      fixedFiles.push({ path: relativePath, changes });
      console.log(`✓ ${relativePath}`);
      changes.forEach(c => console.log(`  └─ ${c}`));
    } else {
      skippedCount++;
    }
  } catch (err) {
    console.error(`✗ ${path.basename(filePath)}: ${err.message}`);
  }
});

console.log('\n╭────────────────────────────────────────────╮');
console.log('│          FIX SUMMARY                       │');
console.log('╰────────────────────────────────────────────╯');
console.log(`✅ Fixed sequences: ${fixedCount}`);
console.log(`⏭️  Already compliant: ${skippedCount}`);
console.log(`📊 Total sequences processed: ${allFiles.length}`);
console.log(`✨ Sequence violations complete!\n`);

process.exit(0);
