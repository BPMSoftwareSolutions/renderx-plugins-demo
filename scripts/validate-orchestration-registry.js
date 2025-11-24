#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

async function validateRegistry() {
  console.log('🔍 Validating Orchestration Registry Against Audit System\n');
  
  // Load orchestration domains
  const registryPath = path.join(rootDir, 'orchestration-domains.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  
  // Load audit catalog (55 web sequences)
  const catalogPath = path.join(
    rootDir,
    'packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json'
  );
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  
  // Load orchestration domain sequences (2 sequences)
  const orchestrationSeqDir = path.join(rootDir, 'packages/ographx/.ographx/sequences');
  const orchestrationSeqs = new Map();
  
  if (fs.existsSync(orchestrationSeqDir)) {
    fs.readdirSync(orchestrationSeqDir)
      .filter(f => f.endsWith('.json') && !f.includes('index.json'))
      .forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(orchestrationSeqDir, file), 'utf-8'));
        if (content.id) orchestrationSeqs.set(content.id, content);
      });
  }
  
  console.log(`📊 Audit System: ${catalog.summary.totalSequences} web sequences`);
  console.log(`🎼 Orchestration: ${orchestrationSeqs.size} domain sequences`);
  console.log(`📋 Registry: ${registry.domains.length} conceptual domains\n`);
  
  let implemented = 0;
  let planned = 0;
  
  registry.domains.forEach(domain => {
    if (domain.sequenceFile) {
      const filePath = path.join(rootDir, domain.sequenceFile);
      if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        let movements = content.movements;
        if (!movements && content.sequences) {
          movements = content.sequences[0]?.movements;
        }
        if (movements) {
          implemented++;
          console.log(`✅ ${domain.id}: ${movements.length} movements`);
        }
      }
    } else {
      planned++;
      console.log(`⏳ ${domain.id}: Planned (no sequence file)`);
    }
  });
  
  console.log(`\n📈 Status: ${implemented} implemented, ${planned} planned`);
  console.log(`\n💡 Note: Audit system has ${catalog.summary.totalSequences} plugin sequences`);
  console.log(`   These are separate from the ${orchestrationSeqs.size} orchestration domain sequences`);
}

validateRegistry().catch(console.error);

