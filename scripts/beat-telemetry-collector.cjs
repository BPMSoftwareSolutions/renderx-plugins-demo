#!/usr/bin/env node
/**
 * Beat Telemetry Collector
 * 
 * Wraps build pipeline beats to collect:
 * - SLI (Service Level Indicator): Duration, status, error count, artifacts, memory, cache state
 * - Shape evolution: Computed hash for signature tracking
 * - SLO (Service Level Objective): Baseline comparison
 * - SLA (Service Level Agreement): Breach detection
 * 
 * Usage: beatTelemetryCollector(handler, beatMetadata, sloBaseline)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Main telemetry collector wrapper
 * 
 * @param {Function} beatHandler - The handler function to wrap
 * @param {Object} beatMetadata - Movement/beat info
 * @param {Object} sloBaseline - SLO targets for this beat
 * @param {Object} options - Configuration
 * @returns {Function} Wrapped handler with telemetry
 */
function beatTelemetryCollector(beatHandler, beatMetadata, sloBaseline, options = {}) {
  const {
    buildId = `build-${Date.now()}`,
    correlationId = generateId(),
    telemetryRoot = '.generated/telemetry',
    shapeEvolutionsPath = 'shape-evolutions.json',
    slaBreachThresholds = { warning: 0.7, breach: 0.9, critical: 1.1 }
  } = options;

  return async function wrappedBeatHandler(...args) {
    const beatStartTime = Date.now();
    const heapBefore = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    
    // Initialize telemetry record
    const telemetryRecord = {
      timestamp: new Date().toISOString(),
      correlationId,
      buildId,
      movement: beatMetadata.movement,
      beat: beatMetadata.beat,
      beatName: beatMetadata.beatName,
      event: beatMetadata.event,
      
      // SLI will be populated after execution
      sli: {
        duration_ms: 0,
        duration_bucket: null,
        status: 'unknown',
        artifacts_count: 0,
        errors_count: 0,
        memory_delta_mb: 0,
        cache_state: 'unknown'
      },
      
      // Shape evolution tracking
      shape: {
        currentHash: null,
        previousHash: null,
        evolved: false,
        evolutionReason: null
      },
      
      // SLO baseline
      slo: sloBaseline || {},
      
      // SLA evaluation
      sla: {
        duration_exceeded: false,
        duration_breach_percent: 0,
        duration_status: 'compliant',
        error_limit_exceeded: false,
        cache_hit_shortfall: false,
        overall_status: 'compliant'
      }
    };

    try {
      // Log beat start
      console.log(`\n[BEAT ${beatMetadata.beat}] Starting: ${beatMetadata.beatName}`);
      
      // Execute the actual beat handler
      const result = await beatHandler(...args);
      
      // Collect execution metrics
      const beatEndTime = Date.now();
      const heapAfter = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const duration = beatEndTime - beatStartTime;
      
      // Update SLI metrics
      telemetryRecord.sli.duration_ms = duration;
      telemetryRecord.sli.duration_bucket = getDurationBucket(duration);
      telemetryRecord.sli.status = 'success';
      telemetryRecord.sli.memory_delta_mb = heapAfter - heapBefore;
      
      // Extract additional metrics from result if available
      if (result && typeof result === 'object') {
        telemetryRecord.sli.artifacts_count = result.artifactCount || 0;
        telemetryRecord.sli.errors_count = result.errorCount || 0;
        telemetryRecord.sli.cache_state = result.cacheState || 'unknown';
      }
      
      // Compute shape hash
      telemetryRecord.shape.currentHash = computeShapeHash(telemetryRecord);
      
      // Load previous shape hash for comparison
      const previousShape = loadPreviousShape(beatMetadata.movement, beatMetadata.beat, shapeEvolutionsPath);
      if (previousShape) {
        telemetryRecord.shape.previousHash = previousShape.hash;
        telemetryRecord.shape.evolved = telemetryRecord.shape.currentHash !== previousShape.hash;
      }
      
      // Evaluate SLA compliance
      evaluateSLACompliance(telemetryRecord, sloBaseline, slaBreachThresholds);
      
      // Persist telemetry
      await persistTelemetry(telemetryRecord, telemetryRoot, buildId, beatMetadata);
      
      // Log beat completion
      console.log(
        `[BEAT ${beatMetadata.beat}] Completed: ${duration}ms | ` +
        `Status: ${telemetryRecord.sli.status} | ` +
        `SLA: ${telemetryRecord.sla.overall_status} | ` +
        `Shape: ${telemetryRecord.shape.evolved ? 'EVOLVED' : 'stable'}`
      );
      
      return {
        ...result,
        telemetry: telemetryRecord
      };
      
    } catch (error) {
      const beatEndTime = Date.now();
      const duration = beatEndTime - beatStartTime;
      
      // Record failure
      telemetryRecord.sli.status = 'failure';
      telemetryRecord.sli.duration_ms = duration;
      telemetryRecord.sli.errors_count = 1;
      telemetryRecord.sla.overall_status = 'failed';
      
      // Compute hash for failed state
      telemetryRecord.shape.currentHash = computeShapeHash(telemetryRecord);
      telemetryRecord.shape.evolved = true;
      telemetryRecord.shape.evolutionReason = `Beat failed: ${error.message}`;
      
      // Persist failure telemetry
      await persistTelemetry(telemetryRecord, telemetryRoot, buildId, beatMetadata);
      
      console.error(`[BEAT ${beatMetadata.beat}] FAILED: ${error.message}`);
      throw error;
    }
  };
}

