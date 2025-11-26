#!/usr/bin/env node

/**
 * Fix Symphonia CRITICAL Violations: Sequence Beats
 * 
 * Fixes sequences in json-sequences/ directory that are missing top-level beat counts.
 * The violations: sequences have movements with beats but no beats property.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sequencesDir = path.join(__dirname, '../json-sequences');
let fixedCount = 0;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║     Symphonia Critical Fixes: JSON Sequence Beat Counts      ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Find all sequence JSON files
const files = glob.sync(`${sequencesDir}/**/*.json`, { ignore: '**/index.json' });

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let sequence = JSON.parse(content);
    let modified = false;
    
    // Calculate total beats from movements
    let totalBeats = 0;
    if (sequence.movements && Array.isArray(sequence.movements)) {
      sequence.movements.forEach(movement => {
        if (movement.beats && Array.isArray(movement.beats)) {
          totalBeats += movement.beats.length;
        }
      });
    }
    
    // Add top-level beats if missing or invalid
    if (!sequence.beats || sequence.beats <= 0) {
      if (totalBeats > 0) {
        sequence.beats = totalBeats;
        modified = true;
        const filename = path.basename(filePath);
        console.log(`✓ ${filename}`);
        console.log(`  └─ Set beats: ${totalBeats} (calculated from ${sequence.movements.length} movements)`);
      }
    }
    
    // Ensure required properties
    if (!sequence.id && sequence.id !== 'control-panel-classes-add-symphony') {
      // Generate ID from filename if missing
      const fileBase = path.basename(filePath, '.json');
      const dir = path.basename(path.dirname(filePath));
      const generatedId = `${dir}-${fileBase}`.replace(/\./g, '-');
      sequence.id = generatedId;
      modified = true;
      console.log(`  └─ Set ID: ${generatedId}`);
    }
    
    // Ensure name is present
    if (!sequence.name && sequence.id) {
      sequence.name = sequence.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(sequence, null, 2), 'utf-8');
      fixedCount++;
    }
  } catch (err) {
    console.error(`✗ Error processing ${path.basename(filePath)}: ${err.message}`);
  }
});

console.log('\n╭────────────────────────────────────────────╮');
console.log('│          FIX SUMMARY                       │');
console.log('╰────────────────────────────────────────────╯');
console.log(`✅ Fixed sequences: ${fixedCount}`);
console.log(`📊 Total sequences scanned: ${files.length}`);
console.log(`✨ Sequence beat counts complete!\n`);

process.exit(0);
