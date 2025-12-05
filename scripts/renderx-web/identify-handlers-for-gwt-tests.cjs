#!/usr/bin/env node

/**
 * Identify Handlers with ACs that Need Runtime GWT Tests
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const AC_REGISTRY = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');
const CLASSIFICATION = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-classification.json');

function main() {
  console.log('🧪 Identifying Handlers for Runtime GWT Tests\n');

  const acRegistry = JSON.parse(fs.readFileSync(AC_REGISTRY, 'utf-8'));
  const classification = JSON.parse(fs.readFileSync(CLASSIFICATION, 'utf-8'));

  // Map handlers to their ACs
  const handlersWithACs = new Map();
  acRegistry.acs.forEach(ac => {
    if (ac.handler) {
      const handlerName = ac.handler.split('#')[1] || ac.handler;
      if (!handlersWithACs.has(handlerName)) {
        handlersWithACs.set(handlerName, []);
      }
      handlersWithACs.get(handlerName).push(ac);
    }
  });

  // Filter orchestration handlers with ACs
  const orchestrationHandlers = classification.handlers.orchestration;
  const orchestrationWithACs = orchestrationHandlers
    .filter(h => handlersWithACs.has(h.name))
    .map(h => ({
      ...h,
      acCount: handlersWithACs.get(h.name).length,
      acs: handlersWithACs.get(h.name)
    }));

  console.log(`📊 Found ${orchestrationWithACs.length} orchestration handlers with ACs\n`);

  // Sort by priority: HIGH risk first, then low coverage
  const riskOrder = { HIGH: 0, MED: 1, LOW: 2 };
  orchestrationWithACs.sort((a, b) => {
    if (riskOrder[a.risk] !== riskOrder[b.risk]) {
      return riskOrder[a.risk] - riskOrder[b.risk];
    }
    return a.coverage - b.coverage;
  });

  console.log('🎯 Top 10 Priority Handlers for Runtime GWT Tests:\n');
  orchestrationWithACs.slice(0, 10).forEach((h, i) => {
    console.log(`${i + 1}. ${h.name}`);
    console.log(`   Risk: ${h.risk} | Coverage: ${h.coverage}% | ACs: ${h.acCount} | Beat: ${h.beat} M${h.movement}`);
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 Detailed AC Breakdown for Top 5:');
  console.log('═══════════════════════════════════════════════════════════\n');

  orchestrationWithACs.slice(0, 5).forEach((h, i) => {
    console.log(`${i + 1}. ${h.name} (${h.acCount} ACs)`);
    h.acs.forEach((ac, j) => {
      console.log(`   AC-${j + 1}: ${ac.id}`);
      console.log(`        GIVEN: ${ac.given}`);
      console.log(`        WHEN:  ${ac.when}`);
      console.log(`        THEN:  ${ac.then}`);
      if (ac.and) {
        console.log(`        AND:   ${ac.and}`);
      }
    });
    console.log('');
  });

  // Write output
  const output = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalOrchestrationHandlers: orchestrationHandlers.length,
      handlersWithACs: orchestrationWithACs.length,
      handlersNeedingTests: orchestrationWithACs.length
    },
    topPriority: orchestrationWithACs.slice(0, 10).map(h => ({
      name: h.name,
      risk: h.risk,
      coverage: h.coverage,
      beat: h.beat,
      movement: h.movement,
      acCount: h.acCount,
      acs: h.acs
    }))
  };

  const outputPath = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handlers-for-gwt-tests.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✅ Analysis written: ${outputPath}\n`);
}

main();
