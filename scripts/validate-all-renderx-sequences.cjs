#!/usr/bin/env node
/**
 * Validate all renderx-web-orchestration sequence files
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const schemaPath = path.join(__dirname, '../docs/schemas/musical-sequence.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

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
console.log(`\n📋 Validating ${files.length} sequence files\n`);

let valid = 0;
let invalid = 0;
const results = [];

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const isValid = validate(data);
    const relPath = path.relative(process.cwd(), file);
    
    if (isValid) {
      valid++;
      results.push({ file: relPath, status: '✅', movements: data.movements?.length || 0, beats: data.movements?.reduce((s, m) => s + (m.beats?.length || 0), 0) || 0 });
    } else {
      invalid++;
      results.push({ file: relPath, status: '❌', error: validate.errors[0]?.message });
    }
  } catch (err) {
    invalid++;
    const relPath = path.relative(process.cwd(), file);
    results.push({ file: relPath, status: '❌', error: err.message });
  }
}

results.forEach(r => {
  if (r.status === '✅') {
    console.log(`${r.status} ${r.file} (${r.movements}M, ${r.beats}B)`);
  } else {
    console.log(`${r.status} ${r.file}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Valid: ${valid} | ❌ Invalid: ${invalid} | 📊 Total: ${files.length}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(invalid > 0 ? 1 : 0);

