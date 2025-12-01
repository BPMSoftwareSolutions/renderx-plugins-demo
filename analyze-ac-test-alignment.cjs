#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const basePath = 'c:\\source\\repos\\bpm\\Internal\\renderx-plugins-demo';

/**
 * Extract acceptance criteria conditions from Gherkin ACs
 * Splits "Given...When...Then" into testable conditions
 */
function extractACConditions(acceptanceCriteria) {
  if (!Array.isArray(acceptanceCriteria)) return [];
  
  const conditions = [];
  
  for (const ac of acceptanceCriteria) {
    // Split by \n to get individual lines
    const lines = ac.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Extract key conditions (skipping "Given", "When" prefixes, focus on assertions)
      if (trimmed.startsWith('Then ')) {
        conditions.push(trimmed.substring(5)); // Remove "Then " prefix
      } else if (trimmed.startsWith('And ') && conditions.length > 0) {
        // These are assertions under a "Then"
        conditions.push(trimmed.substring(4)); // Remove "And " prefix
      }
    }
  }
  
  return conditions;
}

/**
 * Extract assertions from test file
 */
function extractTestAssertions(testFilePath) {
  try {
    const fullPath = path.join(basePath, testFilePath);
    if (!fs.existsSync(fullPath)) return [];
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const assertions = [];
    
    // Match expect(...) or assert(...) statements
    const expectRegex = /expect\([^)]*\)\.(toBe|toEqual|toContain|toMatch|toThrow|toHaveLength|toHaveProperty|toBeLessThan|toBeGreaterThan|toBeCloseTo|toBeDefined|toBeNull|toHaveBeenCalled|toHaveBeenCalledWith|toHaveBeenCalledTimes|resolves|rejects)/g;
    const assertRegex = /assert\([^)]*,\s*['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = expectRegex.exec(content)) !== null) {
      assertions.push(`expect(...).${match[1]}`);
    }
    
    while ((match = assertRegex.exec(content)) !== null) {
      assertions.push(`assert: ${match[1]}`);
    }
    
    // Also look for specific test patterns
    const latencyRegex = /(\d+)\s*ms|latency|duration|time/gi;
    const eventRegex = /event|emit|publish|subscribe|listener/gi;
    const errorRegex = /error|throw|catch|reject/gi;
    const stateRegex = /state|update|change|sync|consistent/gi;
    
    if (latencyRegex.test(content)) assertions.push('performance: latency/timing check');
    if (eventRegex.test(content)) assertions.push('verification: event/publication');
    if (errorRegex.test(content)) assertions.push('verification: error handling');
    if (stateRegex.test(content)) assertions.push('verification: state consistency');
    
    return [...new Set(assertions)]; // Deduplicate
  } catch (e) {
    return [];
  }
}

/**
 * Score AC condition coverage by test
 */
function scoreACCoverage(acConditions, testAssertions) {
  if (acConditions.length === 0) return 100; // No ACs to verify
  if (testAssertions.length === 0) return 0;
  
  let matchCount = 0;
  
  for (const condition of acConditions) {
    const conditionLower = condition.toLowerCase();
    
    // Look for semantic matches in test assertions
    for (const assertion of testAssertions) {
      const assertionLower = assertion.toLowerCase();
      
      // Direct substring match
      if (assertionLower.includes(conditionLower) || conditionLower.includes(assertionLower.split(':')[0])) {
        matchCount++;
        break;
      }
      
      // Partial matches for common patterns
      if (conditionLower.includes('latency') && assertionLower.includes('performance')) matchCount++;
      if (conditionLower.includes('event') && assertionLower.includes('event')) matchCount++;
      if (conditionLower.includes('error') && assertionLower.includes('error')) matchCount++;
      if (conditionLower.includes('schema') && assertionLower.includes('expect')) matchCount++;
    }
  }
  
  return Math.round((matchCount / acConditions.length) * 100);
}

/**
 * Find symphony JSON files
 */
