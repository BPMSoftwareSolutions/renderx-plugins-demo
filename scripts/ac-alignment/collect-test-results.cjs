#!/usr/bin/env node

/**
 * Test Result Collector
 *
 * Collects test results from Vitest/Jest and Cypress test runs, extracting
 * AC tags ([AC:...]) and BEAT tags ([BEAT:...]) from test titles.
 *
 * Supports:
 * - Vitest/Jest JSON reporter output
 * - Cypress Mocha JSON reporter output
 * - Custom test result formats
 *
 * Output: .generated/ac-alignment/results/{unit,e2e}.json
 *
 * Usage:
 *   node scripts/ac-alignment/collect-test-results.cjs --unit <unit-results.json>
 *   node scripts/ac-alignment/collect-test-results.cjs --e2e <cypress-results.json>
 *   node scripts/ac-alignment/collect-test-results.cjs --all
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// TAG EXTRACTION
// ============================================================================

/**
 * Extract AC and BEAT tags from test title
 * @param {string} title - Test title
 * @returns {Object} Extracted tags
 */
function extractTagsFromTitle(title) {
  const tags = {
    acTags: [],
    beatTags: []
  };

  // Match AC tags: [AC:domain:sequence:beat:ac]
  const acPattern = /\[AC:([^\]]+)\]/g;
  let match;

  while ((match = acPattern.exec(title)) !== null) {
    const parts = match[1].split(':');
    if (parts.length === 4) {
      tags.acTags.push({
        full: match[1],
        domain: parts[0],
        sequence: parts[1],
        beat: parts[2],
        acIndex: parseInt(parts[3], 10)
      });
    }
  }

  // Match BEAT tags: [BEAT:domain:sequence:beat]
  const beatPattern = /\[BEAT:([^\]]+)\]/g;

  while ((match = beatPattern.exec(title)) !== null) {
    const parts = match[1].split(':');
    if (parts.length === 3) {
      tags.beatTags.push({
        full: match[1],
        domain: parts[0],
        sequence: parts[1],
        beat: parts[2]
      });
    }
  }

  return tags;
}

/**
 * Extract assertion markers from test body (Phase 2)
 * @param {string} testBody - Test source code
 * @returns {Array} Assertion markers
 */
function extractAssertionMarkers(testBody) {
  const markers = [];
  const markerPattern = /\/\/\s*ASSERT:(dom|event|api|perf|schema)/gi;

  let match;
  while ((match = markerPattern.exec(testBody)) !== null) {
    markers.push(match[1].toLowerCase());
  }

  return markers;
}

// ============================================================================
// VITEST/JEST RESULT PARSING
// ============================================================================

/**
 * Parse Vitest/Jest JSON results
 * @param {string} resultsPath - Path to JSON results file
 * @returns {Array} Parsed test results with tags
 */
