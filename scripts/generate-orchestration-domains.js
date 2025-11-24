#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function findSequenceFiles() {
  const sequenceFiles = [];
  
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    fs.readdirSync(packagesDir).forEach(pkg => {
      const seqDir = path.join(packagesDir, pkg, 'json-sequences');
      if (fs.existsSync(seqDir)) {
        fs.readdirSync(seqDir, { recursive: true }).forEach(file => {
          if (file.endsWith('.json')) {
            sequenceFiles.push(path.join('packages', pkg, 'json-sequences', file));
          }
        });
      }
    });
  }
  
  const orchDir = path.join(rootDir, 'packages/ographx/.ographx/sequences');
  if (fs.existsSync(orchDir)) {
    fs.readdirSync(orchDir).forEach(file => {
      if (file.endsWith('.json')) {
        sequenceFiles.push(path.join('packages/ographx/.ographx/sequences', file));
      }
    });
  }
  
  return sequenceFiles;
}

async function generateOrchestrationDomains() {
  console.log('🔄 Generating Orchestration Domains Registry\n');
  
  const sequenceFiles = findSequenceFiles();
  console.log(📂 Found C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{sequenceFiles.length} sequence files\n);
  
  const sequences = [];
  sequenceFiles.forEach(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(rootDir, file), 'utf-8'));
      if (content.id) {
        sequences.push({
          id: content.id,
          name: content.name || content.id,
          file: file,
          movements: content.movements?.length || 0,
          beats: content.movements?.reduce((sum, m) => sum + (m.beats?.length || 0), 0) || 0,
          pluginId: content.pluginId
        });
      }
    } catch (err) {
      console.warn(⚠️  Could not parse C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{file}: C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{err.message});
    }
  });
  
  console.log(✅ Loaded C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{sequences.length} sequences\n);
  
  const domains = {};
  sequences.forEach(seq => {
    if (seq.id.includes('orchestration')) {
      if (!domains[seq.id]) {
        domains[seq.id] = {
          id: seq.id,
          name: seq.name,
          sequenceFile: seq.file,
          movements: seq.movements,
          beats: seq.beats,
          status: 'active'
        };
      }
    }
  });
  
  console.log(🎼 Found C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{Object.keys(domains).length} orchestration domain sequences\n);
  
  Object.values(domains).forEach(d => {
    console.log(  ✅ C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{d.name} (C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{d.movements} movements, C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{d.beats} beats));
  });
  
  console.log(\n📊 Total sequences cataloged: C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{sequences.length});
  console.log(   - Orchestration domains: C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{Object.keys(domains).length});
  console.log(   - Plugin sequences: C:/source/repos/bpm/internal/renderx-plugins-demo/.venv/Scripts/Activate.ps1{sequences.length - Object.keys(domains).length});
}

generateOrchestrationDomains().catch(console.error);
