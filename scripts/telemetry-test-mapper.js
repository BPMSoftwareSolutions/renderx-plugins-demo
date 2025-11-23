#!/usr/bin/env node

/**
 * 🧬 Test Coverage Telemetry Mapper
 * 
 * Links sequence log telemetry to test coverage data, identifying:
 * - Missing tests (events in production logs but not in test suite)
 * - Broken tests (tests that don't emit expected telemetry)
 * - Redundant tests (multiple tests covering same event, low unique value)
 * - Bloat candidates (tests with low coverage impact, high maintenance)
 * 
 * Creates self-healing insights for test suite optimization.
 * 
 * Usage:
 *   node scripts/telemetry-test-mapper.js <sequenceLogs> <testResults> [--output=path]
 * 
 * Files required:
 *   - Sequence logs: .generated/anomalies.json or demo-logs/
 *   - Test results: test-results.json (from jest --json output)
 * 
 * Output:
 *   - test-coverage-mapping.json - Complete telemetry-test mapping
 *   - test-health-report.md - Analysis and recommendations
 *   - missing-tests.json - Events not covered by tests
 *   - broken-tests.json - Tests with low telemetry coverage
 *   - redundant-tests.json - Duplicate coverage candidates
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Data Structures & Types
// ============================================================================

/**
 * @typedef {Object} TelemetryEvent
 * @property {string} id - Event identifier (e.g., control:panel:ui:render)
 * @property {number} occurrences - How many times fired
 * @property {number} avgDuration - Average execution time
 * @property {string} severity - critical, high, medium, low
 * @property {string} component - Component that emitted event
 * @property {string[]} emittedFrom - File paths that emit this event
 */

/**
 * @typedef {Object} TestCaseInfo
 * @property {string} name - Test name
 * @property {string} file - Test file path
 * @property {string} suite - Test suite name
 * @property {boolean} passed - Did test pass
 * @property {string[]} emittedEvents - Events this test emitted
 * @property {number} duration - Test execution time
 * @property {string} status - passed, failed, skipped
 */

/**
 * @typedef {Object} CoverageMapping
 * @property {string} event - Event ID
 * @property {string[]} testedBy - Test names covering this event
 * @property {string[]} notTestedBy - Similar events not tested
 * @property {boolean} hasTest - Is this event tested
 * @property {number} testCount - How many tests cover it
 * @property {number} redundancy - Excess test coverage
 * @property {string} insight - Recommendation
 */

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  defaultOutputDir: '.generated/test-coverage-analysis',
  eventThresholds: {
    criticalOccurrences: 10,      // Events fired >10 times are critical
    highOccurrences: 5,            // Events fired >5 times are high
    lowOccurrences: 1,             // Events fired 1-2 times are edge cases
  },
  testThresholds: {
    optimalCoverage: 1,            // 1 test per event is optimal
    highRedundancy: 3,             // 3+ tests covering same event
    lowValue: 0.5,                 // Test impact score < 0.5
  },
};

// ============================================================================
// Telemetry Parser
// ============================================================================

class TelemetryParser {
  constructor(logsPath) {
    this.logsPath = logsPath;
    this.events = new Map();
    this.parse();
  }

  parse() {
    try {
      if (fs.statSync(this.logsPath).isFile()) {
        this.parseAnomaliesJson(this.logsPath);
      } else {
        this.parseLogDirectory(this.logsPath);
      }
    } catch (error) {
      console.error(`Error parsing telemetry: ${error.message}`);
    }
  }

  parseAnomaliesJson(filePath) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Extract events from anomalies
    if (content.anomalies) {
      for (const anomaly of content.anomalies) {
        this.trackEvent({
          id: anomaly.event || anomaly.feature,
          severity: anomaly.severity,
          component: anomaly.component,
          occurrences: 1,
        });
      }
    }

    // Extract events from summary
    if (content.summary) {
      content.summary.count = content.summary.count || 0;
    }
  }

  parseLogDirectory(dirPath) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const content = JSON.parse(
          fs.readFileSync(path.join(dirPath, file), 'utf-8')
        );
        
        if (content.event) {
          this.trackEvent({
            id: content.event,
            severity: content.severity || 'medium',
            component: content.component,
            occurrences: content.occurrences || 1,
            avgDuration: content.avgDuration || 0,
          });
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  trackEvent(event) {
    const key = event.id;
    
    if (!this.events.has(key)) {
      this.events.set(key, {
        id: event.id,
        occurrences: 0,
        severity: event.severity,
        component: event.component,
        avgDuration: 0,
        emittedFrom: [],
      });
    }

    const existing = this.events.get(key);
    existing.occurrences += event.occurrences;
    if (event.avgDuration) {
      existing.avgDuration = (existing.avgDuration + event.avgDuration) / 2;
    }
  }

  getEvents() {
    return Array.from(this.events.values());
  }

  getSummary() {
    const events = Array.from(this.events.values());
    return {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      highEvents: events.filter(e => e.severity === 'high').length,
      totalOccurrences: events.reduce((sum, e) => sum + e.occurrences, 0),
      avgOccurrences: events.reduce((sum, e) => sum + e.occurrences, 0) / events.length,
    };
  }
}

