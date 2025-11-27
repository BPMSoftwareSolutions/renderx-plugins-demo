#!/usr/bin/env node

/**
 * Symphonic Metrics Envelope & Coordination
 * 
 * Single source of truth for metric scopes, implementation flags, and data flow.
 * Prevents drift between analysis modules and report generation.
 */

/**
 * Coverage scope definitions
 */
const COVERAGE_SCOPES = {
  ORCHESTRATION: 'orchestration',      // Full renderx-web-orchestration suite
  HANDLER_SCOPED: 'handler-scoped',    // Handler files only
  TREND_BASELINE: 'trend-baseline'     // Averaged across snapshots
};

/**
 * Implementation status flags
 * These drive conditional sections in the report
 */
const IMPLEMENTATION_FLAGS = {
  handlerScanningImplemented: true,      // Phase 2.1 complete
  handlerMappingImplemented: true,       // Phase 3.1 complete
  coverageByHandlerImplemented: true,    // Phase 3.2 complete
  refactorSuggestionsImplemented: true,  // Phase 3.3 complete
  trendTrackingImplemented: true         // Phase 3.4 complete
};

/**
 * Maintainability scope definitions
 */
const MAINTAINABILITY_SCOPES = {
  GLOBAL_ORCHESTRATION: 'global-orchestration',    // 68.30/100 - Full codebase
  MOVEMENT_2_SPECIFIC: 'movement-2-specific',      // 47.1/100 - Movement 2 only
  TREND_COMPUTED: 'trend-computed'                 // 84.71/100 - Trend module scope
};

/**
 * Unified coverage classification function
 * Used across all report sections for consistency
 */
function classifyCoverage(percent, metricType = 'statements') {
  const num = parseFloat(percent);
  
  const targets = {
    statements: 80,
    branches: 85,
    functions: 90,
    lines: 85
  };
  
  const target = targets[metricType] || 80;
  const gap = target - num;
  
  if (gap <= 0) {
    return {
      status: '✅ On-target',
      emoji: '✅',
      statusShort: 'On-target',
      riskLevel: 'Low'
    };
  }
  
  if (gap <= 3) {
    return {
      status: '🟢 Close',
      emoji: '🟢',
      statusShort: 'Close',
      riskLevel: 'Low'
    };
  }
  
  if (gap <= 10) {
    return {
      status: '🟡 Needs Improvement',
      emoji: '🟡',
      statusShort: 'Needs Improvement',
      riskLevel: 'Medium'
    };
  }
  
  return {
    status: '🔴 Off-track',
    emoji: '🔴',
    statusShort: 'Off-track',
    riskLevel: 'High'
  };
}

/**
 * Create metrics envelope with metadata
 * This is the canonical object shape that prevents drift
 */
function createMetricsEnvelope(baseMetrics) {
  return {
    // Metadata
    metadata: {
      timestamp: new Date().toISOString(),
      version: '3.4.0',
      implementationFlags: IMPLEMENTATION_FLAGS,
      reportGeneration: 'symphonic-code-analysis-pipeline'
    },
    
    // Coverage metrics by scope
    coverage: {
      [COVERAGE_SCOPES.ORCHESTRATION]: {
        statements: parseFloat(baseMetrics.coverage.statements),
        branches: parseFloat(baseMetrics.coverage.branches),
        functions: parseFloat(baseMetrics.coverage.functions),
        lines: parseFloat(baseMetrics.coverage.lines),
        scope: COVERAGE_SCOPES.ORCHESTRATION,
        source: 'measured',
        description: 'Full renderx-web-orchestration suite coverage'
      },
      // Handler-scoped coverage populated by phase-3.2
      [COVERAGE_SCOPES.HANDLER_SCOPED]: {
        scope: COVERAGE_SCOPES.HANDLER_SCOPED,
        source: 'measured',
        description: 'Handler files only - populated by analyze-coverage-by-handler'
      },
      // Trend baseline populated by phase-3.4
      [COVERAGE_SCOPES.TREND_BASELINE]: {
        scope: COVERAGE_SCOPES.TREND_BASELINE,
        source: 'measured',
        description: 'Averaged or snapshotted metrics - populated by track-historical-trends'
      }
    },
    
    // Maintainability metrics by scope
    maintainability: {
      [MAINTAINABILITY_SCOPES.GLOBAL_ORCHESTRATION]: {
        index: parseFloat(baseMetrics.maintainability.maintainability),
        scope: MAINTAINABILITY_SCOPES.GLOBAL_ORCHESTRATION,
        source: 'computed',
        description: 'Global orchestration codebase index',
        grade: classifyMaintainabilityGrade(parseFloat(baseMetrics.maintainability.maintainability))
      },
      [MAINTAINABILITY_SCOPES.MOVEMENT_2_SPECIFIC]: {
        index: 47.1,  // From Movement Governance
        scope: MAINTAINABILITY_SCOPES.MOVEMENT_2_SPECIFIC,
        source: 'measured',
        description: 'Movement 2 (Code Metrics) specific index',
        grade: classifyMaintainabilityGrade(47.1)
      },
      // Trend maintainability populated by phase-3.4
      [MAINTAINABILITY_SCOPES.TREND_COMPUTED]: {
        scope: MAINTAINABILITY_SCOPES.TREND_COMPUTED,
        source: 'computed',
        description: 'Trend module computed index (may differ from global)'
      }
    },
    
    // Handler metrics with flags
    handlers: {
      discovered: baseMetrics.discoveredCount || 0,
      implementationFlag: IMPLEMENTATION_FLAGS.handlerScanningImplemented,
      source: 'measured',
      description: 'Real discovered handler exports via pattern matching'
    },
    
    // Duplication metrics
    duplication: {
      blocks: baseMetrics.duplication.totalUniqueBlocks || 0,
      lines: baseMetrics.duplication.estimatedMetrics?.estimatedDuplicateLines || 0,
      rate: parseFloat((baseMetrics.duplication.estimatedMetrics?.estimatedDuplicationRate || '0').replace('%', '')),
      source: 'measured',
      description: 'AST region hashing across source files'
    },
    
    // Conformity metrics
    conformity: {
      score: parseFloat(baseMetrics.conformity.conformityScore),
      conformingBeats: baseMetrics.conformity.conformingBeats,
      totalBeats: baseMetrics.conformity.totalBeats,
      violations: baseMetrics.conformity.violations,
      source: 'measured',
      description: 'Beat validation and handler conformity'
    },
    
    // Phase-specific metrics
    phases: {
      '3.1': {
        status: IMPLEMENTATION_FLAGS.handlerMappingImplemented ? 'complete' : 'pending',
        healthScore: 54,  // From phase-3.1 output
        description: 'Handler-to-beat mapping with health score'
      },
      '3.2': {
        status: IMPLEMENTATION_FLAGS.coverageByHandlerImplemented ? 'complete' : 'pending',
        averageCoverage: null,  // Populated by analyze-coverage-by-handler
        description: 'Coverage correlated with handlers'
      },
      '3.3': {
        status: IMPLEMENTATION_FLAGS.refactorSuggestionsImplemented ? 'complete' : 'pending',
        suggestions: null,  // Populated by generate-refactor-suggestions
        description: 'Actionable refactoring guidance'
      },
      '3.4': {
        status: IMPLEMENTATION_FLAGS.trendTrackingImplemented ? 'complete' : 'pending',
        description: 'Historical trend tracking and projections'
      }
    }
  };
}

