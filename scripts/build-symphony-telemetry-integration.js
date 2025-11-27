#!/usr/bin/env node

/**
 * Build Symphony Telemetry Integration
 * 
 * Wraps all build handlers with comprehensive SLI/SLO/SLA telemetry collection
 * Enables real-time observability and shape evolution tracking
 */

import { beatTelemetryCollector, aggregateBuildTelemetry } from './beat-telemetry-collector.cjs';
import { printTelemetryRecord, printMovementSummary, printBuildSummary } from './build-telemetry-console-formatter.cjs';
import fs from 'fs';
import path from 'path';

// SLO baselines by beat type (in milliseconds)
const SLO_BASELINES = {
  validation: { duration_ms: 5000, error_count: 0, cache_hit_rate: 0.8 },
  generation: { duration_ms: 15000, error_count: 0, cache_hit_rate: 0.7 },
  build: { duration_ms: 120000, error_count: 0, cache_hit_rate: 0.6 },
  verification: { duration_ms: 10000, error_count: 1, cache_hit_rate: 0.8 },
  observation: { duration_ms: 5000, error_count: 0, cache_hit_rate: 0.9 }
};

// Map beat names to types for SLO assignment
const BEAT_TYPE_MAP = {
  'loadBuildContext': 'validation',
  'validateOrchestrationDomains': 'validation',
  'validateGovernanceRules': 'validation',
  'validateAgentBehavior': 'validation',
  'recordValidationResults': 'observation',
  
  'regenerateOrchestrationDomains': 'generation',
  'syncJsonSources': 'generation',
  'generateManifests': 'generation',
  'validateManifestIntegrity': 'verification',
  'recordManifestState': 'observation',
  
  'initializePackageBuild': 'build',
  'buildComponentsPackage': 'build',
  'buildMusicalConductorPackage': 'build',
  'buildHostSdkPackage': 'build',
  'buildManifestToolsPackage': 'build',
  'buildCanvasPackage': 'build',
  'buildCanvasComponentPackage': 'build',
  'buildControlPanelPackage': 'build',
  'buildHeaderPackage': 'build',
  'buildLibraryPackage': 'build',
  'buildLibraryComponentPackage': 'build',
  'buildRealEstateAnalyzerPackage': 'build',
  'buildSelfHealingPackage': 'build',
  'buildSloDashboardPackage': 'build',
  'recordPackageBuildMetrics': 'observation',
  
  'prepareHostBuild': 'build',
  'viteHostBuild': 'build',
  'validateHostArtifacts': 'verification',
  'recordHostBuildMetrics': 'observation',
  
  'collectArtifacts': 'build',
  'computeArtifactHashes': 'build',
  'validateArtifactSignatures': 'verification',
  'generateArtifactManifest': 'generation',
  'recordArtifactMetrics': 'observation',
  
  'runLintChecks': 'verification',
  'enrichDomainAuthorities': 'generation',
  'generateGovernanceDocs': 'generation',
  'validateConformityDimensions': 'verification',
  'generateBuildReport': 'observation'
};

// Get SLO baseline for a beat
function getSloBaseline(beatHandler) {
  const beatType = BEAT_TYPE_MAP[beatHandler] || 'build';
  return SLO_BASELINES[beatType] || SLO_BASELINES.build;
}

/**
 * Wrap a beat handler with telemetry collection
 * @param {Function} handler - Original beat handler
 * @param {string} handlerName - Name of handler for identification
 * @param {number} movementNum - Movement number
 * @param {number} beatNum - Beat number
 * @param {string} beatName - Display name of beat
 * @returns {Function} Wrapped handler with telemetry
 */
export function wrapBeatWithTelemetry(handler, handlerName, movementNum, beatNum, beatName) {
  const sloBaseline = getSloBaseline(handlerName);
  
  return beatTelemetryCollector(
    handler,
    {
      number: beatNum,
      name: beatName,
      handler: handlerName,
      movement: movementNum,
      timestamp: new Date().toISOString()
    },
    sloBaseline,
    {
      printToConsole: true,
      persistTelemetry: true,
      formatter: printTelemetryRecord
    }
  );
}