// ============================================================================
// Test Results Parser
// ============================================================================

class TestResultsParser {
  constructor(testResultsPath) {
    this.testResultsPath = testResultsPath;
    this.tests = [];
    this.parse();
  }

  parse() {
    try {
      const content = JSON.parse(fs.readFileSync(this.testResultsPath, 'utf-8'));
      this.extractTests(content);
    } catch (error) {
      console.error(`Error parsing test results: ${error.message}`);
    }
  }

  extractTests(jestResults) {
    if (jestResults.testResults) {
      for (const fileResult of jestResults.testResults) {
        for (const testResult of fileResult.assertionResults || []) {
          this.tests.push({
            name: testResult.title,
            file: fileResult.name,
            fullName: testResult.fullName,
            duration: testResult.duration,
            status: testResult.status,
            emittedEvents: this.extractEventsFromTest(testResult),
          });
        }
      }
    }
  }

  extractEventsFromTest(testResult) {
    // Parse event IDs from test output/logs
    const events = [];
    
    if (testResult.message) {
      const eventPattern = /event[:\s]+([a-z:]+)/gi;
      let match;
      while ((match = eventPattern.exec(testResult.message)) !== null) {
        events.push(match[1].toLowerCase());
      }
    }

    return events;
  }

  getTests() {
    return this.tests;
  }

  getSummary() {
    return {
      totalTests: this.tests.length,
      passedTests: this.tests.filter(t => t.status === 'passed').length,
      failedTests: this.tests.filter(t => t.status === 'failed').length,
      skippedTests: this.tests.filter(t => t.status === 'skipped').length,
      averageDuration: this.tests.reduce((sum, t) => sum + (t.duration || 0), 0) / this.tests.length,
    };
  }
}

// ============================================================================
// Coverage Mapper
// ============================================================================

class TestCoverageMapper {
  constructor(telemetryEvents, testCases) {
    this.events = telemetryEvents;
    this.tests = testCases;
    this.mapping = [];
    this.insights = [];
    this.analyze();
  }

  analyze() {
    // Map each telemetry event to tests
    for (const event of this.events) {
      const coveringTests = this.findTestsForEvent(event.id);
      const mapping = {
        event: event.id,
        severity: event.severity,
        occurrences: event.occurrences,
        testedBy: coveringTests.map(t => t.name),
        testCount: coveringTests.length,
        hasTest: coveringTests.length > 0,
        redundancy: Math.max(0, coveringTests.length - 1),
        testDurations: coveringTests.map(t => t.duration),
        insights: this.generateEventInsights(event, coveringTests),
      };

      this.mapping.push(mapping);
      this.insights.push(...mapping.insights);
    }

    // Find events not tested
    this.findMissingTests();

    // Find tests with low coverage
    this.findBrokenTests();

    // Find redundant tests
    this.findRedundantTests();
  }

  findTestsForEvent(eventId) {
    return this.tests.filter(test => {
      const eventMatch = test.emittedEvents.some(e => 
        e.includes(eventId) || eventId.includes(e)
      );
      return eventMatch || test.name.toLowerCase().includes(eventId.split(':').pop());
    });
  }