/**
 * Helper: Classify maintainability index to grade
 */
function classifyMaintainabilityGrade(index) {
  if (index >= 80) return 'A';
  if (index >= 60) return 'B';
  if (index >= 40) return 'C';
  return 'D';
}

/**
 * Generate conditional CI/CD readiness based on flags
 */
function generateCIReadinessWithFlags(envelope) {
  const flags = envelope.metadata.implementationFlags;
  
  const sections = [];
  
  sections.push(
    `✓ Conformity (${envelope.conformity.score}%) ${envelope.conformity.score >= 85 ? '✅' : '⚠'}`
  );
  
  sections.push(
    `✓ Coverage (${envelope.coverage[COVERAGE_SCOPES.ORCHESTRATION].statements}%) ${envelope.coverage[COVERAGE_SCOPES.ORCHESTRATION].statements >= 80 ? '✅' : '⚠'}`
  );
  
  if (flags.handlerScanningImplemented) {
    sections.push(
      `✓ Handler Scanning (Implemented – ${envelope.handlers.discovered} handlers measured) ✅`
    );
  } else {
    sections.push(
      `⚠ Handler Scanning (Disabled)`
    );
  }
  
  return sections.join('\n');
}

/**
 * Generate Top 10 based on implementation status
 */
function generateTop10FromFlags(envelope) {
  const actions = [];
  const flags = envelope.metadata.implementationFlags;
  
  // Handler scanning status
  if (!flags.handlerScanningImplemented) {
    actions.push('Implement real handler scanning');
  } else {
    // Suggest enhancement instead
    actions.push('Improve handler type classification (currently 100% generic)');
  }
  
  // Coverage improvements
  actions.push('Increase branch test coverage (target 85%, currently 79.07%)');
  actions.push('Add integration tests for Beat 4 (dependencies)');
  
  // Duplication reduction
  actions.push('Execute 5 consolidation refactors (save 600+ duplicate lines)');
  
  // Handler distribution
  if (flags.handlerMappingImplemented) {
    actions.push('Distribute handlers across beats (target 50% beats with handlers, currently 15%)');
  }
  
  // Maintainability
  actions.push('Reduce Movement 2 maintainability complexity');
  actions.push('Add JSDoc documentation (50-100 lines)');
  
  // Trend tracking
  if (flags.trendTrackingImplemented) {
    actions.push('Tune trend thresholds and velocity alerts');
  }
  
  actions.push('Review and prioritize refactor suggestions (11 opportunities)');
  actions.push('Establish team SLOs based on trend projections');
  
  return actions.slice(0, 10);
}

module.exports = {
  COVERAGE_SCOPES,
  MAINTAINABILITY_SCOPES,
  IMPLEMENTATION_FLAGS,
  createMetricsEnvelope,
  classifyCoverage,
  classifyMaintainabilityGrade,
  generateCIReadinessWithFlags,
  generateTop10FromFlags
};
