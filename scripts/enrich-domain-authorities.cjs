#!/usr/bin/env node
/**
 * enrich-domain-authorities.cjs
 * Computes lineage_hash and integrity_checksum for each domain authority JSON.
 * Updates DOMAIN_REGISTRY checksums accordingly.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function sha256(content){return crypto.createHash('sha256').update(content).digest('hex');}
function deterministicSerialize(obj){
  if(obj===null||typeof obj!=='object') return JSON.stringify(obj);
  if(Array.isArray(obj)) return '['+obj.map(deterministicSerialize).join(',')+']';
  const keys=Object.keys(obj).sort();
  return '{'+keys.map(k=>JSON.stringify(k)+':'+deterministicSerialize(obj[k])).join(',')+'}';
}
function loadJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function saveJSON(p,o){fs.writeFileSync(p,JSON.stringify(o,null,2));}
function findDomainFiles(){
  const dir=path.resolve('docs','domains');
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.endsWith('-trace.json')&&f!=='DOMAIN_AUTHORITY_SCHEMA.json'&&f!=='DOMAIN_REGISTRY.json').map(f=>path.join(dir,f));
}

function main(){
  const registryPath=path.resolve('DOMAIN_REGISTRY.json');
  const registry=fs.existsSync(registryPath)?loadJSON(registryPath):null;
  if(!registry){console.error('Missing DOMAIN_REGISTRY.json');process.exit(1);}  
  const files=findDomainFiles();
  if(!files.length){console.log('No domain files to enrich.');process.exit(0);}  
  files.forEach(file=>{
    const domain=loadJSON(file);
    const lineageSource=(domain.root_context_ref||'')+'|'+(domain.context_lineage||[]).join('>')+'|'+domain.domain_id;
    const lineageHash=sha256(lineageSource);
    domain.provenance=lineageHash?{...domain.provenance,lineage_hash:lineageHash}:domain.provenance;
    const integrityChecksum=sha256(deterministicSerialize(domain));
    domain.provenance.integrity_checksum=integrityChecksum;
    saveJSON(file,domain);
    if(registry.domains[domain.domain_id]){
      registry.domains[domain.domain_id].checksum=integrityChecksum;
    }
    console.log(`Enriched ${domain.domain_id}: lineage_hash=${lineageHash.substr(0,8)}.. checksum=${integrityChecksum.substr(0,8)}..`);
  });
  saveJSON(registryPath,registry);
  console.log('✅ Enrichment complete.');
}
main();
