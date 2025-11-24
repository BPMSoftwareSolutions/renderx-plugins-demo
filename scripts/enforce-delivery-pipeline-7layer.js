#!/usr/bin/env node

/**
 * ============================================================================
 * PIPELINE ENFORCEMENT - 7-LAYER MODEL
 * ============================================================================
 * 
 * Pre-commit enforcement to prevent incomplete features from being committed.
 * Checks ALL 7 LAYERS of the delivery pipeline.
 * 
 * Usage: npm run enforce:pipeline
 * 
 * Blocks commits if any layer is missing.
 * All 7 layers must be present for commit to succeed.
 * 
 * ============================================================================
 */

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
};

const PIPELINE_LAYERS = {
  1: {
    name: 'Business BDD Specifications',
    description: 'Business requirements in JSON format (LOCKED)',
    required: true,
    check: (featurePath) => {
      const generatedDir = path.join(featurePath, '.generated');
      if (!fs.existsSync(generatedDir)) return false;
      const files = fs.readdirSync(generatedDir);
      return files.some(f => f.includes('business-bdd-specifications'));
    },
  },
  2: {
    name: 'Business BDD Tests',
    description: 'Auto-generated tests verifying business requirements',
    required: true,
    check: (featurePath) => {
      const testsDir = path.join(featurePath, '__tests__', 'business-bdd-handlers');
      if (!fs.existsSync(testsDir)) return false;
      const files = fs.readdirSync(testsDir, { recursive: true });
      return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
    },
  },
  3: {
    name: 'JSON Sequences & Orchestration',
    description: 'Handler orchestration definitions (LOCKED)',
    required: true,
    check: (featurePath) => {
      const generatedDir = path.join(featurePath, '.generated');
      if (!fs.existsSync(generatedDir)) return false;
      const files = fs.readdirSync(generatedDir);
      return files.some(f => f.includes('sequences'));
    },
  },
  4: {
    name: 'Handler Definitions',
    description: 'Individual handler implementations',
    required: true,
    check: (featurePath) => {
      const handlersDir = path.join(featurePath, 'src', 'handlers');
      if (!fs.existsSync(handlersDir)) return false;
      const files = fs.readdirSync(handlersDir);
      return files.length > 0;
    },
  },
  5: {
    name: 'Unit Tests (TDD)',
    description: 'Developer-written component/hook tests (80%+ coverage target)',
    required: true,
    check: (featurePath) => {
      const unitTestDir = path.join(featurePath, '__tests__', 'unit');
      if (!fs.existsSync(unitTestDir)) return false;
      const files = fs.readdirSync(unitTestDir, { recursive: true });
      return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
    },
  },
  6: {
    name: 'Integration Tests',
    description: 'End-to-end workflow tests',
    required: true,
    check: (featurePath) => {
      const integrationDir = path.join(featurePath, '__tests__', 'integration');
      if (!fs.existsSync(integrationDir)) return false;
      const files = fs.readdirSync(integrationDir, { recursive: true });
      return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
    },
  },
  7: {
    name: 'Drift Detection Configuration',
    description: 'Checksums and monitoring for locked files',
    required: true,
    check: (featurePath) => {
      const generatedDir = path.join(featurePath, '.generated');
      if (!fs.existsSync(generatedDir)) return false;
      const files = fs.readdirSync(generatedDir);
      return files.some(f => f.includes('drift'));
    },
  },
};

class PipelineEnforcer {
  constructor() {
    this.violations = [];
    this.compliantFeatures = [];
    this.nonCompliantFeatures = [];
  }

  checkFeature(featureName, featurePath) {
    console.log(`\n${colors.info(`Checking ${featureName}...`)}`);

    const layerStatus = {};
    let completeCount = 0;

    Object.entries(PIPELINE_LAYERS).forEach(([layerNum, layer]) => {
      const isComplete = layer.check(featurePath);
      layerStatus[layerNum] = {
        name: layer.name,
        complete: isComplete,
      };

      const status = isComplete ? '✅' : '❌';
      const message = `  Layer ${layerNum}: ${status} ${layer.name}`;

      if (isComplete) {
        console.log(colors.success(message));
        completeCount++;
      } else {
        console.log(colors.error(message));
        if (layer.required) {
          this.violations.push({
            feature: featureName,
            layer: layerNum,
            name: layer.name,
            description: layer.description,
            message: `Missing ${layer.name}`,
          });
        }
      }
    });

    const compliancePercentage = Math.round((completeCount / Object.keys(PIPELINE_LAYERS).length) * 100);
    const isCompliant = completeCount === Object.keys(PIPELINE_LAYERS).length;

    if (isCompliant) {
      console.log(
        colors.success(`\n  Result: ${colors.success.bold('100% COMPLIANT')} (${completeCount}/7 layers)`)
      );
      this.compliantFeatures.push(featureName);
    } else {
      console.log(
        colors.error(`\n  Result: ${colors.error.bold(compliancePercentage + '% COMPLIANT')} (${completeCount}/7 layers)`)
      );
      this.nonCompliantFeatures.push({
        feature: featureName,
        compliance: compliancePercentage,
        layersComplete: completeCount,
      });
    }

    return isCompliant;
  }

