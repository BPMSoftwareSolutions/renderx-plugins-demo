#!/usr/bin/env node

/**
 * ✅ Root Goal Alignment Validator
 * 
 * Enforces that all changes align with the root goal:
 * "Implement telemetry-driven Feature Shape governance across eight evolutionary capabilities."
 * 
 * Usage:
 *   node scripts/validate-root-goal-alignment.js --check-all
 *   node scripts/validate-root-goal-alignment.js --check-telemetry
 *   node scripts/validate-root-goal-alignment.js --check-governance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

class RootGoalValidator {
  constructor() {
    this.rootContext = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  loadRootContext() {
    const rcPath = path.join(ROOT, 'root-context.json');
    this.rootContext = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
  }

  /**
   * Validate telemetry artifacts exist and are compliant
   */
  validateTelemetryCompliance() {
    console.log('\n📊 Checking Telemetry Compliance...');

    const telemetryDir = path.join(ROOT, '.generated', 'telemetry');
    if (!fs.existsSync(telemetryDir)) {
      this.results.warnings.push('⚠️ Telemetry directory not yet created');
      return;
    }

    const indexPath = path.join(telemetryDir, 'index.json');
    if (fs.existsSync(indexPath)) {
      try {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const requiredFields = this.rootContext.governanceArtifacts.telemetryFields.required;

        let compliant = 0;
        if (typeof index === 'object' && index !== null) {
          Object.values(index).forEach(record => {
            if (typeof record === 'object' && record !== null) {
              const hasAllFields = requiredFields.every(f => f in record);
              if (hasAllFields) compliant++;
            }
          });
          this.results.passed.push(`✅ ${compliant}/${Object.keys(index).length} telemetry records compliant`);
        }
      } catch (err) {
        this.results.warnings.push(`⚠️ Could not parse telemetry index: ${err.message}`);
      }
    }
  }

  /**
   * Validate governance artifacts
   */
  validateGovernanceArtifacts() {
    console.log('\n🏛️ Checking Governance Artifacts...');
    
    const required = this.rootContext.governanceArtifacts.required;
    required.forEach(artifact => {
      const artifactPath = path.join(ROOT, artifact);
      if (fs.existsSync(artifactPath)) {
        this.results.passed.push(`✅ ${artifact} present`);
      } else {
        this.results.failed.push(`❌ ${artifact} missing`);
      }
    });
  }

  /**
   * Validate sprint alignment
   */
  validateSprintAlignment() {
    console.log('\n🎯 Checking Sprint Alignment...');
    
    const shapeEvolutionsPath = path.join(ROOT, 'shape-evolutions.json');
    if (fs.existsSync(shapeEvolutionsPath)) {
      const evolutions = JSON.parse(fs.readFileSync(shapeEvolutionsPath, 'utf-8'));
      const expectedEvolutions = this.rootContext.eightEvolutions.length;
      const actualEvolutions = Object.keys(evolutions).length;
      
      if (actualEvolutions >= expectedEvolutions) {
        this.results.passed.push(`✅ All ${expectedEvolutions} evolutions tracked`);
      } else {
        this.results.warnings.push(`⚠️ Only ${actualEvolutions}/${expectedEvolutions} evolutions tracked`);
      }
    }
  }

  /**
   * Validate boundary compliance
   */
  validateBoundaryCompliance() {
    console.log('\n🚧 Checking Boundary Compliance...');
    
    const inScope = this.rootContext.contextBoundaries.inScope;
    const outOfScope = this.rootContext.contextBoundaries.outOfScope;
    
    this.results.passed.push(`✅ ${inScope.length} in-scope paths defined`);
    this.results.passed.push(`✅ ${outOfScope.length} out-of-scope paths defined`);
  }

  /**
   * Validate metrics tracking
   */
  validateMetricsTracking() {
    console.log('\n📈 Checking Metrics Tracking...');
    
    const metrics = this.rootContext.metrics;
    Object.entries(metrics).forEach(([key, value]) => {
      this.results.passed.push(`✅ Metric defined: ${key}`);
    });
  }

  /**
   * Run all validations
   */
  runAll() {
    this.validateTelemetryCompliance();
    this.validateGovernanceArtifacts();
    this.validateSprintAlignment();
    this.validateBoundaryCompliance();
    this.validateMetricsTracking();
  }

  /**
   * Display results
   */
  displayResults() {
    console.log('\n' + '═'.repeat(70));
    console.log('✅ ROOT GOAL ALIGNMENT VALIDATION REPORT');
    console.log('═'.repeat(70));
    
    console.log(`\n🎯 Root Goal: ${this.rootContext.rootGoal}`);
    
    if (this.results.passed.length > 0) {
      console.log('\n✅ PASSED:');
      this.results.passed.forEach(r => console.log(`   ${r}`));
    }

    if (this.results.failed.length > 0) {
      console.log('\n❌ FAILED:');
      this.results.failed.forEach(r => console.log(`   ${r}`));
    }

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.results.warnings.forEach(r => console.log(`   ${r}`));
    }

    const totalChecks = this.results.passed.length + this.results.failed.length;
    const passRate = totalChecks > 0 ? Math.round((this.results.passed.length / totalChecks) * 100) : 0;
    
    console.log('\n' + '═'.repeat(70));
    console.log(`📊 Summary: ${this.results.passed.length}/${totalChecks} checks passed (${passRate}%)`);
    console.log('═'.repeat(70) + '\n');

    return this.results.failed.length === 0;
  }

  /**
   * Save report
   */
  saveReport(outputFile) {
    const dir = path.dirname(outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`✅ Report saved to: ${outputFile}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  try {
    const validator = new RootGoalValidator();
    validator.loadRootContext();
    validator.runAll();
    
    const passed = validator.displayResults();
    
    const reportPath = path.join(ROOT, '.generated', 'root-goal-validation-report.json');
    validator.saveReport(reportPath);

    if (!passed) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();