function findSymphonies() {
  const symphonies = [];
  
  const packages = [
    'orchestration', 'control-panel', 'self-healing', 'slo-dashboard',
    'canvas-component', 'header', 'library', 'library-component', 'real-estate-analyzer'
  ];
  
  for (const pkg of packages) {
    const flatPath = path.join(basePath, `packages/${pkg}/json-sequences`);
    if (fs.existsSync(flatPath)) {
      try {
        const files = fs.readdirSync(flatPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            symphonies.push(path.join(flatPath, file));
          }
        }
      } catch (e) {}
    }
  }
  
  for (const pkg of packages) {
    const nestedBase = path.join(basePath, `packages/${pkg}/json-sequences`);
    if (fs.existsSync(nestedBase)) {
      const dirs = fs.readdirSync(nestedBase);
      for (const dir of dirs) {
        const nestedPath = path.join(nestedBase, dir);
        if (fs.statSync(nestedPath).isDirectory()) {
          try {
            const files = fs.readdirSync(nestedPath);
            for (const file of files) {
              if (file.endsWith('.json')) {
                symphonies.push(path.join(nestedPath, file));
              }
            }
          } catch (e) {}
        }
      }
    }
  }
  
  const srcPath = path.join(basePath, 'src');
  if (fs.existsSync(srcPath)) {
    try {
      const dirs = fs.readdirSync(srcPath);
      for (const dir of dirs) {
        if (dir.startsWith('RenderX.Plugins.')) {
          const seqPath = path.join(srcPath, dir, 'json-sequences');
          if (fs.existsSync(seqPath)) {
            const files = fs.readdirSync(seqPath);
            for (const file of files) {
              if (file.endsWith('.json')) {
                symphonies.push(path.join(seqPath, file));
              }
              
              const nested = path.join(seqPath, file);
              if (fs.statSync(nested).isDirectory()) {
                try {
                  const nestedFiles = fs.readdirSync(nested);
                  for (const nf of nestedFiles) {
                    if (nf.endsWith('.json')) {
                      symphonies.push(path.join(nested, nf));
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
      }
    } catch (e) {}
  }
  
  return symphonies;
}

/**
 * Analyze AC-to-Test alignment
 */
function analyzeACAlignment() {
  console.log('🔍 Analyzing Acceptance Criteria to Test Alignment...\n');
  
  const symphonies = findSymphonies();
  const report = {
    totalSymphonies: symphonies.length,
    totalBeats: 0,
    alignmentScores: [],
    good: 0,     // ≥70%
    partial: 0,  // 40-69%
    poor: 0,     // <40%
    details: []
  };
  
  for (const symphonyPath of symphonies) {
    try {
      const content = fs.readFileSync(symphonyPath, 'utf8');
      const symphony = JSON.parse(content);
      
      if (!symphony.movements || !Array.isArray(symphony.movements)) continue;
      
      for (const movement of symphony.movements) {
        if (!movement.beats || !Array.isArray(movement.beats)) continue;
        
        for (const beat of movement.beats) {
          report.totalBeats++;
          
          const acConditions = extractACConditions(beat.acceptanceCriteria);
          const testAssertions = extractTestAssertions(beat.testFile);
          
          const coverage = scoreACCoverage(acConditions, testAssertions);
          report.alignmentScores.push(coverage);
          
          // Categorize
          if (coverage >= 70) report.good++;
          else if (coverage >= 40) report.partial++;
          else report.poor++;
          
          // Track details
          if (coverage < 70) {
            report.details.push({
              symphony: path.basename(symphonyPath, '.json'),
              beat: beat.title || `Beat ${beat.beat}`,
              handler: beat.handler,
              coverage,
              acCount: acConditions.length,
              testCount: testAssertions.length,
              acConditions,
              testAssertions,
              testFile: beat.testFile
            });
          }
        }
      }
    } catch (e) {}
  }
  
  return report;
}

/**
 * Generate recommendations for improving alignment
 */
function generateRecommendations(details) {
  const recommendations = [];
  
  for (const beat of details.slice(0, 10)) {
    const gaps = beat.acConditions.filter(ac => {
      return !beat.testAssertions.some(t => 
        ac.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(ac.toLowerCase())
      );
    });
    
    if (gaps.length > 0) {
      recommendations.push({
        symphony: beat.symphony,
        beat: beat.beat,
        handler: beat.handler,
        testFile: beat.testFile,
        missingAssertions: gaps,
        suggestedTests: gaps.map(gap => {
          let suggestion = '';
          if (gap.includes('latency') || gap.includes('ms') || gap.includes('seconds')) {
            suggestion = `// Verify latency: ${gap}\n    const start = performance.now();\n    await handler();\n    const duration = performance.now() - start;\n    expect(duration).toBeLessThan(expectedLatency);`;
          } else if (gap.includes('event') || gap.includes('publish')) {
            suggestion = `// Verify event published: ${gap}\n    const eventSpy = jest.fn();\n    eventBus.subscribe('event-name', eventSpy);\n    await handler();\n    expect(eventSpy).toHaveBeenCalled();`;
          } else if (gap.includes('schema') || gap.includes('conform')) {
            suggestion = `// Verify schema conformance: ${gap}\n    const result = await handler();\n    expect(result).toMatchSchema(expectedSchema);\n    expect(result).toHaveProperty('required_field');`;
          } else if (gap.includes('error')) {
            suggestion = `// Verify error handling: ${gap}\n    expect(async () => {\n      await handler(invalidInput);\n    }).rejects.toThrow();`;
          } else {
            suggestion = `// TODO: Add test for: ${gap}`;
          }
          return suggestion;
        })
      });
    }
  }
  
  return recommendations;
}

/**
 * Generate detailed report
 */
function generateReport() {
  const report = analyzeACAlignment();
  const recommendations = generateRecommendations(report.details);
  
  const avgCoverage = Math.round(
    report.alignmentScores.reduce((a, b) => a + b, 0) / report.alignmentScores.length
  );
  
  console.log('📊 Acceptance Criteria to Test Alignment Report\n');
  console.log('='.repeat(70));
  
  console.log('\n📈 Overall Coverage Metrics:');
  console.log(`   Average Alignment: ${avgCoverage}%`);
  console.log(`   Total Beats Analyzed: ${report.totalBeats}`);
  console.log(`   Good Alignment (≥70%): ${report.good} (${Math.round(report.good/report.totalBeats*100)}%)`);
  console.log(`   Partial Alignment (40-69%): ${report.partial} (${Math.round(report.partial/report.totalBeats*100)}%)`);
  console.log(`   Poor Alignment (<40%): ${report.poor} (${Math.round(report.poor/report.totalBeats*100)}%)`);
  
  console.log('\n⚠️ Worst Aligned Beats (Top 10):');
  console.log('-'.repeat(70));
  
  for (let i = 0; i < Math.min(10, report.details.length); i++) {
    const beat = report.details[i];
    console.log(`\n${i+1}. ${beat.symphony} → ${beat.beat}`);
    console.log(`   Handler: ${beat.handler}`);
    console.log(`   Coverage: ${beat.coverage}% (${beat.testCount}/${beat.acCount} ACs matched)`);
    console.log(`   Test File: ${beat.testFile || 'TBD'}`);
    console.log(`   AC Conditions: ${beat.acCount}`);
    console.log(`   Test Assertions Found: ${beat.testCount}`);
  }
  
  console.log('\n\n💡 Gap Analysis Sample:');
  console.log('-'.repeat(70));
  
  if (recommendations.length > 0) {
    const rec = recommendations[0];
    console.log(`\nSymphony: ${rec.symphony}`);
    console.log(`Beat: ${rec.beat} (${rec.handler})`);
    console.log(`Test File: ${rec.testFile}`);
    console.log(`\nMissing Assertions (`);
    for (const gap of rec.missingAssertions.slice(0, 3)) {
      console.log(`  - ${gap}`);
    }
    console.log('\nSuggested Test Additions:');
    for (const suggestion of rec.suggestedTests.slice(0, 2)) {
      console.log(`\n${suggestion}`);
    }
  }
  
  // Save detailed report
  const reportContent = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBeats: report.totalBeats,
      averageCoverage: avgCoverage,
      goodAlignment: report.good,
      partialAlignment: report.partial,
      poorAlignment: report.poor
    },
    worstAligned: report.details.slice(0, 20),
    recommendations: recommendations.slice(0, 10)
  };
  
  fs.writeFileSync(
    path.join(basePath, 'ac-test-alignment-report.json'),
    JSON.stringify(reportContent, null, 2)
  );
  
  console.log('\n\n✅ Detailed report saved to: ac-test-alignment-report.json');
  console.log('\n📝 Improvement Strategy:');
  console.log('   1. Review worst-aligned beats (coverage < 40%)');
  console.log('   2. Add test assertions for each unmatched AC condition');
  console.log('   3. Include performance/timing assertions for SLA ACs');
  console.log('   4. Add event verification tests for observable behavior');
  console.log('   5. Re-run this analysis to track improvement');
}

generateReport();