  generateEventInsights(event, coveringTests) {
    const insights = [];

    // No test coverage
    if (coveringTests.length === 0) {
      insights.push({
        type: 'missing-test',
        severity: event.severity === 'critical' ? 'critical' : 'high',
        message: `Event "${event.id}" (${event.occurrences}x, ${event.severity}) has no test coverage`,
        action: `Create test for ${event.id}`,
        priority: event.occurrences > CONFIG.eventThresholds.criticalOccurrences ? 'critical' : 'high',
      });
    }

    // Excessive redundancy
    if (coveringTests.length > CONFIG.testThresholds.highRedundancy) {
      insights.push({
        type: 'redundant-tests',
        severity: 'medium',
        message: `Event "${event.id}" has ${coveringTests.length} tests (optimal: 1-2)`,
        action: `Consolidate or eliminate ${coveringTests.length - 2} redundant tests`,
        priority: 'medium',
        candidates: coveringTests.map(t => t.name),
      });
    }

    // Low occurrence but tested
    if (event.occurrences < CONFIG.eventThresholds.lowOccurrences && coveringTests.length > 0) {
      insights.push({
        type: 'rare-event',
        severity: 'low',
        message: `Event "${event.id}" rarely occurs (${event.occurrences}x) but is tested`,
        action: 'Consider edge case testing or deprecate test',
        priority: 'low',
      });
    }

    return insights;
  }

  findMissingTests() {
    const missingTests = this.mapping
      .filter(m => !m.hasTest && (m.severity === 'critical' || m.occurrences > CONFIG.eventThresholds.highOccurrences))
      .map(m => ({
        event: m.event,
        severity: m.severity,
        occurrences: m.occurrences,
        priority: m.severity === 'critical' ? 'critical' : 'high',
        suggestedTestName: this.suggestTestName(m.event),
      }));

    return missingTests;
  }

  findBrokenTests() {
    return this.tests.filter(test => {
      // Test that emits events but they're not in telemetry
      if (test.emittedEvents.length === 0) return false;
      
      const matchedEvents = test.emittedEvents.filter(e =>
        this.events.some(evt => evt.id.includes(e) || e.includes(evt.id))
      );

      return matchedEvents.length === 0 || test.status === 'failed';
    }).map(test => ({
      name: test.name,
      file: test.file,
      status: test.status,
      emittedEvents: test.emittedEvents,
      issue: 'Test does not emit expected telemetry or is failing',
    }));
  }

  findRedundantTests() {
    const eventCoverage = new Map();

    for (const test of this.tests) {
      for (const event of test.emittedEvents) {
        if (!eventCoverage.has(event)) {
          eventCoverage.set(event, []);
        }
        eventCoverage.get(event).push(test.name);
      }
    }

    const redundant = [];
    for (const [event, tests] of eventCoverage) {
      if (tests.length > CONFIG.testThresholds.highRedundancy) {
        redundant.push({
          event,
          testCount: tests.length,
          tests,
          recommendation: `Keep best performer, deprecate ${tests.length - 1} others`,
        });
      }
    }

    return redundant;
  }

  suggestTestName(eventId) {
    const parts = eventId.split(':');
    return `should_${parts.join('_')}`;
  }

  getAnalysis() {
    return {
      totalMapping: this.mapping.length,
      testedEvents: this.mapping.filter(m => m.hasTest).length,
      unTestedEvents: this.mapping.filter(m => !m.hasTest).length,
      averageTestCount: this.mapping.reduce((sum, m) => sum + m.testCount, 0) / this.mapping.length,
      redundantCoverage: this.mapping.reduce((sum, m) => sum + m.redundancy, 0),
    };
  }

  getMappings() {
    return this.mapping;
  }

  getInsights() {
    return this.insights;
  }
}

// ============================================================================
// Report Generator
// ============================================================================

class TestHealthReportGenerator {
  constructor(mapper, telemetrySummary, testSummary) {
    this.mapper = mapper;
    this.telemetrySummary = telemetrySummary;
    this.testSummary = testSummary;
  }

