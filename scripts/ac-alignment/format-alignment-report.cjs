#!/usr/bin/env node

/**
 * Alignment Report Formatter
 *
 * Formats AC-to-test alignment results as Markdown for inclusion
 * in the symphonic code analysis report.
 *
 * Outputs:
 * - Summary table with overall metrics
 * - Beat-level coverage breakdown
 * - Sequence-level coverage
 * - Uncovered ACs list
 *
 * Usage:
 *   node scripts/ac-alignment/format-alignment-report.cjs
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// REPORT FORMATTING
// ============================================================================

/**
 * Get coverage status emoji and label
 * @param {number} percent - Coverage percentage
 * @returns {Object} Status info
 */
function getCoverageStatus(percent) {
  if (percent >= 70) {
    return { emoji: '✅', label: 'Good', class: 'good' };
  } else if (percent >= 40) {
    return { emoji: '⚠️', label: 'Partial', class: 'partial' };
  } else {
    return { emoji: '❌', label: 'Poor', class: 'poor' };
  }
}

/**
 * Format summary section
 * @param {Object} summary - Alignment summary
 * @param {Object} presenceCoverage - Presence coverage data
 * @returns {string} Markdown summary
 */
function formatSummary(summary, presenceCoverage) {
  const status = getCoverageStatus(summary.presenceCoverage);

  let md = `## AC-to-Test Alignment Summary\n\n`;
  md += `**Status:** ${status.emoji} ${status.label} (${summary.presenceCoverage}% coverage)\n\n`;

  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total ACs | ${summary.totalACs} |\n`;
  md += `| Average AC Coverage | ${summary.presenceCoverage}% |\n`;
  md += `| Covered ACs | ${presenceCoverage.coveredACs} |\n`;
  md += `| Uncovered ACs | ${presenceCoverage.uncoveredACs} |\n`;
  md += `| Total Tests | ${summary.totalTests} |\n`;
  md += `| Tests with AC Tags | ${summary.testsWithAcTags} |\n`;
  md += `| Beats with Mapped Tests | ${summary.beatsWithTests}/${summary.totalBeats} |\n`;

  if (summary.thenCoverage !== null) {
    md += `| THEN Clause Coverage | ${summary.thenCoverage}% |\n`;
  }

  md += `\n`;

  // Add interpretation guide
  md += `### Coverage Thresholds\n\n`;
  md += `- ✅ **Good** (≥70%): High confidence in requirement validation\n`;
  md += `- ⚠️ **Partial** (40-69%): Some coverage, gaps exist\n`;
  md += `- ❌ **Poor** (<40%): Insufficient test coverage\n\n`;

  return md;
}

/**
 * Format sequence-level coverage table
 * @param {Object} sequenceCoverage - Sequence coverage data
 * @returns {string} Markdown table
 */
function formatSequenceCoverage(sequenceCoverage) {
  let md = `## Sequence-Level Coverage\n\n`;
  md += `| Sequence | Total ACs | Covered | Coverage % | Status |\n`;
  md += `|----------|-----------|---------|------------|--------|\n`;

  const sequences = Object.values(sequenceCoverage).sort((a, b) =>
    a.sequenceId.localeCompare(b.sequenceId)
  );

  sequences.forEach(seq => {
    const status = getCoverageStatus(seq.coveragePercent);
    md += `| ${seq.sequenceName || seq.sequenceId} | ${seq.totalACs} | ${seq.coveredACs} | ${seq.coveragePercent}% | ${status.emoji} ${status.label} |\n`;
  });

  md += `\n`;
  return md;
}

/**
 * Format beat-level coverage table
 * @param {Object} beatCoverage - Beat coverage data
 * @param {number} limit - Max beats to show (0 = all)
 * @returns {string} Markdown table
 */
