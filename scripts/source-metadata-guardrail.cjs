#!/usr/bin/env node

/**
 * Source Metadata Guardrail System
 * 
 * Ensures all metrics are tagged with their data source ('measured'|'computed'|'mock'),
 * preventing accidental use of synthetic data in production reports.
 * 
 * This system:
 * 1. Enforces source tagging on all metrics
 * 2. Prevents rendering of 'mock' source metrics
 * 3. Provides audit trail of metric origins
 * 4. Blocks historical synthetic data
 */

const fs = require('fs');
const path = require('path');

/**
 * Metric source types
 */
const METRIC_SOURCES = {
  MEASURED: 'measured',   // Real data from scanning/analysis
  COMPUTED: 'computed',   // Derived from measured data (e.g., averages, ratios)
  MOCK: 'mock'            // Synthetic/placeholder data (SHOULD NOT render)
};

/**
 * Validate that a metric has proper source metadata
 * @param {Object} metric Metric object with optional source field
 * @returns {Object} Validation result
 */
function validateMetricSource(metric) {
  const errors = [];
  const warnings = [];
  
  if (!metric) {
    errors.push('Metric is null or undefined');
    return { valid: false, errors, warnings };
  }
  
  // Check if source is specified
  if (!metric.source) {
    warnings.push('Metric missing source field; assume COMPUTED');
    metric.source = METRIC_SOURCES.COMPUTED;
  }
  
  // Validate source value
  const validSources = Object.values(METRIC_SOURCES);
  if (!validSources.includes(metric.source)) {
    errors.push(`Invalid source: '${metric.source}'. Must be one of: ${validSources.join(', ')}`);
  }
  
  // Flag mock data (should not be in production)
  if (metric.source === METRIC_SOURCES.MOCK) {
    warnings.push('⚠ WARNING: Metric source is MOCK (synthetic). Should not render in production.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    source: metric.source
  };
}

/**
 * Build audit trail for a metric
 * @param {string} name Metric name
 * @param {*} value Metric value
 * @param {string} source Source of metric
 * @param {Object} options Additional metadata
 * @returns {Object} Metric with audit trail
 */
function createAuditedMetric(name, value, source, options = {}) {
  return {
    name,
    value,
    source: source || METRIC_SOURCES.COMPUTED,
    timestamp: new Date().toISOString(),
    origin: options.origin || 'analysis-pipeline',
    checksum: options.checksum || null,
    ...options
  };
}

/**
 * Filter metrics to exclude mock data
 * @param {Array|Object} metrics Metrics to filter
 * @param {Object} options Filter options
 * @returns {Array|Object} Filtered metrics (or warnings if mock found)
 */
function filterMockMetrics(metrics, options = { throwOnMock: false }) {
  const warnings = [];
  
  if (Array.isArray(metrics)) {
    return metrics.filter(m => {
      if (m && m.source === METRIC_SOURCES.MOCK) {
        warnings.push(`Filtering out mock metric: ${m.name}`);
        if (options.throwOnMock) {
          throw new Error(`Mock metric in production: ${m.name}`);
        }
        return false;
      }
      return true;
    });
  }
  
  if (typeof metrics === 'object' && metrics !== null) {
    const filtered = {};
    for (const [key, value] of Object.entries(metrics)) {
      if (value && value.source === METRIC_SOURCES.MOCK) {
        warnings.push(`Filtering out mock metric: ${key}`);
        if (options.throwOnMock) {
          throw new Error(`Mock metric in production: ${key}`);
        }
        continue;
      }
      filtered[key] = value;
    }
    return filtered;
  }
  
  return metrics;
}

/**
 * Create checkpoint for metrics integrity
 * Generates checksum of non-mock metrics for historical tracking
 * @param {Object} metricsSnapshot Metrics snapshot
 * @returns {Object} Checkpoint with integrity hash
 */
function createIntegrityCheckpoint(metricsSnapshot) {
  const crypto = require('crypto');
  
  // Build integrity data (excludes mock)
  const measuredAndComputed = {};
  for (const [key, value] of Object.entries(metricsSnapshot)) {
    if (!value || value.source !== METRIC_SOURCES.MOCK) {
      measuredAndComputed[key] = value;
    }
  }
  
  // Generate hash
  const data = JSON.stringify(measuredAndComputed, null, 2);
  const hash = crypto
    .createHash('sha256')
    .update(data)
    .digest('hex')
    .substring(0, 16);
  
  return {
    timestamp: new Date().toISOString(),
    integrityHash: hash,
    metricCount: Object.keys(measuredAndComputed).length,
    hasMock: Object.values(metricsSnapshot).some(v => v && v.source === METRIC_SOURCES.MOCK)
  };
}

/**
 * Generate audit report of metric sources in pipeline
 * @param {Object} pipeline Pipeline metrics collection
 * @returns {string} Markdown audit report
 */
function generateAuditReport(pipeline) {
  const metrics = {
    measured: [],
    computed: [],
    mock: []
  };
  
  // Categorize all metrics
  function categorize(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj || {})) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object') {
        if (value.source) {
          // This is a metric with source
          const source = value.source || 'computed';
          metrics[source].push({
            name: fullKey,
            value: value.value || value,
            timestamp: value.timestamp
          });
        } else if (!Array.isArray(value)) {
          // Recurse into objects
          categorize(value, fullKey);
        }
      }
    }
  }
  
  categorize(pipeline);
  
  const report = `# Metric Source Audit Report

**Generated**: ${new Date().toISOString()}

## Summary

| Source | Count | Status |
|--------|-------|--------|
| Measured (Real) | ${metrics.measured.length} | ✓ Trusted |
| Computed (Derived) | ${metrics.computed.length} | ✓ Trusted |
| Mock (Synthetic) | ${metrics.mock.length} | ❌ BLOCKED |

## Source Breakdown

### Measured Metrics (${metrics.measured.length})
Real data from scanning and analysis:
${metrics.measured.map(m => `- ${m.name}: ${JSON.stringify(m.value).substring(0, 50)}`).join('\n') || '(none)'}

### Computed Metrics (${metrics.computed.length})
Derived from measured data:
${metrics.computed.map(m => `- ${m.name}: ${JSON.stringify(m.value).substring(0, 50)}`).join('\n') || '(none)'}

### Mock Metrics (${metrics.mock.length})
⚠ SYNTHETIC DATA - NOT RENDERED:
${metrics.mock.map(m => `- ❌ ${m.name}: ${JSON.stringify(m.value).substring(0, 50)}`).join('\n') || '(none - CLEAN)'}

## Recommendations

${metrics.mock.length > 0 ? '1. **CRITICAL**: Remove mock metrics from pipeline immediately\n2. Replace with real measured data or defer to next phase\n3. Block mock data rendering in all reports' : '1. ✓ No synthetic data detected\n2. Pipeline integrity maintained\n3. Continue Phase 2 implementation'}

---

*Report generated by source-metadata-guardrail.cjs - Integrity verification system*`;

  return report;
}

