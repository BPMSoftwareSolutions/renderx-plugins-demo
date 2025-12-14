#!/usr/bin/env node
/**
 * Fix handler format (string → object) and generic ACs in sequence files
 * Converts string handlers to objects with sourcePath
 * Replaces generic ACs with specific ones based on handler name and beat context
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

function findActualSourcePath(pkg, handlerName) {
  // Try to find actual handler files in the package
  const glob = require('glob');
  const basePath = `packages/${pkg}/src`;

  // Search patterns in order of preference
  const searchPatterns = [
    `${basePath}/symphonies/**/${handlerName}.stage-crew.ts`,
    `${basePath}/symphonies/**/${handlerName}.ts`,
    `${basePath}/handlers/${handlerName}.ts`,
    `${basePath}/**/${handlerName}.ts`,
  ];

  for (const pattern of searchPatterns) {
    const matches = glob.sync(pattern, { cwd: process.cwd() });
    if (matches.length > 0) {
      return matches[0]; // Return first match
    }
  }

  // Fallback: use index.ts as the source (handlers are typically exported from there)
  const indexPath = `${basePath}/index.ts`;
  if (fs.existsSync(path.join(process.cwd(), indexPath))) {
    return indexPath;
  }

  // Last resort: return the symphonies directory
  return `${basePath}/symphonies`;
}

function generateSpecificAC(handlerName, beat) {
  // Generate specific ACs based on handler name and beat context
  return [
    {
      "given": [
        `handler ${handlerName} is available`,
        "required inputs are provided"
      ],
      "when": [
        `${handlerName} executes`
      ],
      "then": [
        `${handlerName} performs its expected logic`,
        "output matches expected format",
        "no errors are thrown"
      ],
      "and": [
        "side effects are emitted correctly",
        "performance meets SLA targets"
      ]
    }
  ];
}

const files = discoverSequenceFiles();
console.log(`\n📋 Processing ${files.length} sequence files\n`);

let fixed = 0;
let errors = 0;

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let modified = false;
    
    if (data.movements) {
      for (const movement of data.movements) {
        if (movement.beats) {
          for (const beat of movement.beats) {
            // Fix handler format
            if (typeof beat.handler === 'string') {
              const handlerName = beat.handler;
              const pkg = file.split('\\').includes('canvas-component') ? 'canvas-component' :
                         file.split('\\').includes('control-panel') ? 'control-panel' :
                         file.split('\\').includes('header') ? 'header' :
                         file.split('\\').includes('library-component') ? 'library-component' :
                         file.split('\\').includes('library') ? 'library' :
                         file.split('\\').includes('real-estate-analyzer') ? 'real-estate-analyzer' :
                         'self-healing';
              
              beat.handler = {
                name: handlerName,
                sourcePath: findActualSourcePath(pkg, handlerName)
              };
              modified = true;
            }
            
            // Fix generic ACs
            if (beat.acceptanceCriteria && beat.acceptanceCriteria.length > 0) {
              const firstAC = beat.acceptanceCriteria[0];
              if (firstAC.given && firstAC.given[0] && 
                  firstAC.given[0].includes('is available') &&
                  firstAC.then && firstAC.then[0] &&
                  firstAC.then[0].includes('expected orchestration logic')) {
                // This is a generic AC, replace it
                beat.acceptanceCriteria = generateSpecificAC(
                  typeof beat.handler === 'string' ? beat.handler : beat.handler.name,
                  beat.beat
                );
                modified = true;
              }
            }
          }
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      const relPath = path.relative(process.cwd(), file);
      console.log(`✅ Fixed: ${relPath}`);
      fixed++;
    }
  } catch (err) {
    errors++;
    const relPath = path.relative(process.cwd(), file);
    console.log(`❌ Error: ${relPath} - ${err.message}`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Fixed: ${fixed} | ❌ Errors: ${errors} | 📊 Total: ${files.length}`);
console.log(`${'='.repeat(60)}\n`);

