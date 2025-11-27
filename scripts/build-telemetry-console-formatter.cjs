#!/usr/bin/env node
/**
 * Build Pipeline Telemetry Console Formatter
 * 
 * Formats telemetry records for console output with color coding and SLA status
 * Provides real-time observability of SLI, SLO, and SLA during build execution
 */

const chalk = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`
};

/**
 * Get status icon based on SLA status
 * @param {string} status - compliant|warning|breach|critical
 * @returns {string} Icon with color
 */
function getSlaIcon(status) {
  switch (status) {
    case 'compliant':
      return chalk.green('✓');
    case 'warning':
      return chalk.yellow('⚠');
    case 'breach':
      return chalk.red('🔴');
    case 'critical':
      return chalk.red('🚨');
    default:
      return '?';
  }
}

/**
 * Format duration with color coding
 * @param {number} duration - Milliseconds
 * @param {number} slo - SLO target in milliseconds
 * @returns {string} Formatted string
 */
function formatDuration(duration, slo) {
  const percent = (duration / slo) * 100;
  let color = chalk.green;
  
  if (percent > 110) color = chalk.red;
  else if (percent > 90) color = chalk.red;
  else if (percent > 70) color = chalk.yellow;
  
  return color(`${duration}ms (${percent.toFixed(0)}% of SLO)`);
}

/**
 * Format cache state with color
 * @param {string} state - hit|miss|skip|expired
 * @returns {string} Colored state
 */
function formatCacheState(state) {
  switch (state) {
    case 'hit':
      return chalk.green('HIT');
    case 'miss':
      return chalk.yellow('MISS');
    case 'skip':
      return chalk.gray('SKIP');
    case 'expired':
      return chalk.yellow('EXPIRED');
    default:
      return chalk.gray('UNKNOWN');
  }
}

/**
 * Format memory delta with color
 * @param {number} delta - MB
 * @returns {string} Colored memory
 */
function formatMemory(delta) {
  let color = chalk.gray;
  if (delta > 200) color = chalk.yellow;
  if (delta > 500) color = chalk.red;
  
  return color(`${delta.toFixed(1)}MB`);
}

/**
 * Print beat header
 * @param {Object} telemetry - Telemetry record
 */
function printBeatHeader(telemetry) {
  const { movement, beat, beatName, timestamp } = telemetry;
  console.log(`\n${'─'.repeat(80)}`);
  console.log(
    chalk.cyan(`🎵 M${movement}.B${beat}`) + ` ${chalk.blue(beatName)} @ ${chalk.gray(new Date(timestamp).toLocaleTimeString())}`
  );
  console.log(`${'─'.repeat(80)}`);
}

/**
 * Print SLI metrics
 * @param {Object} sli - SLI metrics object
 * @param {Object} slo - SLO baseline object
 */
function printSLIMetrics(sli, slo) {
  console.log(chalk.cyan('📊 SLI (Service Level Indicator)'));
  
  console.log(`  Duration:  ${formatDuration(sli.duration_ms, slo.duration_ms)}`);
  console.log(`  Status:    ${sli.status === 'success' ? chalk.green('SUCCESS') : chalk.red('FAILURE')}`);
  console.log(`  Artifacts: ${sli.artifacts_count}`);
  console.log(`  Errors:    ${sli.errors_count === 0 ? chalk.green('0') : chalk.red(sli.errors_count)}`);
  console.log(`  Memory:    ${formatMemory(sli.memory_delta_mb)}`);
  console.log(`  Cache:     ${formatCacheState(sli.cache_state)}`);
}

/**
 * Print SLO baseline
 * @param {Object} slo - SLO baseline object
 */
function printSLOBaseline(slo) {
  console.log(chalk.cyan('📈 SLO (Service Level Objective)'));
  
  if (slo.duration_ms) {
    console.log(`  Duration:  ${slo.duration_ms}ms`);
  }
  if (slo.error_count !== undefined) {
    console.log(`  Errors:    ≤ ${slo.error_count}`);
  }
  if (slo.cache_hit_rate) {
    console.log(`  Cache Hit: ≥ ${(slo.cache_hit_rate * 100).toFixed(0)}%`);
  }
}

/**
 * Print SLA evaluation
 * @param {Object} sla - SLA evaluation object
 */
function printSLAStatus(sla) {
  console.log(chalk.cyan('🚨 SLA (Service Level Agreement)'));
  
  const icon = getSlaIcon(sla.overall_status);
  const statusStr = sla.overall_status.toUpperCase();
  console.log(`  Overall:   ${icon} ${statusStr}`);
  
  if (sla.duration_exceeded) {
    console.log(`  Duration:  ${chalk.red('EXCEEDED')} (${sla.duration_breach_percent.toFixed(1)}% over)`);
  } else {
    console.log(`  Duration:  ${chalk.green('OK')} (${Math.abs(sla.duration_breach_percent).toFixed(1)}% under)`);
  }
  
  if (sla.error_limit_exceeded) {
    console.log(`  Errors:    ${chalk.red('EXCEEDED')}`);
  } else {
    console.log(`  Errors:    ${chalk.green('OK')}`);
  }
  
  if (sla.cache_hit_shortfall) {
    console.log(`  Cache:     ${chalk.yellow('SHORTFALL')}`);
  } else {
    console.log(`  Cache:     ${chalk.green('OK')}`);
  }
}

/**
 * Print shape evolution
 * @param {Object} shape - Shape evolution object
 */
function printShapeEvolution(shape) {
  console.log(chalk.cyan('🔄 Shape Evolution'));
  
  if (shape.evolved) {
    console.log(`  Status:    ${chalk.yellow('EVOLVED')}`);
    console.log(`  Previous:  ${shape.previousHash ? shape.previousHash.substring(0, 16) + '...' : chalk.gray('N/A')}`);
    console.log(`  Current:   ${shape.currentHash.substring(0, 16)}...`);
    if (shape.evolutionReason) {
      console.log(`  Reason:    ${shape.evolutionReason}`);
    }
  } else {
    console.log(`  Status:    ${chalk.green('STABLE')}`);
    console.log(`  Hash:      ${shape.currentHash.substring(0, 16)}...`);
  }
}

/**
 * Print complete telemetry record
 * @param {Object} telemetry - Complete telemetry record
 */
function printTelemetryRecord(telemetry) {
  printBeatHeader(telemetry);
  printSLIMetrics(telemetry.sli, telemetry.slo);
  console.log();
  printSLOBaseline(telemetry.slo);
  console.log();
  printSLAStatus(telemetry.sla);
  console.log();
  printShapeEvolution(telemetry.shape);
}

/**
 * Print movement summary
 * @param {Array} beatTelemetries - Array of telemetry records
 */
function printMovementSummary(movementNum, beatTelemetries) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(chalk.magenta(`🎼 MOVEMENT ${movementNum} SUMMARY`));
  console.log(`${'='.repeat(80)}`);
  
  const stats = {
    totalBeats: beatTelemetries.length,
    totalDuration: 0,
    successCount: 0,
    breachCount: 0,
    warningCount: 0
  };
  
  beatTelemetries.forEach(t => {
    stats.totalDuration += t.sli.duration_ms;
    if (t.sli.status === 'success') stats.successCount++;
    
    switch (t.sla.overall_status) {
      case 'breach':
        stats.breachCount++;
        break;
      case 'critical':
        stats.breachCount++;
        break;
      case 'warning':
        stats.warningCount++;
        break;
    }
  });
  
  console.log(`Beats:        ${stats.totalBeats}`);
  console.log(`Duration:     ${chalk.cyan(`${stats.totalDuration}ms (${(stats.totalDuration / 1000).toFixed(1)}s)`)}`);
  console.log(`Success:      ${chalk.green(stats.successCount)} / ${stats.totalBeats}`);
  console.log(`Warnings:     ${stats.warningCount > 0 ? chalk.yellow(stats.warningCount) : chalk.green('0')}`);
  console.log(`Breaches:     ${stats.breachCount > 0 ? chalk.red(stats.breachCount) : chalk.green('0')}`);
  
  // Print beat list
  console.log(`\nBeats:`);
  beatTelemetries.forEach(t => {
    const icon = getSlaIcon(t.sla.overall_status);
    const name = t.beatName.substring(0, 40);
    const duration = `${t.sli.duration_ms}ms`;
    console.log(`  ${icon} B${t.beat}: ${chalk.blue(name.padEnd(40))} ${chalk.gray(duration)}`);
  });
}

/**
 * Print build summary
 * @param {Object} buildSummary - Build summary object
 */
function printBuildSummary(buildSummary) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(chalk.magenta('🎭 BUILD SUMMARY'));
  console.log(`${'='.repeat(80)}`);
  
  console.log(`Build ID:          ${chalk.cyan(buildSummary.buildId)}`);
  console.log(`Duration:          ${chalk.cyan(`${buildSummary.totalDuration}ms (${(buildSummary.totalDuration / 1000 / 60).toFixed(2)}m)`)}`);
  console.log(`Total Beats:       ${buildSummary.totalBeats}`);
  console.log(`Success Rate:      ${buildSummary.successRate > 90 ? chalk.green(buildSummary.successRate.toFixed(1) + '%') : chalk.red(buildSummary.successRate.toFixed(1) + '%')}`);
  console.log(`Breach Percentage: ${buildSummary.breachPercentage > 5 ? chalk.red(buildSummary.breachPercentage.toFixed(1) + '%') : chalk.green(buildSummary.breachPercentage.toFixed(1) + '%')}`);
  console.log(`Total Errors:      ${buildSummary.totalErrors > 0 ? chalk.red(buildSummary.totalErrors) : chalk.green('0')}`);
  console.log(`Overall Status:    ${buildSummary.breachPercentage > 10 ? chalk.red('BREACHED') : buildSummary.breachPercentage > 5 ? chalk.yellow('WARNINGS') : chalk.green('COMPLIANT')}`);
}

module.exports = {
  printBeatHeader,
  printSLIMetrics,
  printSLOBaseline,
  printSLAStatus,
  printShapeEvolution,
  printTelemetryRecord,
  printMovementSummary,
  printBuildSummary,
  getSlaIcon,
  formatDuration,
  formatCacheState,
  formatMemory
};
