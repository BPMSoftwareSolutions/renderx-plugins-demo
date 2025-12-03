#!/usr/bin/env node

/**
 * Validate AC Alignment — Unified Workflow
 *
 * Executes the complete AC-to-test alignment workflow:
 * 1. Generate AC registry
 * 2. Collect test results (if available)
 * 3. Compute alignment (presence + THEN heuristics)
 * 4. Format reports
 *
 * This is the main entry point for AC alignment validation in CI/CD.
 *
 * Usage:
 *   ANALYSIS_DOMAIN_ID=renderx-web-orchestration node scripts/validate-ac-alignment.cjs
 *   node scripts/validate-ac-alignment.cjs --domain renderx-web-orchestration
 */

const fs = require('fs');
const path = require('path');
const { generateACRegistry, writeRegistry } = require('./generate-ac-registry.cjs');
const { collectTestResults, writeCollectedResults } = require('./ac-alignment/collect-test-results.cjs');
const { computeAlignment, writeAlignmentResults } = require('./ac-alignment/compute-alignment.cjs');
const { formatAlignmentReport, formatCompactSummary } = require('./ac-alignment/format-alignment-report.cjs');

/**
 * Run complete AC alignment workflow
 * @param {Object} options - Workflow options
 * @returns {Object} Complete alignment results
 */
function runACAlignmentWorkflow(options = {}) {
  const domainId = options.domainId || process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';

  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ AC-to-Test Alignment Workflow                                ║`);
  console.log(`║ Domain: ${domainId.padEnd(51)} ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

  const workflowResults = {
    domainId,
    timestamp: new Date().toISOString(),
    steps: {}
  };

  try {
    // ========================================================================
    // STEP 1: Generate AC Registry
    // ========================================================================
    console.log('📖 STEP 1: Generating AC Registry...\n');

    const registry = generateACRegistry(domainId);
    const registryPath = path.join(
      process.cwd(),
      '.generated',
      'acs',
      `${registry.domainId}.registry.json`
    );
    writeRegistry(registry, registryPath);

    workflowResults.steps.registry = {
      success: true,
      path: registryPath,
      totalACs: registry.totalACs,
      sequences: registry.sequences,
      beats: registry.beats
    };

    // ========================================================================
    // STEP 2: Collect Test Results (Optional)
    // ========================================================================
    console.log('📊 STEP 2: Collecting Test Results...\n');

    let testResults = null;
    try {
      testResults = collectTestResults({ all: true });

      const resultsPath = path.join(
        process.cwd(),
        '.generated',
        'ac-alignment',
        'results',
        'collected-results.json'
      );
      writeCollectedResults(testResults, resultsPath);

      workflowResults.steps.collection = {
        success: true,
        path: resultsPath,
        totalTests: testResults.totalTests,
        testsWithAcTags: testResults.testsWithAcTags,
        testsWithBeatTags: testResults.testsWithBeatTags
      };
    } catch (error) {
      console.log(`⚠️  Test collection skipped: ${error.message}`);
      workflowResults.steps.collection = {
        success: false,
        skipped: true,
        reason: error.message
      };
    }

    // ========================================================================
    // STEP 3: Compute Alignment
    // ========================================================================
    console.log('🔍 STEP 3: Computing Alignment...\n');

    const alignment = computeAlignment({
      domainId: registry.domainId,
      registry: registryPath,
      phase2: true
    });

    const alignmentDir = path.join(process.cwd(), '.generated', 'ac-alignment');
    writeAlignmentResults(alignment, alignmentDir);

    workflowResults.steps.computation = {
      success: true,
      presenceCoverage: alignment.presenceCoverage.coveragePercent,
      thenCoverage: alignment.thenCoverage?.coveragePercent || null,
      coveredACs: alignment.presenceCoverage.coveredACs,
      uncoveredACs: alignment.presenceCoverage.uncoveredACs
    };

    // ========================================================================
    // STEP 4: Format Reports
    // ========================================================================
    console.log('📝 STEP 4: Formatting Reports...\n');

    // Full report
    const fullReport = formatAlignmentReport(alignment, {
      showTopCovered: true,
      beatLimit: 20,
      uncoveredLimit: 10
    });

    const reportPath = path.join(
      process.cwd(),
      'docs',
      'generated',
      registry.domainId,
      'ac-alignment-report.md'
    );

    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, fullReport);
    console.log(`✅ Full report written to: ${reportPath}`);

    // Compact summary (for inclusion in main report)
    const summary = {
      domainId: alignment.presenceCoverage.domainId,
      totalACs: alignment.presenceCoverage.totalACs,
      presenceCoverage: alignment.presenceCoverage.coveragePercent,
      thenCoverage: alignment.thenCoverage?.coveragePercent || null,
      totalTests: alignment.testResults.totalTests,
      testsWithAcTags: alignment.testResults.testsWithAcTags,
      uncoveredACs: alignment.presenceCoverage.uncoveredACs,
      beatsWithTests: Object.keys(alignment.presenceCoverage.beatCoverage).filter(
        beatId => alignment.presenceCoverage.beatCoverage[beatId].coveredACs > 0
      ).length,
      totalBeats: Object.keys(alignment.presenceCoverage.beatCoverage).length
    };

    const compactSummary = formatCompactSummary(summary);

    workflowResults.steps.reporting = {
      success: true,
      fullReportPath: reportPath,
      compactSummary
    };

    workflowResults.summary = summary;
    workflowResults.success = true;

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║ Workflow Summary                                             ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log(`✅ AC Registry: ${workflowResults.steps.registry.totalACs} ACs`);
    if (workflowResults.steps.collection.success) {
      console.log(`✅ Test Collection: ${workflowResults.steps.collection.totalTests} tests`);
    } else {
      console.log(`⚠️  Test Collection: Skipped`);
    }
    console.log(`✅ Alignment Computation: ${workflowResults.steps.computation.presenceCoverage}% coverage`);
    console.log(`✅ Report Generation: Complete\n`);

    const status = workflowResults.steps.computation.presenceCoverage >= 70 ? '✅ GOOD' :
                   workflowResults.steps.computation.presenceCoverage >= 40 ? '⚠️ PARTIAL' : '❌ POOR';

    console.log(`📊 Overall Status: ${status}\n`);

    return workflowResults;

  } catch (error) {
    console.error(`\n❌ Workflow failed: ${error.message}\n`);
    workflowResults.success = false;
    workflowResults.error = error.message;
    throw error;
  }
}