  generate() {
    const report = [];

    report.push('# 🧬 Test Coverage Telemetry Analysis Report');
    report.push('');
    report.push(`**Generated:** ${new Date().toISOString()}`);
    report.push(`**Status:** ✅ Analysis Complete`);
    report.push('');

    // Executive Summary
    report.push('## 📊 Executive Summary');
    report.push('');
    const analysis = this.mapper.getAnalysis();
    report.push('| Metric | Value | Status |');
    report.push('|--------|-------|--------|');
    report.push(`| Total Events | ${analysis.totalMapping} | ℹ️ |`);
    report.push(`| Tested Events | ${analysis.testedEvents} | ✅ |`);
    report.push(`| Untested Events | ${analysis.unTestedEvents} | ⚠️ |`);
    report.push(`| Test Coverage | ${((analysis.testedEvents / analysis.totalMapping) * 100).toFixed(1)}% | ${analysis.testedEvents / analysis.totalMapping > 0.8 ? '✅' : '⚠️'} |`);
    report.push(`| Redundant Tests | ${analysis.redundantCoverage} | ${analysis.redundantCoverage > 5 ? '❌' : '✅'} |`);
    report.push('');

    // Telemetry Overview
    report.push('## 📡 Telemetry Overview');
    report.push('');
    report.push('| Metric | Value |');
    report.push('|--------|-------|');
    report.push(`| Total Events | ${this.telemetrySummary.totalEvents} |`);
    report.push(`| Critical Events | ${this.telemetrySummary.criticalEvents} |`);
    report.push(`| High Priority | ${this.telemetrySummary.highEvents} |`);
    report.push(`| Total Occurrences | ${this.telemetrySummary.totalOccurrences} |`);
    report.push(`| Avg Occurrences | ${this.telemetrySummary.avgOccurrences.toFixed(2)} |`);
    report.push('');

    // Test Overview
    report.push('## 🧪 Test Suite Overview');
    report.push('');
    report.push('| Metric | Value |');
    report.push('|--------|-------|');
    report.push(`| Total Tests | ${this.testSummary.totalTests} |`);
    report.push(`| Passed | ${this.testSummary.passedTests} ✅ |`);
    report.push(`| Failed | ${this.testSummary.failedTests} ❌ |`);
    report.push(`| Skipped | ${this.testSummary.skippedTests} ⏭️ |`);
    report.push(`| Avg Duration | ${this.testSummary.averageDuration.toFixed(2)}ms |`);
    report.push('');

    // Top Issues
    report.push('## 🚨 Top Issues');
    report.push('');
    const insights = this.mapper.getInsights();
    const criticalInsights = insights.filter(i => i.priority === 'critical').slice(0, 5);

    if (criticalInsights.length === 0) {
      report.push('✅ No critical issues detected');
    } else {
      for (const insight of criticalInsights) {
        report.push(`- **${insight.type}** (${insight.severity})`);
        report.push(`  - ${insight.message}`);
        report.push(`  - Action: ${insight.action}`);
        report.push('');
      }
    }

    // Missing Tests
    report.push('## ❌ Missing Test Coverage');
    report.push('');
    const missingTests = this.mapper.findMissingTests();
    if (missingTests.length === 0) {
      report.push('✅ All critical events have test coverage');
    } else {
      report.push('| Event | Occurrences | Severity | Suggested Test |');
      report.push('|-------|-------------|----------|-----------------|');
      for (const missing of missingTests.slice(0, 10)) {
        report.push(`| \`${missing.event}\` | ${missing.occurrences} | ${missing.severity} | \`${missing.suggestedTestName}\` |`);
      }
    }
    report.push('');

    // Broken Tests
    report.push('## 🔨 Tests Needing Repair');
    report.push('');
    const brokenTests = this.mapper.findBrokenTests();
    if (brokenTests.length === 0) {
      report.push('✅ All tests emitting expected telemetry');
    } else {
      report.push('| Test Name | File | Status | Issue |');
      report.push('|-----------|------|--------|-------|');
      for (const broken of brokenTests.slice(0, 10)) {
        report.push(`| ${broken.name} | ${path.basename(broken.file)} | ${broken.status} | ${broken.issue} |`);
      }
    }
    report.push('');

    // Redundant Tests
    report.push('## 🔄 Redundant Test Coverage');
    report.push('');
    const redundantTests = this.mapper.findRedundantTests();
    if (redundantTests.length === 0) {
      report.push('✅ No excessive redundancy detected');
    } else {
      report.push('| Event | Tests | Count | Recommendation |');
      report.push('|-------|-------|-------|-----------------|');
      for (const redundant of redundantTests.slice(0, 10)) {
        report.push(`| \`${redundant.event}\` | ${redundant.tests.join(', ')} | ${redundant.testCount} | ${redundant.recommendation} |`);
      }
    }
    report.push('');

    // Recommendations
    report.push('## 💡 Recommendations');
    report.push('');
    report.push('### High Priority (Do These First)');
    report.push('1. **Add missing tests for critical events** - Improves production stability');
    report.push('2. **Repair broken tests** - Ensures telemetry is accurate');
    report.push('3. **Consolidate redundant tests** - Reduces maintenance burden');
    report.push('');

    report.push('### Medium Priority');
    report.push('1. **Review and optimize test suite** - Remove low-value tests');
    report.push('2. **Establish test maintenance SLA** - Keep tests current');
    report.push('');

    report.push('### Self-Healing Opportunities');
    report.push('1. **Auto-generate missing tests** from telemetry patterns');
    report.push('2. **Auto-retire broken tests** that don\'t emit telemetry');
    report.push('3. **Auto-consolidate redundant tests** based on coverage analysis');
    report.push('');

    // Impact Summary
    report.push('## 📈 Estimated Impact of Recommendations');
    report.push('');
    report.push('| Action | Impact | Effort | ROI |');
    report.push('|--------|--------|--------|-----|');
    report.push(`| Add missing tests | +${missingTests.length} test cases | High | High |`);
    report.push(`| Fix broken tests | ${brokenTests.length} tests restored | Medium | High |`);
    report.push(`| Remove redundancy | -${analysis.redundantCoverage} excess tests | Low | Medium |`);
    report.push('');

    return report.join('\n');
  }
}

