#!/usr/bin/env node
/**
 * analyze-domain-volatility.cjs
 * Computes volatility trends based on historical demo_runs in DOMAIN_REGISTRY.json.
 * Volatility metric: checksum_change_count (times integrity checksum changed across runs).
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
function sha256(c){return crypto.createHash('sha256').update(c).digest('hex');}
function loadJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function main(){
  const registryPath = path.resolve('DOMAIN_REGISTRY.json');
  if(!fs.existsSync(registryPath)){console.error('Missing DOMAIN_REGISTRY.json');process.exit(1);}  
  const registry = loadJSON(registryPath);
  const runs = (registry.meta && registry.meta.demo_runs) || [];
  const history = {}; // domain_id -> {checksums:[], lineage_hashes:[]}
  runs.forEach(r=>{
    r.domains.forEach(d=>{
      if(!history[d.domain_id]) history[d.domain_id] = {checksums:[], lineage_hashes:[]};
      history[d.domain_id].checksums.push(d.integrity_checksum);
      history[d.domain_id].lineage_hashes.push(d.lineage_hash);
    });
  });
  const trend = [];
  Object.keys(history).forEach(id=>{
    const h = history[id];
    let checksumChanges = 0; for(let i=1;i<h.checksums.length;i++){ if(h.checksums[i]!==h.checksums[i-1]) checksumChanges++; }
    let lineageChanges = 0; for(let i=1;i<h.lineage_hashes.length;i++){ if(h.lineage_hashes[i]!==h.lineage_hashes[i-1]) lineageChanges++; }
    trend.push({domain_id:id, runs:h.checksums.length, checksum_change_count:checksumChanges, lineage_change_count:lineageChanges});
  });
  const outDir = path.resolve('.generated','domains');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  const outPath = path.join(outDir,'domain-volatility-trend.json');
  fs.writeFileSync(outPath, JSON.stringify({generated_at:new Date().toISOString(), trend}, null,2));
  console.log('✅ Volatility trend written:', outPath);
}
main();