  findAllFeatures() {
    const packagesDir = path.join(ROOT, 'packages');
    if (!fs.existsSync(packagesDir)) {
      console.log(colors.warning('No packages directory found'));
      return [];
    }

    const features = fs.readdirSync(packagesDir)
      .filter(f => {
        const stat = fs.statSync(path.join(packagesDir, f));
        return stat.isDirectory();
      });

    return features;
  }

  enforceAllFeatures() {
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info('  PIPELINE ENFORCEMENT - 7-LAYER MODEL'));
    console.log(colors.info('═'.repeat(80)));

    const features = this.findAllFeatures();
    console.log(`\nFound ${colors.info(features.length.toString())} features to check\n`);

    features.forEach(feature => {
      const featurePath = path.join(ROOT, 'packages', feature);
      this.checkFeature(feature, featurePath);
    });

    // Summary report
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info('  ENFORCEMENT SUMMARY'));
    console.log(colors.info('═'.repeat(80)));

    console.log(`\n${colors.success('✅ Compliant Features')}: ${this.compliantFeatures.length}`);
    if (this.compliantFeatures.length > 0) {
      this.compliantFeatures.forEach(f => console.log(`   • ${f}`));
    }

    console.log(`\n${colors.error('❌ Non-Compliant Features')}: ${this.nonCompliantFeatures.length}`);
    if (this.nonCompliantFeatures.length > 0) {
      this.nonCompliantFeatures.forEach(f => {
        console.log(`   • ${f.feature}: ${f.compliance}% (${f.layersComplete}/7 layers)`);
      });
    }

    // Detailed violations
    if (this.violations.length > 0) {
      console.log(`\n${colors.error('═'.repeat(80))}`);
      console.log(colors.error('  VIOLATIONS'));
      console.log(colors.error('═'.repeat(80)));

      const violationsByFeature = {};
      this.violations.forEach(violation => {
        if (!violationsByFeature[violation.feature]) {
          violationsByFeature[violation.feature] = [];
        }
        violationsByFeature[violation.feature].push(violation);
      });

      Object.entries(violationsByFeature).forEach(([feature, violations]) => {
        console.log(`\n${colors.error(feature)}:`);
        violations.forEach(v => {
          console.log(`  Layer ${v.layer}: ${v.name}`);
          console.log(`           ${colors.hint(v.description)}`);
        });
      });
    }

    // Exit code
    const allCompliant = this.violations.length === 0;

    console.log('\n' + colors.info('═'.repeat(80)));
    if (allCompliant) {
      console.log(colors.success('  ✅ ALL FEATURES ARE COMPLIANT'));
      console.log(colors.success('  Ready to commit!'));
    } else {
      console.log(colors.error('  ❌ PIPELINE VIOLATIONS DETECTED'));
      console.log(colors.error(`  ${this.violations.length} issues must be resolved before commit`));
      console.log(colors.hint('\n  To recover: npm run recover:feature <feature-name>'));
    }
    console.log(colors.info('═'.repeat(80)) + '\n');

    return allCompliant ? 0 : 1;
  }

  enforceFeature(featureName) {
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info(`  ENFORCING: ${featureName}`));
    console.log(colors.info('═'.repeat(80)));

    const featurePath = path.join(ROOT, 'packages', featureName);
    if (!fs.existsSync(featurePath)) {
      console.log(colors.error(`Feature not found: ${featureName}`));
      return 1;
    }

    const isCompliant = this.checkFeature(featureName, featurePath);

    console.log('\n' + colors.info('═'.repeat(80)));
    if (isCompliant) {
      console.log(colors.success('  ✅ FULLY COMPLIANT'));
      console.log(colors.success('  All 7 layers verified'));
    } else {
      console.log(colors.error('  ❌ NOT COMPLIANT'));
      console.log(colors.error(`  Missing layers: ${this.violations.map(v => v.layer).join(', ')}`));
      console.log(colors.hint(`\n  To recover: npm run recover:feature ${featureName}`));
    }
    console.log(colors.info('═'.repeat(80)) + '\n');

    return isCompliant ? 0 : 1;
  }
}

// Main execution
const enforcer = new PipelineEnforcer();
const targetFeature = process.argv[2];

let exitCode;
if (targetFeature) {
  exitCode = enforcer.enforceFeature(targetFeature);
} else {
  exitCode = enforcer.enforceAllFeatures();
}

process.exit(exitCode);
