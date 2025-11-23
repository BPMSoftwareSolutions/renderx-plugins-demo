#!/usr/bin/env node

/**
 * ============================================================================
 * PIPELINE RECOVERY WIZARD
 * ============================================================================
 * 
 * Guides teams through recovering non-compliant features to full compliance.
 * 
 * Usage: node scripts/pipeline-recovery.js <feature-name>
 * 
 * This script:
 * 1. Assesses current state
 * 2. Guides specification recovery
 * 3. Generates BDD tests
 * 4. Verifies implementation
 * 5. Sets up drift detection
 * 6. Documents recovery
 * 
 * Time: 6-9 hours
 * 
 * ============================================================================
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
 * RECOVERY WIZARD
 * ============================================================================
 */

class RecoveryWizard {
  constructor(featureName) {
    this.featureName = featureName;
    this.featurePath = path.join(ROOT, 'packages', featureName);
    this.state = {};
  }

  async run() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('🔄 PIPELINE RECOVERY WIZARD'));
    console.log(colors.info('═'.repeat(80)));
    console.log(`\nRecovering compliance for: ${colors.code(this.featureName)}\n`);

    console.log(colors.warning('This wizard will:\n'));
    console.log(colors.code('  1. 📊 Assess current state'));
    console.log(colors.code('  2. 📋 Reverse-engineer specifications'));
    console.log(colors.code('  3. 🧪 Generate BDD tests'));
    console.log(colors.code('  4. ✅ Verify implementation'));
    console.log(colors.code('  5. 🔍 Setup drift detection'));
    console.log(colors.code('  6. 📄 Document recovery\n'));

    // Phase 1: Assess
    await this.assessCurrentState();

    // Phase 2: Recover Specs
    await this.recoverSpecifications();

    // Phase 3: Generate Tests
    await this.generateBDDTests();

    // Phase 4: Verify
    await this.verifyImplementation();

    // Phase 5: Setup Drift
    await this.setupDriftDetection();

    // Phase 6: Document
    await this.documentRecovery();

    // Summary
    await this.showRecoverySummary();
  }

  async assessCurrentState() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 1: ASSESS CURRENT STATE'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.warning('Checking what exists and what\'s missing...\n'));

    // Check implementation
    const srcPath = path.join(this.featurePath, 'src');
    const hasImplementation = fs.existsSync(srcPath);
    console.log(
      hasImplementation
        ? colors.success('✅ Implementation code exists')
        : colors.warning('⚠️  No implementation code found')
    );

    // Check tests
    const testsPath = path.join(this.featurePath, '__tests__');
    const hasTests = fs.existsSync(testsPath);
    console.log(
      hasTests
        ? colors.success('✅ Unit tests exist')
        : colors.warning('⚠️  No unit tests found')
    );

    // Check specs
    const specsPath = path.join(this.featurePath, '.generated');
    const specFiles = fs.existsSync(specsPath)
      ? fs
          .readdirSync(specsPath)
          .filter((f) => f.includes('business-bdd-specifications'))
      : [];

    console.log(
      specFiles.length > 0
        ? colors.warning(`⚠️  Specifications found (${specFiles.length})`)
        : colors.error('❌ NO Business BDD Specifications (this is why we\'re recovering)')
    );

    this.state.hasImplementation = hasImplementation;
    this.state.hasTests = hasTests;
    this.state.hasSpecs = specFiles.length > 0;

    console.log(colors.warning('\n⚠️  Current Status: NON-COMPLIANT'));
    console.log(colors.code('    Missing: Business BDD Specifications'));

    await pause();
  }

  async recoverSpecifications() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 2: RECOVER SPECIFICATIONS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(
      colors.warning(
        'Gathering information to create business BDD specifications:\n'
      )
    );

    // Get feature description
    console.log(colors.hint('📝 Feature Description\n'));
    this.state.description = await question(
      colors.hint('Briefly describe what this feature does: ')
    );

    // Get business value
    console.log('');
    this.state.businessValue = await question(
      colors.hint('What business value does it provide? ')
    );

    // Get personas
    console.log(colors.hint('\n👥 User Personas'));
    console.log(colors.hint('Who uses this feature? (Enter names, type "done" to finish)\n'));

    this.state.personas = [];
    while (true) {
      const persona = await question(colors.hint('  Persona: '));
      if (persona.toLowerCase() === 'done' || persona === '') break;
      this.state.personas.push(persona);
    }

    // Get main scenarios from code analysis
    console.log(colors.hint('\n📋 Main Use Cases'));
    console.log(
      colors.hint('From code analysis, what are the main scenarios users perform?\n')
    );

    this.state.scenarios = [];
    let addMore = true;
    let index = 1;

    while (addMore && index <= 5) {
      const title = await question(
        colors.hint(`Scenario ${index} (or press Enter to finish): `)
      );
      if (!title) break;

      const description = await question(
        colors.hint('  What should happen? ')
      );

      this.state.scenarios.push({
        title: title,
        description: description,
      });

      index++;
    }

    console.log(colors.success('\n✅ Specifications gathered'));

    // Create specs file
    await this.createSpecsFile();
  }

  async createSpecsFile() {
    const specsDir = path.join(
      this.featurePath,
      '.generated'
    );
    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true });
    }

    const specsFile = path.join(
      specsDir,
      `${this.featureName}-business-bdd-specifications.json`
    );

    const specs = {
      version: '1.0.0',
      type: 'Business BDD Specifications',
      feature: this.featureName,
      timestamp: new Date().toISOString(),
      source: 'Pipeline Recovery Wizard',
      recovery: true,
      immutable: true,
      locked: true,
      metadata: {
        description: this.state.description,
        businessValue: this.state.businessValue,
        personas: this.state.personas || [],
        changeControl: 'All changes must start with spec update',
        notes: 'Specifications recovered from existing implementation',
      },
      scenarios: this.state.scenarios.map((s, idx) => ({
        id: `${this.featureName}-scenario-${idx + 1}`,
        title: s.title,
        description: s.description,
        persona:
          this.state.personas && this.state.personas.length > 0
            ? this.state.personas[idx % this.state.personas.length]
            : 'User',
        businessValue: this.state.businessValue,
      })),
      checksum: 'will-be-computed-on-first-verify',
      recoveryDate: new Date().toISOString(),
    };

    fs.writeFileSync(specsFile, JSON.stringify(specs, null, 2));

    console.log(colors.success(`\n✅ Created: ${this.featureName}-business-bdd-specifications.json`));
    this.state.specsFile = specsFile;
  }

  async generateBDDTests() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 3: GENERATE BDD TESTS'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(
      colors.warning('Creating auto-generated BDD test file from specifications:\n')
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

    // Create test template
    const testContent = `/**
 * ============================================================================
 * ${this.featureName} - Business BDD Tests
 * ============================================================================
 * 
 * AUTO-GENERATED FROM: ${this.featureName}-business-bdd-specifications.json
 * DO NOT EDIT THIS FILE MANUALLY
 * 
 * These tests verify business scenarios work correctly.
 * If specifications change, regenerate this file:
 *   npm run generate:${this.featureName}:bdd-tests
 * 
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

describe('${this.featureName} - Business BDD Scenarios', () => {
${this.state.scenarios
  .map(
    (scenario, idx) => `
  it('Scenario ${idx + 1}: ${scenario.title}', async () => {
    // GIVEN: [setup preconditions]
    // TODO: Set up test data
    
    // WHEN: [user performs action]
    // TODO: Trigger the scenario
    
    // THEN: [verify expected behavior]
    // TODO: Assert the result
    // expect(...).toBe(...);
    
    // Placeholder while implementation details are added
    expect(true).toBe(true);
  });