/**
 * Get alignment summary for inclusion in other reports
 * @param {string} domainId - Domain identifier
 * @returns {Object} Alignment summary or error
 */
function getAlignmentSummary(domainId) {
  try {
    const summaryPath = path.join(
      process.cwd(),
      '.generated',
      'ac-alignment',
      'summary.json'
    );

    if (!fs.existsSync(summaryPath)) {
      return {
        error: 'No alignment data available. Run validate-ac-alignment.cjs first.'
      };
    }

    return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  } catch (error) {
    return {
      error: error.message
    };
  }
}

/**
 * Format alignment summary for symphonic analysis report
 * @param {string} domainId - Domain identifier
 * @returns {string} Formatted markdown section
 */
function formatAlignmentSectionForAnalysisReport(domainId) {
  const summary = getAlignmentSummary(domainId);

  if (summary.error) {
    return `### Acceptance Criteria-to-Test Alignment

⚠️ Alignment data unavailable: ${summary.error}

Run \`npm run validate:ac-alignment\` to generate alignment data.

`;
  }

  const status = summary.presenceCoverage >= 70 ? '✅ GOOD' :
                 summary.presenceCoverage >= 40 ? '⚠️ PARTIAL' : '❌ POOR';

  // Calculate covered ACs from presence coverage percentage
  const coveredACs = Math.round(summary.totalACs * summary.presenceCoverage / 100);

  let md = `### Acceptance Criteria-to-Test Alignment

**Status**: ${status}

| Metric | Value |
|--------|-------|
| Average AC Coverage | **${summary.presenceCoverage}%** |
| Covered ACs | ${coveredACs}/${summary.totalACs} |
| Beats with Tests | ${summary.beatsWithTests}/${summary.totalBeats} |
| Total Tests | ${summary.totalTests} |
| Tests with AC Tags | ${summary.testsWithAcTags} |
`;

  if (summary.thenCoverage !== null) {
    md += `| THEN Clause Coverage | ${summary.thenCoverage}% |\n`;
  }

  md += `\n`;

  if (summary.presenceCoverage < 70) {
    md += `⚠️ **Action Required**: AC coverage is below 70% threshold.\n\n`;
  }

  md += `📖 See [AC Alignment Report](./ac-alignment-report.md) for detailed breakdown.\n\n`;

  return md;
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--domain' && args[i + 1]) {
      options.domainId = args[i + 1];
      i++;
    }
  }

  try {
    const results = runACAlignmentWorkflow(options);

    // Exit with appropriate code based on coverage
    const coverage = results.steps.computation.presenceCoverage;
    if (coverage < 50) {
      console.log('❌ FAILED: Coverage below 50% (critical threshold)\n');
      process.exit(1);
    } else if (coverage < 70) {
      console.log('⚠️  WARNING: Coverage below 70% (target threshold)\n');
      process.exit(0); // Don't fail build, but warn
    } else {
      console.log('✅ SUCCESS: Coverage meets or exceeds 70% threshold\n');
      process.exit(0);
    }
  } catch (error) {
    console.error(`\n❌ FAILED: ${error.message}\n`);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  runACAlignmentWorkflow,
  getAlignmentSummary,
  formatAlignmentSectionForAnalysisReport
};