/**
 * Compute duration bucket for telemetry
 * @param {number} durationMs 
 * @returns {string} Duration bucket
 */
function getDurationBucket(durationMs) {
  if (durationMs < 1000) return 'under-1s';
  if (durationMs < 5000) return '1-5s';
  if (durationMs < 30000) return '5-30s';
  if (durationMs < 120000) return '30s-2m';
  return 'over-2m';
}

/**
 * Compute shape hash from telemetry
 * 
 * Shape = SHA256(movement + beat + duration_bucket + status + artifacts_bucket + errors_bucket + memory_bucket + cache_state)
 * 
 * @param {Object} telemetryRecord 
 * @returns {string} SHA256 hash
 */
function computeShapeHash(telemetryRecord) {
  const artifactsBucket = getBucket(telemetryRecord.sli.artifacts_count, [0, 5, 10, 20, 50]);
  const errorsBucket = telemetryRecord.sli.errors_count > 0 ? 'errors' : 'clean';
  const memoryBucket = getBucket(telemetryRecord.sli.memory_delta_mb, [0, 50, 100, 200, 500]);
  
  const shapeString = [
    `m${telemetryRecord.movement}`,
    `b${telemetryRecord.beat}`,
    telemetryRecord.sli.duration_bucket,
    telemetryRecord.sli.status,
    `a${artifactsBucket}`,
    `e${errorsBucket}`,
    `mem${memoryBucket}`,
    telemetryRecord.sli.cache_state || 'unknown'
  ].join(':');
  
  return crypto.createHash('sha256').update(shapeString).digest('hex');
}

/**
 * Bucket numeric value into ranges
 * @param {number} value 
 * @param {number[]} ranges 
 * @returns {string} Bucket identifier
 */
function getBucket(value, ranges) {
  for (let i = 0; i < ranges.length; i++) {
    if (value < ranges[i]) return `${i}`;
  }
  return `${ranges.length}`;
}

/**
 * Load previous shape hash for a beat
 * @param {number} movement 
 * @param {number} beat 
 * @param {string} shapeEvolutionsPath 
 * @returns {Object|null} Previous shape data
 */
