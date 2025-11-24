#!/usr/bin/env node
/**
 * generate-overlay-input-specs.cjs
 * Phase 1: Produce per-domain overlay input specs using existing audit artifacts.
 * Non-invasive; read-only over artifacts.
 * Outputs:
 *  - .generated/domains/overlay-input-specs/<domainId>.json (for candidate domains without orchestration overlay)
 *  - .generated/domains/overlay-input-spec-index.json (summary + priority seed)
 */
const fs = require('fs');
const path = require('path');

function loadJSON(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function ensureDir(d){if(!fs.existsSync(d)) fs.mkdirSync(d,{recursive:true});}

function safeLoad(p){if(!fs.existsSync(p)) return null; try{return loadJSON(p);}catch{return null;}}

// ─────────────────────────────────────────────────────────────────────────────
// Business BDD Discovery Functions
// ─────────────────────────────────────────────────────────────────────────────
function discoverAllPaths(baseDir) {
  const allPaths = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full); else allPaths.push(full);
    }
  }
  walk(baseDir);
  return allPaths;
}

function buildBddIndex(packagesDir) {
  const allPaths = discoverAllPaths(packagesDir);
  
  // Patterns for BDD specs (JSON and feature files)
  const specPatterns = [/business-bdd-specifications\.json$/i, /\.feature$/i];
  
  // Handler patterns: files in business-bdd-handlers OR business-bdd directories
  // but EXCLUDE spec JSON files (only match .ts, .js, .spec.ts handler files)
  const handlerDirPatterns = [/business-bdd-handlers/i, /__tests__[\\/]business-bdd[\\/]/i];
  const handlerFileExtensions = /\.(ts|js|spec\.ts|spec\.js)$/i;
  
  return {
    specCandidates: allPaths.filter(p => specPatterns.some(rx => rx.test(p))),
    handlerCandidates: allPaths.filter(p => 
      handlerDirPatterns.some(rx => rx.test(p)) && 
      handlerFileExtensions.test(p) &&
      !specPatterns.some(rx => rx.test(p)) // Exclude spec files
    )
  };
}

// Explicit package-level mapping for known domains not token-compatible
const EXPLICIT_BDD_SPECS = {
  'self-healing-symphony': [
    'packages/self-healing/.generated/comprehensive-business-bdd-specifications.json'
  ],
  'slo-dashboard-symphony': [
    'packages/slo-dashboard/.generated/slo-dashboard-business-bdd-specifications.json'
  ]
};

const EXPLICIT_BDD_HANDLERS = {
  'self-healing-symphony': [
    'packages/self-healing/__tests__/business-bdd-handlers',
    'packages/self-healing/__tests__/business-bdd'
  ],
  'slo-dashboard-symphony': [
    'packages/slo-dashboard/__tests__/business-bdd'
  ]
};

// Map domain ID prefixes to their corresponding package names
const DOMAIN_TO_PACKAGE = {
  'canvas-component': 'canvas-component',
  'canvas-line': 'canvas-line',
  'control-panel': 'control-panel',
  'library': 'library',
  'header-ui': 'header-ui',
  'catalog': 'catalog',
  'real-estate-analyzer': 'real-estate-analyzer',
  'self-healing': 'self-healing',
  'slo-dashboard': 'slo-dashboard'
};

function getDomainPackage(domainId) {
  // Try to match known prefixes (longest first for specificity)
  const prefixes = Object.keys(DOMAIN_TO_PACKAGE).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (domainId.startsWith(prefix)) {
      return DOMAIN_TO_PACKAGE[prefix];
    }
  }
  // Fallback: extract first two tokens as package guess
  const tokens = domainId.split('-').filter(t => t && t !== 'symphony');
  return tokens.slice(0, 2).join('-');
}

