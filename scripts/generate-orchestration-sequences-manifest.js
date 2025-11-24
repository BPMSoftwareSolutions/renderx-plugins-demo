#!/usr/bin/env node
/**
 * Generate Orchestration Sequences Manifest
 * 
 * Scans all MusicalSequence files and auto-generates manifest
 * that maps actual sequences to orchestration domains.
 * 
 * This is the SOURCE OF TRUTH for what sequences actually exist.
 * orchestration-domains.json is the registry of all domains (some may not have sequences yet).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function findSequenceFiles() {
  const sequences = [];
  const searchPaths = [
    'packages/ographx/.ographx/sequences',
    'packages/*/json-sequences',
  ];

  for (const pattern of searchPaths) {
    const basePath = pattern.includes('*') 
      ? path.join(rootDir, 'packages')
      : path.join(rootDir, pattern);

    if (!fs.existsSync(basePath)) continue;

    const files = fs.readdirSync(basePath, { recursive: true })
      .filter(f => f.endsWith('.json') && !f.includes('index.json'));

    for (const file of files) {
      const filePath = path.join(basePath, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Extract MusicalSequence metadata
        if (content.id && content.movements && Array.isArray(content.movements)) {
          const totalBeats = content.movements.reduce((sum, m) => sum + (m.beats?.length || 0), 0);
          
          sequences.push({
            id: content.id,
            name: content.name || content.id,
            description: content.description || '',
            file: path.relative(rootDir, filePath).replace(/\\/g, '/'),
            movements: content.movements.length,
            beats: totalBeats,
            category: content.category || 'unknown',
            dynamics: content.dynamics || [],
            key: content.key || '',
            tempo: content.tempo || 0,
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  return sequences;
}

async function generateManifest() {
  console.log('🔍 Scanning for MusicalSequence files...\n');
  
  const sequences = await findSequenceFiles();
  
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    description: 'Auto-generated manifest of actual orchestration sequences',
    totalSequences: sequences.length,
    sequences: sequences.sort((a, b) => a.id.localeCompare(b.id)),
  };

  const outputPath = path.join(rootDir, 'orchestration-sequences-manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

  console.log(`✅ Generated: ${outputPath}`);
  console.log(`📊 Found ${sequences.length} MusicalSequence files\n`);
  
  sequences.forEach(seq => {
    console.log(`  📋 ${seq.id}`);
    console.log(`     Movements: ${seq.movements}, Beats: ${seq.beats}`);
    console.log(`     File: ${seq.file}\n`);
  });

  return manifest;
}

generateManifest().catch(console.error);