// ============================================================================
// Main CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/telemetry-test-mapper.js <sequenceLogs> <testResults> [--output=path]');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/telemetry-test-mapper.js .generated/anomalies.json test-results.json');
    process.exit(1);
  }

  const logsPath = args[0];
  const testResultsPath = args[1];
  let outputDir = CONFIG.defaultOutputDir;

  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      outputDir = arg.replace('--output=', '');
    }
  }

  try {
    console.log('🧬 Test Coverage Telemetry Mapper');
    console.log('');

    // Parse telemetry
    console.log('📡 Parsing telemetry...');
    const telemetryParser = new TelemetryParser(logsPath);
    const events = telemetryParser.getEvents();
    const telemetrySummary = telemetryParser.getSummary();
    console.log(`   ✅ Found ${events.length} unique events`);

    // Parse test results
    console.log('🧪 Parsing test results...');
    const testParser = new TestResultsParser(testResultsPath);
    const tests = testParser.getTests();
    const testSummary = testParser.getSummary();
    console.log(`   ✅ Found ${tests.length} test cases`);

    // Analyze coverage
    console.log('🔍 Analyzing coverage...');
    const mapper = new TestCoverageMapper(events, tests);
    const analysis = mapper.getAnalysis();
    console.log(`   ✅ ${analysis.testedEvents}/${analysis.totalMapping} events have test coverage`);
    console.log(`   ✅ ${analysis.redundantCoverage} redundant test cases detected`);

    // Generate reports
    console.log('📝 Generating reports...');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write mappings
    const mappingsFile = path.join(outputDir, 'test-coverage-mapping.json');
    fs.writeFileSync(mappingsFile, JSON.stringify(mapper.getMappings(), null, 2), 'utf-8');
    console.log(`   ✅ ${mappingsFile}`);

    // Write health report
    const reportGenerator = new TestHealthReportGenerator(mapper, telemetrySummary, testSummary);
    const reportFile = path.join(outputDir, 'test-health-report.md');
    fs.writeFileSync(reportFile, reportGenerator.generate(), 'utf-8');
    console.log(`   ✅ ${reportFile}`);

    // Write missing tests
    const missingTestsFile = path.join(outputDir, 'missing-tests.json');
    fs.writeFileSync(missingTestsFile, JSON.stringify(mapper.findMissingTests(), null, 2), 'utf-8');
    console.log(`   ✅ ${missingTestsFile}`);

    // Write broken tests
    const brokenTestsFile = path.join(outputDir, 'broken-tests.json');
    fs.writeFileSync(brokenTestsFile, JSON.stringify(mapper.findBrokenTests(), null, 2), 'utf-8');
    console.log(`   ✅ ${brokenTestsFile}`);

    // Write redundant tests
    const redundantTestsFile = path.join(outputDir, 'redundant-tests.json');
    fs.writeFileSync(redundantTestsFile, JSON.stringify(mapper.findRedundantTests(), null, 2), 'utf-8');
    console.log(`   ✅ ${redundantTestsFile}`);

    // Write insights
    const insightsFile = path.join(outputDir, 'coverage-insights.json');
    fs.writeFileSync(insightsFile, JSON.stringify(mapper.getInsights(), null, 2), 'utf-8');
    console.log(`   ✅ ${insightsFile}`);

    console.log('');
    console.log('✅ Analysis complete!');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   Events: ${telemetrySummary.totalEvents} total, ${analysis.testedEvents} tested`);
    console.log(`   Tests: ${testSummary.totalTests} total, ${testSummary.passedTests} passed, ${testSummary.failedTests} failed`);
    console.log(`   Coverage: ${((analysis.testedEvents / analysis.totalMapping) * 100).toFixed(1)}%`);
    console.log(`   Redundancy: ${analysis.redundantCoverage} excess tests`);
    console.log('');
    console.log(`📁 Output directory: ${outputDir}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
