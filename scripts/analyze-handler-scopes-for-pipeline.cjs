#!/usr/bin/env node

/**
 * Handler Scope Analysis for Symphonic Pipeline
 * 
 * Reads handler scope/kind from sequence JSON files and correlates with
 * discovered handler implementations. Generates metrics separated by scope.
 * 
 * Output:
 *   - handlers-by-scope.json: Handlers grouped by scope with metrics
 *   - handler-scope-report.md: Markdown report for pipeline documentation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Extract handler scope metadata from sequence files
 */
function extractHandlerScopeFromSequences() {
  const handlers = [];
  
  // Find all sequence files
  const patterns = [
    'packages/orchestration/json-sequences/**/*.json',
    'src/RenderX.Plugins.**/json-sequences/**/*.json',
    'packages/plugins/**/json-sequences/**/*.json'
  ];

  let allFiles = [];
  patterns.forEach(pattern => {
    allFiles = allFiles.concat(glob.sync(pattern, { cwd: process.cwd() }));
  });
  allFiles = [...new Set(allFiles)];

  allFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      
      const sequenceId = json.id || json.sequenceId;
      const sequenceCategory = json.category || 'plugin';

      // Extract from beatDetails (orchestration)
      if (Array.isArray(json.beatDetails)) {
        json.beatDetails.forEach((beat, idx) => {
          if (beat.handler && beat.handler.scope) {
            handlers.push({
              sequenceId,
              sequenceCategory,
              beatName: beat.name,
              handlerName: beat.handler.id || `${beat.name}`,
              scope: beat.handler.scope,
              kind: beat.handler.kind,
              stage: beat.handler.stage,
              source: 'sequence-definition'
            });
          }
        });
      }

      // Extract from movements.beats (both types)
      if (Array.isArray(json.movements)) {
        json.movements.forEach((movement, mvIdx) => {
          if (Array.isArray(movement.beats)) {
            movement.beats.forEach((beat, beatIdx) => {
              if (beat.handler && (beat.handlerDef || (typeof beat.handler === 'object' && beat.handler.scope))) {
                const handlerDef = beat.handlerDef || beat.handler;
                handlers.push({
                  sequenceId,
                  sequenceCategory,
                  movementName: movement.name || movement.id,
                  beatName: beat.name || beat.title || `beat-${beatIdx}`,
                  handlerName: typeof beat.handler === 'string' ? beat.handler : handlerDef.id,
                  scope: handlerDef.scope,
                  kind: handlerDef.kind,
                  stage: handlerDef.stage,
                  source: 'sequence-definition'
                });
              }
            });
          }
        });
      }
    } catch (err) {
      // Skip files that fail to parse
    }
  });

  return handlers;
}

/**
 * Group handlers by scope
 */
function groupByScope(handlers) {
  const grouped = {
    orchestration: [],
    plugin: [],
    unknown: []
  };

  handlers.forEach(h => {
    const scope = h.scope || 'unknown';
    if (scope in grouped) {
      grouped[scope].push(h);
    }
  });

  return grouped;
}

/**
 * Calculate scope statistics
 */
