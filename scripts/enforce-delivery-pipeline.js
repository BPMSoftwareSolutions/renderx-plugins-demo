#!/usr/bin/env node

/**
 * ============================================================================
 * DELIVERY PIPELINE ENFORCEMENT SYSTEM
 * ============================================================================
 * 
 * Ensures every feature implementation follows the complete delivery pipeline:
 * 1. Business BDD Specs (immutable source of truth)
 * 2. Auto-Generated Business BDD Tests (derived from specs)
 * 3. Unit Tests (TDD - test-driven implementation)
 * 4. Implementation (code that passes tests)
 * 5. Drift Detection (verify nothing changed unexpectedly)
 * 
 * This script runs at:
 * - Pre-commit (prevents committing incomplete work)
 * - Pre-test (prevents running tests without specs)
 * - Pre-build (prevents building without verified specs)
 * 
 * When pipeline violations are detected, it:
 * 1. Shows clear error messages with exact next steps
 * 2. Links to documentation (prevents agent confusion)
 * 3. Provides interactive guidance to complete the pipeline
 * 4. Refuses to continue until pipeline is satisfied
 * 
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Color output for clarity
const colors = {
  error: chalk.red,
  warning: chalk.yellow,
  success: chalk.green,
  info: chalk.blue,
  hint: chalk.cyan,
  code: chalk.gray,
};

/**
 * ============================================================================
 * PIPELINE LAYER DEFINITIONS
 * ============================================================================
 * 
 * Each layer represents a required phase of the delivery pipeline.
 * All layers must be present for a feature to be considered complete.
 */

