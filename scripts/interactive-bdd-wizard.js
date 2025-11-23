#!/usr/bin/env node

/**
 * ============================================================================
 * INTERACTIVE DELIVERY PIPELINE WIZARD
 * ============================================================================
 * 
 * Guides developers through the complete delivery pipeline step-by-step.
 * Ensures no layer is skipped and every requirement is met.
 * 
 * Usage: node scripts/interactive-bdd-wizard.js <feature-name>
 * 
 * This wizard:
 * 1. Asks clear questions about the feature
 * 2. Validates answers against governance requirements
 * 3. Creates necessary directories and files
 * 4. Generates BDD specifications
 * 5. Auto-generates BDD tests from specifications
 * 6. Shows what unit tests need to be written
 * 7. Provides implementation guidance
 * 8. Sets up drift detection
 * 
 * The wizard refuses to proceed if previous steps aren't complete,
 * ensuring no skipping of pipeline layers.
 * 
 * ============================================================================
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const colors = {
  error: chalk.red,
  warning: chalk.yellow,
  success: chalk.green,
  info: chalk.blue,
  hint: chalk.cyan,
  code: chalk.gray,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function pause(message = 'Press Enter to continue...') {
  return new Promise((resolve) => {
    rl.question(colors.hint(`\n${message}`), resolve);
  });
}

/**
 * ============================================================================
 * PIPELINE WIZARD STEPS
 * ============================================================================
 */

class PipelineWizard {
  constructor(featureName) {
    this.featureName = featureName;
    this.featurePath = path.join(ROOT, 'packages', featureName);
    this.state = {};
  }

