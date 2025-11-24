#!/usr/bin/env node
/**
 * generate-orchestration-sequence-proposals.cjs
 * Produces Layer-2 orchestration sequence proposal JSON files for all domains
 * listed in .generated/domains/missing-sequences-report.json (both ready & deferred).
 * Existing sequences are skipped. Output includes an index summarizing results.
 */
const fs = require('fs');
const path = require('path');

function load(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function safe(p){if(!fs.existsSync(p)) return null; try{return load(p);}catch{return null;}}

function ensureDir(p){if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true});}

function buildProposal(entry){
  // Basic phase scaffolding derived heuristically from feature presence
  const phases = [];
  if(entry.hasFeatureSequence){
    phases.push({ id: 'intake', name: 'Request Intake', triggerTopic: `${entry.domainId}.requested`, emits: [`${entry.domainId}.validated`], handlers: ['validateIntent'] });
    phases.push({ id: 'validation', name: 'Validation', triggerTopic: `${entry.domainId}.validated`, emits: [`${entry.domainId}.enriched`], handlers: ['enrichIntent'] });
    phases.push({ id: 'commit', name: 'Commit', triggerTopic: `${entry.domainId}.enriched`, emits: [`${entry.domainId}.committed`], handlers: ['persistRecord','registerStructures'], atomic: true });
    phases.push({ id: 'activation', name: 'Activation', triggerTopic: `${entry.domainId}.committed`, emits: [`${entry.domainId}.activated`], handlers: ['emitActivationEvents','updateSelection'] });
    phases.push({ id: 'telemetry', name: 'Telemetry & History', triggerTopic: `${entry.domainId}.activated`, emits: [`${entry.domainId}.completed`], handlers: ['recordHistory','publishSummary'] });
  } else {
    phases.push({ id: 'exploration', name: 'Exploration Scaffold', triggerTopic: `${entry.domainId}.requested`, emits: [`${entry.domainId}.completed`], handlers: ['noopExploration'], notes: 'No feature-level signals yet; minimal orchestration scaffold.' });
  }

  // Attach business BDD spec file paths (heuristic matching)
  const businessBddSpecs = entry.businessBddSpecs || [];
  const businessBddHandlers = entry.businessBddHandlers || [];

  return {
    proposalId: entry.domainId,
    layer: 'orchestration',
    version: 1,
    status: 'proposal',
    readiness: entry.generationGroup, // 'ready' | 'deferred'
    priorityScore: entry.priorityScore,
    sequenceType: 'orchestration',
    featurePresence: entry.hasFeatureSequence,
    existingOrchestrationSequence: entry.hasOrchestrationSequence,
    businessBddSpecs,
    businessBddHandlers,
    correlation: { idStrategy: 'uuid-v4' },
    phases,
    failure: {
      errorTopic: `${entry.domainId}.failed`,
      compensationHandlers: ['compensateAttempt'],
      emitOnAnyPhaseError: true
    },
    telemetry: {
      counters: [`${entry.domainId}.total`],
      timers: [`${entry.domainId}.duration_ms`]
    },
    proposalMeta: {
      generatedAt: new Date().toISOString(),
      sourceReport: '.generated/domains/missing-sequences-report.json',
      specPath: entry.specPath,
      generationGroup: entry.generationGroup,
      reason: entry.readyForGeneration ? 'Meets priority threshold; orchestration absent.' : 'Below threshold; scaffold for future evolution.'
    }
  };
}

