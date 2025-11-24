#!/usr/bin/env node
/**
 * domain-risk-assessment.cjs
 * Produces risk scores combining volatility, link surface, and stability score.
 * risk_score = (checksum_change_count * 2) + (cross_domain_link_count * 1) + ((1 - stability.score) * 10)
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
  const registryPath = path.resolve('DOMAIN_REGISTRY.json');
  if(!fs.existsSync(registryPath)){console.error('Missing DOMAIN_REGISTRY.json');process.exit(1);}  
  const registry = loadJSON(registryPath);
  const volatilityPath = path.resolve('.generated','domains','domain-volatility-trend.json');
  const volatilityTrend = fs.existsSync(volatilityPath)? loadJSON(volatilityPath).trend : [];
  const volatilityMap = {}; volatilityTrend.forEach(t=> volatilityMap[t.domain_id]=t);
  const domains = findDomainFiles().map(loadJSON);
  const assessments = domains.map(d=>{
    const volatility = volatilityMap[d.domain_id] || {checksum_change_count:0};
    const linkCount = (d.cross_domain_links||[]).length;
    const stabilityScore = d.stability && typeof d.stability.score==='number'? d.stability.score : 1;
    const riskScore = (volatility.checksum_change_count*2) + (linkCount) + ((1 - stabilityScore)*10);
    return {
      domain_id: d.domain_id,
      risk_score: Number(riskScore.toFixed(2)),
      volatility_checksum_changes: volatility.checksum_change_count || 0,
      cross_domain_link_count: linkCount,
      stability_score: stabilityScore
    };
  });
  assessments.sort((a,b)=> b.risk_score - a.risk_score);
  const outDir = path.resolve('.generated','domains');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  const outPath = path.join(outDir,'domain-risk-assessment.json');
  fs.writeFileSync(outPath, JSON.stringify({generated_at:new Date().toISOString(), assessments}, null,2));
  // Update registry meta
  registry.meta = registry.meta || {}; registry.meta.last_risk_assessment = {generated_at:new Date().toISOString(), assessments};
  fs.writeFileSync(registryPath, JSON.stringify(registry,null,2));
  console.log('✅ Domain risk assessment written:', outPath);
}
main();