const PIPELINE_LAYERS = {
  BUSINESS_BDD_SPECS: {
    id: 'specs',
    name: 'Business BDD Specifications',
    description: 'Immutable source of truth for requirements',
    filePattern: '**/.generated/**-business-bdd-specifications.json',
    required: true,
    docs: 'BDD_SPECS_QUICK_REFERENCE.md',
    errorMessage: `
${colors.error('❌ MISSING: Business BDD Specifications')}

The Business BDD Specifications file is the immutable source of truth that 
ensures all implementation follows business requirements. Without it, there's
no way to detect if code drifts from original intentions.

${colors.hint('📋 REQUIRED FILE:')}
  packages/<feature>/.generated/<feature>-business-bdd-specifications.json

${colors.hint('🔍 WHAT IT CONTAINS:')}
  • Feature description
  • Business value statements
  • User personas
  • Given-When-Then scenarios for each feature

${colors.hint('📚 LEARN MORE:')}
  • BDD_SPECS_QUICK_REFERENCE.md (how specs work)
  • BUSINESS_BDD_SPECS_LOCATION.md (self-healing example)
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md (complete pipeline)

${colors.hint('✅ NEXT STEP:')}
  1. Create the specs JSON file using the template:
     node scripts/interactive-bdd-wizard.js

  2. Or copy from self-healing example:
     packages/self-healing/.generated/comprehensive-business-bdd-specifications.json

${colors.code('💡 Remember: Specs are locked. Changes to specs require regenerating all')}
${colors.code('   downstream tests. This ensures nothing drifts unexpectedly.')}
    `,
  },

  GENERATED_BDD_TESTS: {
    id: 'tests',
    name: 'Auto-Generated Business BDD Tests',
    description: 'Tests automatically derived from specs (never manually edit)',
    filePattern: '**/__tests__/business-bdd/**/*.spec.ts',
    required: true,
    docs: 'BDD_SPECS_QUICK_REFERENCE.md',
    errorMessage: `
${colors.error('❌ MISSING: Auto-Generated Business BDD Tests')}

Business BDD tests must be auto-generated from specs, never manually written.
This ensures:
  • Tests cannot drift from requirements
  • All tests reflect current business logic
  • No manual test maintenance burden

${colors.hint('📂 REQUIRED LOCATION:')}
  packages/<feature>/__tests__/business-bdd/
  └─ *.spec.ts (one file per feature/component)

${colors.hint('🔄 GENERATION PROCESS:')}
  Specs (JSON) → Generate → BDD Tests (TypeScript)
  
  This is automated - tests are never manually created.

${colors.hint('✅ NEXT STEP:')}
  1. First ensure specs exist (see previous error)
  
  2. Then generate tests:
     npm run generate:<feature>:bdd-tests
     
     OR use the wizard:
     node scripts/interactive-bdd-wizard.js

${colors.hint('📚 LEARN MORE:')}
  • BDD_SPECS_QUICK_REFERENCE.md (generation process)
  • packages/self-healing/__tests__/business-bdd-handlers/ (examples)

${colors.code('💡 Important: These files are auto-generated. Do not edit them manually.')}
${colors.code('   If you need changes, modify the specs and regenerate.')}
    `,
  },

  UNIT_TESTS: {
    id: 'unit-tests',
    name: 'Unit Tests (TDD)',
    description: 'Implementation-focused tests written by developers',
    filePattern: '**/__tests__/**/*.spec.ts',
    required: true,
    docs: 'GOVERNANCE_COMPLIANCE_PHASE_6.md',
    errorMessage: `
${colors.error('❌ MISSING or INCOMPLETE: Unit Tests')}

Unit tests (separate from BDD tests) verify implementation correctness.
They should:
  • Test individual functions/components
  • Use Jest + React Testing Library
  • Cover normal cases + edge cases
  • NOT test business scenarios (BDD tests do that)

${colors.hint('📂 REQUIRED LOCATION:')}
  packages/<feature>/__tests__/
  ├─ business-bdd/       (auto-generated)
  └─ unit/               (manually written)
      ├─ Component.spec.ts
      ├─ Hook.spec.ts
      └─ Service.spec.ts

${colors.hint('✅ NEXT STEP:')}
  1. Write unit tests for each component/hook/service
  
  2. Ensure tests use:
     • @testing-library/react for components
     • jest for utilities
     • Clear test names describing behavior

  3. Run tests:
     npm test
     
  4. Target: 80%+ code coverage

${colors.hint('📚 EXAMPLES:')}
  • packages/self-healing/__tests__/ (reference)
  • GOVERNANCE_COMPLIANCE_PHASE_6.md (what good tests look like)

${colors.code('💡 BDD tests check business scenarios. Unit tests check implementation.')}
${colors.code('   You need BOTH to ensure the feature works correctly.')}
    `,
  },

  IMPLEMENTATION_CODE: {
    id: 'code',
    name: 'Implementation Code',
    description: 'Actual code that passes all tests',
    filePattern: 'packages/**/src/**/*.ts',
    required: true,
    docs: 'DEVELOPMENT_PIPELINE_TRACEABILITY.md',
    errorMessage: `
${colors.error('❌ MISSING: Implementation Code')}

The actual implementation must exist and pass all tests (BDD + Unit).

${colors.hint('📂 REQUIRED LOCATION:')}
  packages/<feature>/src/
  ├─ components/
  ├─ hooks/
  ├─ services/
  ├─ types/
  └─ styles/

${colors.hint('🔍 WHAT HAPPENS NEXT:')}
  1. Write code to pass BDD tests first
     (BDD tests tell you what business needs)
  
  2. Then write unit tests for implementation details
  
  3. Then implement code to pass all tests

${colors.hint('✅ NEXT STEP:')}
  1. Review BDD test expectations
  2. Implement code to satisfy them
  3. Run: npm test

${colors.hint('📚 LEARN MORE:')}
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md (how this all fits together)
  • packages/self-healing/src/ (reference implementation)

${colors.code('💡 Implementation is the LAST step, not the first. Start with specs.')}
    `,
  },

  DRIFT_DETECTION: {
    id: 'drift',
    name: 'Drift Detection Configuration',
    description: 'Automated verification that specs and code stay aligned',
    filePattern: '.generated/*checksum*',
    required: true,
    docs: 'DEVELOPMENT_PIPELINE_TRACEABILITY.md',
    errorMessage: `
${colors.error('❌ MISSING: Drift Detection Setup')}

Drift detection uses checksums to verify that specs haven't changed
unexpectedly and that generated files haven't been manually edited.

${colors.hint('🔍 WHAT IT DOES:')}
  • Detects if spec file changed
  • Detects if generated tests were manually edited
  • Detects if implementation drifted from requirements
  • Prevents "spec creep" (requirements changing silently)

${colors.hint('✅ SETUP:')}
  1. Ensure checksums in .generated/ directory:
     npm run verify:no-drift
  
  2. Checksums are auto-generated and embedded in reports
  
  3. On next build, they're verified

${colors.hint('🔄 AUTOMATED CHECKS:')}
  • Pre-build: verify:no-drift script runs
  • Pre-commit: drift detection runs
  • CI/CD: full drift verification

${colors.hint('📚 LEARN MORE:')}
  • DEVELOPMENT_PIPELINE_TRACEABILITY.md (how drift detection works)
  • scripts/verify-no-drift.js (the verification script)

${colors.code('💡 Drift detection is AUTOMATIC - just ensure specs are locked')}
${colors.code('   and generated files are not manually edited.')}
    `,
  },
};

/**
 * ============================================================================
 * PIPELINE VERIFICATION LOGIC
 * ============================================================================
 */

/**
 * Find feature name from file path
 */