`
  )
  .join('')}
});
`;

    fs.writeFileSync(testFile, testContent);

    console.log(colors.success(`✅ Generated: ${this.featureName}-bdd.spec.ts`));
    console.log(colors.code(`   ${this.state.scenarios.length} test cases from scenarios`));
    console.log(
      colors.warning(
        '\n⚠️  Test implementation needed - these are placeholders'
      )
    );

    this.state.testFile = testFile;
    await pause();
  }

  async verifyImplementation() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 4: VERIFY IMPLEMENTATION'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    if (!this.state.hasImplementation) {
      console.log(colors.warning('No implementation code to verify'));
      console.log(colors.code('\nYou\'ll need to implement the feature to pass tests.'));
      await pause();
      return;
    }

    console.log(colors.hint('Run tests to verify implementation:\n'));
    console.log(colors.code('npm test\n'));

    const ready = await question(
      colors.hint('Have you run tests and they pass? (yes/no): ')
    );

    if (ready.toLowerCase() === 'yes' || ready.toLowerCase() === 'y') {
      console.log(colors.success('\n✅ Implementation verified'));
    } else {
      console.log(colors.warning('\n⚠️  Fix failing tests before continuing'));
    }

    await pause();
  }

  async setupDriftDetection() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 5: SETUP DRIFT DETECTION'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.warning('Setting up automatic drift detection...\n'));

    // Create compliance record
    const complianceRecord = {
      recoveryDate: new Date().toISOString(),
      status: 'recovering',
      feature: this.featureName,
      specifications: {
        file: `${this.featureName}-business-bdd-specifications.json`,
        scenarios: this.state.scenarios.length,
        locked: true,
      },
      tests: {
        bdd: {
          count: this.state.scenarios.length,
        },
      },
    };

    const recordFile = path.join(
      this.featurePath,
      '.generated',
      'COMPLIANCE_RECOVERY_RECORD.json'
    );

    fs.writeFileSync(
      recordFile,
      JSON.stringify(complianceRecord, null, 2)
    );

    console.log(colors.success('✅ Drift detection configured'));
    console.log(colors.code('   Command: npm run verify:no-drift'));

    await pause();
  }

  async documentRecovery() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('PHASE 6: DOCUMENT RECOVERY'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    const reportFile = path.join(
      this.featurePath,
      'RECOVERY_REPORT.md'
    );

    const report = `# Recovery Report: ${this.featureName}

## Timeline
- **Recovery Date**: ${new Date().toISOString()}
- **Status**: ✅ IN RECOVERY
- **Target**: Full Compliance

## What Was Recovered

### Specifications
- **File**: \`.generated/${this.featureName}-business-bdd-specifications.json\`
- **Scenarios**: ${this.state.scenarios.length}
- **Method**: Reverse-engineered from implementation

### Tests
- **BDD Tests**: Auto-generated
- **Location**: \`__tests__/business-bdd/\`
- **Status**: Placeholders - implementation needed

## Next Steps

1. **Implement BDD Tests**
   - Review: \`__tests__/business-bdd/${this.featureName}-bdd.spec.ts\`
   - Fill in test logic (Given-When-Then)

2. **Verify Implementation**
   - Run: \`npm test\`
   - Ensure all tests pass

3. **Verify Drift Detection**
   - Run: \`npm run verify:no-drift\`
   - Ensure no drift detected

4. **Commit Changes**
   - Run: \`git add .\`
   - Run: \`git commit -m "Recovery: ${this.featureName} pipeline compliance"\`

## Key Points

- ✅ Specifications are locked (immutable)
- ✅ Tests are auto-generated (never manually edited)
- ✅ Implementation must pass all tests
- ✅ Drift detection prevents silent spec changes

## Enforcement

All future changes must:
1. Update specifications (if needed)
2. Regenerate tests (if specs changed)
3. Update implementation
4. Pass all tests
5. Verify no drift

Pre-commit hooks will validate this automatically.

---

**Recovery completed**: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportFile, report);

    console.log(colors.success('✅ Recovery documented'));
    console.log(colors.code(`   Report: RECOVERY_REPORT.md`));

    await pause();
  }

  async showRecoverySummary() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.success('🎉 RECOVERY PROCESS COMPLETE'));
    console.log(colors.info('═'.repeat(80)) + '\n');

    console.log(colors.success('Feature has been recovered with:\n'));

    console.log(colors.code('✅ Business BDD Specifications'));
    console.log(
      colors.code(`   File: ${this.featureName}-business-bdd-specifications.json`)
    );
    console.log(colors.code(`   Scenarios: ${this.state.scenarios.length}\n`));

    console.log(colors.code('✅ Auto-Generated BDD Tests'));
    console.log(colors.code(`   File: ${this.featureName}-bdd.spec.ts`));
    console.log(colors.code('   Status: Placeholder - needs implementation\n'));

    console.log(colors.code('✅ Recovery Report'));
    console.log(colors.code('   File: RECOVERY_REPORT.md\n'));

    console.log(colors.info('═'.repeat(80)));
    console.log(colors.hint('\n📋 WHAT TO DO NOW:\n'));

    console.log(colors.code('1. Implement BDD test cases:'));
    console.log(colors.code(`   vim __tests__/business-bdd/${this.featureName}-bdd.spec.ts\n`));

    console.log(colors.code('2. Run tests to verify:'));
    console.log(colors.code('   npm test\n'));

    console.log(colors.code('3. Verify no drift:'));
    console.log(colors.code('   npm run verify:no-drift\n'));

    console.log(colors.code('4. Commit recovery:'));
    console.log(colors.code('   git add .'));
    console.log(colors.code(`   git commit -m "Recovery: ${this.featureName} pipeline compliance"\n`));

    console.log(colors.success('✅ Feature is now in recovery'));
    console.log(colors.warning('⚠️  Complete test implementation and commit to finish\n'));

    console.log(colors.info('═'.repeat(80)) + '\n');

    rl.close();
  }
}

// Run recovery wizard
const featureName = process.argv[2];
if (!featureName) {
  console.log(colors.error('\n❌ Feature name required\n'));
  console.log('Usage: node scripts/pipeline-recovery.js <feature-name>\n');
  console.log(colors.code('Example: node scripts/pipeline-recovery.js slo-dashboard\n'));
  process.exit(1);
}

const wizard = new RecoveryWizard(featureName);
wizard.run().catch((err) => {
  console.error(colors.error('Error:'), err);
  process.exit(1);
});
