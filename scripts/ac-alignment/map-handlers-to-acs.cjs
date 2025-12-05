#!/usr/bin/env node
/**
 * Map Handlers to ACs
 * Correlates handler usage with AC registry to map tests to ACs
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', 'renderx-web-orchestration.registry.json');
const HANDLER_USAGE = path.join(ROOT, '.generated', 'ac-alignment', 'handler-usage.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'handler-to-ac-mapping.json');

function mapHandlersToACs() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const handlerUsage = JSON.parse(fs.readFileSync(HANDLER_USAGE, 'utf8'));
  
  const acs = registry.acs || [];
  const mapping = {
    testToACs: {},
    acCoverage: {},
    unmatchedTests: [],
    matchedTests: 0
  };
  
  // Build handler lookup from ACs
  const handlerToACs = {};
  acs.forEach(ac => {
    if (ac.handler) {
      const handlerName = ac.handler.split('#')[1] || ac.handler.split('/').pop();
      if (!handlerToACs[handlerName]) {
        handlerToACs[handlerName] = [];
      }
      handlerToACs[handlerName].push(ac);
    }
  });
  
  // Map tests to ACs based on handler usage
  Object.entries(handlerUsage).forEach(([testFile, usage]) => {
    const matchedACs = [];
    
    // Check imports
    usage.imports.forEach(imp => {
      const handlerName = imp.name;
      if (handlerToACs[handlerName]) {
        matchedACs.push(...handlerToACs[handlerName]);
      }
    });
    
    // Check calls
    usage.calls.forEach(call => {
      if (handlerToACs[call]) {
        matchedACs.push(...handlerToACs[call]);
      }
    });
    
    if (matchedACs.length > 0) {
      mapping.testToACs[testFile] = [...new Set(matchedACs.map(ac => ac.acId))];
      mapping.matchedTests++;
      
      matchedACs.forEach(ac => {
        if (!mapping.acCoverage[ac.acId]) {
          mapping.acCoverage[ac.acId] = [];
        }
        mapping.acCoverage[ac.acId].push(testFile);
      });
    } else {
      mapping.unmatchedTests.push(testFile);
    }
  });
  
  mapping.totalTests = Object.keys(handlerUsage).length;
  mapping.totalACs = acs.length;
  mapping.coveredACs = Object.keys(mapping.acCoverage).length;
  mapping.coveragePercent = Math.floor((mapping.coveredACs / mapping.totalACs) * 100);
  
  fs.writeFileSync(OUTPUT, JSON.stringify(mapping, null, 2));
  
  console.log(`Total tests: ${mapping.totalTests}`);
  console.log(`Matched tests: ${mapping.matchedTests}`);
  console.log(`Covered ACs: ${mapping.coveredACs}/${mapping.totalACs} (${mapping.coveragePercent}%)`);
  console.log(`Output: ${OUTPUT}`);
  
  return mapping;
}

if (require.main === module) mapHandlersToACs();
module.exports = { mapHandlersToACs };
