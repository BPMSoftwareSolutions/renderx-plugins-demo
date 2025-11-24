#!/usr/bin/env node

/**
 * ============================================================================
 * PIPELINE COMPLIANCE CHECKER - 7-LAYER MODEL
 * ============================================================================
 * 
 * Verifies feature compliance with the 7-layer delivery pipeline.
 * 
 * Usage: npm run check:compliance [feature-name]
 * 
 * If no feature specified, checks all features and reports compliance status.
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
  dim: chalk.dim,
};

const PIPELINE_LAYERS = {
  1: {
    name: 'Business BDD Specifications',
    abbrev: 'BUSINESS_SPECS',
    description: 'Business requirements in JSON format (LOCKED)',
    required: true,
  },
  2: {
    name: 'Business BDD Tests',
    abbrev: 'BUSINESS_BDD_TESTS',
    description: 'Auto-generated tests verifying business requirements',
    required: true,
  },
  3: {
    name: 'JSON Sequences & Orchestration',
    abbrev: 'JSON_SEQUENCES',
    description: 'Handler orchestration definitions (LOCKED)',
    required: true,
  },
  4: {
    name: 'Handler Definitions',
    abbrev: 'HANDLER_DEFINITIONS',
    description: 'Individual handler implementations',
    required: true,
  },
  5: {
    name: 'Unit Tests (TDD)',
    abbrev: 'UNIT_TESTS',
    description: 'Developer-written component/hook tests (80%+ coverage target)',
    required: true,
  },
  6: {
    name: 'Integration Tests',
    abbrev: 'INTEGRATION_TESTS',
    description: 'End-to-end workflow tests',
    required: true,
  },
  7: {
    name: 'Drift Detection Configuration',
    abbrev: 'DRIFT_CONFIG',
    description: 'Checksums and monitoring for locked files',
    required: true,
  },
};

class ComplianceChecker {
  checkLayer(featurePath, layerNum, layerDef) {
    switch (layerNum) {
      case '1':
        // Business BDD Specifications
        return this.checkBusinessSpecs(featurePath);
      case '2':
        // Business BDD Tests
        return this.checkBusinessBDDTests(featurePath);
      case '3':
        // JSON Sequences
        return this.checkSequences(featurePath);
      case '4':
        // Handler Definitions
        return this.checkHandlers(featurePath);
      case '5':
        // Unit Tests
        return this.checkUnitTests(featurePath);
      case '6':
        // Integration Tests
        return this.checkIntegrationTests(featurePath);
      case '7':
        // Drift Detection
        return this.checkDriftConfig(featurePath);
      default:
        return false;
    }
  }

  checkBusinessSpecs(featurePath) {
    const generatedDir = path.join(featurePath, '.generated');
    if (!fs.existsSync(generatedDir)) return false;
    const files = fs.readdirSync(generatedDir);
    return files.some(f => f.includes('business-bdd-specifications'));
  }

  checkBusinessBDDTests(featurePath) {
    const testsDir = path.join(featurePath, '__tests__', 'business-bdd-handlers');
    if (!fs.existsSync(testsDir)) return false;
    const files = fs.readdirSync(testsDir, { recursive: true });
    return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
  }

  checkSequences(featurePath) {
    const generatedDir = path.join(featurePath, '.generated');
    if (!fs.existsSync(generatedDir)) return false;
    const files = fs.readdirSync(generatedDir);
    return files.some(f => f.includes('sequences'));
  }

  checkHandlers(featurePath) {
    const handlersDir = path.join(featurePath, 'src', 'handlers');
    if (!fs.existsSync(handlersDir)) return false;
    const files = fs.readdirSync(handlersDir);
    return files.length > 0;
  }

  checkUnitTests(featurePath) {
    const unitTestDir = path.join(featurePath, '__tests__', 'unit');
    if (!fs.existsSync(unitTestDir)) return false;
    const files = fs.readdirSync(unitTestDir, { recursive: true });
    return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
  }

  checkIntegrationTests(featurePath) {
    const integrationDir = path.join(featurePath, '__tests__', 'integration');
    if (!fs.existsSync(integrationDir)) return false;
    const files = fs.readdirSync(integrationDir, { recursive: true });
    return files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
  }

  checkDriftConfig(featurePath) {
    const generatedDir = path.join(featurePath, '.generated');
    if (!fs.existsSync(generatedDir)) return false;
    const files = fs.readdirSync(generatedDir);
    return files.some(f => f.includes('drift'));
  }

  checkFeatureCompliance(featureName) {
    const featurePath = path.join(ROOT, 'packages', featureName);

    if (!fs.existsSync(featurePath)) {
      return {
        feature: featureName,
        exists: false,
        compliance: 0,
        layers: {},
      };
    }

    const layerStatus = {};
    let completeCount = 0;

    Object.entries(PIPELINE_LAYERS).forEach(([layerNum, layerDef]) => {
      const isComplete = this.checkLayer(featurePath, layerNum, layerDef);
      layerStatus[layerNum] = {
        name: layerDef.name,
        abbrev: layerDef.abbrev,
        complete: isComplete,
        required: layerDef.required,
      };

      if (isComplete) {
        completeCount++;
      }
    });

    const compliance = Math.round((completeCount / Object.keys(PIPELINE_LAYERS).length) * 100);

    return {
      feature: featureName,
      exists: true,
      compliance,
      layersComplete: completeCount,
      totalLayers: Object.keys(PIPELINE_LAYERS).length,
      layers: layerStatus,
    };
  }

  displayFeatureCompliance(result) {
    if (!result.exists) {
      console.log(colors.error(`  ✗ ${result.feature} - NOT FOUND`));
      return;
    }

    const complianceColor = result.compliance === 100 ? colors.success : result.compliance >= 50 ? colors.warning : colors.error;
    const complianceStr = `${result.compliance}%`;

    console.log(`\n${colors.info(result.feature)}`);
    console.log(`  Compliance: ${complianceColor(complianceStr)} (${result.layersComplete}/${result.totalLayers} layers)`);

    Object.entries(result.layers).forEach(([layerNum, layer]) => {
      const status = layer.complete ? '✅' : '❌';
      const layerStr = layer.abbrev.padEnd(20);
      console.log(`    ${status} Layer ${layerNum}: ${layerStr} ${colors.dim(layer.name)}`);
    });

    if (result.compliance < 100) {
      const missingLayers = Object.entries(result.layers)
        .filter(([_, layer]) => !layer.complete && layer.required)
        .map(([num, _]) => num);

      if (missingLayers.length > 0) {
        console.log(`\n  ${colors.warning(`Missing required layers: ${missingLayers.join(', ')}`)}`);
        console.log(`  ${colors.hint(`To recover: npm run recover:feature ${result.feature}`)}`);
      }
    }
  }

  checkAllFeatures() {
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info('  COMPLIANCE CHECK - 7-LAYER PIPELINE'));
    console.log(colors.info('═'.repeat(80)));

    const packagesDir = path.join(ROOT, 'packages');
    if (!fs.existsSync(packagesDir)) {
      console.log(colors.warning('\nNo packages directory found\n'));
      return [];
    }

    const features = fs.readdirSync(packagesDir)
      .filter(f => {
        const stat = fs.statSync(path.join(packagesDir, f));
        return stat.isDirectory();
      })
      .sort();

    console.log(`\nChecking ${colors.info(features.length.toString())} features...\n`);

    const results = features.map(feature => this.checkFeatureCompliance(feature));

    // Display individual results
    results.forEach(result => this.displayFeatureCompliance(result));

    // Summary
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info('  SUMMARY'));
    console.log(colors.info('═'.repeat(80)));

    const compliantFeatures = results.filter(r => r.exists && r.compliance === 100);
    const partiallyCompliant = results.filter(r => r.exists && r.compliance > 0 && r.compliance < 100);
    const nonCompliant = results.filter(r => r.exists && r.compliance === 0);

    console.log(`\n${colors.success('✅ Fully Compliant')}: ${compliantFeatures.length}/${features.length}`);
    if (compliantFeatures.length > 0) {
      compliantFeatures.forEach(r => {
        console.log(`   • ${r.feature}`);
      });
    }

    console.log(`\n${colors.warning('⚠️  Partially Compliant')}: ${partiallyCompliant.length}/${features.length}`);
    if (partiallyCompliant.length > 0) {
      partiallyCompliant.forEach(r => {
        console.log(`   • ${r.feature}: ${r.compliance}% (${r.layersComplete}/${r.totalLayers})`);
      });
    }

    console.log(`\n${colors.error('❌ Non-Compliant')}: ${nonCompliant.length}/${features.length}`);
    if (nonCompliant.length > 0) {
      nonCompliant.forEach(r => {
        console.log(`   • ${r.feature}`);
      });
    }

    // Overall score
    const avgCompliance = Math.round(
      results.filter(r => r.exists).reduce((sum, r) => sum + r.compliance, 0) / 
      results.filter(r => r.exists).length
    );

    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info(`  Overall Pipeline Compliance: ${avgCompliance}%`));
    console.log(colors.info('═'.repeat(80)) + '\n');

    return results;
  }

  checkSingleFeature(featureName) {
    console.log('\n' + colors.info('═'.repeat(80)));
    console.log(colors.info(`  COMPLIANCE CHECK: ${featureName}`));
    console.log(colors.info('═'.repeat(80)));

    const result = this.checkFeatureCompliance(featureName);

    if (!result.exists) {
      console.log(colors.error(`\nFeature not found: ${featureName}\n`));
      return 1;
    }

    this.displayFeatureCompliance(result);

    console.log('\n' + colors.info('═'.repeat(80)));
    if (result.compliance === 100) {
      console.log(colors.success('  ✅ 100% COMPLIANT'));
      console.log(colors.success('  All 7 layers verified!'));
    } else {
      console.log(colors.error(`  ${result.compliance}% COMPLIANT`));
      console.log(colors.error(`  ${7 - result.layersComplete} layers missing`));
      console.log(colors.hint(`\n  To recover: npm run recover:feature ${featureName}`));
    }
    console.log(colors.info('═'.repeat(80)) + '\n');

    return result.compliance === 100 ? 0 : 1;
  }
}

// Main execution
const checker = new ComplianceChecker();
const targetFeature = process.argv[2];

let exitCode;
if (targetFeature) {
  exitCode = checker.checkSingleFeature(targetFeature);
} else {
  checker.checkAllFeatures();
  exitCode = 0;
}

process.exit(exitCode);
