#!/usr/bin/env node
/**
 * demo-orchestration-domain-workflow.cjs
 * Demonstrates the Orchestration Domain System workflow:
 * 1. Validate all domain authority JSONs
 * 2. Enrich domain authorities (lineage_hash + integrity_checksum)
 * 3. Generate domain reflection markdown + trace artifacts
 * 4. Produce demo telemetry summary artifacts for orchestration-core
 *
 * Outputs:
 *  - .generated/domains/orchestration-core-demo-telemetry.json
 *  - docs/domains/orchestration-core-demo-results.md
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(label, cmd){
  console.log(`\n▶ ${label}`);
  try { const out = execSync(cmd, { stdio: 'pipe' }).toString(); console.log(out.trim()); }
  catch(e){ console.error(`❌ Step failed: ${label}`); console.error(e.stdout? e.stdout.toString(): e.message); process.exit(1);} }

function loadJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function sha256(content){ const crypto = require('crypto'); return crypto.createHash('sha256').update(content).digest('hex'); }

function main(){
  const start = Date.now();
  // Steps (enrich first to reconcile any manual edits, then validate)
  run('Enrich domain authorities', 'node scripts/enrich-domain-authorities.cjs');
  run('Validate domain authorities', 'node scripts/validate-domain-authorities.cjs');
  run('Generate orchestration-core doc', 'node scripts/generate-domain-doc.js docs/domains/orchestration-core.json');
  run('Generate telemetry-pipeline doc', 'node scripts/generate-domain-doc.js docs/domains/telemetry-pipeline.json');

  // Telemetry aggregation for orchestration-core
  const domainPath = path.resolve('docs','domains','orchestration-core.json');
  if(!fs.existsSync(domainPath)){ console.error('Missing orchestration-core domain JSON'); process.exit(1); }
  const domain = loadJson(domainPath);
  const summary = {
    demo_run_at: new Date().toISOString(),
    domain_id: domain.domain_id,
    lineage_hash: domain.provenance && domain.provenance.lineage_hash,
    integrity_checksum: domain.provenance && domain.provenance.integrity_checksum,
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
  mdLines.push(`Run Timestamp: ${summary.demo_run_at}`);
  mdLines.push(`Domain ID: \`${summary.domain_id}\``);
  mdLines.push('');
  mdLines.push('## Integrity');
  mdLines.push(`Stored Lineage Hash: \`${summary.lineage_hash}\``);
  mdLines.push(`Stored Integrity Checksum: \`${summary.integrity_checksum}\``);
  mdLines.push(`Deterministic Snapshot Hash (current JSON): \`${summary.deterministic_snapshot_hash}\``);
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
  mdLines.push('- validate-domain-authorities');
  mdLines.push('- enrich-domain-authorities');
  mdLines.push('- generate-domain-doc (orchestration-core)');
  mdLines.push('- generate-domain-doc (telemetry-pipeline)');
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