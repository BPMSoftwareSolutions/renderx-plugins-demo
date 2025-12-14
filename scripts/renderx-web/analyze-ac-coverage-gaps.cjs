#!/usr/bin/env node

/**
 * Analyze AC Coverage Gaps for 285 Handlers
 *
 * Identifies which handlers need acceptance criteria and tests
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const CLASSIFICATION_FILE = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-classification.json');
const AC_REGISTRY_FILE = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');
const CANONICAL_HANDLERS_FILE = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/handler-count.json');

function main() {
  console.log('🔍 Analyzing AC Coverage Gaps for 285 Handlers\n');

  // Load data
  const classification = JSON.parse(fs.readFileSync(CLASSIFICATION_FILE, 'utf-8'));
  const acRegistry = JSON.parse(fs.readFileSync(AC_REGISTRY_FILE, 'utf-8'));
  const canonicalHandlers = JSON.parse(fs.readFileSync(CANONICAL_HANDLERS_FILE, 'utf-8'));

  // Extract handler names from AC registry
  const handlersWithACs = new Set();
  acRegistry.acs.forEach(ac => {
    if (ac.handler) {
      const handlerName = ac.handler.split('#')[1] || ac.handler;
      handlersWithACs.add(handlerName);
    }
  });

  // Get canonical handler names
  const canonicalHandlerNames = new Set(canonicalHandlers.handlers.allHandlers);

  // Analyze orchestration handlers (64 total)
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 ORCHESTRATION HANDLERS (64 total)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const orchestrationHandlers = classification.handlers.orchestration;

  // Group by risk
  const byRisk = {
    HIGH: orchestrationHandlers.filter(h => h.risk === 'HIGH'),
    MED: orchestrationHandlers.filter(h => h.risk === 'MED'),
    LOW: orchestrationHandlers.filter(h => h.risk === 'LOW')
  };

  console.log(`Risk Distribution:`);
  console.log(`  HIGH: ${byRisk.HIGH.length} handlers (17%)`);
  console.log(`  MED:  ${byRisk.MED.length} handlers (45%)`);
  console.log(`  LOW:  ${byRisk.LOW.length} handlers (38%)\n`);

  // Analyze HIGH-risk orchestration handlers
  console.log('🔥 HIGH-Risk Orchestration Handlers (11 total)\n');
  console.log('These are the TOP PRIORITY for AC definition and testing:\n');

  byRisk.HIGH.forEach((h, i) => {
    const hasAC = handlersWithACs.has(h.name);
    const isCanonical = canonicalHandlerNames.has(h.name);
    const status = hasAC ? '✅' : '❌';
    const canonical = isCanonical ? '[Canonical]' : '';

    console.log(`${i + 1}. ${h.name} ${canonical}`);
    console.log(`   Coverage: ${h.coverage}% | Beat: ${h.beat} M${h.movement} | AC: ${status}`);
  });

  const highRiskWithoutACs = byRisk.HIGH.filter(h => !handlersWithACs.has(h.name));
  console.log(`\n❌ Missing ACs: ${highRiskWithoutACs.length}/11 HIGH-risk handlers`);

  // Analyze coverage for all orchestration handlers
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📈 AC COVERAGE ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const orchestrationWithACs = orchestrationHandlers.filter(h => handlersWithACs.has(h.name));
  const orchestrationWithoutACs = orchestrationHandlers.filter(h => !handlersWithACs.has(h.name));

  console.log(`Orchestration Handlers:`);
  console.log(`  Total: ${orchestrationHandlers.length}`);
  console.log(`  With ACs: ${orchestrationWithACs.length} (${(orchestrationWithACs.length / orchestrationHandlers.length * 100).toFixed(1)}%)`);
  console.log(`  Without ACs: ${orchestrationWithoutACs.length} (${(orchestrationWithoutACs.length / orchestrationHandlers.length * 100).toFixed(1)}%)\n`);

  console.log(`Canonical vs. Non-Canonical:`);
  const orchestrationCanonical = orchestrationHandlers.filter(h => canonicalHandlerNames.has(h.name));
  const orchestrationNonCanonical = orchestrationHandlers.filter(h => !canonicalHandlerNames.has(h.name));
  console.log(`  Canonical: ${orchestrationCanonical.length}`);
  console.log(`  Non-Canonical: ${orchestrationNonCanonical.length}\n`);

  // Top priority handlers needing ACs
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎯 TOP PRIORITY: Handlers Needing ACs');
  console.log('═══════════════════════════════════════════════════════════\n');

  const topPriority = orchestrationHandlers
    .filter(h => !handlersWithACs.has(h.name))
    .sort((a, b) => {
      // Sort by risk (HIGH first), then by coverage (low first)
      const riskOrder = { HIGH: 0, MED: 1, LOW: 2 };
      if (riskOrder[a.risk] !== riskOrder[b.risk]) {
        return riskOrder[a.risk] - riskOrder[b.risk];
      }
      return a.coverage - b.coverage;
    })
    .slice(0, 20);

  console.log('Top 20 handlers that need AC definitions:\n');
  topPriority.forEach((h, i) => {
    const canonical = canonicalHandlerNames.has(h.name) ? '📘' : '  ';
    console.log(`${i + 1}. ${canonical} ${h.name}`);
    console.log(`   Risk: ${h.risk} | Coverage: ${h.coverage}% | Beat: ${h.beat} M${h.movement}`);
  });

  // Generate output report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalHandlers: 285,
      orchestrationHandlers: orchestrationHandlers.length,
      handlersWithACs: handlersWithACs.size,
      gap: orchestrationHandlers.length - orchestrationWithACs.length
    },
    highRiskOrchestration: {
      total: byRisk.HIGH.length,
      withACs: byRisk.HIGH.filter(h => handlersWithACs.has(h.name)).length,
      withoutACs: highRiskWithoutACs.length,
      handlers: byRisk.HIGH.map(h => ({
        name: h.name,
        coverage: h.coverage,
        beat: h.beat,
        movement: h.movement,
        hasAC: handlersWithACs.has(h.name),
        isCanonical: canonicalHandlerNames.has(h.name)
      }))
    },
    topPriority: topPriority.map(h => ({
      name: h.name,
      risk: h.risk,
      coverage: h.coverage,
      beat: h.beat,
      movement: h.movement,
      isCanonical: canonicalHandlerNames.has(h.name)
    }))
  };

  const outputPath = path.join(WORKSPACE_ROOT, '.generated/analysis/renderx-web-orchestration/ac-coverage-gaps.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`\n✅ Gap analysis written: ${outputPath}\n`);
}

main();
