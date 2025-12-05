#!/usr/bin/env node

/**
 * Alignment Computation Engine
 *
 * Computes AC-to-test alignment metrics by correlating:
 * - AC registry (canonical source of ACs)
 * - Collected test results (with AC/BEAT tags)
 *
 * Phases:
 * - Phase 1: Presence-based coverage (AC has at least one test tag)
 * - Phase 2: THEN-to-assertion heuristics (optional, with confidence scores)
 *
 * Output: .generated/ac-alignment/coverage.{presence,then}.json
 *
 * Usage:
 *   node scripts/ac-alignment/compute-alignment.cjs
 *   node scripts/ac-alignment/compute-alignment.cjs --registry <path> --results <path>
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// PHASE 1: PRESENCE-BASED COVERAGE
// ============================================================================

/**
 * Compute presence-based AC coverage
 * @param {Object} registry - AC registry
 * @param {Object} testResults - Collected test results
 * @returns {Object} Presence coverage results
 */
function computePresenceCoverage(registry, testResults) {
  console.log('\n🔍 Computing Presence-Based Coverage...\n');

  const coverage = {
    domainId: registry.domainId,
    generatedAt: new Date().toISOString(),
    phase: 'presence',
    totalACs: registry.totalACs,
    coveredACs: 0,
    uncoveredACs: 0,
    coveragePercent: 0,
    beatCoverage: {},
    sequenceCoverage: {},
    acDetails: []
  };

  // Build lookup maps from test results
  const acTagMap = new Map(); // acId -> array of tests
  const beatTagMap = new Map(); // beatId -> array of tests

  testResults.tests.forEach(test => {
    // Process AC tags
    test.acTags.forEach(tag => {
      const acId = tag.full;
      if (!acTagMap.has(acId)) {
        acTagMap.set(acId, []);
      }
      acTagMap.get(acId).push(test);
    });

    // Process BEAT tags
    test.beatTags.forEach(tag => {
      const beatId = `${tag.sequence}:${tag.beat}`;
      if (!beatTagMap.has(beatId)) {
        beatTagMap.set(beatId, []);
      }
      beatTagMap.get(beatId).push(test);
    });
  });

  // Evaluate coverage for each AC
  registry.acs.forEach(ac => {
    const acId = ac.acId;
    const beatId = `${ac.sequenceId}:${ac.beatId}`;

    // Check for direct AC tag match
    const directTests = acTagMap.get(acId) || [];

    // Check for beat-level tag match
    const beatTests = beatTagMap.get(beatId) || [];

    const isCovered = directTests.length > 0 || beatTests.length > 0;

    if (isCovered) {
      coverage.coveredACs++;
    } else {
      coverage.uncoveredACs++;
    }

    coverage.acDetails.push({
      acId,
      sequenceId: ac.sequenceId,
      beatId: ac.beatId,
      beatName: ac.beatName,
      handler: ac.handler,
      isCovered,
      directTestCount: directTests.length,
      beatTestCount: beatTests.length,
      tests: [
        ...directTests.map(t => ({ title: t.fullTitle, type: 'direct', file: t.file })),
        ...beatTests.map(t => ({ title: t.fullTitle, type: 'beat', file: t.file }))
      ]
    });

    // Aggregate beat-level coverage
    if (!coverage.beatCoverage[beatId]) {
      coverage.beatCoverage[beatId] = {
        beatId,
        sequenceId: ac.sequenceId,
        beatName: ac.beatName,
        totalACs: 0,
        coveredACs: 0,
        tests: new Set()
      };
    }

    coverage.beatCoverage[beatId].totalACs++;
    if (isCovered) {
      coverage.beatCoverage[beatId].coveredACs++;
    }

    // Add unique tests
    [...directTests, ...beatTests].forEach(t => {
      coverage.beatCoverage[beatId].tests.add(t.fullTitle);
    });

    // Aggregate sequence-level coverage
    if (!coverage.sequenceCoverage[ac.sequenceId]) {
      coverage.sequenceCoverage[ac.sequenceId] = {
        sequenceId: ac.sequenceId,
        sequenceName: ac.sequenceName,
        totalACs: 0,
        coveredACs: 0
      };
    }

    coverage.sequenceCoverage[ac.sequenceId].totalACs++;
    if (isCovered) {
      coverage.sequenceCoverage[ac.sequenceId].coveredACs++;
    }
  });

  // Convert beat tests Set to array for JSON serialization
  Object.values(coverage.beatCoverage).forEach(beat => {
    beat.tests = Array.from(beat.tests);
    beat.coveragePercent = beat.totalACs > 0
      ? Math.round((beat.coveredACs / beat.totalACs) * 100)
      : 0;
  });

  // Compute sequence coverage percentages
  Object.values(coverage.sequenceCoverage).forEach(sequence => {
    sequence.coveragePercent = sequence.totalACs > 0
      ? Math.round((sequence.coveredACs / sequence.totalACs) * 100)
      : 0;
  });

  // Compute overall coverage percentage
  coverage.coveragePercent = coverage.totalACs > 0
    ? Math.round((coverage.coveredACs / coverage.totalACs) * 100)
    : 0;

  console.log(`   Total ACs: ${coverage.totalACs}`);
  console.log(`   Covered ACs: ${coverage.coveredACs}`);
  console.log(`   Uncovered ACs: ${coverage.uncoveredACs}`);
  console.log(`   Coverage: ${coverage.coveragePercent}%`);

  return coverage;
}

