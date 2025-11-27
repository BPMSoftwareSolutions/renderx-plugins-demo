#!/usr/bin/env node
/**
 * Demonstration of Build Pipeline Telemetry Output
 * 
 * This script shows what the real-time console output looks like during builds
 */

const path = require('path');
const fs = require('fs');

// Import console formatter
const formatter = require('./scripts/build-telemetry-console-formatter.cjs');

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║         🎵 BUILD PIPELINE TELEMETRY CONSOLE OUTPUT DEMONSTRATION 🎵       ║
║                                                                            ║
║                         Real-Time SLI/SLO/SLA Display                     ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

// Example 1: Healthy beat - compliant performance
console.log('\n\n━━━ EXAMPLE 1: Healthy Beat (Compliant) ━━━\n');

const healthyBeatTelemetry = {
  movement: 1,
  beat: 1,
  beatName: 'Load Build Context',
  timestamp: new Date().toISOString(),
  correlationId: 'a1f2b4c6-d7e3-f5g8-h9i0-j1k2l3m4n5o6',
  sli: {
    duration_ms: 245,
    duration_bucket: '1-5s',
    status: 'success',
    artifacts_count: 5,
    errors_count: 0,
    memory_delta_mb: 12.5,
    cache_state: 'hit'
  },
  slo: {
    duration_ms: 5000,
    error_count: 0,
    cache_hit_rate: 0.8
  },
  sla: {
    overall_status: 'compliant',
    duration_exceeded: false,
    duration_breach_percent: -95,
    error_limit_exceeded: false,
    cache_hit_shortfall: false
  },
  shape: {
    currentHash: 'a1f2b4c6d7e3f5g8h9i0j1k2l3m4n5o6',
    previousHash: 'a1f2b4c6d7e3f5g8h9i0j1k2l3m4n5o6',
    evolved: false,
    evolutionReason: null
  }
};

formatter.printTelemetryRecord(healthyBeatTelemetry);

// Example 2: Performance degradation - warning state
console.log('\n\n━━━ EXAMPLE 2: Performance Degradation (Warning) ━━━\n');

const warningBeatTelemetry = {
  movement: 3,
  beat: 5,
  beatName: 'Build Library Package',
  timestamp: new Date().toISOString(),
  correlationId: 'a1f2b4c6-d7e3-f5g8-h9i0-j1k2l3m4n5o6',
  sli: {
    duration_ms: 95250,
    duration_bucket: '30s-2m',
    status: 'success',
    artifacts_count: 147,
    errors_count: 0,
    memory_delta_mb: 285.4,
    cache_state: 'hit'
  },
  slo: {
    duration_ms: 120000,
    error_count: 0,
    cache_hit_rate: 0.6
  },
  sla: {
    overall_status: 'warning',
    duration_exceeded: false,
    duration_breach_percent: 79.4,
    error_limit_exceeded: false,
    cache_hit_shortfall: false
  },
  shape: {
    currentHash: 'd7e3f5g8h9i0j1k2l3m4n5o6p7q8r9s0',
    previousHash: 'a1f2b4c6d7e3f5g8h9i0j1k2l3m4n5o6',
    evolved: true,
    evolutionReason: 'Duration increased from 1-5s to 30s-2m bucket'
  }
};

formatter.printTelemetryRecord(warningBeatTelemetry);

// Example 3: SLA breach - critical state
console.log('\n\n━━━ EXAMPLE 3: SLA Breach (Critical) ━━━\n');

const breachBeatTelemetry = {
  movement: 3,
  beat: 7,
  beatName: 'Build Canvas Component',
  timestamp: new Date().toISOString(),
  correlationId: 'a1f2b4c6-d7e3-f5g8-h9i0-j1k2l3m4n5o6',
  sli: {
    duration_ms: 145000,
    duration_bucket: 'over-2m',
    status: 'failure',
    artifacts_count: 89,
    errors_count: 3,
    memory_delta_mb: 542.8,
    cache_state: 'miss'
  },
  slo: {
    duration_ms: 120000,
    error_count: 0,
    cache_hit_rate: 0.6
  },
  sla: {
    overall_status: 'critical',
    duration_exceeded: true,
    duration_breach_percent: 120.8,
    error_limit_exceeded: true,
    cache_hit_shortfall: true
  },
  shape: {
    currentHash: 'x8y9z0a1b2c3d4e5f6g7h8i9j0k1l2m3',
    previousHash: 'd7e3f5g8h9i0j1k2l3m4n5o6p7q8r9s0',
    evolved: true,
    evolutionReason: 'Errors introduced, duration breach, cache miss'
  }
};

formatter.printTelemetryRecord(breachBeatTelemetry);

// Example 4: Movement Summary
console.log('\n\n━━━ EXAMPLE 4: Movement Summary ━━━\n');

const movementBeats = [healthyBeatTelemetry, warningBeatTelemetry, healthyBeatTelemetry];
formatter.printMovementSummary(1, movementBeats);

// Example 5: Build Summary
console.log('\n\n━━━ EXAMPLE 5: Build Summary ━━━\n');

const buildSummary = {
  buildId: 'a1f2b4c6-d7e3-f5g8-h9i0-j1k2l3m4n5o6',
  totalBeats: 28,
  totalDuration: 425000,
  successRate: 96.4,
  breachPercentage: 3.6,
  totalErrors: 1
};

formatter.printBuildSummary(buildSummary);

console.log(`

╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                    ✅ DEMONSTRATION COMPLETE                              ║
║                                                                            ║
║  This is what you'll see when running:                                    ║
║                                                                            ║
║      npm run build:symphony:telemetry                                    ║
║                                                                            ║
║  Each beat displays SLI/SLO/SLA metrics in real-time with:               ║
║  • Color-coded status (✓ ⚠ 🔴 🚨)                                        ║
║  • Duration vs SLO target percentage                                      ║
║  • Shape evolution tracking                                              ║
║  • Movement summaries after completion                                    ║
║  • Final build summary                                                    ║
║                                                                            ║
║  All telemetry is persisted to: .generated/telemetry/build-{id}/          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
