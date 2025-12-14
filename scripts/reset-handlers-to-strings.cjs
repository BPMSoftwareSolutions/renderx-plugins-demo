#!/usr/bin/env node
/**
 * Reset handlers from objects back to strings for re-processing
 */

const fs = require('fs');
const path = require('path');

function discoverSequenceFiles() {
  const allFiles = [];
  const packagesDir = path.join(__dirname, '../packages');
  
  const packages = [
    'canvas-component',
    'control-panel',
    'header',
    'library',
    'library-component',
    'real-estate-analyzer',
    'self-healing'
  ];
  
  for (const pkg of packages) {
    const seqDir = path.join(packagesDir, pkg, 'json-sequences');
    if (fs.existsSync(seqDir)) {
      function walkDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json') && 
                     entry.name !== 'index.json' && entry.name !== 'rules.config.json') {
            allFiles.push(fullPath);
          }
        }
      }
      walkDir(seqDir);
    }
  }
  
  return allFiles;
}

const files = discoverSequenceFiles();
console.log(`\n📋 Resetting ${files.length} sequence files\n`);

let reset = 0;

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let modified = false;
    
    if (data.movements) {
      for (const movement of data.movements) {
        if (movement.beats) {
          for (const beat of movement.beats) {
            // Reset handler from object to string
            if (typeof beat.handler === 'object' && beat.handler.name) {
              beat.handler = beat.handler.name;
              modified = true;
            }
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      const relPath = path.relative(process.cwd(), file);
      console.log(`✅ Reset: ${relPath}`);
      reset++;
    }
  } catch (err) {
    const relPath = path.relative(process.cwd(), file);
    console.log(`❌ Error: ${relPath} - ${err.message}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Reset: ${reset} | 📊 Total: ${files.length}`);
console.log(`${'='.repeat(60)}\n`);

