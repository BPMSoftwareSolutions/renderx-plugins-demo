#!/usr/bin/env node

/**
 * AC-to-Test Implementation Fixer
 *
 * Fixes non-compliant tests to properly implement their AC specifications.
 * Generates new test implementations that validate Given/When/Then requirements.
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const VALIDATION_SUMMARY = path.join(WORKSPACE_ROOT, '.generated/ac-alignment/validation-summary.json');
const AC_REGISTRY_PATH = path.join(WORKSPACE_ROOT, '.generated/acs/renderx-web-orchestration.registry.json');

/**
 * Load validation summary
 */
function loadValidationSummary() {
  if (!fs.existsSync(VALIDATION_SUMMARY)) {
    throw new Error(`Validation summary not found at ${VALIDATION_SUMMARY}. Run validate-test-implementations.cjs first.`);
  }
  return JSON.parse(fs.readFileSync(VALIDATION_SUMMARY, 'utf-8'));
}

/**
 * Load AC registry
 */
function loadACRegistry() {
  if (!fs.existsSync(AC_REGISTRY_PATH)) {
    throw new Error(`AC registry not found at ${AC_REGISTRY_PATH}`);
  }
  return JSON.parse(fs.readFileSync(AC_REGISTRY_PATH, 'utf-8'));
}

/**
 * Generate test code from AC
 */
function generateTestCode(ac, testContext) {
  const { given, when, then, and } = ac;
  const handler = ac.handler || 'handler';
  const handlerParts = handler.split('#');
  const handlerName = handlerParts[1] || handlerParts[0];

  let testCode = `  it('${generateTestTitle(ac)}', async () => {\n`;

  // Generate Given setup
  if (given && given.length > 0) {
    testCode += `    // Given: ${given.join(', ')}\n`;
    for (const givenCondition of given) {
      testCode += generateGivenSetup(givenCondition, testContext);
    }
    testCode += '\n';
  }

  // Generate When action
  if (when && when.length > 0) {
    testCode += `    // When: ${when.join(', ')}\n`;
    for (const whenAction of when) {
      testCode += generateWhenAction(whenAction, handlerName, testContext);
    }
    testCode += '\n';
  }

  // Generate Then assertions
  if (then && then.length > 0) {
    testCode += `    // Then: ${then.join(', ')}\n`;
    for (const thenAssertion of then) {
      testCode += generateThenAssertion(thenAssertion, testContext);
    }
  }

  // Generate And assertions
  if (and && and.length > 0) {
    testCode += `    // And: ${and.join(', ')}\n`;
    for (const andClause of and) {
      testCode += generateAndAssertion(andClause, testContext);
    }
  }

  testCode += `  });\n`;

  return testCode;
}

/**
 * Generate test title from AC
 */
function generateTestTitle(ac) {
  const action = ac.when?.[0] || 'operation';
  const outcome = ac.then?.[0] || 'succeeds';
  return `[AC:${ac.acId}] ${action} → ${outcome}`;
}

/**
 * Generate Given setup code
 */
function generateGivenSetup(condition, context) {
  const lower = condition.toLowerCase();

  // Theme system setup
  if (lower.includes('theme') && lower.includes('initialized')) {
    return `    // Initialize theme system\n    const themeService = { getCurrentTheme: vi.fn(() => 'light') };\n`;
  }

  // Configuration setup
  if (lower.includes('configuration') || lower.includes('config')) {
    return `    const config = { /* mock configuration */ };\n`;
  }

  // Input parameters
  if (lower.includes('input') || lower.includes('parameters')) {
    return `    const input = { /* valid input parameters */ };\n`;
  }

  // Performance SLA
  if (lower.includes('performance') || lower.includes('sla')) {
    return `    const startTime = performance.now();\n`;
  }

  // Generic setup
  return `    // Setup: ${condition}\n    const testData = {};\n`;
}

/**
 * Generate When action code
 */
function generateWhenAction(action, handlerName, context) {
  const lower = action.toLowerCase();

  // Handler execution
  if (lower.includes('called') || lower.includes('executes') || lower.includes('runs')) {
    return `    const result = await ${handlerName}(/* params */);\n`;
  }

  // Processing
  if (lower.includes('processes')) {
    return `    const result = await ${handlerName}(input);\n`;
  }

  // Generic action
  return `    // Action: ${action}\n    const result = await performAction();\n`;
}

/**
 * Generate Then assertion code
 */
