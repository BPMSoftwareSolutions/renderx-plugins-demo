#!/usr/bin/env node
/**
 * export-domain-link-graph.cjs
 * Builds adjacency + reverse adjacency for cross_domain_links and parent lineage.
 */
const fs = require('fs');
const path = require('path');

function loadJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function findDomainFiles(){
  const dir=path.resolve('docs','domains');
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith('.json')&&!f.endsWith('-trace.json')&&f!=='DOMAIN_AUTHORITY_SCHEMA.json'&&f!=='DOMAIN_REGISTRY.json').map(f=>path.join(dir,f));
}
function main(){
  const domains = findDomainFiles().map(f=>loadJSON(f));
  const adjacency = {}; // cross-domain logical links
  const reverse = {};
  const parentGraph = {}; // lineage parent relationships
  domains.forEach(d=>{
    adjacency[d.domain_id] = [];
    reverse[d.domain_id] = [];
    parentGraph[d.domain_id] = d.parent_context_refs || [];
  });
  domains.forEach(d=>{
    (d.cross_domain_links||[]).forEach(l=>{
      adjacency[d.domain_id].push({target:l.target_domain_id, relation:l.relation_type, strength:l.strength||'n/a'});
      if(!reverse[l.target_domain_id]) reverse[l.target_domain_id] = [];
      reverse[l.target_domain_id].push({source:d.domain_id, relation:l.relation_type, strength:l.strength||'n/a'});
    });
  });
  const output = { generated_at:new Date().toISOString(), adjacency, reverse, parentGraph };
  const outDir = path.resolve('.generated','domains');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  const outPath = path.join(outDir,'domain-link-graph.json');
  fs.writeFileSync(outPath, JSON.stringify(output,null,2));
  console.log('✅ Link graph exported:', outPath);
}
main();
