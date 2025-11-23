#!/usr/bin/env node

/**
 * SLO Definition Engine - Phase 3d
 * 
 * Generates realistic SLO targets based on actual SLI metrics from production.
 * Implements the 7-phase sprint workflow for SLO target definition.
 * 
 * Input:  .generated/sli-metrics.json (real production data)
 * Output: .generated/slo-targets.json (realistic SLO targets)
 * 
 * Phase 1: Load SLI Metrics
 * Phase 2: Analyze Performance Patterns
 * Phase 3: Define Realistic Targets
 * Phase 4: Set Safety Margins
 * Phase 5: Validate Against Production
 * Phase 6: Generate SLO JSON
 * Phase 7: Log Results & Feedback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// PHASE 1: Load SLI Metrics
// ============================================================================

function loadSLIMetrics() {
  const metricsPath = path.join(__dirname, '..', '.generated', 'sli-metrics.json');
  
  if (!fs.existsSync(metricsPath)) {
    console.error(`❌ SLI metrics not found: ${metricsPath}`);
    console.error('   Run: node scripts/calculate-sli-metrics.js');
    process.exit(1);
  }

  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  console.log('✓ Phase 1: SLI metrics loaded');
  console.log(`  Components: ${metrics.components?.length || 0}`);
  console.log(`  Metrics per component: ${metrics.components?.[0]?.metrics?.length || 0}`);
  
  return metrics;
}

// ============================================================================
// PHASE 2: Analyze Performance Patterns
// ============================================================================

function analyzePatterns(metrics) {
  const patterns = {};

  // Handle both old and new metric formats
  const componentMetrics = metrics.componentMetrics || metrics.components || {};

  Object.entries(componentMetrics).forEach(([componentId, data]) => {
    const name = data.component || data.name || componentId;
    const availability = data.availability?.current_percent || 99.0;
    const p95 = data.latency?.p95_ms || 100;
    const p99 = data.latency?.p99_ms || 150;
    const p50 = data.latency?.p50_ms || 50;
    const errorRate = data.errorRate?.current_percent || 1;

    patterns[componentId] = {
      name,
      health: data.health_score || 50,
      availability,
      latencies: {
        p50: p50,
        p95: p95,
        p99: p99
      },
      error_rate: errorRate
    };
  });

  console.log('✓ Phase 2: Performance patterns analyzed');
  Object.entries(patterns).forEach(([id, pattern]) => {
    console.log(`  ${pattern.name}: avail=${pattern.availability}%, P95=${pattern.latencies.p95}ms`);
  });

  return patterns;
}

// ============================================================================
// PHASE 3: Define Realistic Targets
// ============================================================================

function defineTargets(patterns) {
  const targets = {};

  Object.entries(patterns).forEach(([componentId, pattern]) => {
    // Availability target: Use current availability as baseline, round up to nearest 9
    let availabilityTarget;
    const currentAvail = pattern.availability;
    
    if (currentAvail >= 99.95) {
      availabilityTarget = 99.95; // 99.95% = 4 nines
    } else if (currentAvail >= 99.9) {
      availabilityTarget = 99.9; // 99.9% = 3 nines
    } else if (currentAvail >= 99.0) {
      availabilityTarget = 99.0; // 99% = 2 nines
    } else {
      availabilityTarget = 98.0; // 98%
    }

    // Latency targets: Use P95 as baseline, apply 10% safety margin
    const p95 = pattern.latencies.p95 || 100;
    const p99 = pattern.latencies.p99 || p95 * 1.5;
    
    const p95Target = Math.ceil(p95 * 1.1 / 10) * 10; // Round up to nearest 10ms
    const p99Target = Math.ceil(p99 * 1.1 / 10) * 10;

    // Error rate target: Use current + 50% margin
    const errorRateTarget = Math.ceil(pattern.error_rate * 1.5 * 1000) / 1000; // 3 decimals

    targets[componentId] = {
      name: pattern.name,
      targets: {
        availability: {
          percentage: availabilityTarget,
          description: `${availabilityTarget}% uptime (${Math.pow(10, Math.floor(Math.log10(100 - availabilityTarget)))} nines)`
        },
        latency: {
          p50: Math.ceil((pattern.latencies.p50 || p95 / 2) * 1.05 / 5) * 5,
          p95: p95Target,
          p99: p99Target,
          unit: 'milliseconds'
        },
        error_rate: {
          percentage: errorRateTarget,
          description: `${errorRateTarget}% error rate`
        }
      },
      derived_from: {
        current_availability: currentAvail,
        current_p95_latency: p95,
        current_p99_latency: p99,
        current_error_rate: pattern.error_rate
      }
    };
  });

  console.log('✓ Phase 3: Realistic targets defined');
  Object.entries(targets).forEach(([id, target]) => {
    console.log(`  ${target.name}:`);
    console.log(`    - Availability: ${target.targets.availability.percentage}%`);
    console.log(`    - P95 Latency: ${target.targets.latency.p95}ms`);
    console.log(`    - Error Rate: ${target.targets.error_rate.percentage}%`);
  });

  return targets;
}

// ============================================================================
// PHASE 4: Set Safety Margins
// ============================================================================

function applySafetyMargins(targets) {
  const withMargins = JSON.parse(JSON.stringify(targets));

  Object.entries(withMargins).forEach(([componentId, target]) => {
    // Add safety margins as metadata
    target.safety_margins = {
      availability_buffer: 0.05, // 0.05% buffer below target
      latency_overhead: 1.1, // 10% overhead
      error_rate_cushion: 1.5 // 50% cushion
    };

    target.error_budget = {
      description: 'Monthly error budget calculation',
      assumption_requests_per_day: 1000000,
      working_days_per_month: 20,
      calculation: {
        total_requests_per_month: 1000000 * 20,
        allowed_errors_percentage: 100 - target.targets.availability.percentage,
        allowed_errors_count: Math.floor((1000000 * 20) * (100 - target.targets.availability.percentage) / 100),
        allowed_errors_per_day: Math.floor((1000000) * (100 - target.targets.availability.percentage) / 100)
      }
    };
  });

  console.log('✓ Phase 4: Safety margins applied');
  Object.entries(withMargins).forEach(([id, target]) => {
    const budget = target.error_budget.calculation;
    console.log(`  ${target.name}: ${budget.allowed_errors_count.toLocaleString()} failures/month allowed`);
  });

  return withMargins;
}

// ============================================================================
// PHASE 5: Validate Against Production
// ============================================================================

function validateTargets(metrics, targets) {
  const validations = [];

  // Handle both metric formats
  const componentMetrics = metrics.componentMetrics || metrics.components || {};

  Object.entries(componentMetrics).forEach(([componentId, data]) => {
    const target = targets[componentId];
    if (!target) return;

    const currentAvail = data.availability?.current_percent || 99.0;
    const targetAvail = target.targets.availability.percentage;

    // Check: Can we achieve this target with current performance?
    if (currentAvail < targetAvail - 0.1) {
      validations.push({
        component: data.component || componentId,
        issue: 'TARGET_TOO_AGGRESSIVE',
        message: `Current availability ${currentAvail}% < target ${targetAvail}%. Recommend lowering target.`,
        severity: 'warning'
      });
    } else {
      validations.push({
        component: data.component || componentId,
        issue: 'TARGET_ACHIEVABLE',
        message: `Target ${targetAvail}% is achievable from current ${currentAvail}%`,
        severity: 'info'
      });
    }
  });

  console.log('✓ Phase 5: Targets validated against production');
  validations.forEach(v => {
    const icon = v.severity === 'warning' ? '⚠️ ' : '✓ ';
    console.log(`  ${icon}${v.component}: ${v.message}`);
  });

  return validations;
}

// ============================================================================
// PHASE 6: Generate SLO JSON
// ============================================================================

function generateSLOJSON(targets, metrics, validations) {
  const sloJSON = {
    meta: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      title: 'RenderX SLO Targets - Phase 3d',
      description: 'Realistic Service Level Objectives derived from production SLI metrics',
      input_source: '.generated/sli-metrics.json',
      generation_method: '7-phase sprint workflow',
      validation_count: validations.length,
      validation_warnings: validations.filter(v => v.severity === 'warning').length
    },

    slo_targets: targets,

    summary: {
      components_targeted: Object.keys(targets).length,
      total_error_budget_per_month: Object.values(targets).reduce((sum, t) => {
        return sum + t.error_budget.calculation.allowed_errors_count;
      }, 0),
      average_availability_target: (
        Object.values(targets).reduce((sum, t) => sum + t.targets.availability.percentage, 0) /
        Object.keys(targets).length
      ).toFixed(2)
    },

    validation_results: validations,

    recommendations: [
      'Review SLO targets monthly to ensure alignment with product goals',
      'Use error budgets to prioritize feature work vs reliability improvements',
      'Trigger self-healing when error budget consumption exceeds 10% per week',
      'Adjust targets quarterly based on cost/benefit analysis',
      'Communicate SLO targets to customers for SLA negotiation'
    ]
  };

  console.log('✓ Phase 6: SLO JSON generated');
  console.log(`  Components: ${sloJSON.summary.components_targeted}`);
  console.log(`  Total monthly error budget: ${sloJSON.summary.total_error_budget_per_month.toLocaleString()} failures`);
  console.log(`  Average availability target: ${sloJSON.summary.average_availability_target}%`);

  return sloJSON;
}

// ============================================================================
// PHASE 7: Log Results & Feedback
// ============================================================================

function saveAndReport(sloJSON) {
  const outputPath = path.join(__dirname, '..', '.generated', 'slo-targets.json');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputPath, JSON.stringify(sloJSON, null, 2), 'utf8');

  console.log('✓ Phase 7: Results logged and saved');
  console.log(`\n📊 SLO Definition Complete!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${fs.statSync(outputPath).size} bytes`);
  console.log(`\n📋 What's Next:`);
  console.log(`   1. Review .generated/slo-targets.json`);
  console.log(`   2. Run Phase 4: Error Budget Calculator`);
  console.log(`   3. Use targets for Phase 5: SLA Compliance Tracking`);

  // Log for knowledge base registration
  console.log(`\n📚 Register in RAG System:`);
  console.log(`   node scripts/query-project-knowledge.js "slo targets"`);

  return outputPath;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('\n🚀 SLO Definition Engine - Phase 3d');
  console.log('=' .repeat(60));
  console.log('\n📖 7-Phase Sprint Workflow:\n');

  try {
    // Phase 1: Load
    const metrics = loadSLIMetrics();
    console.log();

    // Phase 2: Analyze
    const patterns = analyzePatterns(metrics);
    console.log();

    // Phase 3: Define
    const targets = defineTargets(patterns);
    console.log();

    // Phase 4: Margins
    const withMargins = applySafetyMargins(targets);
    console.log();

    // Phase 5: Validate
    const validations = validateTargets(metrics, withMargins);
    console.log();

    // Phase 6: Generate
    const sloJSON = generateSLOJSON(withMargins, metrics, validations);
    console.log();

    // Phase 7: Save & Report
    const outputPath = saveAndReport(sloJSON);
    console.log('\n' + '='.repeat(60));
    console.log('✅ Phase 3d: Complete!\n');

  } catch (error) {
    console.error('❌ Error in SLO Definition Engine:', error.message);
    process.exit(1);
  }
}

main();