function main(){
  const reportPath = path.resolve('.generated','domains','missing-sequences-report.json');
  const report = safe(reportPath);
  if(!report){console.error('Missing missing-sequences-report.json; run detector first.');process.exit(1);}  

  const sequencesDir = path.resolve('packages','ographx','.ographx','sequences');
  if(!fs.existsSync(sequencesDir)){console.error('Sequences directory not found:', sequencesDir);process.exit(1);}  
  const existing = new Set(fs.readdirSync(sequencesDir).filter(f=>f.endsWith('.json')).map(f=>f.replace(/\.json$/,'')));

  // Gather business BDD related spec/test files (not only .feature to include generated spec ts)
  const allPaths = [];
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const item of fs.readdirSync(dir)){
      const full = path.join(dir,item);
      const stat = fs.statSync(full);
      if(stat.isDirectory()) walk(full); else allPaths.push(full);
    }
  }
  walk(path.resolve('packages'));

  // Categorize into specs vs handlers based on path patterns
  const specPatterns = [/business-bdd-specifications\.json$/i, /\.feature$/i];
  const handlerPatterns = [/business-bdd-handlers/i, /__tests__[\\/]business-bdd[\\/]/i];
  const bddSpecCandidates = allPaths.filter(p => specPatterns.some(rx => rx.test(p)));
  const bddHandlerCandidates = allPaths.filter(p => handlerPatterns.some(rx => rx.test(p)));

  // Build a quick index: map domain tokens -> matching files
  function matchBddSpecs(domainId){
    const tokens = domainId.split('-').filter(t=>t && t!=='symphony');
    const lowerTokens = tokens.map(t=>t.toLowerCase());
    const matches = bddSpecCandidates.filter(f=>{
      const lower = f.toLowerCase();
      return lowerTokens.some(t=> lower.includes(t));
    });
    return matches.map(f=> path.relative(process.cwd(), f));
  }
  function matchBddHandlers(domainId){
    const tokens = domainId.split('-').filter(t=>t && t!=='symphony');
    const lowerTokens = tokens.map(t=>t.toLowerCase());
    const matches = bddHandlerCandidates.filter(f=>{
      const lower = f.toLowerCase();
      return lowerTokens.some(t=> lower.includes(t));
    });
    return matches.map(f=> path.relative(process.cwd(), f));
  }

  // Explicit package-level mapping augmentation for known domains not token-compatible
  const explicitBddSpecs = {
    'self-healing-symphony': [
      'packages/self-healing/.generated/comprehensive-business-bdd-specifications.json'
    ],
    'slo-dashboard-symphony': [
      'packages/slo-dashboard/.generated/slo-dashboard-business-bdd-specifications.json'
    ]
  };
  const explicitBddHandlers = {
    'self-healing-symphony': [
      'packages/self-healing/__tests__/business-bdd-handlers',
      'packages/self-healing/__tests__/business-bdd'
    ],
    'slo-dashboard-symphony': [
      'packages/slo-dashboard/__tests__/business-bdd'
    ]
  };

  const proposalsDir = path.resolve('.generated','domains','orchestration-sequence-proposals');
  ensureDir(proposalsDir);

  const proposals = [];
  const skipped = [];
  for(const entry of report.missingSequences){
    if(existing.has(entry.domainId)) { skipped.push(entry.domainId); continue; }
    let specs = matchBddSpecs(entry.domainId);
    let handlers = matchBddHandlers(entry.domainId);
    if(explicitBddSpecs[entry.domainId]){
      specs = specs.concat(explicitBddSpecs[entry.domainId]);
    }
    if(explicitBddHandlers[entry.domainId]){
      handlers = handlers.concat(explicitBddHandlers[entry.domainId]);
    }
    // Deduplicate & normalize paths
    entry.businessBddSpecs = Array.from(new Set(specs));
    entry.businessBddHandlers = Array.from(new Set(handlers));
    entry.businessBddFiles = entry.businessBddSpecs.concat(entry.businessBddHandlers);
    const proposal = buildProposal(entry);
    const outFile = path.join(proposalsDir, `${entry.domainId}.proposal.json`);
    fs.writeFileSync(outFile, JSON.stringify(proposal,null,2));
    proposals.push({
      domainId: entry.domainId,
      file: outFile,
      readiness: entry.generationGroup,
      priorityScore: entry.priorityScore,
      businessBddSpecsCount: entry.businessBddSpecs.length,
      businessBddHandlersCount: entry.businessBddHandlers.length
    });
  }

  const index = {
    generated_at: new Date().toISOString(),
    total_candidates: report.missingSequences.length,
    existing_sequences_skipped: skipped.length,
    proposals_written: proposals.length,
    ready_count: proposals.filter(p=>p.readiness==='ready').length,
    deferred_count: proposals.filter(p=>p.readiness!=='ready').length,
    threshold_used: report.threshold_used,
    skipped,
    proposals,
    summary: {
      proposals_with_bdd_specs: proposals.filter(p=>p.businessBddSpecsCount>0).length,
      proposals_with_bdd_handlers: proposals.filter(p=>p.businessBddHandlersCount>0).length,
      total_bdd_specs_refs: proposals.reduce((a,p)=>a+p.businessBddSpecsCount,0),
      total_bdd_handlers_refs: proposals.reduce((a,p)=>a+p.businessBddHandlersCount,0)
    }
  };
  fs.writeFileSync(path.join(proposalsDir,'proposals-index.json'), JSON.stringify(index,null,2));
  console.log(`✅ Orchestration sequence proposals generated: ${proposals.length}`);
  console.log(`Ready: ${index.ready_count} | Deferred: ${index.deferred_count} | Skipped existing: ${skipped.length}`);
  console.log(`Index: ${path.join(proposalsDir,'proposals-index.json')}`);
}
main();