function matchBddSpecs(domainId, specCandidates) {
  const packageName = getDomainPackage(domainId);
  const packagePattern = new RegExp(`packages[/\\\\]${packageName}[/\\\\]`, 'i');
  
  // Only match files within the domain's package
  const matches = specCandidates.filter(f => packagePattern.test(f));
  
  let results = matches.map(f => path.relative(process.cwd(), f).replace(/\\/g, '/'));
  if (EXPLICIT_BDD_SPECS[domainId]) {
    results = results.concat(EXPLICIT_BDD_SPECS[domainId]);
  }
  return Array.from(new Set(results));
}

function matchBddHandlers(domainId, handlerCandidates) {
  const packageName = getDomainPackage(domainId);
  const packagePattern = new RegExp(`packages[/\\\\]${packageName}[/\\\\]`, 'i');
  
  // Only match files within the domain's package
  const matches = handlerCandidates.filter(f => packagePattern.test(f));
  
  let results = matches.map(f => path.relative(process.cwd(), f).replace(/\\/g, '/'));
  if (EXPLICIT_BDD_HANDLERS[domainId]) {
    results = results.concat(EXPLICIT_BDD_HANDLERS[domainId]);
  }
  return Array.from(new Set(results));
}

function main(){
  const orchestrationDomainsPath = path.resolve('docs','governance','orchestration-domains.json');
  const externalAuditPath = path.resolve('packages','ographx','.ographx','artifacts','renderx-web','analysis','external-interactions-audit.json');
  const irHandlersPath = path.resolve('packages','ographx','.ographx','artifacts','renderx-web','ir','ir-handlers.json');
  const irSequencesPath = path.resolve('packages','ographx','.ographx','artifacts','renderx-web','ir','ir-sequences.json');
  const irHandlerTestsPath = path.resolve('packages','ographx','.ographx','artifacts','renderx-web','ir','ir-handler-tests.json');

  const orchestrationDomains = safeLoad(orchestrationDomainsPath);
  if(!orchestrationDomains){console.error('Missing orchestration-domains.json');process.exit(1);}  
  const audit = safeLoad(externalAuditPath) || { edges: [], summary: {} };
  const irHandlers = safeLoad(irHandlersPath) || { handlers: [] };
  const irSequences = safeLoad(irSequencesPath) || { sequences: [] };
  const irHandlerTests = safeLoad(irHandlerTestsPath) || { tests: [] };

  const domains = orchestrationDomains.domains || [];
  const edges = audit.edges || [];

  // Build quick indexes
  const handlerTestCount = {}; (irHandlerTests.tests||[]).forEach(t=>{(t.handlers||[]).forEach(h=>{handlerTestCount[h]=(handlerTestCount[h]||0)+1;});});

  // Determine existing orchestration overlays (category === 'orchestration')
  const orchestrationOverlayIds = new Set(domains.filter(d=>d.category==='orchestration').map(d=>d.id));

  // Candidate plugin domains lacking overlay
  const candidateDomains = domains.filter(d=>d.category==='plugin');

  // Build BDD file index for all packages
  const packagesDir = path.resolve('packages');
  const bddIndex = buildBddIndex(packagesDir);
  console.log(`📚 BDD Discovery: ${bddIndex.specCandidates.length} spec files, ${bddIndex.handlerCandidates.length} handler files`);

  const outDir = path.resolve('.generated','domains','overlay-input-specs');
  ensureDir(outDir);
  const index = { generated_at: new Date().toISOString(), specs: [] };

  candidateDomains.forEach(d=>{
    // Gather edges referencing this sequence id OR pluginId
    const relatedEdges = edges.filter(e=> e.sequenceId === d.id || e.pluginId === d.pluginId);
    const handlersSet = new Set(); const topicsSet = new Set(); const testsSet = new Set();
    relatedEdges.forEach(e=>{
      if(e.handler) handlersSet.add(e.handler);
      if(e.topic) topicsSet.add(e.topic);
      (e.tests && e.tests.files || []).forEach(f=> testsSet.add(f));
    });
    const handlers = Array.from(handlersSet).map(h=>({ name: h, testCount: handlerTestCount[h]||0 }));
    const topics = Array.from(topicsSet).map(t=>({ name: t }));
    const tests = Array.from(testsSet).map(f=>({ filePath: f }));

    // Gap classification (simple heuristic) - unsequenced handlers if no related edges (none here) else if testCount==0
    const untestedHandlers = handlers.filter(h=> h.testCount===0).map(h=>h.name);
    // Orphan topics: those with name containing ':' but no tests referencing them (simplified heuristic)
    const orphanTopics = topics.filter(t=> !tests.some(ts=> ts.filePath.toLowerCase().includes(t.name.split(':').pop().toLowerCase()))).map(t=>t.name);

    // Complexity
    const complexity = { handlerCount: handlers.length, topicCount: topics.length, interactionEdges: relatedEdges.length };
    // Priority score (simple seed formula)
    const priorityScore = (untestedHandlers.length*2) + (orphanTopics.length*1.5) + (complexity.interactionEdges*0.1);

    // Discover business BDD specs and handlers for this domain
    const businessBddSpecs = matchBddSpecs(d.id, bddIndex.specCandidates);
    const businessBddHandlers = matchBddHandlers(d.id, bddIndex.handlerCandidates);

    const spec = {
      domainId: d.id,
      domainName: d.name,
      existingOverlayPresent: false, // plugin layer only
      category: d.category,
      pluginId: d.pluginId,
      handlers,
      topics,
      tests,
      businessBddSpecs,
      businessBddHandlers,
      featureSequences: relatedEdges.reduce((acc,e)=>{ if(e.sequenceId) acc.add(e.sequenceId); return acc;}, new Set()),
      gaps: {
        untestedHandlers,
        orphanTopics,
        unsequencedHandlers: [] // placeholder for future deeper diff
      },
      complexity,
      priorityScore: Number(priorityScore.toFixed(2)),
      provenance: {
        sources: {
          orchestrationDomains: orchestrationDomainsPath,
          externalInteractionsAudit: externalAuditPath,
          irHandlers: irHandlersPath,
          irSequences: irSequencesPath,
          irHandlerTests: irHandlerTestsPath
        },
        generatedAt: new Date().toISOString()
      }
    };
    // Convert featureSequences set to array
    spec.featureSequences = Array.from(spec.featureSequences);
    const specPath = path.join(outDir, `${d.id}.json`);
    fs.writeFileSync(specPath, JSON.stringify(spec,null,2));
    index.specs.push({ 
      domainId: d.id, 
      handlers: handlers.length, 
      topics: topics.length, 
      tests: tests.length, 
      businessBddSpecs: businessBddSpecs.length,
      businessBddHandlers: businessBddHandlers.length,
      priorityScore: spec.priorityScore, 
      specPath 
    });
  });

  // Sort index by priorityScore descending
  index.specs.sort((a,b)=> b.priorityScore - a.priorityScore);

  // Add BDD summary to index
  index.bddSummary = {
    specsWithBddSpecs: index.specs.filter(s => s.businessBddSpecs > 0).length,
    specsWithBddHandlers: index.specs.filter(s => s.businessBddHandlers > 0).length,
    totalBddSpecsRefs: index.specs.reduce((a, s) => a + s.businessBddSpecs, 0),
    totalBddHandlersRefs: index.specs.reduce((a, s) => a + s.businessBddHandlers, 0)
  };

  const indexPath = path.resolve('.generated','domains','overlay-input-spec-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index,null,2));
  console.log(`✅ Generated ${index.specs.length} overlay input specs.`);
  console.log(`📋 BDD Coverage: ${index.bddSummary.specsWithBddSpecs} specs with BDD specs, ${index.bddSummary.specsWithBddHandlers} with BDD handlers`);
  console.log(`Index: ${indexPath}`);
}
main();