function loadPreviousShape(movement, beat, shapeEvolutionsPath) {
  try {
    if (!fs.existsSync(shapeEvolutionsPath)) return null;
    
    const data = JSON.parse(fs.readFileSync(shapeEvolutionsPath, 'utf8'));
    const beatId = `movement-${movement}-beat-${beat}`;
    
    // Find most recent entry for this beat
    const relevant = data.annotations?.filter(a => a.feature === beatId);
    if (relevant && relevant.length > 0) {
      const latest = relevant[relevant.length - 1];
      return { hash: latest.newHash };
    }
    
    return null;
  } catch (err) {
    // Silently fail if file doesn't exist
    return null;
  }
}

/**
 * Evaluate SLA compliance against baselines and thresholds
 * @param {Object} telemetryRecord 
 * @param {Object} sloBaseline 
 * @param {Object} thresholds 
 */
function evaluateSLACompliance(telemetryRecord, sloBaseline, thresholds) {
  if (!sloBaseline) return;
  
  const sla = telemetryRecord.sla;
  const sli = telemetryRecord.sli;
  
  // Duration check
  if (sloBaseline.duration_ms) {
    const breachPercent = (sli.duration_ms / sloBaseline.duration_ms - 1) * 100;
    sla.duration_breach_percent = breachPercent;
    
    if (sli.duration_ms > sloBaseline.duration_ms) {
      const ratio = sli.duration_ms / sloBaseline.duration_ms;
      if (ratio > (1 + thresholds.critical)) {
        sla.duration_status = 'critical';
        sla.duration_exceeded = true;
      } else if (ratio > (1 + thresholds.breach)) {
        sla.duration_status = 'breach';
        sla.duration_exceeded = true;
      } else if (ratio > (1 + thresholds.warning)) {
        sla.duration_status = 'warning';
      } else {
        sla.duration_status = 'compliant';
      }
    }
  }
  
  // Error check
  if (sloBaseline.error_count !== undefined && sli.errors_count > sloBaseline.error_count) {
    sla.error_limit_exceeded = true;
  }
  
  // Cache hit check
  if (sloBaseline.cache_hit_rate && sli.cache_state === 'miss') {
    sla.cache_hit_shortfall = true;
  }
  
  // Overall status
  if (sla.duration_status === 'critical' || sla.error_limit_exceeded) {
    sla.overall_status = 'critical';
  } else if (sla.duration_status === 'breach' || sli.status === 'failure') {
    sla.overall_status = 'breach';
  } else if (sla.duration_status === 'warning' || sla.cache_hit_shortfall) {
    sla.overall_status = 'warning';
  } else {
    sla.overall_status = 'compliant';
  }
}

/**
 * Persist telemetry record to disk
 * @param {Object} telemetryRecord 
 * @param {string} telemetryRoot 
 * @param {string} buildId 
 * @param {Object} beatMetadata 
 */
async function persistTelemetry(telemetryRecord, telemetryRoot, buildId, beatMetadata) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const movementDir = path.join(telemetryRoot, buildId, `movement-${beatMetadata.movement}`);
  const beatFile = path.join(movementDir, `beat-${beatMetadata.beat}-${beatMetadata.beatName}.json`);
  
  // Ensure directory exists
  fs.mkdirSync(movementDir, { recursive: true });
  
  // Write telemetry record
  fs.writeFileSync(beatFile, JSON.stringify(telemetryRecord, null, 2));
}

/**
 * Generate unique ID
 * @returns {string} UUID-like ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load and aggregate telemetry for a build
 * @param {string} buildId 
 * @param {string} telemetryRoot 
 * @returns {Object} Aggregated telemetry
 */
