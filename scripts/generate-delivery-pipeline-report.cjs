#!/usr/bin/env node

/**
 * SAFe Continuous Delivery Pipeline Report Generator
 * 
 * Generates comprehensive reports from pipeline execution history
 * and current governance status.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const REPORTS_DIR = path.join(__dirname, '../.generated/delivery-pipeline-reports');
const PIPELINE_PATH = path.join(__dirname, '../packages/orchestration/json-sequences/safe-continuous-delivery-pipeline.json');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Load all execution reports
 */
function loadExecutionReports() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('delivery-pipeline-execution-') && f.endsWith('.json'))
    .sort()
    .reverse();

  return files.map(file => {
    const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
    return {
      file,
      data: JSON.parse(content),
      timestamp: new Date(JSON.parse(content).executionTime)
    };
  });
}

/**
 * Generate trend analysis
 */
function generateTrendAnalysis(reports) {
  if (reports.length < 2) {
    return { status: 'insufficient-data', message: 'Need at least 2 executions for trend analysis' };
  }

  const trends = {
    completionRate: [],
    governanceCompliance: [],
    avgVisibility: [],
    avgConsistency: []
  };

  reports.slice(0, 10).reverse().forEach(report => {
    trends.completionRate.push({
      timestamp: report.data.executionTime,
      value: parseFloat(report.data.summary.averageCompletionRate)
    });
    trends.governanceCompliance.push({
      timestamp: report.data.executionTime,
      value: report.data.summary.governanceCompliant === 'VERIFIED' ? 100 : 50
    });
    trends.avgVisibility.push({
      timestamp: report.data.executionTime,
      value: parseFloat(report.data.governance.visibility_average)
    });
    trends.avgConsistency.push({
      timestamp: report.data.executionTime,
      value: parseFloat(report.data.governance.consistency_average)
    });
  });

  const calculateTrend = (data) => {
    if (data.length < 2) return 'stable';
    const lastValue = data[data.length - 1].value;
    const prevValue = data[data.length - 2].value;
    if (lastValue > prevValue + 2) return 'improving';
    if (lastValue < prevValue - 2) return 'declining';
    return 'stable';
  };

  return {
    completionRateTrend: calculateTrend(trends.completionRate),
    governanceComplianceTrend: calculateTrend(trends.governanceCompliance),
    visibilityTrend: calculateTrend(trends.avgVisibility),
    consistencyTrend: calculateTrend(trends.avgConsistency),
    trends
  };
}

/**
 * Generate recommendations from reports
 */
function generateRecommendations(reports) {
  const recommendations = [];
  const latestReport = reports[0];

  if (!latestReport) return recommendations;

  const report = latestReport.data;

  // Check completion rate
  if (parseFloat(report.summary.averageCompletionRate) < 90) {
    recommendations.push({
      severity: 'high',
      category: 'Completion Rate',
      recommendation: `Average completion rate is ${report.summary.averageCompletionRate}%. Target: 95%+. Review failed success criteria in recent executions.`,
      actionItems: [
        'Review latest execution report for failures',
        'Identify root causes of incomplete criteria',
        'Update team guidance on success criteria',
        'Execute corrective actions before next cycle'
      ]
    });
  }

  // Check visibility scores
  if (parseFloat(report.governance.visibility_average) < 75) {
    recommendations.push({
      severity: 'high',
      category: 'Visibility',
      recommendation: `Average visibility is ${report.governance.visibility_average}%. Target: 85%+. Improve metrics collection and dashboards.`,
      actionItems: [
        'Audit telemetry collection for each movement',
        'Update dashboards to show key metrics',
        'Enable real-time alerts for anomalies',
        'Conduct visibility audit in next sprint'
      ]
    });
  }

  // Check consistency scores
  if (parseFloat(report.governance.consistency_average) < 75) {
    recommendations.push({
      severity: 'high',
      category: 'Consistency',
      recommendation: `Average consistency is ${report.governance.consistency_average}%. Target: 85%+. Standardize processes across teams.`,
      actionItems: [
        'Review process deviations in execution reports',
        'Document standardized procedures',
        'Conduct process training for team',
        'Implement automated compliance checks'
      ]
    });
  }

  // Check governance compliance
  if (report.summary.governanceCompliant !== 'VERIFIED') {
    recommendations.push({
      severity: 'medium',
      category: 'Governance',
      recommendation: 'Pipeline execution completed but governance verification not passed. Review policy violations.',
      actionItems: [
        'Review governance policies in latest report',
        'Address policy violations immediately',
        'Update process documentation',
        'Schedule governance audit'
      ]
    });
  }

  // Check for warnings
  if (report.summary.warningMovements > 0) {
    recommendations.push({
      severity: 'medium',
      category: 'Execution Quality',
      recommendation: `${report.summary.warningMovements} movements completed with warnings. Investigate issues.`,
      actionItems: [
        'Review detailed execution logs',
        'Identify patterns in warnings',
        'Implement preventive measures',
        'Track improvements in next execution'
      ]
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      severity: 'info',
      category: 'Overall Health',
      recommendation: 'Pipeline execution metrics are healthy. Continue current practices and monitor ongoing metrics.',
      actionItems: [
        'Monitor metrics weekly',
        'Maintain current process discipline',
        'Share success patterns with team',
        'Plan continuous improvement activities'
      ]
    });
  }

  return recommendations;
}