function formatBeatCoverage(beatCoverage, limit = 20) {
  let md = `## Beat-Level Coverage\n\n`;

  const beats = Object.values(beatCoverage).sort((a, b) => {
    // Sort by coverage (poorest first for visibility)
    if (a.coveragePercent !== b.coveragePercent) {
      return a.coveragePercent - b.coveragePercent;
    }
    return a.beatId.localeCompare(b.beatId);
  });

  if (limit > 0 && beats.length > limit) {
    md += `*Showing ${limit} of ${beats.length} beats (sorted by coverage, lowest first)*\n\n`;
  }

  md += `| Beat | Sequence | Total ACs | Covered | Coverage % | Tests | Status |\n`;
  md += `|------|----------|-----------|---------|------------|-------|--------|\n`;

  const displayBeats = limit > 0 ? beats.slice(0, limit) : beats;

  displayBeats.forEach(beat => {
    const status = getCoverageStatus(beat.coveragePercent);
    md += `| ${beat.beatName || beat.beatId} | ${beat.sequenceId} | ${beat.totalACs} | ${beat.coveredACs} | ${beat.coveragePercent}% | ${beat.tests.length} | ${status.emoji} ${status.label} |\n`;
  });

  md += `\n`;

  if (limit > 0 && beats.length > limit) {
    md += `<details>\n<summary>Show all ${beats.length} beats</summary>\n\n`;
    md += `| Beat | Sequence | Total ACs | Covered | Coverage % | Tests | Status |\n`;
    md += `|------|----------|-----------|---------|------------|-------|--------|\n`;

    beats.slice(limit).forEach(beat => {
      const status = getCoverageStatus(beat.coveragePercent);
      md += `| ${beat.beatName || beat.beatId} | ${beat.sequenceId} | ${beat.totalACs} | ${beat.coveredACs} | ${beat.coveragePercent}% | ${beat.tests.length} | ${status.emoji} ${status.label} |\n`;
    });

    md += `\n</details>\n\n`;
  }

  return md;
}

/**
 * Format uncovered ACs section
 * @param {Array} acDetails - AC detail array
 * @param {number} limit - Max ACs to show (0 = all)
 * @returns {string} Markdown list
 */
function formatUncoveredACs(acDetails, limit = 10) {
  const uncovered = acDetails.filter(ac => !ac.isCovered);

  if (uncovered.length === 0) {
    return `## Uncovered ACs\n\n✅ All ACs have test coverage!\n\n`;
  }

  let md = `## Uncovered ACs\n\n`;
  md += `${uncovered.length} ACs without test coverage:\n\n`;

  const displayACs = limit > 0 ? uncovered.slice(0, limit) : uncovered;

  displayACs.forEach(ac => {
    md += `- **${ac.acId}**\n`;
    md += `  - Beat: ${ac.beatName || ac.beatId}\n`;
    md += `  - Handler: \`${ac.handler}\`\n`;
    md += `  - Sequence: ${ac.sequenceId}\n\n`;
  });

  if (limit > 0 && uncovered.length > limit) {
    md += `<details>\n<summary>Show all ${uncovered.length} uncovered ACs</summary>\n\n`;

    uncovered.slice(limit).forEach(ac => {
      md += `- **${ac.acId}**\n`;
      md += `  - Beat: ${ac.beatName || ac.beatId}\n`;
      md += `  - Handler: \`${ac.handler}\`\n`;
      md += `  - Sequence: ${ac.sequenceId}\n\n`;
    });

    md += `</details>\n\n`;
  }

  return md;
}

/**
 * Format top covered ACs (optional, for positive reinforcement)
 * @param {Array} acDetails - AC detail array
 * @param {number} limit - Max ACs to show
 * @returns {string} Markdown list
 */
function formatTopCoveredACs(acDetails, limit = 5) {
  const covered = acDetails
    .filter(ac => ac.isCovered && ac.tests.length > 0)
    .sort((a, b) => b.tests.length - a.tests.length)
    .slice(0, limit);

  if (covered.length === 0) {
    return '';
  }

  let md = `## Top Covered ACs\n\n`;
  md += `ACs with the most test coverage:\n\n`;

  covered.forEach(ac => {
    md += `- **${ac.acId}** (${ac.tests.length} tests)\n`;
    md += `  - Beat: ${ac.beatName || ac.beatId}\n`;
    md += `  - Handler: \`${ac.handler}\`\n\n`;
  });

  return md;
}

/**
 * Format full alignment report
 * @param {Object} alignment - Complete alignment results
 * @param {Object} options - Formatting options
 * @returns {string} Complete Markdown report
 */