function parseVitestJestResults(resultsPath) {
  try {
    if (!fs.existsSync(resultsPath)) {
      console.log(`⚠️  Vitest/Jest results not found: ${resultsPath}`);
      return [];
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const collectedTests = [];

    // Vitest/Jest format: testResults array
    const testResults = results.testResults || [];

    testResults.forEach(fileResult => {
      const filePath = fileResult.name || fileResult.file;

      if (!fileResult.assertionResults) {
        return;
      }

      fileResult.assertionResults.forEach(test => {
        // Build full test path (describe + it)
        const fullTitle = test.fullName || test.title || '';
        const tags = extractTagsFromTitle(fullTitle);

        collectedTests.push({
          file: filePath,
          title: test.title,
          fullTitle,
          status: test.status,
          duration: test.duration,
          acTags: tags.acTags,
          beatTags: tags.beatTags,
          ancestorTitles: test.ancestorTitles || [],
          framework: 'vitest-jest'
        });
      });
    });

    return collectedTests;
  } catch (error) {
    console.error(`❌ Error parsing Vitest/Jest results: ${error.message}`);
    return [];
  }
}

// ============================================================================
// CYPRESS RESULT PARSING
// ============================================================================

/**
 * Parse Cypress Mocha JSON results
 * @param {string} resultsPath - Path to JSON results file
 * @returns {Array} Parsed test results with tags
 */
function parseCypressResults(resultsPath) {
  try {
    if (!fs.existsSync(resultsPath)) {
      console.log(`⚠️  Cypress results not found: ${resultsPath}`);
      return [];
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    const collectedTests = [];

    // Recursively parse Mocha test structure
    function parseTests(suite, filePath = '', ancestorTitles = []) {
      if (suite.tests) {
        suite.tests.forEach(test => {
          const fullTitle = [...ancestorTitles, test.title].join(' ');
          const tags = extractTagsFromTitle(fullTitle);

          collectedTests.push({
            file: filePath || suite.file || 'unknown',
            title: test.title,
            fullTitle,
            status: test.state || (test.pass ? 'passed' : 'failed'),
            duration: test.duration,
            acTags: tags.acTags,
            beatTags: tags.beatTags,
            ancestorTitles,
            framework: 'cypress'
          });
        });
      }

      if (suite.suites) {
        suite.suites.forEach(childSuite => {
          parseTests(
            childSuite,
            filePath || suite.file || childSuite.file,
            [...ancestorTitles, suite.title || childSuite.title]
          );
        });
      }
    }

    // Handle both single result and array of results
    if (Array.isArray(results)) {
      results.forEach(result => {
        if (result.results) {
          result.results.forEach(spec => parseTests(spec, spec.file));
        }
      });
    } else if (results.results) {
      results.results.forEach(spec => parseTests(spec, spec.file));
    } else {
      parseTests(results);
    }

    return collectedTests;
  } catch (error) {
    console.error(`❌ Error parsing Cypress results: ${error.message}`);
    return [];
  }
}

// ============================================================================
// GENERIC TEST RESULT PARSER
// ============================================================================

/**
 * Auto-detect and parse test results
 * @param {string} resultsPath - Path to JSON results file
 * @returns {Array} Parsed test results
 */
function parseTestResults(resultsPath) {
  try {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    // Detect format based on structure
    if (results.testResults) {
      console.log('   Detected: Vitest/Jest format');
      return parseVitestJestResults(resultsPath);
    } else if (results.results || (Array.isArray(results) && results[0]?.results)) {
      console.log('   Detected: Cypress format');
      return parseCypressResults(resultsPath);
    } else {
      console.log('   ⚠️  Unknown format, attempting generic parse');
      return [];
    }
  } catch (error) {
    console.error(`❌ Error parsing test results: ${error.message}`);
    return [];
  }
}

// ============================================================================
// COLLECTION & OUTPUT
// ============================================================================

/**
 * Collect all test results and write to output
 * @param {Object} options - Collection options
 */
function collectTestResults(options = {}) {
  console.log('\n🔍 Collecting Test Results\n');

  const collectedResults = {
    generatedAt: new Date().toISOString(),
    sources: [],
    totalTests: 0,
    testsWithAcTags: 0,
    testsWithBeatTags: 0,
    uniqueACs: new Set(),
    uniqueBeats: new Set(),
    tests: []
  };

  // Collect unit test results
  if (options.unit || options.all) {
    console.log('📊 Collecting Unit/Integration Test Results...');
    const unitPath = options.unit || path.join(process.cwd(), 'test-results', 'unit-results.json');

    const unitTests = parseVitestJestResults(unitPath);
    if (unitTests.length > 0) {
      collectedResults.sources.push({ type: 'unit', path: unitPath, count: unitTests.length });
      collectedResults.tests.push(...unitTests);
      console.log(`   → Collected ${unitTests.length} unit tests`);
    }
  }

  // Collect E2E test results
  if (options.e2e || options.all) {
    console.log('🌐 Collecting E2E Test Results...');
    const e2ePath = options.e2e || path.join(process.cwd(), 'test-results', 'e2e-results.json');

    const e2eTests = parseCypressResults(e2ePath);
    if (e2eTests.length > 0) {
      collectedResults.sources.push({ type: 'e2e', path: e2ePath, count: e2eTests.length });
      collectedResults.tests.push(...e2eTests);
      console.log(`   → Collected ${e2eTests.length} E2E tests`);
    }
  }

  // Compute statistics
  collectedResults.totalTests = collectedResults.tests.length;

  collectedResults.tests.forEach(test => {
    if (test.acTags.length > 0) {
      collectedResults.testsWithAcTags++;
      test.acTags.forEach(tag => collectedResults.uniqueACs.add(tag.full));
    }

    if (test.beatTags.length > 0) {
      collectedResults.testsWithBeatTags++;
      test.beatTags.forEach(tag => collectedResults.uniqueBeats.add(tag.full));
    }
  });

  // Convert sets to arrays for JSON serialization
  collectedResults.uniqueACs = Array.from(collectedResults.uniqueACs);
  collectedResults.uniqueBeats = Array.from(collectedResults.uniqueBeats);

  console.log('\n📈 Collection Summary:');
  console.log(`   Total Tests: ${collectedResults.totalTests}`);
  console.log(`   Tests with AC Tags: ${collectedResults.testsWithAcTags}`);
  console.log(`   Tests with Beat Tags: ${collectedResults.testsWithBeatTags}`);
  console.log(`   Unique ACs Referenced: ${collectedResults.uniqueACs.length}`);
  console.log(`   Unique Beats Referenced: ${collectedResults.uniqueBeats.length}`);

  return collectedResults;
}

/**
 * Write collected results to output file
 * @param {Object} results - Collected results
 * @param {string} outputPath - Output file path
 */
function writeCollectedResults(results, outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Test results written to: ${outputPath}\n`);
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--unit' && args[i + 1]) {
      options.unit = args[i + 1];
      i++;
    } else if (args[i] === '--e2e' && args[i + 1]) {
      options.e2e = args[i + 1];
      i++;
    } else if (args[i] === '--all') {
      options.all = true;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    }
  }

  // Default to --all if no specific options
  if (!options.unit && !options.e2e && !options.all) {
    options.all = true;
  }

  const results = collectTestResults(options);

  const outputPath = options.output || path.join(
    process.cwd(),
    '.generated',
    'ac-alignment',
    'results',
    'collected-results.json'
  );

  writeCollectedResults(results, outputPath);

  console.log('✨ Test result collection complete!\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  extractTagsFromTitle,
  extractAssertionMarkers,
  parseVitestJestResults,
  parseCypressResults,
  parseTestResults,
  collectTestResults,
  writeCollectedResults
};