function generateThenAssertion(assertion, context) {
  const lower = assertion.toLowerCase();

  // Performance assertions
  if (lower.includes('within') && (lower.includes('ms') || lower.includes('second'))) {
    const timeMatch = assertion.match(/(\d+)\s*(ms|second)/i);
    if (timeMatch) {
      const time = timeMatch[1];
      const unit = timeMatch[2].toLowerCase();
      const ms = unit === 'second' ? parseInt(time) * 1000 : parseInt(time);
      return `    const elapsed = performance.now() - startTime;\n    expect(elapsed).toBeLessThan(${ms});\n`;
    }
  }

  // Schema conformance
  if (lower.includes('schema') || lower.includes('conform')) {
    return `    expect(result).toBeDefined();\n    expect(typeof result).toBe('object');\n`;
  }

  // Error handling
  if (lower.includes('no error') || lower.includes('without error')) {
    return `    expect(() => result).not.toThrow();\n`;
  }

  // Theme assertions
  if (lower.includes('theme') && (lower.includes('dark') || lower.includes('light'))) {
    return `    expect(['dark', 'light']).toContain(result);\n`;
  }

  // localStorage
  if (lower.includes('localstorage') && lower.includes('respected')) {
    return `    expect(localStorage.getItem('theme')).toBeTruthy();\n`;
  }

  // Default handling
  if (lower.includes('default')) {
    return `    expect(result).toBe('light'); // default theme\n`;
  }

  // Registry/JSON output
  if (lower.includes('registry') || lower.includes('.json')) {
    return `    expect(fs.existsSync(outputPath)).toBe(true);\n    expect(JSON.parse(fs.readFileSync(outputPath, 'utf-8'))).toBeDefined();\n`;
  }

  // Generic assertion
  return `    expect(result).toBeDefined();\n`;
}

/**
 * Generate And assertion code
 */
function generateAndAssertion(clause, context) {
  // Reuse Then assertion logic for And clauses
  return generateThenAssertion(clause, context);
}

/**
 * Fix a non-compliant test file
 */
function fixTestFile(filePath, nonCompliantTests, registry) {
  const fullPath = path.join(WORKSPACE_ROOT, filePath);
  const originalContent = fs.readFileSync(fullPath, 'utf-8');

  console.log(`\n📝 Fixing ${filePath}...`);
  console.log(`   Found ${nonCompliantTests.length} non-compliant test(s)`);

  // Group by test suite
  const suggestions = [];

  for (const test of nonCompliantTests) {
    const ac = registry.acs.find(ac => ac.acId === test.tag.replace(/\[AC:([^\]]+)\]/, '$1'));

    if (!ac) {
      console.log(`   ⚠️  Skipping ${test.tag}: AC not found in registry`);
      continue;
    }

    const testCode = generateTestCode(ac, {});

    suggestions.push({
      tag: test.tag,
      ac: ac,
      issues: test.issues,
      suggestedCode: testCode
    });

    console.log(`   ✨ Generated test for ${test.tag}`);
  }

  // Write suggestions to file
  const suggestionsPath = fullPath.replace(/\.spec\.(ts|js)$/, '.fixes.txt');
  let output = `# Test Implementation Fixes for ${path.basename(filePath)}\n\n`;
  output += `This file contains suggested test implementations to fix AC compliance issues.\n\n`;

  for (const suggestion of suggestions) {
    output += `## ${suggestion.tag}\n\n`;
    output += `**AC Details:**\n`;
    output += `- Handler: ${suggestion.ac.handler}\n`;
    output += `- Given: ${suggestion.ac.given?.join(', ') || 'N/A'}\n`;
    output += `- When: ${suggestion.ac.when?.join(', ') || 'N/A'}\n`;
    output += `- Then: ${suggestion.ac.then?.join(', ') || 'N/A'}\n`;
    if (suggestion.ac.and?.length > 0) {
      output += `- And: ${suggestion.ac.and.join(', ')}\n`;
    }
    output += `\n**Issues Found:**\n`;
    for (const issue of suggestion.issues) {
      output += `- ${issue}\n`;
    }
    output += `\n**Suggested Test Code:**\n\n`;
    output += '```typescript\n';
    output += suggestion.suggestedCode;
    output += '```\n\n';
    output += `---\n\n`;
  }

  fs.writeFileSync(suggestionsPath, output);
  console.log(`   💾 Fixes written to ${path.basename(suggestionsPath)}`);

  return suggestions.length;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 AC-to-Test Implementation Fixer\n');

  // Load validation summary
  console.log('📖 Loading validation summary...');
  const validation = loadValidationSummary();
  console.log(`   Found ${validation.nonCompliant} non-compliant tests\n`);

  if (validation.nonCompliant === 0) {
    console.log('✅ No non-compliant tests to fix!');
    return;
  }

  // Load AC registry
  console.log('📖 Loading AC registry...');
  const registry = loadACRegistry();
  console.log(`   Loaded ${registry.totalACs} ACs\n`);

  // Group non-compliant tests by file
  const testsByFile = new Map();
  for (const test of validation.nonCompliantTests) {
    if (!testsByFile.has(test.file)) {
      testsByFile.set(test.file, []);
    }
    testsByFile.get(test.file).push(test);
  }

  console.log(`📝 Processing ${testsByFile.size} files with non-compliant tests...\n`);

  // Fix each file
  let totalFixed = 0;
  for (const [file, tests] of testsByFile) {
    const fixed = fixTestFile(file, tests, registry);
    totalFixed += fixed;
  }

  console.log(`\n✅ Generated ${totalFixed} test fixes across ${testsByFile.size} files`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Review the .fixes.txt files in your test directories`);
  console.log(`   2. Update your tests with the suggested implementations`);
  console.log(`   3. Run validate-test-implementations.cjs again to verify`);
  console.log(`   4. Adjust as needed to match your specific test framework and patterns\n`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