/**
 * Generate comprehensive dashboard report
 */
function generateDashboardReport(reports) {
  const latestReport = reports.length > 0 ? reports[0].data : null;
  const trend = generateTrendAnalysis(reports);
  const recommendations = generateRecommendations(reports);

  const dashboard = {
    id: `delivery-pipeline-dashboard-${new Date().toISOString().split('T')[0]}`,
    generated: new Date().toISOString(),
    pipeline: {
      name: 'SAFe Continuous Delivery Pipeline',
      framework: 'Scaled Agile Framework (SAFe) v6.0',
      status: latestReport?.summary.governanceCompliant || 'unknown'
    },
    executionHistory: {
      totalExecutions: reports.length,
      lastExecution: latestReport ? {
        timestamp: latestReport.executionTime,
        movements: latestReport.summary.totalMovements,
        successful: latestReport.summary.successfulMovements,
        warnings: latestReport.summary.warningMovements,
        failed: latestReport.summary.failedMovements,
        completionRate: latestReport.summary.averageCompletionRate,
        governanceStatus: latestReport.summary.governanceCompliant
      } : null,
      pastExecutions: reports.slice(1, 6).map(r => ({
        timestamp: r.data.executionTime,
        completionRate: r.data.summary.averageCompletionRate,
        governanceStatus: r.data.summary.governanceCompliant
      }))
    },
    currentMetrics: latestReport ? {
      visibility: parseFloat(latestReport.governance.visibility_average),
      consistency: parseFloat(latestReport.governance.consistency_average),
      completionRate: parseFloat(latestReport.summary.averageCompletionRate),
      policiesVerified: latestReport.governance.policies_verified,
      metricsTracked: latestReport.governance.metrics_tracked
    } : null,
    trends,
    recommendations,
    keyInsights: generateKeyInsights(reports)
  };

  return dashboard;
}

/**
 * Generate key insights
 */
function generateKeyInsights(reports) {
  const insights = [];

  if (reports.length === 0) {
    insights.push('No execution history available. Run the pipeline to generate reports.');
    return insights;
  }

  const latestReport = reports[0].data;

  // Insight 1: Overall health
  if (latestReport.summary.governanceCompliant === 'VERIFIED') {
    insights.push('✓ Pipeline governance is verified and compliant across all movements.');
  } else {
    insights.push('⚠ Pipeline governance verification incomplete. Review policy enforcement.');
  }

  // Insight 2: Movement performance
  const allPassing = latestReport.movements.every(m => m.status === 'completed');
  if (allPassing) {
    insights.push('✓ All movements executed successfully. Team is following standardized delivery workflow.');
  } else {
    const failed = latestReport.movements.filter(m => m.status !== 'completed').map(m => m.name);
    insights.push(`⚠ Some movements encountered issues: ${failed.join(', ')}. Review and retry.`);
  }

  // Insight 3: Metric trends
  if (reports.length > 1) {
    const currentCompletion = parseFloat(latestReport.summary.averageCompletionRate);
    const prevCompletion = parseFloat(reports[1].data.summary.averageCompletionRate);
    if (currentCompletion > prevCompletion) {
      const improvement = (currentCompletion - prevCompletion).toFixed(1);
      insights.push(`✓ Completion rate improving: +${improvement}% from previous execution.`);
    } else if (currentCompletion < prevCompletion) {
      const decline = (prevCompletion - currentCompletion).toFixed(1);
      insights.push(`⚠ Completion rate declining: -${decline}% from previous execution. Investigate.`);
    }
  }

  // Insight 4: Governance metrics
  const avgVisibility = parseFloat(latestReport.governance.visibility_average);
  const avgConsistency = parseFloat(latestReport.governance.consistency_average);
  if (avgVisibility >= 85 && avgConsistency >= 85) {
    insights.push('✓ High visibility and consistency scores indicate well-structured, transparent delivery process.');
  } else {
    const issues = [];
    if (avgVisibility < 85) issues.push('visibility');
    if (avgConsistency < 85) issues.push('consistency');
    insights.push(`→ Consider improving ${issues.join(' and ')} in the next sprint.`);
  }

  return insights;
}

