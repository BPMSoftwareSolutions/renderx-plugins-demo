#!/usr/bin/env node
/**
 * fuse-slo-breaches.js
 * 
 * Reads slo-breaches.json and ingests breach records into anomalies.json as "slo" type.
 * Ensures every SLO breach is surfaced as an anomaly for unified visualization.
 * 
 * Usage: node scripts/fuse-slo-breaches.js
 * 
 * Expected inputs:
 *   - packages/self-healing/.generated/slo-breaches.json (SLI vs SLO comparison)
 *   - packages/self-healing/.generated/anomalies.json (existing anomaly records)
 * 
 * Output:
 *   - packages/self-healing/.generated/anomalies.json (updated with SLO breach entries + summary)
 *   - console log: fusion result (breaches fused, summary statistics)
 */

const fs = require('fs');
const path = require('path');

const SELF_HEALING_DIR = path.join(__dirname, '..', 'packages', 'self-healing');
const GENERATED_DIR = path.join(SELF_HEALING_DIR, '.generated');
const SLO_BREACHES_FILE = path.join(GENERATED_DIR, 'slo-breaches.json');
const ANOMALIES_FILE = path.join(GENERATED_DIR, 'anomalies.json');

/**
 * Determine severity based on breach magnitude and type.
 * @param {string} key - breach key (latency_p95_ms, error_rate, availability, etc.)
 * @param {number} diff - actual - target (can be positive or negative)
 * @param {number} actual - actual SLI value
 * @param {number} target - target SLO value
 * @returns {string} severity level (critical, high, medium, low)
 */
function determineSeverity(key, diff, actual, target) {
  if (key === 'error_rate') {
    const ratio = actual / target;
    return ratio > 3 ? 'critical' : ratio > 2 ? 'high' : 'medium';
  }
  if (key === 'availability') {
    const ratio = 1 - (actual / target); // How far below target
    return ratio > 0.05 ? 'critical' : ratio > 0.02 ? 'high' : 'medium';
  }
  if (key.includes('latency')) {
    const ratio = actual / target;
    return ratio > 5 ? 'critical' : ratio > 3 ? 'high' : 'medium';
  }
  if (key === 'throughput_min') {
    const ratio = target / actual; // Inverse: lower throughput is worse
    return ratio > 3 ? 'critical' : ratio > 2 ? 'high' : 'medium';
  }
  return 'medium';
}

/**
 * Create anomaly records from SLO breaches.
 * @param {Array} breaches - breach records from slo-breaches.json
 * @param {object} slos - SLO targets object
 * @returns {Array} anomaly records with type='slo'
 */
function createSloAnomalies(breaches, slos) {
  const now = new Date().toISOString();
  const timestamp = Date.now();

  return breaches.map(breach => {
    const { key, actual, target, diff } = breach;
    const severity = determineSeverity(key, diff, actual, target);

    return {
      id: `slo-breach-${key}-${timestamp}`,
      type: 'slo',
      severity,
      handler: 'system', // SLO breaches are system-level, not handler-specific
      feature: 'service-level-objective', // System-wide feature
      correlationId: null, // SLO breaches are not tied to a single correlation
      description: `SLO breach: ${key} (actual: ${actual}, target: ${target})`,
      metrics: {
        actual,
        target,
        diff: Math.abs(diff),
        percentage: ((Math.abs(diff) / target) * 100).toFixed(2) + '%'
      },
      detectedAt: now,
      confidence: 0.95 // High confidence: measured SLO comparison
    };
  });
}

/**
 * Compute summary statistics from anomalies.
 * @param {Array} anomalies - all anomaly records (including new SLO breaches)
 * @returns {object} summary with count, severities breakdown, breach count, highest severity
 */
function computeSummary(anomalies) {
  const summary = {
    count: anomalies.length,
    severityBreakdown: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    typeBreakdown: {
      performance: 0,
      behavioral: 0,
      coverage: 0,
      error: 0,
      slo: 0
    },
    breachesCovered: 0,
    highestSeverity: 'low',
    syntheticMarker: false,
    lastUpdated: new Date().toISOString()
  };

  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  anomalies.forEach(a => {
    summary.severityBreakdown[a.severity]++;
    summary.typeBreakdown[a.type]++;
    if (a.type === 'slo') summary.breachesCovered++;

    if (severityOrder[a.severity] > severityOrder[summary.highestSeverity]) {
      summary.highestSeverity = a.severity;
    }
  });

  return summary;
}

/**
 * Main fusion logic.
 */
function fuseSloBreaches() {
  try {
    // Read SLO breaches
    if (!fs.existsSync(SLO_BREACHES_FILE)) {
      console.warn(`[fuse-slo-breaches] WARNING: ${SLO_BREACHES_FILE} not found. Skipping fusion.`);
      return;
    }

    const sloData = JSON.parse(fs.readFileSync(SLO_BREACHES_FILE, 'utf8'));
    const breaches = sloData.breaches || [];

    if (breaches.length === 0) {
      console.log('[fuse-slo-breaches] No SLO breaches detected. Anomalies unchanged.');
      return;
    }

    // Read existing anomalies
    let anomaliesData = { timestamp: new Date().toISOString(), anomalies: [] };
    if (fs.existsSync(ANOMALIES_FILE)) {
      anomaliesData = JSON.parse(fs.readFileSync(ANOMALIES_FILE, 'utf8'));
    }

    // Create SLO anomalies
    const sloAnomalies = createSloAnomalies(breaches, sloData.slo);

    // Merge: avoid duplicates by checking breach keys already present
    const existingSloBreachKeys = anomaliesData.anomalies
      .filter(a => a.type === 'slo')
      .map(a => a.id);

    const newSloAnomalies = sloAnomalies.filter(
      a => !existingSloBreachKeys.includes(a.id)
    );

    anomaliesData.anomalies.push(...newSloAnomalies);

    // Compute summary
    const summary = computeSummary(anomaliesData.anomalies);

    // Update anomalies data with summary
    anomaliesData.summary = summary;

    // Write back
    fs.writeFileSync(
      ANOMALIES_FILE,
      JSON.stringify(anomaliesData, null, 2) + '\n'
    );

    console.log(`[fuse-slo-breaches] SUCCESS`);
    console.log(`  - Fused ${newSloAnomalies.length} SLO breach(es) into anomalies`);
    console.log(`  - Total anomalies now: ${anomaliesData.anomalies.length}`);
    console.log(`  - Summary:`, JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('[fuse-slo-breaches] ERROR:', error.message);
    process.exit(1);
  }
}

// Run fusion
fuseSloBreaches();
