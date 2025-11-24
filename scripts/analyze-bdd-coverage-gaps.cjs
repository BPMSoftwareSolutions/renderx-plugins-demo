#!/usr/bin/env node
/**
 * analyze-bdd-coverage-gaps.cjs
 * Analyzes gaps between plugin domains and business BDD coverage.
 * Outputs:
 *  - Gap analysis report with recommendations
 *  - Proposed BDD spec scaffolds for domains lacking coverage
 */
const fs = require('fs');
const path = require('path');

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function safe(p) { if (!fs.existsSync(p)) return null; try { return load(p); } catch { return null; } }
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

// Discover all BDD-related files
function discoverBddFiles(packagesDir) {
  const specs = [];
  const handlers = [];
  const features = [];
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else {
        const rel = path.relative(process.cwd(), full).replace(/\\/g, '/');
        if (/business-bdd-specifications\.json$/i.test(item)) {
          specs.push(rel);
        } else if (/\.feature$/i.test(item)) {
          features.push(rel);
        } else if (/business-bdd-handlers/i.test(full) || /__tests__[\\/]business-bdd[\\/]/i.test(full)) {
          handlers.push(rel);
        }
      }
    }
  }
  walk(packagesDir);
  return { specs, handlers, features };
}

// Extract package name from path
function extractPackage(filePath) {
  const match = filePath.match(/packages\/([^/]+)\//);
  return match ? match[1] : null;
}

// Group files by package
function groupByPackage(files) {
  const groups = {};
  for (const f of files) {
    const pkg = extractPackage(f);
    if (pkg) {
      if (!groups[pkg]) groups[pkg] = [];
      groups[pkg].push(f);
    }
  }
  return groups;
}

// Extract domain prefix from domain ID
function getDomainPrefix(domainId) {
  // Remove '-symphony' suffix and get the domain prefix
  return domainId.replace(/-symphony$/, '');
}

// Map domain prefix to package
function mapDomainToPackage(domainPrefix) {
  const mapping = {
    'canvas-component': 'canvas-component',
    'canvas-line': 'canvas-line', 
    'control-panel': 'control-panel',
    'library': 'library',
    'header-ui': 'header-ui',
    'catalog': 'catalog',
    'real-estate-analyzer': 'real-estate-analyzer'
  };
  
  for (const [prefix, pkg] of Object.entries(mapping)) {
    if (domainPrefix.startsWith(prefix)) {
      return pkg;
    }
  }
  return null;
}

function main() {
  console.log('🔍 Analyzing BDD Coverage Gaps...\n');
  
  // Load input specs index
  const indexPath = path.resolve('.generated', 'domains', 'overlay-input-spec-index.json');
  const index = safe(indexPath);
  if (!index) {
    console.error('Missing overlay-input-spec-index.json. Run generate-overlay-input-specs.cjs first.');
    process.exit(1);
  }
  
  // Discover all BDD files
  const packagesDir = path.resolve('packages');
  const bddFiles = discoverBddFiles(packagesDir);
  
  console.log('📚 BDD File Discovery:');
  console.log(`   Spec files: ${bddFiles.specs.length}`);
  console.log(`   Feature files: ${bddFiles.features.length}`);
  console.log(`   Handler files: ${bddFiles.handlers.length}`);
  console.log('');
  
  // Group by package
  const specsByPkg = groupByPackage(bddFiles.specs);
  const featuresByPkg = groupByPackage(bddFiles.features);
  const handlersByPkg = groupByPackage(bddFiles.handlers);
  
  console.log('📦 BDD Coverage by Package:');
  const allPkgs = new Set([
    ...Object.keys(specsByPkg),
    ...Object.keys(featuresByPkg),
    ...Object.keys(handlersByPkg)
  ]);
  for (const pkg of [...allPkgs].sort()) {
    const specs = specsByPkg[pkg]?.length || 0;
    const features = featuresByPkg[pkg]?.length || 0;
    const handlers = handlersByPkg[pkg]?.length || 0;
    console.log(`   ${pkg}: ${specs} specs, ${features} features, ${handlers} handlers`);
  }
  console.log('');
  
  // Analyze domain gaps
  const gaps = {
    domainsWithoutBdd: [],
    packagesWithBdd: [...allPkgs],
    packagesWithoutDomains: [],
    recommendations: []
  };
  
  // Group domains by their target package
  const domainsByPackage = {};
  for (const spec of index.specs) {
    const prefix = getDomainPrefix(spec.domainId);
    const pkg = mapDomainToPackage(prefix);
    if (pkg) {
      if (!domainsByPackage[pkg]) domainsByPackage[pkg] = [];
      domainsByPackage[pkg].push(spec);
    }
    
    if (spec.businessBddSpecs === 0 && spec.businessBddHandlers === 0) {
      gaps.domainsWithoutBdd.push({
        domainId: spec.domainId,
        package: pkg,
        priorityScore: spec.priorityScore,
        handlers: spec.handlers,
        topics: spec.topics
      });
    }
  }
  
  // Find packages with BDD but no domain coverage
  for (const pkg of allPkgs) {
    if (!domainsByPackage[pkg]) {
      gaps.packagesWithoutDomains.push(pkg);
    }
  }
  
  console.log('🚨 Gap Analysis:');
  console.log(`   Domains without BDD coverage: ${gaps.domainsWithoutBdd.length}`);
  console.log(`   Packages with BDD content: ${gaps.packagesWithBdd.length}`);
  console.log(`   Packages with BDD but no domain mapping: ${gaps.packagesWithoutDomains.length}`);
  console.log('');
  
  // Generate recommendations
  console.log('📋 Recommendations:\n');
  
  // Group gaps by package for actionable recommendations
  const gapsByPackage = {};
  for (const gap of gaps.domainsWithoutBdd) {
    const pkg = gap.package || 'unknown';
    if (!gapsByPackage[pkg]) gapsByPackage[pkg] = [];
    gapsByPackage[pkg].push(gap);
  }
  
  const recommendations = [];
  
  for (const [pkg, domains] of Object.entries(gapsByPackage)) {
    if (pkg === 'unknown') continue;
    
    const hasBdd = allPkgs.has(pkg);
    const topDomains = domains.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 3);
    
    const rec = {
      package: pkg,
      domainCount: domains.length,
      hasBddInfrastructure: hasBdd,
      topPriorityDomains: topDomains.map(d => ({ id: d.domainId, score: d.priorityScore })),
      action: hasBdd 
        ? `Extend existing BDD in packages/${pkg}/ to cover ${domains.length} domains`
        : `Create packages/${pkg}/__tests__/business-bdd/ directory and add BDD specs`,
      scaffoldNeeded: !hasBdd
    };
    
    recommendations.push(rec);
    
    console.log(`   📦 ${pkg} (${domains.length} domains without BDD)`);
    console.log(`      Has BDD infrastructure: ${hasBdd ? '✅' : '❌'}`);
    console.log(`      Top priority: ${topDomains.map(d => d.domainId).join(', ')}`);
    console.log(`      Action: ${rec.action}`);
    console.log('');
  }
  
  // Generate scaffold templates for packages needing BDD
  const scaffoldDir = path.resolve('.generated', 'domains', 'bdd-scaffolds');
  ensureDir(scaffoldDir);
  
  let scaffoldsCreated = 0;
  for (const rec of recommendations) {
    if (rec.scaffoldNeeded) {
      const scaffold = {
        package: rec.package,
        suggestedPath: `packages/${rec.package}/__tests__/business-bdd/`,
        domains: rec.topPriorityDomains,
        template: {
          specFile: `${rec.package}-business-bdd-specifications.json`,
          structure: {
            version: '1.0.0',
            package: rec.package,
            domains: rec.topPriorityDomains.map(d => ({
              domainId: d.id,
              scenarios: [
                {
                  id: `${d.id}-happy-path`,
                  name: `${d.id.replace(/-/g, ' ')} happy path`,
                  given: 'the system is in a valid state',
                  when: `the ${d.id.replace(/-symphony/, '')} operation is triggered`,
                  then: 'the operation completes successfully',
                  priority: 'high'
                }
              ]
            }))
          }
        }
      };
      
      const scaffoldPath = path.join(scaffoldDir, `${rec.package}-scaffold.json`);
      fs.writeFileSync(scaffoldPath, JSON.stringify(scaffold, null, 2));
      scaffoldsCreated++;
    }
  }
  
  // Write full gap report
  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      totalDomains: index.specs.length,
      domainsWithBdd: index.specs.length - gaps.domainsWithoutBdd.length,
      domainsWithoutBdd: gaps.domainsWithoutBdd.length,
      coveragePercent: ((index.specs.length - gaps.domainsWithoutBdd.length) / index.specs.length * 100).toFixed(1),
      packagesWithBdd: gaps.packagesWithBdd.length,
      scaffoldsGenerated: scaffoldsCreated
    },
    bddFileInventory: {
      specs: bddFiles.specs,
      features: bddFiles.features,
      handlerDirs: [...new Set(bddFiles.handlers.map(h => path.dirname(h)))]
    },
    gapsByPackage: Object.entries(gapsByPackage).map(([pkg, domains]) => ({
      package: pkg,
      domains: domains.map(d => d.domainId),
      count: domains.length
    })),
    recommendations,
    scaffoldPaths: scaffoldsCreated > 0 ? fs.readdirSync(scaffoldDir).map(f => path.join(scaffoldDir, f)) : []
  };
  
  const reportPath = path.resolve('.generated', 'domains', 'bdd-coverage-gap-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('═'.repeat(60));
  console.log('📊 Summary:');
  console.log(`   Total domains: ${report.summary.totalDomains}`);
  console.log(`   With BDD coverage: ${report.summary.domainsWithBdd} (${report.summary.coveragePercent}%)`);
  console.log(`   Without BDD coverage: ${report.summary.domainsWithoutBdd}`);
  console.log(`   Scaffolds generated: ${scaffoldsCreated}`);
  console.log('');
  console.log(`📄 Gap report: ${reportPath}`);
  if (scaffoldsCreated > 0) {
    console.log(`📁 Scaffolds: ${scaffoldDir}`);
  }
}

main();