module.exports = {
  METRIC_SOURCES,
  validateMetricSource,
  createAuditedMetric,
  filterMockMetrics,
  createIntegrityCheckpoint,
  generateAuditReport
};

// CLI execution
if (require.main === module) {
  const testMetrics = {
    handlers: createAuditedMetric('handlers', 38, 'measured', { origin: 'scan-handlers' }),
    duplication: createAuditedMetric('duplication_blocks', 561, 'measured', { origin: 'scan-duplication' }),
    coverage: createAuditedMetric('statement_coverage', 79.73, 'computed', { origin: 'analysis' }),
    mockData: createAuditedMetric('old_synthetic', 1, 'mock', { origin: 'deprecated' })
  };
  
  console.log('\n=== Metric Validation ===\n');
  for (const [key, metric] of Object.entries(testMetrics)) {
    const result = validateMetricSource(metric);
    console.log(`${key}: ${result.valid ? '✓' : '✗'} (${result.source})`);
    if (result.warnings.length) {
      result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
    }
  }
  
  console.log('\n=== Filtered Metrics (Mock Removed) ===\n');
  const filtered = filterMockMetrics(testMetrics);
  console.log(`Before: ${Object.keys(testMetrics).length}, After: ${Object.keys(filtered).length}`);
  
  console.log('\n=== Integrity Checkpoint ===\n');
  const checkpoint = createIntegrityCheckpoint(testMetrics);
  console.log(JSON.stringify(checkpoint, null, 2));
  
  console.log('\n=== Audit Report ===\n');
  const report = generateAuditReport(testMetrics);
  console.log(report);
}