// ============================================================================
// PHASE 2: THEN-TO-ASSERTION HEURISTICS
// ============================================================================

/**
 * Extract assertion type heuristics from THEN clauses
 * @param {Array} thenClauses - THEN clauses from AC
 * @returns {Array} Assertion type hints
 */
function extractAssertionHints(thenClauses) {
  const hints = [];

  thenClauses.forEach(clause => {
    const lowerClause = clause.toLowerCase();

    // Performance/timing assertions
    if (/latency|duration|within|<|≤|less than|under.*ms/i.test(lowerClause)) {
      const timeMatch = lowerClause.match(/(\d+)\s*(ms|millisecond|second)/i);
      hints.push({
        type: 'performance',
        clause,
        expectedValue: timeMatch ? parseInt(timeMatch[1], 10) : null,
        unit: timeMatch ? timeMatch[2] : null
      });
    }

    // Event/telemetry assertions
    if (/event|publish|emit|telemetry|record/i.test(lowerClause)) {
      hints.push({
        type: 'event',
        clause
      });
    }

    // Schema/validation assertions
    if (/valid|schema|conform|match/i.test(lowerClause)) {
      hints.push({
        type: 'schema',
        clause
      });
    }

    // DOM/UI assertions
    if (/visible|display|render|appear|overlay|ui/i.test(lowerClause)) {
      hints.push({
        type: 'dom',
        clause
      });
    }

    // Error handling assertions
    if (/error|exception|throw|reject|fail/i.test(lowerClause)) {
      hints.push({
        type: 'error',
        clause
      });
    }

    // Success/completion assertions
    if (/success|complete|finish|return/i.test(lowerClause)) {
      hints.push({
        type: 'success',
        clause
      });
    }

    // Stability/reliability assertions
    if (/stable|recover|retry|idempotent/i.test(lowerClause)) {
      hints.push({
        type: 'stability',
        clause
      });
    }
  });

  return hints;
}

/**
 * Compute THEN-to-assertion alignment (Phase 2)
 * @param {Object} registry - AC registry
 * @param {Object} testResults - Collected test results
 * @param {Object} presenceCoverage - Phase 1 presence coverage
 * @returns {Object} THEN coverage results
 */
function computeThenCoverage(registry, testResults, presenceCoverage) {
  console.log('\n🔍 Computing THEN-to-Assertion Coverage (Phase 2)...\n');

  const thenCoverage = {
    domainId: registry.domainId,
    generatedAt: new Date().toISOString(),
    phase: 'then-heuristics',
    totalThenClauses: 0,
    matchedThenClauses: 0,
    coveragePercent: 0,
    acDetails: []
  };

  // Process each AC with presence coverage
  presenceCoverage.acDetails.forEach(acCoverage => {
    if (!acCoverage.isCovered) {
      // Skip uncovered ACs in Phase 2
      return;
    }

    const ac = registry.acs.find(a => a.acId === acCoverage.acId);
    if (!ac) return;

    const thenClauses = [...(ac.then || []), ...(ac.and || [])];
    const hints = extractAssertionHints(thenClauses);

    thenCoverage.totalThenClauses += thenClauses.length;

    // For Phase 2, we assume heuristic match if we have presence coverage
    // In a more advanced implementation, this would parse test bodies
    const matchedClauses = hints.length; // Simplified heuristic
    thenCoverage.matchedThenClauses += Math.min(matchedClauses, thenClauses.length);

    thenCoverage.acDetails.push({
      acId: ac.acId,
      beatId: ac.beatId,
      thenClauses,
      hints,
      matchedCount: Math.min(matchedClauses, thenClauses.length),
      totalCount: thenClauses.length,
      confidence: matchedClauses > 0 ? 0.7 : 0.3 // Heuristic confidence
    });
  });

  thenCoverage.coveragePercent = thenCoverage.totalThenClauses > 0
    ? Math.round((thenCoverage.matchedThenClauses / thenCoverage.totalThenClauses) * 100)
    : 0;

  console.log(`   Total THEN Clauses: ${thenCoverage.totalThenClauses}`);
  console.log(`   Matched THEN Clauses: ${thenCoverage.matchedThenClauses}`);
  console.log(`   Coverage: ${thenCoverage.coveragePercent}%`);

  return thenCoverage;
}

