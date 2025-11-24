#!/usr/bin/env node
/**
 * generate-bdd-spec-scaffolds.cjs
 * Generates business BDD specification files for packages lacking coverage.
 * Uses the gap report and input specs to create comprehensive BDD specs.
 * 
 * Outputs:
 *  - packages/<pkg>/__tests__/business-bdd/<pkg>-business-bdd-specifications.json
 */
const fs = require('fs');
const path = require('path');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function safe(p) { if (!fs.existsSync(p)) return null; try { return load(p); } catch { return null; } }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

// Generate scenarios for a domain based on its input spec
function generateScenariosForDomain(spec) {
  const scenarios = [];
  const domainName = spec.domainName || spec.domainId.replace(/-symphony$/, '').replace(/-/g, ' ');
  const baseId = spec.domainId.replace(/-symphony$/, '');
  
  // Happy path scenario
  scenarios.push({
    id: `${baseId}-happy-path`,
    name: `${domainName} completes successfully`,
    given: `the system is initialized and ready for ${domainName} operations`,
    when: `a valid ${domainName} request is processed`,
    then: 'the operation completes without errors and emits success events',
    priority: 'critical',
    tags: ['happy-path', 'smoke']
  });
  
  // Validation scenario
  if (spec.handlers && spec.handlers.length > 0) {
    scenarios.push({
      id: `${baseId}-validation`,
      name: `${domainName} validates input parameters`,
      given: `the ${domainName} handler chain is active`,
      when: 'an invalid or malformed request is received',
      then: 'validation errors are captured and appropriate error events are emitted',
      priority: 'high',
      tags: ['validation', 'error-handling'],
      handlers: spec.handlers.map(h => h.name || h)
    });
  }
  
  // Handler coverage scenarios
  if (spec.handlers && spec.handlers.length > 1) {
    const handlerNames = spec.handlers.map(h => h.name || h);
    scenarios.push({
      id: `${baseId}-handler-orchestration`,
      name: `${domainName} handler chain executes in order`,
      given: `all ${handlerNames.length} handlers are registered for ${domainName}`,
      when: 'the orchestration sequence is triggered',
      then: `handlers execute in sequence: ${handlerNames.join(' → ')}`,
      priority: 'high',
      tags: ['orchestration', 'handler-chain'],
      expectedHandlerOrder: handlerNames
    });
  }
  
  // Topic coverage scenarios
  if (spec.topics && spec.topics.length > 0) {
    const topicNames = spec.topics.map(t => t.name || t);
    scenarios.push({
      id: `${baseId}-topic-emissions`,
      name: `${domainName} emits expected topics`,
      given: `the ${domainName} sequence is executing`,
      when: 'each phase of the sequence completes',
      then: `the following topics are emitted: ${topicNames.slice(0, 3).join(', ')}${topicNames.length > 3 ? ` (+${topicNames.length - 3} more)` : ''}`,
      priority: 'medium',
      tags: ['topics', 'events'],
      expectedTopics: topicNames
    });
  }
  
  // Error recovery scenario
  scenarios.push({
    id: `${baseId}-error-recovery`,
    name: `${domainName} handles failures gracefully`,
    given: `the ${domainName} operation is in progress`,
    when: 'an unexpected error occurs during execution',
    then: 'the system logs the error, emits failure events, and maintains consistent state',
    priority: 'high',
    tags: ['error-handling', 'resilience']
  });
  
  // Telemetry scenario
  scenarios.push({
    id: `${baseId}-telemetry`,
    name: `${domainName} records telemetry metrics`,
    given: `telemetry collection is enabled for ${domainName}`,
    when: 'the operation completes (success or failure)',
    then: 'duration, success/failure counts, and relevant metadata are recorded',
    priority: 'medium',
    tags: ['telemetry', 'observability']
  });
  
  return scenarios;
}

