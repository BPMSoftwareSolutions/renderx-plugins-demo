#!/usr/bin/env node

/**
 * Acceptance Criteria to Test Alignment Validator
 *
 * Validates that each acceptance criteria in symphony beats has a corresponding
 * test assertion that matches the AC requirements.
 *
 * For each beat:
 * 1. Loads the linked test file
 * 2. Extracts all test assertions (expect/assert statements)
 * 3. Compares AC conditions against actual test assertions
 * 4. Reports alignment score and gaps
 *
 * Usage:
 *   node scripts/validate-ac-test-alignment.cjs <symphony-file.json>
 *
 * Environment variables:
 *   ANALYSIS_DOMAIN_ID - Domain ID for filtering symphonies
 *   VALIDATION_MODE - 'strict' or 'relaxed' (default: relaxed)
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract test assertions from a test file
 * @param {string} testFilePath - Path to test file
 * @returns {Array} Array of assertions with metadata
 */
function extractTestAssertions(testFilePath) {
  try {
    const fullPath = path.join(process.cwd(), testFilePath);
    if (!fs.existsSync(fullPath)) {
      return { error: 'Test file not found', assertions: [] };
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const assertions = [];

    // Patterns for different assertion styles
    const assertionPatterns = [
      // Vitest/Jest expect assertions
      { pattern: /expect\(([^)]+)\)\.([a-zA-Z]+)\(([^)]*)\)/g, style: 'expect' },
      // Chai assertions
      { pattern: /assert\.([a-zA-Z]+)\(([^)]+)\)/g, style: 'assert' },
      // toBe, toEqual, toHaveBeenCalled, etc.
      { pattern: /\.to(Be|Equal|Have|Contain|Match|Throw|Be[A-Z]\w*)\(/g, style: 'matcher' },
      // Performance/timing assertions
      { pattern: /expect\.+latency|duration|time.+to(Be)?LessThan\((\d+)/gi, style: 'performance' },
      // Schema/validation assertions
      { pattern: /expect.+schema|valid|conform.+toBe|toMatch/gi, style: 'schema' },
      // Error/exception assertions
      { pattern: /expect.+toThrow|toReject|catch|error/gi, style: 'error' },
      // Event/telemetry assertions
      { pattern: /expect.+event|publish|emit|telemetry/gi, style: 'event' }
    ];

    // Extract all assertions with context
    assertionPatterns.forEach(({ pattern, style }) => {
      let match;
      pattern.lastIndex = 0;

      while ((match = pattern.exec(content)) !== null) {
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;

        // Get surrounding context (test name)
        const testNameMatch = beforeMatch.match(/(?:it|test)\(['"]([^'"]+)['"]/g);
        const testName = testNameMatch
          ? testNameMatch[testNameMatch.length - 1]?.match(/['"]([^'"]+)['"]/)?.[1]
          : null;

        assertions.push({
          line: lineNumber,
          assertion: match[0],
          style,
          testName,
          fullMatch: match[0]
        });
      }
    });

    // Extract describe/it structure for context
    const testStructure = extractTestStructure(content);

    return {
      assertions,
      testStructure,
      totalAssertions: assertions.length,
      assertionStyles: [...new Set(assertions.map(a => a.style))]
    };

  } catch (error) {
    return { error: error.message, assertions: [] };
  }
}

/**
 * Extract test structure (describe/it blocks)
 */
function extractTestStructure(content) {
  const structure = [];

  // Match describe blocks
  const describePattern = /describe\(['"]([^'"]+)['"],/g;
  let match;

  while ((match = describePattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;

    structure.push({
      type: 'describe',
      name: match[1],
      line: lineNumber
    });
  }

  // Match it/test blocks
  const itPattern = /(?:it|test)\(['"]([^'"]+)['"],/g;
  while ((match = itPattern.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;

    structure.push({
      type: 'it',
      name: match[1],
      line: lineNumber
    });
  }

  return structure.sort((a, b) => a.line - b.line);
}

/**
 * Parse Gherkin AC into testable conditions
 * @param {string} ac - Acceptance criteria string
 * @returns {Object} Parsed AC with Given/When/Then
 */
function parseAcceptanceCriteria(ac) {
  const lines = ac.split('\n').map(l => l.trim()).filter(l => l);

  const parsed = {
    given: [],
    when: [],
    then: [],
    and: []
  };

  let currentSection = null;

  lines.forEach(line => {
    if (line.startsWith('Given')) {
      currentSection = 'given';
      parsed.given.push(line.replace(/^Given\s+/, ''));
    } else if (line.startsWith('When')) {
      currentSection = 'when';
      parsed.when.push(line.replace(/^When\s+/, ''));
    } else if (line.startsWith('Then')) {
      currentSection = 'then';
      parsed.then.push(line.replace(/^Then\s+/, ''));
    } else if (line.startsWith('And') && currentSection) {
      parsed[currentSection === 'given' || currentSection === 'when' ? currentSection : 'and']
        .push(line.replace(/^And\s+/, ''));
    }
  });

  return parsed;
}

/**
 * Check if assertion covers an AC condition
 * @param {string} condition - AC condition (Then/And clause)
 * @param {Array} assertions - All test assertions
 * @returns {Object} Match result with confidence score
 */
function findMatchingAssertion(condition, assertions) {
  const lowerCondition = condition.toLowerCase();

  // Extract key phrases from condition
  const keyPhrases = extractKeyPhrases(lowerCondition);

  // Find best matching assertion
  let bestMatch = null;
  let bestScore = 0;

  assertions.forEach(assertion => {
    const score = calculateMatchScore(keyPhrases, assertion);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = assertion;
    }
  });

  return {
    matched: bestScore > 0.3, // 30% threshold
    confidence: bestScore,
    matchedAssertion: bestMatch,
    keyPhrases
  };
}

/**
 * Extract key testable phrases from AC condition
 */
function extractKeyPhrases(condition) {
  const phrases = [];

  // Performance indicators
  if (/within|<|less than|under/.test(condition)) {
    const timeMatch = condition.match(/(\d+)\s*(ms|second|millisecond)/i);
    if (timeMatch) {
      phrases.push({ type: 'performance', value: timeMatch[1], unit: timeMatch[2] });
    }
  }

  // Success indicators
  if (/completes? successfully|success/.test(condition)) {
    phrases.push({ type: 'success', value: true });
  }

  // Schema/validation
  if (/valid|schema|conform/.test(condition)) {
    phrases.push({ type: 'validation', value: true });
  }

  // Events/telemetry
  if (/event|publish|emit|record/.test(condition)) {
    phrases.push({ type: 'event', value: true });
  }

  // Error handling
  if (/error|exception|throw/.test(condition)) {
    phrases.push({ type: 'error', value: true });
  }

  // Stability
  if (/stable|recover/.test(condition)) {
    phrases.push({ type: 'stability', value: true });
  }

  // Governance/audit
  if (/governance|audit|compliance/.test(condition)) {
    phrases.push({ type: 'governance', value: true });
  }

  return phrases;
}

/**
 * Calculate match score between key phrases and assertion
 */
function calculateMatchScore(keyPhrases, assertion) {
  let score = 0;
  const assertionLower = assertion.assertion.toLowerCase();
  const testNameLower = (assertion.testName || '').toLowerCase();

  keyPhrases.forEach(phrase => {
    switch (phrase.type) {
      case 'performance':
        if (/latency|duration|time|lessthan/i.test(assertionLower) ||
            /latency|duration|time|performance/i.test(testNameLower)) {
          score += 0.5;
          // Extra score if timing value matches
          if (assertionLower.includes(phrase.value)) {
            score += 0.3;
          }
        }
        break;

      case 'success':
        if (/tobe\(true\)|tobe\('success'\)|not.*error/i.test(assertionLower)) {
          score += 0.4;
        }
        break;

      case 'validation':
        if (/valid|schema|conform|match/i.test(assertionLower)) {
          score += 0.5;
        }
        break;

      case 'event':
        if (/event|publish|emit|call|been.*called/i.test(assertionLower) ||
            /event|telemetry/i.test(testNameLower)) {
          score += 0.5;
        }
        break;

      case 'error':
        if (/throw|reject|error|catch/i.test(assertionLower)) {
          score += 0.5;
        }
        break;

      case 'stability':
        if (/recover|stable|not.*throw/i.test(assertionLower)) {
          score += 0.4;
        }
        break;

      case 'governance':
        if (/governance|audit|compliance|log/i.test(assertionLower) ||
            /audit|compliance/i.test(testNameLower)) {
          score += 0.5;
        }
        break;
    }
  });

  return Math.min(score, 1.0); // Cap at 100%
}

/**
 * Validate a single beat's AC-to-test alignment
 * @param {Object} beat - Beat object from symphony
 * @returns {Object} Validation results
 */
function validateBeatAlignment(beat) {
  if (!beat.testFile) {
    return {
      beat: beat.title || beat.handler,
      status: 'NO_TEST_FILE',
      coverage: 0,
      message: 'No test file linked to this beat'
    };
  }

  const testData = extractTestAssertions(beat.testFile);

  if (testData.error) {
    return {
      beat: beat.title || beat.handler,
      status: 'TEST_FILE_ERROR',
      coverage: 0,
      message: testData.error
    };
  }

  if (!beat.acceptanceCriteria || beat.acceptanceCriteria.length === 0) {
    return {
      beat: beat.title || beat.handler,
      status: 'NO_AC',
      coverage: 0,
      message: 'No acceptance criteria defined'
    };
  }

  // Validate each AC
  const acResults = [];
  let totalMatches = 0;

  beat.acceptanceCriteria.forEach((ac, index) => {
    const parsed = parseAcceptanceCriteria(ac);
    const thenConditions = [...parsed.then, ...parsed.and];

    const conditionResults = thenConditions.map(condition => {
      const match = findMatchingAssertion(condition, testData.assertions);
      if (match.matched) totalMatches++;

      return {
        condition,
        matched: match.matched,
        confidence: match.confidence,
        assertion: match.matchedAssertion?.assertion,
        testName: match.matchedAssertion?.testName
      };
    });

    acResults.push({
      acIndex: index + 1,
      ac,
      parsed,
      conditions: conditionResults,
      coverage: conditionResults.length > 0
        ? (conditionResults.filter(c => c.matched).length / conditionResults.length) * 100
        : 0
    });
  });

  const totalConditions = acResults.reduce((sum, ac) => sum + ac.conditions.length, 0);
  const overallCoverage = totalConditions > 0 ? (totalMatches / totalConditions) * 100 : 0;

  return {
    beat: beat.title || beat.handler,
    handler: beat.handler,
    testFile: beat.testFile,
    testCase: beat.testCase,
    status: overallCoverage >= 70 ? 'GOOD' : overallCoverage >= 40 ? 'PARTIAL' : 'POOR',
    coverage: Math.round(overallCoverage),
    totalACs: beat.acceptanceCriteria.length,
    totalConditions,
    matchedConditions: totalMatches,
    totalAssertions: testData.totalAssertions,
    acResults,
    testStructure: testData.testStructure
  };
}

/**
 * Validate all beats in a symphony
 * @param {string} symphonyPath - Path to symphony JSON
 * @returns {Object} Complete validation results
 */
function validateSymphony(symphonyPath) {
  try {
    const symphony = JSON.parse(fs.readFileSync(symphonyPath, 'utf8'));
    const results = [];

    // Process all movements and beats
    if (symphony.movements && Array.isArray(symphony.movements)) {
      symphony.movements.forEach(movement => {
        if (movement.beats && Array.isArray(movement.beats)) {
          movement.beats.forEach(beat => {
            const validation = validateBeatAlignment(beat);
            results.push({
              movement: movement.name,
              ...validation
            });
          });
        }
      });
    }

    // Calculate summary statistics
    const summary = {
      symphonyId: symphony.id,
      symphonyName: symphony.name,
      totalBeats: results.length,
      goodBeats: results.filter(r => r.status === 'GOOD').length,
      partialBeats: results.filter(r => r.status === 'PARTIAL').length,
      poorBeats: results.filter(r => r.status === 'POOR').length,
      noTestBeats: results.filter(r => r.status === 'NO_TEST_FILE').length,
      averageCoverage: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.coverage, 0) / results.length)
        : 0,
      totalConditions: results.reduce((sum, r) => sum + (r.totalConditions || 0), 0),
      matchedConditions: results.reduce((sum, r) => sum + (r.matchedConditions || 0), 0)
    };

    return {
      symphonyPath,
      summary,
      beatResults: results,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      error: error.message,
      symphonyPath
    };
  }
}

/**
 * Format validation results as markdown
 */
function formatValidationReport(validation) {
  const { summary, beatResults } = validation;

  let report = `# AC-to-Test Alignment Report\n\n`;
  report += `**Symphony:** ${summary.symphonyName}\n`;
  report += `**Generated:** ${validation.timestamp}\n\n`;

  report += `## Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Beats | ${summary.totalBeats} |\n`;
  report += `| Average Coverage | ${summary.averageCoverage}% |\n`;
  report += `| Good Alignment (≥70%) | ${summary.goodBeats} |\n`;
  report += `| Partial Alignment (40-69%) | ${summary.partialBeats} |\n`;
  report += `| Poor Alignment (<40%) | ${summary.poorBeats} |\n`;
  report += `| No Test File | ${summary.noTestBeats} |\n`;
  report += `| Matched Conditions | ${summary.matchedConditions}/${summary.totalConditions} |\n\n`;

  report += `## Beat Analysis\n\n`;

  beatResults.forEach(beat => {
    const statusEmoji = {
      'GOOD': '✅',
      'PARTIAL': '⚠️',
      'POOR': '❌',
      'NO_TEST_FILE': '🚫',
      'NO_AC': '📝'
    };

    report += `### ${statusEmoji[beat.status]} ${beat.beat} (${beat.coverage}%)\n\n`;
    report += `- **Handler:** \`${beat.handler}\`\n`;
    report += `- **Test File:** ${beat.testFile || 'None'}\n`;
    report += `- **Test Case:** ${beat.testCase || 'None'}\n`;
    report += `- **Status:** ${beat.status}\n`;
    report += `- **Matched:** ${beat.matchedConditions || 0}/${beat.totalConditions || 0} conditions\n\n`;

    if (beat.acResults && beat.acResults.length > 0) {
      report += `#### Acceptance Criteria Coverage\n\n`;
      beat.acResults.forEach(ac => {
        report += `**AC ${ac.acIndex}** (${Math.round(ac.coverage)}%):\n`;
        ac.conditions.forEach(cond => {
          const icon = cond.matched ? '✓' : '✗';
          report += `  ${icon} ${cond.condition}\n`;
          if (cond.matched && cond.assertion) {
            report += `    → Assertion: \`${cond.assertion}\`\n`;
            if (cond.testName) {
              report += `    → Test: "${cond.testName}"\n`;
            }
          }
        });
        report += `\n`;
      });
    }

    report += `---\n\n`;
  });

  return report;
}

module.exports = {
  extractTestAssertions,
  parseAcceptanceCriteria,
  validateBeatAlignment,
  validateSymphony,
  formatValidationReport,
  findMatchingAssertion,
  extractKeyPhrases,
  calculateMatchScore
};

// CLI execution
if (require.main === module) {
  const symphonyPath = process.argv[2];

  if (!symphonyPath) {
    console.error('Usage: node validate-ac-test-alignment.cjs <symphony-file.json>');
    process.exit(1);
  }

  const validation = validateSymphony(symphonyPath);

  if (validation.error) {
    console.error('Validation error:', validation.error);
    process.exit(1);
  }

  const report = formatValidationReport(validation);
  console.log(report);

  // Also output JSON for programmatic use
  const jsonOutput = path.join(
    path.dirname(symphonyPath),
    path.basename(symphonyPath, '.json') + '-ac-validation.json'
  );
  fs.writeFileSync(jsonOutput, JSON.stringify(validation, null, 2));
  console.log(`\nJSON output saved to: ${jsonOutput}`);
}
