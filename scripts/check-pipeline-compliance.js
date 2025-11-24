#!/usr/bin/env node

/**
 * ============================================================================
 * AUTONOMOUS PIPELINE ENFORCEMENT CHECKER (Non-Interactive)
 * ============================================================================
 * 
 * Checks if features comply with delivery pipeline governance.
 * Designed for autonomous execution (CI/CD, AI agents).
 * 
 * Usage: node scripts/check-pipeline-compliance.js [feature-name]
 * 
 * ============================================================================
 */

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

class ComplianceChecker {
  constructor(featureFilter = null) {
    this.featureFilter = featureFilter;
    this.packagesDir = path.join(ROOT, 'packages');
    this.results = {
      total: 0,
      compliant: 0,
      noncompliant: 0,
      features: [],
    };
  }

  log(level, message) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}]`;
    const icons = { ERROR: '❌', WARNING: '⚠️', SUCCESS: '✅', INFO: 'ℹ️', DEBUG: '🔍' };
    const icon = icons[level] || ' ';
    const text = `${prefix} ${icon} ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.log(colors.error(text));
        break;
      case 'WARNING':
        console.log(colors.warning(text));
        break;
      case 'SUCCESS':
        console.log(colors.success(text));
        break;
      case 'INFO':
        console.log(colors.info(text));
        break;
      case 'DEBUG':
        console.log(colors.code(text));
        break;
      default:
        console.log(text);
    }
  }

  checkFeature(featureName, featurePath) {
    const check = {
      name: featureName,
      path: featurePath,
      compliance: {
        hasSpecs: false,
        hasTests: false,
        hasImplementation: false,
        hasDriftConfig: false,
        noSpecDrift: false,
        noTestDrift: false,
      },
      issues: [],
      complianceScore: 0,
    };

    // 1. Check for BDD specifications
    const specDir = path.join(featurePath, '.generated');
    const specFile = path.join(specDir, `${featureName}-business-bdd-specifications.json`);

    if (fs.existsSync(specFile)) {
      check.compliance.hasSpecs = true;
    } else {
      check.issues.push(`Missing BDD Specifications`);
    }

    // 2. Check for auto-generated tests
    const testDir = path.join(featurePath, '__tests__', 'business-bdd');
    const testFile = path.join(testDir, `${featureName}-bdd.spec.ts`);

    if (fs.existsSync(testFile)) {
      check.compliance.hasTests = true;
    } else {
      check.issues.push(`Missing BDD Tests`);
    }

    // 3. Check for implementation code
    const srcDir = path.join(featurePath, 'src');
    if (fs.existsSync(srcDir)) {
      const files = this.findSourceFiles(srcDir);
      if (files.length > 0) {
        check.compliance.hasImplementation = true;
      } else {
        check.issues.push(`No implementation code`);
      }
    } else {
      check.issues.push(`Missing src directory`);
    }

    // 4. Check for drift configuration
    const driftConfigFile = path.join(specDir, `${featureName}-drift-config.json`);

    if (fs.existsSync(driftConfigFile)) {
      check.compliance.hasDriftConfig = true;

      try {
        const driftConfig = JSON.parse(fs.readFileSync(driftConfigFile, 'utf8'));
        const expectedSpecChecksum = driftConfig.checksums.specifications;
        const expectedTestChecksum = driftConfig.checksums.tests;

        // Verify spec checksum
        if (fs.existsSync(specFile)) {
          const specContent = fs.readFileSync(specFile, 'utf8');
          const actualSpecChecksum = crypto
            .createHash('sha256')
            .update(specContent)
            .digest('hex');

          if (actualSpecChecksum === expectedSpecChecksum) {
            check.compliance.noSpecDrift = true;
          } else {
            check.issues.push(`Spec drift detected`);
          }
        }

        // Verify test checksum
        if (fs.existsSync(testFile)) {
          const testContent = fs.readFileSync(testFile, 'utf8');
          const actualTestChecksum = crypto
            .createHash('sha256')
            .update(testContent)
            .digest('hex');

          if (actualTestChecksum === expectedTestChecksum) {
            check.compliance.noTestDrift = true;
          } else {
            check.issues.push(`Test drift detected`);
          }
        }
      } catch (error) {
        check.issues.push(`Drift config error: ${error.message}`);
      }
    } else {
      check.issues.push(`Missing drift configuration`);
    }

    // Calculate compliance score
    const checksPassed = Object.values(check.compliance).filter(v => v === true).length;
    check.complianceScore = Math.round((checksPassed / Object.keys(check.compliance).length) * 100);

    // Determine overall status
    check.isCompliant = check.complianceScore === 100 && check.issues.length === 0;

    return check;
  }

  findSourceFiles(dir, fileList = []) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        if (file.startsWith('.')) return;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          this.findSourceFiles(filePath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          fileList.push(filePath);
        }
      });
    } catch (error) {
      // Ignore errors
    }
    return fileList;
  }

  async run() {
    console.clear();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('🔍 DELIVERY PIPELINE COMPLIANCE CHECK'));
    console.log(colors.info('═'.repeat(80)));
    console.log();

    // Get list of features to check
    let features = [];

    if (this.featureFilter) {
      const featurePath = path.join(this.packagesDir, this.featureFilter);
      if (fs.existsSync(featurePath)) {
        features.push([this.featureFilter, featurePath]);
      } else {
        this.log('ERROR', `Feature not found: ${this.featureFilter}`);
        return false;
      }
    } else {
      try {
        const dirs = fs.readdirSync(this.packagesDir);
        for (const dir of dirs) {
          const featurePath = path.join(this.packagesDir, dir);
          if (fs.statSync(featurePath).isDirectory() && !dir.startsWith('.')) {
            features.push([dir, featurePath]);
          }
        }
      } catch (error) {
        this.log('ERROR', `Failed to read packages: ${error.message}`);
        return false;
      }
    }

    // Check each feature
    for (const [featureName, featurePath] of features) {
      const check = this.checkFeature(featureName, featurePath);
      this.results.features.push(check);
      this.results.total++;

      if (check.isCompliant) {
        this.results.compliant++;
        this.log('SUCCESS', `${featureName}: 100% compliant`);
      } else {
        this.results.noncompliant++;
        this.log('WARNING', `${featureName}: ${check.complianceScore}% | ${check.issues.join(' | ')}`);
      }
    }

    // Print summary
    console.log();
    console.log(colors.info('═'.repeat(80)));
    console.log(colors.info('COMPLIANCE SUMMARY'));
    console.log(colors.info('═'.repeat(80)));
    console.log();

    console.log(`Total: ${this.results.total} | ${colors.success(`✅ ${this.results.compliant} Compliant`)} | ${colors.warning(`⚠️ ${this.results.noncompliant} Non-Compliant`)}`);

    if (this.results.compliant === this.results.total) {
      console.log();
      console.log(colors.success('✅ ALL FEATURES COMPLIANT - PIPELINE VERIFIED'));
      console.log();
      return true;
    } else {
      console.log();
      console.log(colors.warning('⚠️ Some features need recovery'));
      console.log();
      return false;
    }
  }
}

// Run compliance check
const featureFilter = process.argv[2] || null;
const checker = new ComplianceChecker(featureFilter);

checker.run().then((success) => {
  process.exit(success ? 0 : 1);
});