function main() {
  console.log('🏗️  Generating BDD Specification Scaffolds...\n');
  
  // Load gap report
  const gapReportPath = path.resolve('.generated', 'domains', 'bdd-coverage-gap-report.json');
  const gapReport = safe(gapReportPath);
  if (!gapReport) {
    console.error('Missing bdd-coverage-gap-report.json. Run analyze-bdd-coverage-gaps.cjs first.');
    process.exit(1);
  }
  
  // Load input specs index
  const indexPath = path.resolve('.generated', 'domains', 'overlay-input-spec-index.json');
  const index = safe(indexPath);
  
  // Group specs by package
  const specsByPackage = {};
  for (const specMeta of index.specs) {
    const specPath = specMeta.specPath;
    const spec = safe(specPath);
    if (!spec) continue;
    
    // Extract package from domainId
    let pkg = null;
    const prefixes = ['canvas-component', 'canvas-line', 'control-panel', 'library', 'header-ui', 'catalog', 'real-estate-analyzer'];
    for (const prefix of prefixes) {
      if (spec.domainId.startsWith(prefix)) {
        pkg = prefix;
        break;
      }
    }
    if (!pkg) continue;
    
    if (!specsByPackage[pkg]) specsByPackage[pkg] = [];
    specsByPackage[pkg].push(spec);
  }
  
  let filesCreated = 0;
  const createdFiles = [];
  
  for (const rec of gapReport.recommendations) {
    if (!rec.scaffoldNeeded) continue;
    
    const pkg = rec.package;
    const specs = specsByPackage[pkg] || [];
    
    if (specs.length === 0) {
      console.log(`⚠️  No specs found for package: ${pkg}`);
      continue;
    }
    
    // Generate comprehensive BDD spec file
    const bddSpec = {
      $schema: '../../../.generated/schemas/business-bdd-spec-schema.json',
      version: '1.0.0',
      package: pkg,
      generated_at: new Date().toISOString(),
      generator: 'generate-bdd-spec-scaffolds.cjs',
      domains: specs.map(spec => ({
        domainId: spec.domainId,
        domainName: spec.domainName,
        category: spec.category,
        pluginId: spec.pluginId,
        priorityScore: spec.priorityScore,
        complexity: spec.complexity,
        scenarios: generateScenariosForDomain(spec)
      })),
      coverage: {
        totalDomains: specs.length,
        totalScenarios: 0, // Will be computed
        byPriority: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      }
    };
    
    // Compute coverage stats
    let totalScenarios = 0;
    const byPriority = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const domain of bddSpec.domains) {
      totalScenarios += domain.scenarios.length;
      for (const scenario of domain.scenarios) {
        if (byPriority[scenario.priority] !== undefined) {
          byPriority[scenario.priority]++;
        }
      }
    }
    bddSpec.coverage.totalScenarios = totalScenarios;
    bddSpec.coverage.byPriority = byPriority;
    
    // Create directory and write file
    const bddDir = path.join('packages', pkg, '__tests__', 'business-bdd');
    ensureDir(bddDir);
    
    const fileName = `${pkg}-business-bdd-specifications.json`;
    const filePath = path.join(bddDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(bddSpec, null, 2));
    
    console.log(`✅ ${pkg}: Created ${fileName}`);
    console.log(`   📊 ${specs.length} domains, ${totalScenarios} scenarios`);
    console.log(`   📁 ${filePath}`);
    console.log('');
    
    createdFiles.push({
      package: pkg,
      path: filePath,
      domains: specs.length,
      scenarios: totalScenarios
    });
    filesCreated++;
  }
  
  // Write generation summary
  const summaryPath = path.resolve('.generated', 'domains', 'bdd-scaffold-generation-summary.json');
  const summary = {
    generated_at: new Date().toISOString(),
    filesCreated,
    files: createdFiles,
    totalDomainsCovered: createdFiles.reduce((a, f) => a + f.domains, 0),
    totalScenarios: createdFiles.reduce((a, f) => a + f.scenarios, 0)
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('═'.repeat(60));
  console.log('📊 Generation Summary:');
  console.log(`   Files created: ${filesCreated}`);
  console.log(`   Domains covered: ${summary.totalDomainsCovered}`);
  console.log(`   Scenarios generated: ${summary.totalScenarios}`);
  console.log(`   Summary: ${summaryPath}`);
}

main();
