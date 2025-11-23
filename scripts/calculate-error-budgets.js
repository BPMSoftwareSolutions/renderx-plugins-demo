#!/usr/bin/env node

/**
 * Error Budget Calculator - Phase 4
 * 
 * Computes error budgets from SLI metrics and SLO targets.
 * Tracks allowed failures vs actual consumption for each component.
 * 
 * Input:  .generated/slo-targets.json (from Phase 3d)
 *         .generated/sli-metrics.json (actual production data)
 * Output: .generated/error-budgets.json (budget allocation and tracking)
 * 
 * Phase 1: Load SLO Targets & SLI Metrics
 * Phase 2: Calculate Allowed Error Budgets
 * Phase 3: Calculate Actual Error Consumption
 * Phase 4: Compute Remaining Budget
 * Phase 5: Project Budget Burn Rate
 * Phase 6: Generate Budget Report
 * Phase 7: Trigger Alerts & Recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// PHASE 1: Load SLO Targets & SLI Metrics
// ============================================================================

function loadData() {
  const targetsPath = path.join(__dirname, '..', '.generated', 'slo-targets.json');
  const metricsPath = path.join(__dirname, '..', '.generated', 'sli-metrics.json');

  if (!fs.existsSync(targetsPath)) {
    console.error(`❌ SLO targets not found: ${targetsPath}`);
    console.error('   Run: node scripts/define-slo-targets.js');
    process.exit(1);
  }

  if (!fs.existsSync(metricsPath)) {
    console.error(`❌ SLI metrics not found: ${metricsPath}`);
    console.error('   Run: node scripts/calculate-sli-metrics.js');
    process.exit(1);
  }

  const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));

  console.log('✓ Phase 1: Data loaded');
  console.log(`  SLO targets: ${Object.keys(targets.slo_targets || targets).length} components`);
  console.log(`  SLI metrics: ${metrics.components?.length || 0} components`);

  return { targets, metrics };
}

// ============================================================================
// PHASE 2: Calculate Allowed Error Budgets
// ============================================================================

function calculateAllowedBudgets(targets) {
  const budgets = {};

  // Determine which format we're working with
  const sloTargets = targets.slo_targets || targets;

  Object.entries(sloTargets).forEach(([componentId, target]) => {
    // Skip metadata
    if (componentId === 'meta' || componentId === 'summary' || componentId === 'validation_results' || componentId === 'recommendations') {
      return;
    }

    // Monthly budget assumptions
    const requestsPerDay = 1000000; // 1M requests/day baseline
    const workingDaysPerMonth = 20;
    const totalRequestsPerMonth = requestsPerDay * workingDaysPerMonth;

    // Calculate allowed failures
    const availabilityTarget = target.targets?.availability?.percentage || 99.9;
    const allowedErrorPercentage = 100 - availabilityTarget;
    const allowedErrorsCount = Math.floor((totalRequestsPerMonth * allowedErrorPercentage) / 100);
    const allowedErrorsPerDay = Math.floor((requestsPerDay * allowedErrorPercentage) / 100);

    budgets[componentId] = {
      component_name: target.name,
      availability_target: availabilityTarget,
      error_percentage_allowed: allowedErrorPercentage.toFixed(3),
      
      monthly_budget: {
        total_requests: totalRequestsPerMonth,
        allowed_errors: allowedErrorsCount,
        allowed_errors_readable: `${allowedErrorsCount.toLocaleString()} failures`
      },

      daily_budget: {
        requests_per_day: requestsPerDay,
        allowed_errors_per_day: allowedErrorsPerDay,
        allowed_errors_readable: `${allowedErrorsPerDay.toLocaleString()} failures/day`
      },

      weekly_budget: {
        allowed_errors_per_week: allowedErrorsPerDay * 5,
        alert_threshold: Math.floor((allowedErrorsPerDay * 5) * 0.1) // Alert if 10% consumed
      }
    };
  });

  console.log('✓ Phase 2: Allowed budgets calculated');
  Object.entries(budgets).forEach(([id, budget]) => {
    console.log(`  ${budget.component_name}: ${budget.monthly_budget.allowed_errors_readable}/month`);
  });

  return budgets;
}

// ============================================================================
// PHASE 3: Calculate Actual Error Consumption
// ============================================================================

function calculateActualConsumption(metrics, budgets) {
  const consumption = {};

  // Handle both metric formats
  const componentMetrics = metrics.componentMetrics || metrics.components || {};

  Object.entries(componentMetrics).forEach(([componentId, data]) => {
    if (!budgets[componentId]) return;

    // Extract error rate from metrics
    let errorRate = data.errorRate?.current_percent || data.error_rate || 1;

    const budget = budgets[componentId];
    const monthlyRequests = budget.monthly_budget.total_requests;
    const actualErrorsPerMonth = Math.floor((monthlyRequests * errorRate) / 100);
    const actualErrorsPerDay = Math.floor(budget.daily_budget.requests_per_day * errorRate / 100);

    consumption[componentId] = {
      component_name: budget.component_name,
      current_error_rate: errorRate.toFixed(3),
      
      monthly_consumption: {
        errors: actualErrorsPerMonth,
        errors_readable: `${actualErrorsPerMonth.toLocaleString()} failures`,
        percentage_of_budget: ((actualErrorsPerMonth / budget.monthly_budget.allowed_errors) * 100).toFixed(1)
      },

      daily_consumption: {
        errors_per_day: actualErrorsPerDay,
        errors_readable: `${actualErrorsPerDay.toLocaleString()} failures/day`
      },

      health_score: data.health_score || 50,
      anomalies: data.anomalyCount || 0
    };
  });

  console.log('✓ Phase 3: Actual consumption calculated');
  Object.entries(consumption).forEach(([id, data]) => {
    console.log(`  ${data.component_name}: ${data.monthly_consumption.percentage_of_budget}% of budget consumed`);
  });

  return consumption;
}

// ============================================================================
// PHASE 4: Compute Remaining Budget
// ============================================================================

function computeRemainingBudget(budgets, consumption) {
  const remaining = {};

  Object.entries(budgets).forEach(([componentId, budget]) => {
    const consume = consumption[componentId];
    if (!consume) return;

    const allowedMonthly = budget.monthly_budget.allowed_errors;
    const consumedMonthly = consume.monthly_consumption.errors;
    const remainingMonthly = allowedMonthly - consumedMonthly;

    const allowedDaily = budget.daily_budget.allowed_errors_per_day;
    const consumedDaily = consume.daily_consumption.errors_per_day;
    const remainingDaily = allowedDaily - consumedDaily;

    remaining[componentId] = {
      component_name: budget.component_name,
      
      monthly_remaining: {
        errors: remainingMonthly,
        errors_readable: `${remainingMonthly.toLocaleString()} failures`,
        percentage: ((remainingMonthly / allowedMonthly) * 100).toFixed(1),
        status: remainingMonthly > 0 ? 'OK' : 'EXCEEDED'
      },

      daily_remaining: {
        errors: remainingDaily,
        errors_readable: `${remainingDaily.toLocaleString()} failures/day`,
        percentage: ((remainingDaily / allowedDaily) * 100).toFixed(1)
      },

      budget_health: getRemainingHealth(remainingMonthly, allowedMonthly)
    };
  });

  console.log('✓ Phase 4: Remaining budget computed');
  Object.entries(remaining).forEach(([id, data]) => {
    console.log(`  ${data.component_name}: ${data.monthly_remaining.percentage}% remaining (${data.budget_health})`);
  });

  return remaining;
}

function getRemainingHealth(remaining, total) {
  const percentage = (remaining / total) * 100;
  if (percentage > 50) return '🟢 Healthy';
  if (percentage > 10) return '🟡 Caution';
  if (percentage > 0) return '🔴 Critical';
  return '⚫ Exceeded';
}

// ============================================================================
// PHASE 5: Project Budget Burn Rate
// ============================================================================

function projectBurnRate(consumption, remaining, budgets) {
  const projections = {};

  Object.entries(consumption).forEach(([componentId, consume]) => {
    const budget = budgets[componentId];
    const remain = remaining[componentId];

    if (!budget || !remain) return;

    // Days until budget exhausted
    const dailyBurn = consume.daily_consumption.errors_per_day;
    const remainingErrors = remain.monthly_remaining.errors;
    const daysUntilExhausted = dailyBurn > 0 ? Math.ceil(remainingErrors / dailyBurn) : 999;

    projections[componentId] = {
      component_name: consume.component_name,
      
      daily_burn_rate: {
        errors_per_day: dailyBurn,
        percentage_per_day: (dailyBurn / budget.daily_budget.requests_per_day * 100).toFixed(3)
      },

      projection: {
        days_until_budget_exhausted: daysUntilExhausted,
        projected_exhaustion_date: new Date(Date.now() + daysUntilExhausted * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_remaining_in_month: 30 - Math.min(30, Math.floor((Date.now() % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)))
      },

      alert_level: getAlertLevel(daysUntilExhausted)
    };
  });

  console.log('✓ Phase 5: Budget burn rate projected');
  Object.entries(projections).forEach(([id, proj]) => {
    console.log(`  ${proj.component_name}: ${proj.alert_level} - ${proj.projection.days_until_budget_exhausted} days remaining`);
  });

  return projections;
}

function getAlertLevel(daysRemaining) {
  if (daysRemaining > 20) return '✅ Low Risk';
  if (daysRemaining > 10) return '⚠️ Medium Risk';
  if (daysRemaining > 5) return '🔴 High Risk';
  return '🚨 Critical Risk';
}

// ============================================================================
// PHASE 6: Generate Budget Report
// ============================================================================

function generateReport(budgets, consumption, remaining, projections) {
  const report = {
    meta: {
      version: '1.0.0',
      generated: new Date().toISOString(),
      title: 'Error Budget Report - Phase 4',
      description: 'Monthly error budget allocation, consumption, and projections',
      period: 'Monthly'
    },

    budgets,
    consumption,
    remaining,
    projections,

    summary: {
      total_components: Object.keys(budgets).length,
      
      budget_status: {
        healthy: Object.values(remaining).filter(r => r.monthly_remaining.status === 'OK').length,
        exceeded: Object.values(remaining).filter(r => r.monthly_remaining.status === 'EXCEEDED').length
      },

      highest_risk_components: Object.entries(projections)
        .sort((a, b) => a[1].projection.days_until_budget_exhausted - b[1].projection.days_until_budget_exhausted)
        .slice(0, 3)
        .map(([id, proj]) => ({
          name: proj.component_name,
          days_remaining: proj.projection.days_until_budget_exhausted,
          alert_level: proj.alert_level
        })),

      total_monthly_budget: Object.values(budgets).reduce((sum, b) => sum + b.monthly_budget.allowed_errors, 0),
      total_monthly_consumption: Object.values(consumption).reduce((sum, c) => sum + c.monthly_consumption.errors, 0),
      total_remaining: Object.values(remaining).reduce((sum, r) => sum + r.monthly_remaining.errors, 0)
    },

    recommendations: [
      'Review components with <10% remaining budget',
      'Trigger self-healing for high-risk components',
      'Consider reliability improvements for frequent offenders',
      'Use error budget to prioritize feature freeze vs hotfixes',
      'Communicate budget status to product teams weekly'
    ]
  };

  console.log('✓ Phase 6: Budget report generated');
  console.log(`  Total budget: ${report.summary.total_monthly_budget.toLocaleString()} failures/month`);
  console.log(`  Currently consumed: ${report.summary.total_monthly_consumption.toLocaleString()} (${((report.summary.total_monthly_consumption / report.summary.total_monthly_budget) * 100).toFixed(1)}%)`);
  console.log(`  High-risk components: ${report.summary.highest_risk_components.length}`);

  return report;
}

// ============================================================================
// PHASE 7: Trigger Alerts & Recommendations
// ============================================================================

function saveAndAlert(report) {
  const outputPath = path.join(__dirname, '..', '.generated', 'error-budgets.json');

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('✓ Phase 7: Alerts triggered and saved');

  // Display critical alerts
  const criticalComponents = report.summary.highest_risk_components
    .filter(c => c.alert_level.includes('Critical') || c.alert_level.includes('High'));

  if (criticalComponents.length > 0) {
    console.log(`\n🚨 CRITICAL ALERTS:`);
    criticalComponents.forEach(c => {
      console.log(`   ${c.alert_level}: ${c.name} (${c.days_remaining} days remaining)`);
    });
  }

  console.log(`\n📊 Error Budget Report Complete!`);
  console.log(`   Output: ${outputPath}`);
  console.log(`   Size: ${fs.statSync(outputPath).size} bytes`);
  console.log(`\n📋 What's Next:`);
  console.log(`   1. Review .generated/error-budgets.json`);
  console.log(`   2. Prioritize fixes for high-risk components`);
  console.log(`   3. Run Phase 5: SLA Compliance Tracker`);
  console.log(`   4. Set up automated breach notifications`);

  return outputPath;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('\n🚀 Error Budget Calculator - Phase 4');
  console.log('='.repeat(60));
  console.log('\n📖 7-Phase Sprint Workflow:\n');

  try {
    // Phase 1: Load
    const { targets, metrics } = loadData();
    console.log();

    // Phase 2: Calculate Allowed
    const budgets = calculateAllowedBudgets(targets);
    console.log();

    // Phase 3: Calculate Actual
    const consumption = calculateActualConsumption(metrics, budgets);
    console.log();

    // Phase 4: Compute Remaining
    const remaining = computeRemainingBudget(budgets, consumption);
    console.log();

    // Phase 5: Project Burn
    const projections = projectBurnRate(consumption, remaining, budgets);
    console.log();

    // Phase 6: Generate Report
    const report = generateReport(budgets, consumption, remaining, projections);
    console.log();

    // Phase 7: Save & Alert
    const outputPath = saveAndAlert(report);
    console.log('\n' + '='.repeat(60));
    console.log('✅ Phase 4: Complete!\n');

  } catch (error) {
    console.error('❌ Error in Error Budget Calculator:', error.message);
    process.exit(1);
  }
}

main();