/**
 * Create telemetry-wrapped handlers from original handlers
 * @param {Object} originalHandlers - Original handlers object
 * @param {Array} movementDefinitions - Movement and beat definitions
 * @returns {Object} New handlers object with telemetry wrapping
 */
export function createTelemetryWrappedHandlers(originalHandlers, movementDefinitions) {
  const wrappedHandlers = {};
  
  movementDefinitions.forEach((movement, movementIdx) => {
    const movementNum = movementIdx + 1;
    
    movement.beats.forEach((beat, beatIdx) => {
      const beatNum = beatIdx + 1;
      const originalHandler = originalHandlers[beat.handler];
      
      if (!originalHandler) {
        console.warn(`Warning: Handler ${beat.handler} not found`);
        return;
      }
      
      wrappedHandlers[beat.handler] = wrapBeatWithTelemetry(
        originalHandler,
        beat.handler,
        movementNum,
        beatNum,
        beat.name
      );
    });
  });
  
  return wrappedHandlers;
}

/**
 * Generate movement summary from telemetry
 * @param {string} buildId - Build ID/correlation ID
 * @param {number} movementNum - Movement number
 * @returns {Object} Movement summary with aggregated metrics
 */
export function generateMovementSummary(buildId, movementNum) {
  const telemetryRoot = path.join(process.cwd(), '.generated', 'telemetry');
  const movementDir = path.join(telemetryRoot, `build-${buildId}`, `movement-${movementNum}`);
  
  if (!fs.existsSync(movementDir)) {
    return null;
  }
  
  const beatFiles = fs.readdirSync(movementDir)
    .filter(f => f.startsWith('beat-') && f.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
  
  const beatTelemetries = beatFiles.map(file => {
    const content = fs.readFileSync(path.join(movementDir, file), 'utf-8');
    return JSON.parse(content);
  });
  
  return { movementNum, beatCount: beatTelemetries.length, beats: beatTelemetries };
}

/**
 * Generate build summary from all telemetry
 * @param {string} buildId - Build ID/correlation ID
 * @returns {Object} Complete build summary
 */
export function generateBuildSummary(buildId) {
  const telemetryRoot = path.join(process.cwd(), '.generated', 'telemetry');
  const buildDir = path.join(telemetryRoot, `build-${buildId}`);
  
  if (!fs.existsSync(buildDir)) {
    return null;
  }
  
  const movementDirs = fs.readdirSync(buildDir)
    .filter(f => f.startsWith('movement-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0]);
      const numB = parseInt(b.match(/\d+/)[0]);
      return numA - numB;
    });
  
  let totalBeats = 0;
  let totalDuration = 0;
  let successCount = 0;
  let breachCount = 0;
  let totalErrors = 0;
  
  movementDirs.forEach(movementDir => {
    const beatFiles = fs.readdirSync(path.join(buildDir, movementDir))
      .filter(f => f.startsWith('beat-') && f.endsWith('.json'));
    
    beatFiles.forEach(beatFile => {
      const content = fs.readFileSync(path.join(buildDir, movementDir, beatFile), 'utf-8');
      const telemetry = JSON.parse(content);
      
      totalBeats++;
      totalDuration += telemetry.sli.duration_ms;
      
      if (telemetry.sli.status === 'success') successCount++;
      if (telemetry.sla.overall_status === 'breach' || telemetry.sla.overall_status === 'critical') {
        breachCount++;
      }
      totalErrors += telemetry.sli.errors_count;
    });
  });
  
  return {
    buildId,
    totalBeats,
    totalDuration,
    successRate: (successCount / totalBeats) * 100,
    breachPercentage: (breachCount / totalBeats) * 100,
    totalErrors
  };
}

/**
 * Print all movement summaries for a build
 * @param {string} buildId - Build ID
 */
export function printAllMovementSummaries(buildId) {
  for (let i = 1; i <= 6; i++) {
    const summary = generateMovementSummary(buildId, i);
    if (summary) {
      printMovementSummary(i, summary.beats);
    }
  }
}

/**
 * Print final build summary
 * @param {string} buildId - Build ID
 */
export function printFinalBuildSummary(buildId) {
  const summary = generateBuildSummary(buildId);
  if (summary) {
    printBuildSummary(summary);
  }
}

export {
  SLO_BASELINES,
  BEAT_TYPE_MAP,
  getSloBaseline
};