// ============================================================================
// MAIN ALIGNMENT COMPUTATION
// ============================================================================

/**
 * Compute full alignment (both phases)
 * @param {Object} options - Computation options
 * @returns {Object} Complete alignment results
 */
function computeAlignment(options = {}) {
  console.log('\n🔍 Computing AC-to-Test Alignment\n');

  // Load AC registry
  const registryPath = options.registry || path.join(
    process.cwd(),
    '.generated',
    'acs',
    `${options.domainId || 'renderx-web-orchestration'}.registry.json`
  );

  if (!fs.existsSync(registryPath)) {
    throw new Error(`AC registry not found: ${registryPath}. Run generate-ac-registry.cjs first.`);
  }

  console.log(`📖 Loading AC Registry: ${registryPath}`);
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  console.log(`   Loaded ${registry.totalACs} ACs`);

  // Load test results
  const resultsPath = options.results || path.join(
    process.cwd(),
    '.generated',
    'ac-alignment',
    'results',
    'collected-results.json'
  );

  if (!fs.existsSync(resultsPath)) {
    console.log(`⚠️  Test results not found: ${resultsPath}`);
    console.log(`   Running with 0 test coverage (no tests collected yet)`);

    // Create empty test results
    var testResults = {
      tests: [],
      totalTests: 0,
      testsWithAcTags: 0,
      testsWithBeatTags: 0
    };
  } else {
    console.log(`📊 Loading Test Results: ${resultsPath}`);
    var testResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    console.log(`   Loaded ${testResults.totalTests} tests`);
  }

  // Phase 1: Presence-based coverage
  const presenceCoverage = computePresenceCoverage(registry, testResults);

  // Phase 2: THEN-to-assertion heuristics (optional)
  let thenCoverage = null;
  if (options.phase2 !== false) {
    thenCoverage = computeThenCoverage(registry, testResults, presenceCoverage);
  }

  return {
    registry,
    testResults,
    presenceCoverage,
    thenCoverage
  };
}

/**
 * Write alignment results to output files
 * @param {Object} alignment - Alignment results
 * @param {string} outputDir - Output directory
 */
function writeAlignmentResults(alignment, outputDir) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write presence coverage
  const presencePath = path.join(outputDir, 'coverage.presence.json');
  fs.writeFileSync(presencePath, JSON.stringify(alignment.presenceCoverage, null, 2));
  console.log(`\n✅ Presence coverage written to: ${presencePath}`);

  // Write THEN coverage (if computed)
  if (alignment.thenCoverage) {
    const thenPath = path.join(outputDir, 'coverage.then.json');
    fs.writeFileSync(thenPath, JSON.stringify(alignment.thenCoverage, null, 2));
    console.log(`✅ THEN coverage written to: ${thenPath}`);
  }

  // Write summary
  const summary = {
    domainId: alignment.presenceCoverage.domainId,
    generatedAt: alignment.presenceCoverage.generatedAt,
    totalACs: alignment.presenceCoverage.totalACs,
    presenceCoverage: alignment.presenceCoverage.coveragePercent,
    thenCoverage: alignment.thenCoverage ? alignment.thenCoverage.coveragePercent : null,
    totalTests: alignment.testResults.totalTests,
    testsWithAcTags: alignment.testResults.testsWithAcTags,
    beatsWithTests: Object.keys(alignment.presenceCoverage.beatCoverage).filter(
      beatId => alignment.presenceCoverage.beatCoverage[beatId].coveredACs > 0
    ).length,
    totalBeats: Object.keys(alignment.presenceCoverage.beatCoverage).length
  };

  const summaryPath = path.join(outputDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary written to: ${summaryPath}\n`);
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    domainId: process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration'
  };

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--registry' && args[i + 1]) {
      options.registry = args[i + 1];
      i++;
    } else if (args[i] === '--results' && args[i + 1]) {
      options.results = args[i + 1];
      i++;
    } else if (args[i] === '--domain' && args[i + 1]) {
      options.domainId = args[i + 1];
      i++;
    } else if (args[i] === '--no-phase2') {
      options.phase2 = false;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputDir = args[i + 1];
      i++;
    }
  }

  try {
    const alignment = computeAlignment(options);

    const outputDir = options.outputDir || path.join(
      process.cwd(),
      '.generated',
      'ac-alignment'
    );

    writeAlignmentResults(alignment, outputDir);

    console.log('✨ Alignment computation complete!\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  computePresenceCoverage,
  computeThenCoverage,
  extractAssertionHints,
  computeAlignment,
  writeAlignmentResults
};