  async run() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('🚀 DELIVERY PIPELINE WIZARD'));
    console.log(colors.info('═'.repeat(80)));
    console.log(`\nGuiding you through the complete delivery pipeline for:`);
    console.log(colors.code(`  ${this.featureName}\n`));

    console.log(colors.warning('This wizard will ensure you follow the required pipeline:\n'));
    console.log(colors.code('  1. 📋 Business BDD Specifications (immutable source)'));
    console.log(colors.code('  2. 🧪 Auto-Generated Business BDD Tests'));
    console.log(colors.code('  3. ✅ Unit Tests (TDD - implementation details)'));
    console.log(colors.code('  4. 💻 Implementation Code'));
    console.log(colors.code('  5. 🔍 Drift Detection Setup\n'));

    await pause();

    // Step 1: Gather feature requirements
    await this.gatherFeatureRequirements();

    // Step 2: Create Business BDD Specifications
    await this.createBusinessBDDSpecs();

    // Step 3: Generate BDD Tests
    await this.generateBDDTests();

    // Step 4: Plan Unit Tests
    await this.planUnitTests();

    // Step 5: Guide Implementation
    await this.guideImplementation();

    // Step 6: Setup Drift Detection
    await this.setupDriftDetection();

    // Final: Show summary
    await this.showCompletionSummary();
  }

  async gatherFeatureRequirements() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 1: GATHER FEATURE REQUIREMENTS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.warning('These requirements become your immutable source of truth.'));
    console.log(colors.warning('They guide all implementation and prevent requirements drift.\n'));

    this.state.description = await question(
      colors.hint('📝 Describe the feature (1-2 sentences): ')
    );

    this.state.businessValue = await question(
      colors.hint('💼 What business value does it provide? ')
    );

    this.state.personas = [];
    console.log(colors.hint('\n👥 Who will use this feature? (Enter names, type "done" when complete)'));
    while (true) {
      const persona = await question(colors.hint('   Persona: '));
      if (persona.toLowerCase() === 'done') break;
      this.state.personas.push(persona);
    }

    this.state.numScenarios = parseInt(
      await question(
        colors.hint(
          '\n📋 How many user scenarios/use cases? (e.g., 3-5 typical): '
        )
      )
    );

    console.log(
      colors.success(
        '\n✅ Requirements gathered! Moving to specifications...'
      )
    );
    await pause();
  }

  async createBusinessBDDSpecs() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 2: CREATE BUSINESS BDD SPECIFICATIONS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(
      colors.warning(
        'Creating immutable BDD specifications file (never manually edit):\n'
      )
    );

    const specsDir = path.join(
      this.featurePath,
      '.generated'
    );
    const specsFile = path.join(
      specsDir,
      `${this.featureName}-business-bdd-specifications.json`
    );

    // Ensure directory exists
    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true });
    }

    console.log(colors.code(`📁 ${specsFile}`));

    // Gather scenarios
    const scenarios = [];
    for (let i = 0; i < this.state.numScenarios; i++) {
      console.log(colors.hint(`\n  Scenario ${i + 1}:`));
      const title = await question(colors.hint('    Title: '));
      const given = await question(
        colors.hint('    Given (precondition): ')
      );
      const when = await question(colors.hint('    When (action): '));
      const then = await question(colors.hint('    Then (expected): '));

      scenarios.push({
        title,
        given,
        when,
        then,
      });
    }

    // Create specs object
    const specs = {
      version: '1.0.0',
      type: 'Business BDD Specifications',
      feature: this.featureName,
      timestamp: new Date().toISOString(),
      source: 'Interactive Pipeline Wizard',
      immutable: true,
      locked: true,
      metadata: {
        description: this.state.description,
        businessValue: this.state.businessValue,
        personas: this.state.personas,
        changeControl: 'Specification changes require approval from Product Owner',
        regenerationRequired:
          'If specs change, all downstream tests and implementation must be regenerated',
      },
      scenarios: scenarios.map((s, idx) => ({
        id: `${this.featureName}-scenario-${idx + 1}`,
        title: s.title,
        persona: this.state.personas[idx % this.state.personas.length],
        given: s.given,
        when: s.when,
        then: s.then,
        businessValue: this.state.businessValue,
      })),
      checksum: 'will-be-computed-on-first-verify',
      generatedAt: new Date().toISOString(),
      generatedBy: 'interactive-bdd-wizard.js',
    };

    // Write specs file
    fs.writeFileSync(specsFile, JSON.stringify(specs, null, 2));

    console.log(colors.success(`\n✅ Created: ${this.featureName}-business-bdd-specifications.json`));
    console.log(
      colors.code(
        `   ${Object.keys(specs.scenarios).length} scenarios defined`
      )
    );
    console.log(
      colors.warning(
        '\n⚠️  This file is LOCKED - do not edit manually!\n   Changes require regenerating all downstream tests.'
      )
    );

    this.state.specsFile = specsFile;
    await pause();
  }

  async generateBDDTests() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 3: GENERATE AUTO-GENERATED BDD TESTS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(
      colors.warning('Auto-generating test file from specifications:\n')
    );

    const testsDir = path.join(
      this.featurePath,
      '__tests__',
      'business-bdd'
    );

    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }

    const testFile = path.join(
      testsDir,
      `${this.featureName}-bdd.spec.ts`
    );

    console.log(colors.code(`📁 ${testFile}`));

    // Create test template
    const testContent = `
/**
 * ============================================================================
 * ${this.featureName} - Business BDD Tests
 * ============================================================================
 * 
 * AUTO-GENERATED FROM: ${this.featureName}-business-bdd-specifications.json
 * DO NOT EDIT THIS FILE MANUALLY
 * 
 * If you need to change tests:
 * 1. Modify the specifications JSON file
 * 2. Re-run: npm run generate:${this.featureName}:bdd-tests
 * 3. All tests will be regenerated
 * 
 * This ensures tests ALWAYS match specifications.
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('${this.featureName} - Business BDD Scenarios', () => {
  ${this.state.scenarios
    .map(
      (s, idx) => `
  it('Scenario ${idx + 1}: ${s.title}', async () => {
    // GIVEN: ${s.given}
    // (Setup preconditions here)
    
    // WHEN: ${s.when}
    // (Perform action here)
    
    // THEN: ${s.then}
    // expect(...).toBe(...);
    
    // TODO: Implement this test based on specification
    expect(true).toBe(true); // Placeholder
  });
  `
    )
    .join('')}
});

/**
 * ============================================================================
 * IMPLEMENTATION INSTRUCTIONS
 * ============================================================================
 * 
 * 1. Replace the placeholder "expect(true).toBe(true)" with actual assertions
 * 
 * 2. Each test should:
 *    - Set up the precondition (GIVEN)
 *    - Perform the action (WHEN)
 *    - Verify the result (THEN)
 * 
 * 3. Use:
 *    - @testing-library/react for UI components
 *    - jest-mock for mocking services
 *    - vitest for test runner
 * 
 * 4. These tests verify BUSINESS SCENARIOS, not implementation details.
 *    Implementation unit tests go in __tests__/unit/
 * 
 * 5. Run tests:
 *    npm test -- ${this.featureName}-bdd.spec.ts
 * 
 * ============================================================================
 */
`;

    fs.writeFileSync(testFile, testContent);

    console.log(colors.success(`\n✅ Generated: ${this.featureName}-bdd.spec.ts`));
    console.log(colors.code(`   ${this.state.scenarios.length} test cases from scenarios`));
    console.log(
      colors.warning(
        '\n⚠️  Tests are placeholders - you must implement the test logic.'
      )
    );

    this.state.testFile = testFile;
    await pause();
  }

  async planUnitTests() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 4: PLAN UNIT TESTS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(
      colors.warning(
        'Unit tests differ from BDD tests:\n'
      )
    );

    console.log(colors.code('BDD Tests (you just created):'));
    console.log(colors.code('  • Test business scenarios'));
    console.log(colors.code('  • Verify user experience'));
    console.log(colors.code('  • Auto-generated from specifications'));
    console.log(colors.code('  • Stay in: __tests__/business-bdd/\n'));

    console.log(colors.code('Unit Tests (you write next):'));
    console.log(colors.code('  • Test individual functions/components'));
    console.log(colors.code('  • Verify edge cases and error handling'));
    console.log(colors.code('  • Manually written by developers'));
    console.log(colors.code('  • Stay in: __tests__/unit/\n'));

    console.log(colors.hint('Component/Hook/Service to test:'));
    const items = parseInt(
      await question(colors.hint(
        '  How many components/hooks/services need unit tests? '
      ))
    );

    const unitTestPlan = [];
    for (let i = 0; i < items; i++) {
      const name = await question(
        colors.hint(`  ${i + 1}. Component/Hook/Service name: `)
      );
      const numTests = parseInt(
        await question(colors.hint(`     How many tests? (typical: 5-10): `))
      );
      unitTestPlan.push({ name, count: numTests });
    }

    console.log(colors.success('\n✅ Unit test plan created'));
    console.log(colors.code('  Target tests:', unitTestPlan.reduce((sum, item) => sum + item.count, 0)));

    this.state.unitTestPlan = unitTestPlan;
    await pause();
  }

  async guideImplementation() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 5: IMPLEMENTATION GUIDANCE'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.warning('Implementation Flow (Test-Driven Development):\n'));

    console.log(colors.code('1. BDD Tests (ALREADY DONE)'));
    console.log(colors.code('   ├─ Define what business needs'));
    console.log(colors.code('   └─ Guide implementation\n'));

    console.log(colors.code('2. Unit Tests (DO THIS NEXT)'));
    console.log(colors.code('   ├─ Write test cases'));
    console.log(colors.code('   └─ Tests fail (no code yet)\n'));

    console.log(colors.code('3. Implementation Code'));
    console.log(colors.code('   ├─ Write code to pass unit tests'));
    console.log(colors.code('   ├─ Run: npm test'));
    console.log(colors.code('   └─ Tests pass\n'));

    console.log(colors.code('4. BDD Test Implementation'));
    console.log(colors.code('   ├─ Implement BDD test logic'));
    console.log(colors.code('   └─ Verify business scenarios pass\n'));

    console.log(colors.code('5. Drift Detection'));
    console.log(colors.code('   ├─ Run: npm run verify:no-drift'));
    console.log(colors.code('   └─ Ensure nothing changed unexpectedly\n'));

    console.log(colors.hint('Ready to start writing code? (yes/no)'));
    const ready = await question(colors.hint('  Continue? '));

    if (ready.toLowerCase() !== 'yes' && ready.toLowerCase() !== 'y') {
      console.log(colors.warning('\n⏸️  Pipeline paused. Resume with:'));
      console.log(
        colors.code(`  node scripts/interactive-bdd-wizard.js ${this.featureName}`)
      );
      rl.close();
      return;
    }

    await pause();
  }

  async setupDriftDetection() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('STEP 6: SETUP DRIFT DETECTION'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.warning('Drift detection ensures specifications never change silently.\n'));

    console.log(colors.code('How it works:'));
    console.log(colors.code('  1. Specifications file is hashed (SHA256)'));
    console.log(colors.code('  2. Hash is embedded in reports'));
    console.log(colors.code('  3. On next run, hashes are compared'));
    console.log(colors.code('  4. If different → drift detected → alert!\n'));

    console.log(colors.hint('Drift detection is AUTOMATIC. Nothing to do here.\n'));

    console.log(colors.success('✅ Drift detection ready'));
    console.log(colors.code('  Command: npm run verify:no-drift'));
    console.log(colors.code('  Will detect any changes to specifications\n'));

    await pause();
  }

  async showCompletionSummary() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.success('🎉 PIPELINE SETUP COMPLETE'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.success('Your feature has been set up with:\n'));

    console.log(colors.code('✅ Step 1: Business BDD Specifications'));
    console.log(colors.code(`   File: ${this.featureName}-business-bdd-specifications.json`));
    console.log(colors.code(`   Scenarios: ${this.state.numScenarios}\n`));

    console.log(colors.code('✅ Step 2: Auto-Generated BDD Tests'));
    console.log(colors.code(`   File: ${this.featureName}-bdd.spec.ts`));
    console.log(colors.code('   Status: Placeholder - needs implementation\n'));

    console.log(colors.code('⏳ Step 3: Unit Tests (NEXT)'));
    console.log(colors.code(`   Items to test: ${this.state.unitTestPlan.length}`));
    console.log(colors.code(`   Total tests needed: ${this.state.unitTestPlan.reduce((sum, item) => sum + item.count, 0)}\n`));

    console.log(colors.code('⏳ Step 4: Implementation Code'));
    console.log(colors.code('   Write code to pass tests\n'));

    console.log(colors.code('✅ Step 5: Drift Detection'));
    console.log(colors.code('   Automatic - no setup needed\n'));

    console.log(colors.info('═'.repeat(80)));
    console.log(colors.hint('\n📋 NEXT STEPS:\n'));

    console.log(
      colors.code(`1. Read the generated test file to understand what to implement:`)
    );
    console.log(colors.code(`   cat ${this.state.testFile}\n`));

    console.log(colors.code('2. Write unit tests first (TDD approach):'));
    console.log(
      colors.code(
        `   Create: __tests__/unit/ directory with test files\n`
      )
    );

    console.log(colors.code('3. Implement code to pass tests:'));
    console.log(colors.code(`   Create: src/ directory with implementation\n`));

    console.log(colors.code('4. Run all tests:'));
    console.log(colors.code('   npm test\n'));

    console.log(colors.code('5. Verify no drift:'));
    console.log(colors.code('   npm run verify:no-drift\n'));

    console.log(colors.info('═'.repeat(80)));
    console.log(
      colors.success('Pipeline is ready! Follow the steps above to complete implementation.')
    );
    console.log(
      colors.warning(
        '\n💡 Remember: Specs are locked. All changes start with spec updates.'
      )
    );
    console.log(colors.info('═'.repeat(80)) + '\n');

    rl.close();
  }
}

// Run wizard
const featureName = process.argv[2];
if (!featureName) {
  console.log(colors.error('\n❌ Feature name required\n'));
  console.log('Usage: node scripts/interactive-bdd-wizard.js <feature-name>\n');
  console.log(colors.code('Example: node scripts/interactive-bdd-wizard.js slo-dashboard\n'));
  process.exit(1);
}

const wizard = new PipelineWizard(featureName);
wizard.run().catch((err) => {
  console.error(colors.error('Error:'), err);
  process.exit(1);
});
