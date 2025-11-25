#!/usr/bin/env node
/**
 * AUTO-GENERATED DOC GENERATOR (Musical Conductor Orchestration)
 * Reads orchestration-domains.json and the referenced sequence JSON
 * Emits a markdown documentation file summarizing movements, beats and lifecycle.
 *
 * Output: docs/orchestration/MUSICAL_CONDUCTOR_ORCHESTRATION.md
 * Do not edit the generated markdown directly; edit JSON sources instead.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const DOMAINS_FILE = path.join(ROOT, 'orchestration-domains.json');
const OUTPUT_DIR = path.join(ROOT, 'docs', 'orchestration');
const DOMAIN_ID = 'musical-conductor-orchestration';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'MUSICAL_CONDUCTOR_ORCHESTRATION.md');

function sha256(v){return crypto.createHash('sha256').update(v).digest('hex');}

function loadJson(fp){return JSON.parse(fs.readFileSync(fp,'utf-8'));}

function main(){
  if(!fs.existsSync(DOMAINS_FILE)){
    console.error(`❌ Missing domains file: ${DOMAINS_FILE}`);process.exit(1);
  }
  const domains = loadJson(DOMAINS_FILE);
  if(!domains.domains || !Array.isArray(domains.domains)){
    console.error('❌ Invalid domains JSON structure (missing domains array).');process.exit(1);
  }
  const domain = domains.domains.find(d=>d.id===DOMAIN_ID);
  if(!domain){
    console.error(`❌ Domain id '${DOMAIN_ID}' not found in orchestration-domains.json`);process.exit(1);
  }
  const sequenceFile = path.join(ROOT, domain.sequenceFile);
  if(!fs.existsSync(sequenceFile)){
    console.error(`❌ Referenced sequence file not found: ${sequenceFile}`);process.exit(1);
  }
  const sequence = loadJson(sequenceFile);
  const movements = sequence.phases || [];
  const totalBeats = movements.reduce((acc,m)=>acc+(m.items?m.items.length:0),0);
  // Integrity block
  const integrityPayload = JSON.stringify({domain, sequence}, null, 0);
  const integrityHash = sha256(integrityPayload);

  fs.mkdirSync(OUTPUT_DIR, {recursive:true});
  const lines = [];
  lines.push('<!-- AUTO-GENERATED: DO NOT EDIT DIRECTLY -->');
  lines.push(`<!-- Source: orchestration-domains.json:id=${DOMAIN_ID} + ${domain.sequenceFile} -->`);
  lines.push(`<!-- Integrity Hash: ${integrityHash} -->`);
  lines.push('# Musical Conductor Orchestration');
  lines.push('');
  lines.push(`Status: **${domain.status}**  | Movements: **${domain.movements}**  | Beats Declared: **${domain.beats}**  | Computed Beats: **${totalBeats}**`);
  lines.push('');
  lines.push('## Overview');
  lines.push(domain.description);
  lines.push('');
  lines.push('### Core Attributes');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  ['tempo','key','timeSignature','category','purpose'].forEach(f=>{
    lines.push(`| ${f} | ${domain[f]} |`);
  });
  lines.push('');
  if(domain.relatedDomains && domain.relatedDomains.length){
    lines.push('### Related Domains');
    lines.push(domain.relatedDomains.map(d=>`- ${d}`).join('\n'));
    lines.push('');
  }
  lines.push('## Movements');
  movements.forEach((m,i)=>{
    lines.push(`### ${m.name}`);
    if(m.items && m.items.length){
      m.items.forEach((it,idx)=>lines.push(`- (${idx+1}) ${it}`));
    } else {
      lines.push('*No items defined*');
    }
    lines.push('');
  });
  lines.push('## Integrity');
  lines.push('- Integrity Hash (domain+sequence JSON): ' + integrityHash);
  lines.push('- Canonical Beats Count: ' + totalBeats);
  lines.push('');
  lines.push('## Regeneration');
  lines.push('Run: `node scripts/generate-musical-conductor-orchestration-doc.js`');
  lines.push('Edit JSON sources, never this markdown directly.');
  lines.push('');
  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'),'utf-8');
  console.log(`✅ Generated documentation: ${OUTPUT_FILE}`);
}

try { main(); } catch(e){ console.error('❌ Generation failed:', e); process.exit(1);} 
