#!/usr/bin/env node
/**
 * detect-missing-domain-overlays.cjs
 * Phase 2: Use generated input specs + orchestration domain registry to highlight missing Layer-2 orchestration sequences.
 * Terminology refinement:
 *  - "overlay" => "orchestration sequence" (Layer-2 coordination above feature/plugin sequences)
 * Output:
 *  - .generated/domains/missing-sequences-report.json
 */
const fs = require('fs');
const path = require('path');

function loadJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function safeLoad(p){if(!fs.existsSync(p)) return null; try{return loadJSON(p);}catch{return null;}}

function main(){
  const orchestrationDomainsPath = path.resolve('docs','governance','orchestration-domains.json');
  const specsIndexPath = path.resolve('.generated','domains','overlay-input-spec-index.json');
  const sequencesDir = path.resolve('packages','ographx','.ographx','sequences');

  const orchestrationDomains = safeLoad(orchestrationDomainsPath);
  if(!orchestrationDomains){console.error('Missing orchestration-domains.json');process.exit(1);}  
  const index = safeLoad(specsIndexPath);
  if(!index){console.error('Missing overlay-input-spec-index.json (run generate-overlay-input-specs first)');process.exit(1);}  

  // Existing orchestration sequence file ids
  const existingSequenceFiles = fs.existsSync(sequencesDir)? fs.readdirSync(sequencesDir).filter(f=>f.endsWith('.json')).map(f=>f.replace(/\.json$/,'')) : [];
  const existingOverlays = new Set(existingSequenceFiles);

  // Threshold to classify readiness for orchestration sequence generation
  const THRESHOLD_READY = 4; // priorityScore >= 4 considered actionable

  // Determine candidate plugin domains needing orchestration sequence (from specs index) where no matching orchestration sequence exists
  const missingSpecs = index.specs.filter(s=> !existingOverlays.has(s.domainId));

  const missingSequences = missingSpecs.map(s => {
    const hasFeatureSequence = (s.handlers + s.topics + s.tests) > 0; // heuristic presence of lower-level activity
    const hasOrchestrationSequence = false; // by definition of missing
    const readyForGeneration = s.priorityScore >= THRESHOLD_READY;
    return {
      domainId: s.domainId,
      handlers: s.handlers,
      topics: s.topics,
      tests: s.tests,
      priorityScore: s.priorityScore,
      specPath: s.specPath,
      hasFeatureSequence,
      hasOrchestrationSequence,
      sequenceTypeNeeded: 'orchestration',
      readyForGeneration,
      generationGroup: readyForGeneration ? 'ready' : 'deferred'
    };
  });

  const report = {
    generated_at: new Date().toISOString(),
    total_domains: index.specs.length,
    existing_orchestration_sequences: existingOverlays.size,
    missing_sequences_count: missingSequences.length,
    threshold_used: THRESHOLD_READY,
    missingSequences,
    hint: 'Generate proposals for items in missingSequences[] where readyForGeneration=true using AI orchestration sequence generator phase.'
  };

  const outPath = path.resolve('.generated','domains','missing-sequences-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report,null,2));
  console.log(`✅ Missing orchestration sequences detected: ${missingSequences.length}`);
  console.log(`Ready for generation: ${missingSequences.filter(m=>m.readyForGeneration).length}`);
  console.log(`Report: ${outPath}`);
}
main();