function formatAlignmentReport(alignment, options = {}) {
  const {
    showTopCovered = false,
    beatLimit = 20,
    uncoveredLimit = 10
  } = options;

  let report = `# AC-to-Test Alignment Report\n\n`;
  report += `**Domain:** ${alignment.presenceCoverage.domainId}\n`;
  report += `**Generated:** ${alignment.presenceCoverage.generatedAt}\n\n`;

  report += `---\n\n`;

  // Summary
  const summary = {
    domainId: alignment.presenceCoverage.domainId,
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

  report += formatSummary(summary, alignment.presenceCoverage);

  // Sequence coverage
  report += formatSequenceCoverage(alignment.presenceCoverage.sequenceCoverage);

  // Beat coverage
  report += formatBeatCoverage(alignment.presenceCoverage.beatCoverage, beatLimit);

  // Top covered (optional)
  if (showTopCovered) {
    report += formatTopCoveredACs(alignment.presenceCoverage.acDetails, 5);
  }

  // Uncovered ACs
  report += formatUncoveredACs(alignment.presenceCoverage.acDetails, uncoveredLimit);

  // Footer with links
  report += `---\n\n`;
  report += `## Resources\n\n`;
  report += `- [Test Tagging Guide](../../TEST_TAGGING_GUIDE.md)\n`;
  report += `- [AC Registry](./../../../.generated/acs/${alignment.presenceCoverage.domainId}.registry.json)\n`;
  report += `- [GitHub Issue #420](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420)\n\n`;

  return report;
}

/**
 * Format compact alignment summary for inclusion in main report
 * @param {Object} summary - Alignment summary
 * @returns {string} Compact Markdown summary
 */
function formatCompactSummary(summary) {
  const status = getCoverageStatus(summary.presenceCoverage);

  let md = `### AC-to-Test Alignment\n\n`;
  md += `**Status:** ${status.emoji} ${status.label}\n\n`;
  md += `- Average AC Coverage: **${summary.presenceCoverage}%**\n`;
  md += `- Covered ACs: ${summary.presenceCoverage >= 70 ? '✅' : '⚠️'} ${summary.totalACs - (summary.uncoveredACs || 0)}/${summary.totalACs}\n`;
  md += `- Beats with Tests: ${summary.beatsWithTests}/${summary.totalBeats}\n`;

  if (summary.presenceCoverage < 70) {
    md += `\n⚠️ **Action Required:** Coverage is below 70% threshold. See [AC Alignment Report](./ac-alignment-report.md) for details.\n`;
  }

  md += `\n`;

  return md;
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
    if (args[i] === '--domain' && args[i + 1]) {
      options.domainId = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    } else if (args[i] === '--compact') {
      options.compact = true;
    }
  }

  try {
    // Load alignment results
    const alignmentDir = path.join(process.cwd(), '.generated', 'ac-alignment');
    const presencePath = path.join(alignmentDir, 'coverage.presence.json');
    const thenPath = path.join(alignmentDir, 'coverage.then.json');
    const summaryPath = path.join(alignmentDir, 'summary.json');

    if (!fs.existsSync(presencePath)) {
      throw new Error(`Presence coverage not found: ${presencePath}. Run compute-alignment.cjs first.`);
    }

    const presenceCoverage = JSON.parse(fs.readFileSync(presencePath, 'utf8'));
    const thenCoverage = fs.existsSync(thenPath)
      ? JSON.parse(fs.readFileSync(thenPath, 'utf8'))
      : null;
    const summary = fs.existsSync(summaryPath)
      ? JSON.parse(fs.readFileSync(summaryPath, 'utf8'))
      : null;

    const alignment = {
      presenceCoverage,
      thenCoverage,
      testResults: {
        totalTests: summary?.totalTests || 0,
        testsWithAcTags: summary?.testsWithAcTags || 0
      }
    };

    // Format report
    const report = options.compact
      ? formatCompactSummary(summary)
      : formatAlignmentReport(alignment);

    // Write to output
    const outputPath = options.output || path.join(
      process.cwd(),
      'docs',
      'generated',
      options.domainId,
      'ac-alignment-report.md'
    );

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, report);
    console.log(`\n✅ Report written to: ${outputPath}\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  formatAlignmentReport,
  formatCompactSummary,
  formatSummary,
  formatSequenceCoverage,
  formatBeatCoverage,
  formatUncoveredACs,
  formatTopCoveredACs,
  getCoverageStatus
};
