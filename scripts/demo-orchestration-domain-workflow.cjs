#!/usr/bin/env node
/**
 * demo-orchestration-domain-workflow.cjs
 * Demonstrates the Orchestration Domain System workflow:
 * 1. Enrich domain authorities (lineage_hash + integrity_checksum)
 * 2. Validate domain authority JSONs
 * 3. Generate domain reflection markdown + trace artifacts
 * 4. Verify drift (recompute checksum excluding integrity_checksum field)
 * 5. Append run metadata to DOMAIN_REGISTRY.json (meta.demo_runs[])
 * 6. Produce per-domain consolidated lineage file
 * 7. Emit demo telemetry + markdown results for orchestration-core
 *
 * Outputs:
 *  - .generated/domains/orchestration-core-demo-telemetry.json
 *  - docs/domains/orchestration-core-demo-results.md
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function run(label, cmd){
  console.log(`\n▶ ${label}`);
  try { const out = execSync(cmd, { stdio: 'pipe' }).toString(); console.log(out.trim()); }
  catch(e){ console.error(`❌ Step failed: ${label}`); console.error(e.stdout? e.stdout.toString(): e.message); process.exit(1);} }

function loadJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function sha256(content){ return crypto.createHash('sha256').update(content).digest('hex'); }
function deterministicSerialize(obj){
  if(obj===null||typeof obj!=='object') return JSON.stringify(obj);
  if(Array.isArray(obj)) return '['+obj.map(deterministicSerialize).join(',')+']';
  const keys=Object.keys(obj).sort();
  return '{'+keys.map(k=>JSON.stringify(k)+':'+deterministicSerialize(obj[k])).join(',')+'}';
}

function main(){
  const start = Date.now();
  const pipelineId = `domain-demo-${start}-${Math.random().toString(36).slice(2,8)}`;
  console.log(`\n🧩 Domain Demo Pipeline ID: ${pipelineId}`);
  // Steps (enrich first to reconcile any manual edits, then validate)
  run('Enrich domain authorities', 'node scripts/enrich-domain-authorities.cjs');
  run('Validate domain authorities', 'node scripts/validate-domain-authorities.cjs');
  // Discover domains dynamically
  const domainsDir = path.resolve('docs','domains');
  const domainFiles = fs.readdirSync(domainsDir).filter(f=>f.endsWith('.json') && !f.endsWith('-trace.json') && f!=='DOMAIN_AUTHORITY_SCHEMA.json' && f!=='DOMAIN_REGISTRY.json');
  domainFiles.forEach(f=> run(`Generate doc for ${f}`, `node scripts/generate-domain-doc.js ${path.join('docs','domains',f)}`));

  // Verification + lineage consolidation
  const consolidated = { pipeline_id: pipelineId, run_at: new Date().toISOString(), domains: [] };
  domainFiles.forEach(f=>{
    const fullPath = path.join(domainsDir,f);
    const d = loadJson(fullPath);
    const clone = JSON.parse(JSON.stringify(d));
    if(clone.provenance) delete clone.provenance.integrity_checksum;
    const recomputedChecksum = sha256(deterministicSerialize(clone));
    const driftVerified = d.provenance && d.provenance.integrity_checksum === recomputedChecksum;
    console.log(`Verification: ${d.domain_id} driftVerified=${driftVerified ? '✅' : '❌'}`);
    consolidated.domains.push({
      domain_id: d.domain_id,
      lineage_hash: d.provenance && d.provenance.lineage_hash,
      stored_integrity_checksum: d.provenance && d.provenance.integrity_checksum,
      recomputed_checksum: recomputedChecksum,
      drift_verified: driftVerified,
      reflection_path: `docs/domains/${d.domain_id}.md`,
      trace_path: `.generated/domains/${d.domain_id}-trace.json`
    });
  });

  const generatedDir = path.resolve('.generated','domains');
  if(!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir,{recursive:true});
  const consolidatedPath = path.join(generatedDir,'domain-demo-lineage.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidated,null,2));
  console.log(`\n🗂  Consolidated lineage written: ${consolidatedPath}`);

  // Append run metadata to DOMAIN_REGISTRY.json
  const registryPath = path.resolve('DOMAIN_REGISTRY.json');
  if(fs.existsSync(registryPath)){
    const registry = loadJson(registryPath);
    registry.meta = registry.meta || {};
    registry.meta.demo_runs = registry.meta.demo_runs || [];
    registry.meta.demo_runs.push({ pipeline_id: pipelineId, run_at: consolidated.run_at, domains: consolidated.domains.map(d=>({
      domain_id: d.domain_id,
      lineage_hash: d.lineage_hash,
      integrity_checksum: d.stored_integrity_checksum,
      drift_verified: d.drift_verified
    })) });
    fs.writeFileSync(registryPath, JSON.stringify(registry,null,2));
    console.log(`📘 Registry updated with demo run (pipeline_id=${pipelineId}).`);
  } else {
    console.warn('⚠️ DOMAIN_REGISTRY.json not found; run metadata not appended.');
  }

  // Telemetry aggregation for orchestration-core
  const domainPath = path.resolve('docs','domains','orchestration-core.json');
  if(!fs.existsSync(domainPath)){ console.error('Missing orchestration-core domain JSON'); process.exit(1); }
  const domain = loadJson(domainPath);
  const domainClone = JSON.parse(JSON.stringify(domain));
  if(domainClone.provenance) delete domainClone.provenance.integrity_checksum;
  const recomputedChecksum = sha256(deterministicSerialize(domainClone));
  const driftVerified = domain.provenance && domain.provenance.integrity_checksum === recomputedChecksum;
  const summary = {
    pipeline_id: pipelineId,
    demo_run_at: new Date().toISOString(),
    domain_id: domain.domain_id,
    lineage_hash: domain.provenance && domain.provenance.lineage_hash,
    integrity_checksum: domain.provenance && domain.provenance.integrity_checksum,
    recomputed_checksum: recomputedChecksum,
    drift_verified: driftVerified,
    lifecycle_stage: domain.lifecycle && domain.lifecycle.stage,
    cross_domain_link_count: Array.isArray(domain.cross_domain_links)? domain.cross_domain_links.length : 0,
    kpi_count: domain.metrics && domain.metrics.kpis? domain.metrics.kpis.length : 0,
    quality_gate_count: domain.metrics && domain.metrics.quality_gates? domain.metrics.quality_gates.length : 0,
    ownership_team: domain.ownership && domain.ownership.team,
    validation_rules_count: Array.isArray(domain.validation_rules)? domain.validation_rules.length : 0,
    generated_docs: domain.artifacts && domain.artifacts.generated_markdown || [],
    source_json: domain.artifacts && domain.artifacts.json_sources || [],
    trace_file: path.join('.generated','domains',`${domain.domain_id}-trace.json`),
    deterministic_snapshot_hash: sha256(JSON.stringify(domain))
  };

  const genDir = path.resolve('.generated','domains');
  if(!fs.existsSync(genDir)) fs.mkdirSync(genDir,{recursive:true});
  const telemetryJsonPath = path.join(genDir,'orchestration-core-demo-telemetry.json');
  fs.writeFileSync(telemetryJsonPath, JSON.stringify(summary,null,2));

  // Markdown results summary
  const mdLines = [];
  mdLines.push('<!-- AUTO-GENERATED DEMO RESULTS: orchestration-core -->');
  mdLines.push(`# Orchestration Core Demo Run`);
  mdLines.push('');
  mdLines.push(`Pipeline ID: ${summary.pipeline_id}`);
  mdLines.push(`Run Timestamp: ${summary.demo_run_at}`);
  mdLines.push(`Domain ID: \`${summary.domain_id}\``);
  mdLines.push('');
  mdLines.push('## Integrity & Drift Verification');
  mdLines.push(`Stored Lineage Hash: \`${summary.lineage_hash}\``);
  mdLines.push(`Stored Integrity Checksum: \`${summary.integrity_checksum}\``);
  mdLines.push(`Recomputed Checksum (excludes self-field): \`${summary.recomputed_checksum}\``);
  mdLines.push(`Deterministic Snapshot Hash (current JSON): \`${summary.deterministic_snapshot_hash}\``);
  mdLines.push(`Drift Verified: ${summary.drift_verified ? '✅' : '❌'}`);
  mdLines.push('');
  mdLines.push('## Metrics & Counts');
  mdLines.push(`- Lifecycle Stage: ${summary.lifecycle_stage}`);
  mdLines.push(`- Cross-Domain Links: ${summary.cross_domain_link_count}`);
  mdLines.push(`- KPIs: ${summary.kpi_count}`);
  mdLines.push(`- Quality Gates: ${summary.quality_gate_count}`);
  mdLines.push(`- Validation Rules: ${summary.validation_rules_count}`);
  mdLines.push('');
  mdLines.push('## Ownership');
  mdLines.push(`Team: ${summary.ownership_team}`);
  mdLines.push('');
  mdLines.push('## Artifacts');
  mdLines.push('Source JSON:');
  summary.source_json.forEach(s=> mdLines.push(`- ${s}`));
  mdLines.push('Generated Markdown:');
  summary.generated_docs.forEach(s=> mdLines.push(`- ${s}`));
  mdLines.push(`Trace File: ${summary.trace_file}`);
  mdLines.push('');
  mdLines.push('## Workflow Steps Executed');
  mdLines.push('- enrich-domain-authorities');
  mdLines.push('- validate-domain-authorities');
  mdLines.push('- generate-domain-doc (each domain)');
  mdLines.push('- verify-drift (checksum parity)');
  mdLines.push('- append-registry-run-metadata');
  mdLines.push('- consolidate-domain-lineage');
  mdLines.push('');
  mdLines.push('## Next Enhancement Suggestions');
  mdLines.push('- Add link graph export');
  mdLines.push('- Add cycle detection to validation');
  mdLines.push('- Emit per-domain volatility trend');
  mdLines.push('- Integrate run metadata into registry meta');

  const mdPath = path.resolve('docs','domains','orchestration-core-demo-results.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'),'utf8');

  console.log(`\n✅ Demo telemetry written: ${telemetryJsonPath}`);
  console.log(`✅ Demo markdown written: ${mdPath}`);
  console.log(`⏱  Total demo workflow duration: ${(Date.now()-start)}ms`);
}

main();