function aggregateBuildTelemetry(buildId, telemetryRoot = '.generated/telemetry') {
  const buildDir = path.join(telemetryRoot, buildId);
  if (!fs.existsSync(buildDir)) return null;
  
  const movements = {};
  const movementDirs = fs.readdirSync(buildDir);
  
  movementDirs.forEach(movDir => {
    const movPath = path.join(buildDir, movDir);
    if (!fs.statSync(movPath).isDirectory()) return;
    
    const beats = [];
    const beatFiles = fs.readdirSync(movPath).filter(f => f.endsWith('.json'));
    
    beatFiles.forEach(beatFile => {
      const beatData = JSON.parse(fs.readFileSync(path.join(movPath, beatFile), 'utf8'));
      beats.push(beatData);
    });
    
    const movNum = parseInt(movDir.split('-')[1]);
    movements[movNum] = {
      name: movDir,
      beats,
      stats: aggregateMovementStats(beats)
    };
  });
  
  return {
    buildId,
    timestamp: new Date().toISOString(),
    movements,
    stats: aggregateBuildStats(movements)
  };
}

/**
 * Aggregate statistics for a movement
 * @param {Object[]} beats 
 * @returns {Object} Aggregated stats
 */
function aggregateMovementStats(beats) {
  if (beats.length === 0) return {};
  
  const durations = beats.map(b => b.sli.duration_ms);
  const errors = beats.reduce((sum, b) => sum + b.sli.errors_count, 0);
  const breaches = beats.filter(b => b.sla.overall_status !== 'compliant').length;
  
  return {
    beatCount: beats.length,
    totalDuration: durations.reduce((a, b) => a + b, 0),
    avgDuration: durations.reduce((a, b) => a + b, 0) / beats.length,
    maxDuration: Math.max(...durations),
    minDuration: Math.min(...durations),
    totalErrors: errors,
    breachCount: breaches,
    successRate: (beats.filter(b => b.sli.status === 'success').length / beats.length) * 100
  };
}

/**
 * Aggregate statistics for entire build
 * @param {Object} movements 
 * @returns {Object} Aggregated stats
 */
function aggregateBuildStats(movements) {
  const allBeats = Object.values(movements).flatMap(m => m.beats);
  const durations = allBeats.map(b => b.sli.duration_ms);
  
  return {
    totalMovements: Object.keys(movements).length,
    totalBeats: allBeats.length,
    totalDuration: durations.reduce((a, b) => a + b, 0),
    totalErrors: allBeats.reduce((sum, b) => sum + b.sli.errors_count, 0),
    totalBreaches: allBeats.filter(b => b.sla.overall_status !== 'compliant').length,
    successRate: (allBeats.filter(b => b.sli.status === 'success').length / allBeats.length) * 100,
    breachPercentage: (allBeats.filter(b => b.sla.overall_status !== 'compliant').length / allBeats.length) * 100
  };
}

/**
 * Generate SLI/SLO/SLA report
 * @param {string} buildId 
 * @param {string} telemetryRoot 
 * @returns {Object} Report data
 */
function generateSliSloSlaReport(buildId, telemetryRoot = '.generated/telemetry') {
  const aggregated = aggregateBuildTelemetry(buildId, telemetryRoot);
  if (!aggregated) return null;
  
  const reportPath = path.join(telemetryRoot, buildId, 'build-sli-slo-sla-report.json');
  const report = {
    buildId,
    timestamp: aggregated.timestamp,
    summary: aggregated.stats,
    movements: aggregated.movements,
    breaches: []
  };
  
  // Collect all breaches
  Object.values(aggregated.movements).forEach(mov => {
    mov.beats.forEach(beat => {
      if (beat.sla.overall_status !== 'compliant') {
        report.breaches.push({
          beat: beat.beatName,
          metric: 'duration' in beat.sla && beat.sla.duration_exceeded ? 'duration_ms' : 'multiple',
          value: beat.sli.duration_ms,
          slo: beat.slo.duration_ms,
          status: beat.sla.overall_status,
          exceeded_percent: beat.sla.duration_breach_percent
        });
      }
    });
  });
  
  // Write report
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

module.exports = {
  beatTelemetryCollector,
  aggregateBuildTelemetry,
  generateSliSloSlaReport,
  getDurationBucket,
  computeShapeHash,
  evaluateSLACompliance,
  persistTelemetry
};