/**
 * Display dashboard in terminal
 */
function displayDashboard(dashboard) {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        SAFe Continuous Delivery Pipeline - Executive Dashboard              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  console.log('PIPELINE STATUS:');
  console.log(`  Framework: ${dashboard.pipeline.framework}`);
  console.log(`  Status: ${dashboard.pipeline.status}`);
  console.log(`  Executions: ${dashboard.executionHistory.totalExecutions}`);

  if (dashboard.executionHistory.lastExecution) {
    const exec = dashboard.executionHistory.lastExecution;
    console.log('\nLAST EXECUTION:');
    console.log(`  Time: ${exec.timestamp}`);
    console.log(`  Movements: ${exec.successful}/${exec.movements} successful`);
    console.log(`  Completion: ${exec.completionRate}%`);
    console.log(`  Governance: ${exec.governanceStatus}`);
  }

  if (dashboard.currentMetrics) {
    console.log('\nCURRENT METRICS:');
    console.log(`  Visibility: ${dashboard.currentMetrics.visibility.toFixed(1)}%`);
    console.log(`  Consistency: ${dashboard.currentMetrics.consistency.toFixed(1)}%`);
    console.log(`  Completion: ${dashboard.currentMetrics.completionRate.toFixed(1)}%`);
    console.log(`  Policies Verified: ${dashboard.currentMetrics.policiesVerified}/7`);
  }

  console.log('\nKEY INSIGHTS:');
  dashboard.keyInsights.forEach(insight => {
    console.log(`  ${insight}`);
  });

  console.log('\nTREND ANALYSIS:');
  if (dashboard.trends.trends) {
    const trend = dashboard.trends.trends;
    console.log(`  Completion Rate: ${trend.completionRate.length > 0 ? trend.completionRate[0].value.toFixed(1) + '%' : 'N/A'}`);
    console.log(`  Governance: ${trend.governanceCompliance.length > 0 ? (trend.governanceCompliance[0].value > 80 ? 'VERIFIED' : 'NEEDS REVIEW') : 'N/A'}`);
  }

  console.log('\nRECOMMENDATIONS:');
  dashboard.recommendations.slice(0, 3).forEach(rec => {
    const icon = rec.severity === 'high' ? '⚠' : rec.severity === 'info' ? 'ℹ' : '→';
    console.log(`  ${icon} [${rec.severity.toUpperCase()}] ${rec.recommendation}`);
  });

  console.log('\n' + '═'.repeat(88) + '\n');
}

/**
 * Save dashboard report
 */
function saveDashboard(dashboard) {
  const reportPath = path.join(REPORTS_DIR, 'dashboard.json');
  fs.writeFileSync(reportPath, JSON.stringify(dashboard, null, 2));
  console.log(`✓ Dashboard report saved: ${reportPath}`);
  return reportPath;
}

/**
 * Main execution
 */
function main() {
  const reports = loadExecutionReports();
  const dashboard = generateDashboardReport(reports);
  
  displayDashboard(dashboard);
  saveDashboard(dashboard);

  console.log(`ℹ View full report details:`);
  console.log(`  - Execution history: .generated/delivery-pipeline-reports/`);
  console.log(`  - Latest dashboard: .generated/delivery-pipeline-reports/dashboard.json`);
  console.log();
}

main();