function extractFeatureName(filePath) {
  // Try to extract from packages/<feature>
  const match = filePath.match(/packages\/([^/]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a feature has all required pipeline layers
 */
function checkFeaturePipeline(feature) {
  const featurePath = path.join(ROOT, 'packages', feature);
  const results = {};
  const missing = [];

  for (const [key, layer] of Object.entries(PIPELINE_LAYERS)) {
    const layerKey = layer.id;
    const hasLayer = fs.existsSync(path.join(featurePath, layer.filePattern));
    results[layerKey] = {
      present: hasLayer,
      layer: layer,
    };

    if (!hasLayer && layer.required) {
      missing.push(key);
    }
  }

  return { results, missing, isComplete: missing.length === 0 };
}

/**
 * Generate interactive guidance for completing the pipeline
 */
function generateGuidance(feature, missing) {
  let guidance = '\n';
  guidance += colors.warning('═'.repeat(80)) + '\n';
  guidance += colors.warning('⚠️  DELIVERY PIPELINE INCOMPLETE') + '\n';
  guidance += colors.warning('═'.repeat(80)) + '\n\n';

  guidance += colors.info(`Feature: ${colors.code(feature)}\n\n`);

  // Show what's missing
  guidance += colors.warning('Missing Pipeline Layers:\n');
  missing.forEach((layerKey) => {
    const layer = PIPELINE_LAYERS[layerKey];
    guidance += `\n${colors.error(`  ❌ ${layer.name}`)}\n`;
    guidance += `     ${layer.description}\n`;
  });

  guidance += '\n' + colors.hint('═'.repeat(80)) + '\n';
  guidance += colors.hint('📋 HOW TO FIX THIS:\n\n');

  // Show fix steps in order
  const fixOrder = [
    'BUSINESS_BDD_SPECS',
    'GENERATED_BDD_TESTS',
    'UNIT_TESTS',
    'IMPLEMENTATION_CODE',
    'DRIFT_DETECTION',
  ];

  for (let i = 0; i < fixOrder.length; i++) {
    const layerKey = fixOrder[i];
    if (missing.includes(layerKey)) {
      const layer = PIPELINE_LAYERS[layerKey];
      guidance += colors.info(`\nSTEP ${i + 1}: ${layer.name}\n`);
      guidance += layer.errorMessage;
    }
  }

  guidance += '\n' + colors.info('═'.repeat(80)) + '\n';
  guidance += colors.success('📚 REFERENCE DOCUMENTATION:\n\n');
  guidance += `${colors.code('  • BDD_SPECS_QUICK_REFERENCE.md')}       (quick start)\n`;
  guidance += `${colors.code('  • DEVELOPMENT_PIPELINE_TRACEABILITY.md')}  (complete pipeline)\n`;
  guidance += `${colors.code('  • BUSINESS_BDD_SPECS_LOCATION.md')}       (self-healing example)\n`;
  guidance += `${colors.code('  • GOVERNANCE_COMPLIANCE_PHASE_6.md')}     (governance gates)\n\n`;

  guidance += colors.warning('═'.repeat(80)) + '\n';

  return guidance;
}

/**
 * Main enforcement function
 */
export async function enforcePipeline(options = {}) {
  const { 
    feature = null,
    strict = true,
    autoFix = false,
    verbose = false,
  } = options;

  console.log(
    colors.info('\n🔍 DELIVERY PIPELINE ENFORCEMENT\n')
  );

  // Find all features
  const packagesDir = path.join(ROOT, 'packages');
  const allFeatures = fs
    .readdirSync(packagesDir)
    .filter((f) => fs.statSync(path.join(packagesDir, f)).isDirectory());

  if (verbose) {
    console.log(`Found ${allFeatures.length} features to check`);
  }

  let violations = 0;
  let totalFeatures = 0;

  for (const feat of allFeatures) {
    const check = checkFeaturePipeline(feat);
    totalFeatures++;

    if (!check.isComplete) {
      violations++;
      console.log(generateGuidance(feat, check.missing));
    } else if (verbose) {
      console.log(colors.success(`✅ ${feat} - pipeline complete`));
    }
  }

  // Summary
  console.log('\n' + colors.info('═'.repeat(80)));
  console.log(colors.info('ENFORCEMENT SUMMARY'));
  console.log(colors.info('═'.repeat(80)) + '\n');

  console.log(`Total features: ${totalFeatures}`);
  console.log(`Complete: ${totalFeatures - violations}`);
  console.log(`Violations: ${violations}\n`);

  if (violations > 0 && strict) {
    console.log(colors.error('❌ PIPELINE ENFORCEMENT FAILED'));
    console.log(colors.error('   Refusing to proceed until all features complete their pipeline.\n'));
    process.exit(1);
  } else if (violations === 0) {
    console.log(colors.success('✅ ALL FEATURES FOLLOW COMPLETE DELIVERY PIPELINE\n'));
    process.exit(0);
  } else {
    console.log(colors.warning('⚠️  WARNINGS: Fix issues above\n'));
    process.exit(strict ? 1 : 0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  enforcePipeline({
    strict: !process.argv.includes('--warn'),
    verbose: process.argv.includes('--verbose'),
    autoFix: process.argv.includes('--auto-fix'),
  });
}

export default enforcePipeline;