function calculateStats(grouped) {
  const stats = {
    total: Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0),
    byScope: {},
    bySequence: {},
    byStage: {}
  };

  Object.entries(grouped).forEach(([scope, handlers]) => {
    stats.byScope[scope] = {
      count: handlers.length,
      percentage: ((handlers.length / stats.total) * 100).toFixed(1),
      sequences: [...new Set(handlers.map(h => h.sequenceId))].length,
      stages: [...new Set(handlers.filter(h => h.stage).map(h => h.stage))]
    };
  });

  return stats;
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(grouped, stats) {
  const orchestrationHandlers = grouped.orchestration;
  const pluginHandlers = grouped.plugin;
  const unknownHandlers = grouped.unknown;

  let markdown = `# Handler Scope Analysis Report

**Generated**: ${new Date().toISOString()}

## Overview

The handler scope/kind metadata introduced on 2025-11-27 distinguishes orchestration-level handlers (system logic) from plugin-level handlers (feature logic).

## Summary Statistics

| Scope | Count | Percentage | Sequences | Stages |
|-------|-------|-----------|-----------|--------|
| Orchestration | ${stats.byScope.orchestration.count} | ${stats.byScope.orchestration.percentage}% | ${stats.byScope.orchestration.sequences} | ${stats.byScope.orchestration.stages.join(', ') || 'N/A'} |
| Plugin | ${stats.byScope.plugin.count} | ${stats.byScope.plugin.percentage}% | ${stats.byScope.plugin.sequences} | N/A |
| Unknown | ${stats.byScope.unknown.count} | ${stats.byScope.unknown.percentage}% | - | - |
| **TOTAL** | **${stats.total}** | **100%** | - | - |

## Orchestration Handlers (${orchestrationHandlers.length})

Orchestration handlers implement system-level logic (code analysis, governance, build coordination).

### By Stage

`;

  // Group orchestration by stage
  const stageGroups = {};
  orchestrationHandlers.forEach(h => {
    const stage = h.stage || 'unspecified';
    if (!stageGroups[stage]) stageGroups[stage] = [];
    stageGroups[stage].push(h);
  });

  Object.entries(stageGroups).forEach(([stage, handlers]) => {
    markdown += `
#### ${stage.charAt(0).toUpperCase() + stage.slice(1)} (${handlers.length} handlers)

| Sequence | Beat | Handler |
|----------|------|---------|
`;
    handlers.slice(0, 10).forEach(h => {
      markdown += `| ${h.sequenceId} | ${h.beatName} | ${h.handlerName} |\n`;
    });
    if (handlers.length > 10) {
      markdown += `| ... | ... | and ${handlers.length - 10} more |\n`;
    }
  });

  markdown += `

## Plugin Handlers (${pluginHandlers.length})

Plugin handlers implement feature-level logic (UI behavior, component interactions).

### Top Sequences by Handler Count

| Sequence | Handler Count |
|----------|---|
`;

  // Count handlers per plugin sequence
  const sequenceCounts = {};
  pluginHandlers.forEach(h => {
    sequenceCounts[h.sequenceId] = (sequenceCounts[h.sequenceId] || 0) + 1;
  });

  Object.entries(sequenceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .forEach(([seq, count]) => {
      markdown += `| ${seq} | ${count} |\n`;
    });

  markdown += `

## Unknown Scope Handlers (${unknownHandlers.length})

These handlers need scope assignment:

`;

  unknownHandlers.forEach(h => {
    markdown += `- ${h.sequenceId} → ${h.beatName}\n`;
  });

  markdown += `

## Key Metrics

- **Orchestration Coverage**: ${stats.byScope.orchestration.count} handlers across ${stats.byScope.orchestration.sequences} sequences
- **Plugin Coverage**: ${stats.byScope.plugin.count} handlers across ${stats.byScope.plugin.sequences} sequences
- **Implementation Status**: Ready for per-scope metrics analysis

## Integration Points

With handler scope/kind now defined, the pipeline can now:

1. **Separate Metrics**: Report LOC, coverage, and complexity separately by scope
2. **Governance Rules**: Apply scope-specific thresholds and standards
3. **Registry Validation**: Audit completeness of orchestration handlers
4. **Self-Healing**: Target fixes to specific handler scopes

## Next Steps

1. Update \`analyze-symphonic-code.cjs\` to report metrics by scope
2. Implement registry validation for missing orchestration handlers
3. Add scope-specific governance rules to conformity checking
4. Integrate with self-healing domain for targeted refactoring
`;

  return markdown;
}

/**
 * Main execution
 */
function main() {
  console.log('\n🔍 Extracting handler scope metadata from sequences...\n');

  const handlers = extractHandlerScopeFromSequences();
  const grouped = groupByScope(handlers);
  const stats = calculateStats(grouped);

  // Output JSON
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    stats,
    handlers: grouped
  };

  const jsonPath = 'docs/generated/symphonic-code-analysis-pipeline/handlers-by-scope.json';
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2));

  // Output Markdown
  const markdown = generateMarkdownReport(grouped, stats);
  const mdPath = 'docs/generated/symphonic-code-analysis-pipeline/handler-scope-report.md';
  fs.writeFileSync(mdPath, markdown);

  // Display summary
  console.log('📊 Handler Scope Analysis Complete\n');
  console.log(`  Orchestration Handlers: ${stats.byScope.orchestration.count} (${stats.byScope.orchestration.percentage}%)`);
  console.log(`  Plugin Handlers:        ${stats.byScope.plugin.count} (${stats.byScope.plugin.percentage}%)`);
  console.log(`  Unknown Scope:          ${stats.byScope.unknown.count} (${stats.byScope.unknown.percentage}%)`);
  console.log(`  Total:                  ${stats.total}\n`);
  console.log(`📁 Output files:`);
  console.log(`   - ${jsonPath}`);
  console.log(`   - ${mdPath}\n`);
}

if (require.main === module) {
  main();
}

module.exports = {
  extractHandlerScopeFromSequences,
  groupByScope,
  calculateStats,
  generateMarkdownReport
};
