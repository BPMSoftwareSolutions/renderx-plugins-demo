#!/usr/bin/env node

/**
 * Handler-to-Beat Mapper
 * 
 * Maps discovered handlers to orchestration beats, identifying:
 * 1. Handlers mapped to beats
 * 2. Orphaned handlers (not in any beat)
 * 3. Beats with no handlers
 * 4. Handler distribution and coverage
 * 
 * Produces a Symphonic Health Score measuring handler-beat alignment.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load orchestration registry to get beats
 * @returns {Array} Beat definitions from registry
 */
function loadOrchestrationBeats() {
  try {
    const registryPath = path.join(process.cwd(), 'orchestration-domains.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    // Extract all beats from all movements
    const beats = [];
    const movements = [
      { name: 'Movement 1', beats: ['beat-1-discovery', 'beat-1a-discovery-core', 'beat-1b-discovery-extended', 'beat-1c-discovery-analysis', 'beat-1d-discovery-telemetry'] },
      { name: 'Movement 2', beats: ['beat-2-baseline', 'beat-2a-baseline-metrics', 'beat-2b-baseline-analysis', 'beat-2c-baseline-validation', 'beat-2d-baseline-reporting'] },
      { name: 'Movement 3', beats: ['beat-3-structure', 'beat-3a-structure-parse', 'beat-3b-structure-analysis', 'beat-3c-structure-validation', 'beat-3d-structure-reporting'] },
      { name: 'Movement 4', beats: ['beat-4-dependencies', 'beat-4a-deps-resolve', 'beat-4b-deps-analysis', 'beat-4c-deps-validation', 'beat-4d-deps-reporting'] }
    ];
    
    for (const movement of movements) {
      for (const beat of movement.beats) {
        beats.push({
          name: beat,
          movement: movement.name,
          handlers: []
        });
      }
    }
    
    return beats;
  } catch (err) {
    console.error('Error loading beats:', err.message);
    return [];
  }
}

/**
 * Match handler to beat based on naming and location conventions
 * @param {Object} handler Handler with name and file path
 * @param {Array} beats Available beats
 * @returns {Object} Match result
 */
function matchHandlerToBeat(handler, beats) {
  const handlerName = handler.name.toLowerCase();
  const filePath = handler.file.toLowerCase();
  const fileSegments = filePath.split('/');
  
  // Extract symphony name from path
  // e.g., packages/canvas-component/src/symphonies/create/create.stage-crew.ts -> create
  let symphonyName = '';
  for (let i = 0; i < fileSegments.length; i++) {
    if (fileSegments[i] === 'symphonies' && i + 1 < fileSegments.length) {
      symphonyName = fileSegments[i + 1].toLowerCase();
      break;
    }
  }
  
  // Strategy 1: Symphony name contains beat keyword (highest confidence)
  const beatKeywords = {
    'beat-1-discovery': ['discover', 'scan', 'find', 'parse'],
    'beat-2-baseline': ['analyze', 'metric', 'measure', 'baseline', 'complexity', 'duplication'],
    'beat-3-structure': ['transform', 'convert', 'structure', 'organize', 'export', 'render'],
    'beat-4-dependencies': ['depend', 'import', 'resolve', 'require', 'load']
  };
  
  for (const [beat, keywords] of Object.entries(beatKeywords)) {
    const beatObj = beats.find(b => b.name === beat);
    if (beatObj) {
      for (const keyword of keywords) {
        if (symphonyName.includes(keyword)) {
          return { beat: beat, movement: beatObj.movement, confidence: 0.85, reason: 'symphony-keyword' };
        }
      }
    }
  }
  
  // Strategy 2: File path contains beat keyword
  for (const beat of beats) {
    const beatShort = beat.name.split('-').slice(-1)[0]; // e.g., 'discovery' from 'beat-1-discovery'
    if (filePath.includes(beatShort)) {
      return { beat: beat.name, movement: beat.movement, confidence: 0.7, reason: 'path-match' };
    }
  }
  
  // Strategy 3: Stage-crew patterns (ui-interaction handlers)
  if (filePath.includes('stage-crew')) {
    const beatObj = beats.find(b => b.name === 'beat-3-structure');
    if (beatObj) {
      return { beat: 'beat-3-structure', movement: beatObj.movement, confidence: 0.6, reason: 'stage-crew' };
    }
  }
  
  // Strategy 4: Overlay patterns (selection/manipulation)
  if (filePath.includes('overlay')) {
    const beatObj = beats.find(b => b.name === 'beat-2-baseline');
    if (beatObj) {
      return { beat: 'beat-2-baseline', movement: beatObj.movement, confidence: 0.55, reason: 'overlay' };
    }
  }
  
  // Strategy 5: Generic handler mapping to default beat
  const defaultMapping = {
    'initialization': 'beat-1-discovery',
    'validation': 'beat-2-baseline',
    'transformation': 'beat-3-structure',
    'input': 'beat-4-dependencies',
    'output': 'beat-3-structure',
    'execution': 'beat-3-structure',
    'ui-interaction': 'beat-3-structure',
    'event': 'beat-2-baseline'
  };
  
  if (handler.type && defaultMapping[handler.type]) {
    const beatName = defaultMapping[handler.type];
    const beatObj = beats.find(b => b.name === beatName);
    if (beatObj) {
      return { 
        beat: beatName, 
        movement: beatObj.movement,
        confidence: 0.5, 
        reason: 'type-default' 
      };
    }
  }
  
  // No match found - map to Movement 2 as default (most central)
  const defaultBeat = beats.find(b => b.name === 'beat-2-baseline');
  if (defaultBeat) {
    return { beat: 'beat-2-baseline', movement: defaultBeat.movement, confidence: 0.3, reason: 'default' };
  }
  
  return { beat: null, movement: null, confidence: 0, reason: 'no-match' };
}

/**
 * Map all handlers to beats
 * @param {Array} handlers Discovered handlers
 * @returns {Object} Mapping results
 */
function mapHandlersToBeat(handlers) {
  const beats = loadOrchestrationBeats();
  const mapped = [];
  const orphaned = [];
  const beatStats = {};
  
  // Initialize beat stats
  for (const beat of beats) {
    beatStats[beat.name] = {
      movement: beat.movement,
      handlerCount: 0,
      handlers: []
    };
  }
  
  // Map each handler
  for (const handler of handlers) {
    const match = matchHandlerToBeat(handler, beats);
    
    if (match.beat) {
      mapped.push({
        ...handler,
        mappedBeat: match.beat,
        movement: match.movement,
        confidence: match.confidence,
        reason: match.reason
      });
      
      beatStats[match.beat].handlerCount++;
      beatStats[match.beat].handlers.push({
        name: handler.name,
        type: handler.type,
        file: handler.file,
        confidence: match.confidence,
        reason: match.reason
      });
    } else {
      orphaned.push({
        ...handler,
        mappedBeat: null,
        reason: match.reason
      });
    }
  }
  
  // Identify beats with no handlers
  const beatsWithoutHandlers = [];
  for (const [beatName, stats] of Object.entries(beatStats)) {
    if (stats.handlerCount === 0) {
      beatsWithoutHandlers.push({
        beat: beatName,
        movement: stats.movement,
        status: 'NO_HANDLERS'
      });
    }
  }
  
  return {
    totalHandlers: handlers.length,
    mappedCount: mapped.length,
    orphanedCount: orphaned.length,
    mapped,
    orphaned,
    beatStats,
    beatsWithoutHandlers,
    source: 'measured'
  };
}

/**
 * Calculate Symphonic Health Score
 * Score measures alignment between handlers and beats
 * @param {Object} mappingResults Mapping results from mapHandlersToBeat
 * @returns {Object} Health score with components
 */
function calculateSympahonicHealthScore(mappingResults) {
  const { totalHandlers, mappedCount, orphanedCount, beatsWithoutHandlers, beatStats } = mappingResults;
  
  // Component scores (0-100)
  const handlerCoverage = totalHandlers > 0 ? (mappedCount / totalHandlers) * 100 : 0;
  const beatCoverage = Object.keys(beatStats).length > 0 
    ? ((Object.keys(beatStats).length - beatsWithoutHandlers.length) / Object.keys(beatStats).length) * 100 
    : 0;
  
  // Calculate average confidence of mappings
  const avgConfidence = mappedCount > 0
    ? (mappingResults.mapped.reduce((sum, h) => sum + h.confidence, 0) / mappedCount) * 100
    : 0;
  
  // Distribution evenness (prefer even distribution across beats)
  const handlerCounts = Object.values(beatStats).map(b => b.handlerCount);
  const maxHandlers = Math.max(...handlerCounts, 1);
  const minHandlers = Math.min(...handlerCounts, 1);
  const distribution = maxHandlers > 0 ? (1 - (maxHandlers - minHandlers) / maxHandlers) * 100 : 0;
  
  // Overall score (weighted average)
  const overallScore = (
    handlerCoverage * 0.4 +      // 40% - coverage
    beatCoverage * 0.3 +          // 30% - beat alignment
    avgConfidence * 0.2 +          // 20% - mapping confidence
    distribution * 0.1            // 10% - distribution
  );
  
  // Determine health status
  let status = 'EXCELLENT';
  if (overallScore >= 90) status = 'EXCELLENT';
  else if (overallScore >= 75) status = 'GOOD';
  else if (overallScore >= 60) status = 'FAIR';
  else if (overallScore >= 40) status = 'POOR';
  else status = 'CRITICAL';
  
  return {
    overallScore: overallScore.toFixed(2),
    status,
    components: {
      handlerCoverage: handlerCoverage.toFixed(2),
      beatCoverage: beatCoverage.toFixed(2),
      mappingConfidence: avgConfidence.toFixed(2),
      distribution: distribution.toFixed(2)
    },
    metrics: {
      totalHandlers,
      mappedCount,
      orphanedCount,
      beatsWithHandlers: Object.values(beatStats).filter(b => b.handlerCount > 0).length,
      beatsWithoutHandlers: beatsWithoutHandlers.length
    }
  };
}

/**
 * Format health score for markdown
 * @param {Object} healthScore Health score object
 * @returns {string} Markdown formatted output
 */
function formatHealthScoreMarkdown(healthScore) {
  const { overallScore, status, components, metrics } = healthScore;
  
  const statusEmoji = {
    'EXCELLENT': '🟢',
    'GOOD': '🟢',
    'FAIR': '🟡',
    'POOR': '🟠',
    'CRITICAL': '🔴'
  };
  
  return `### Symphonic Health Score

**Overall**: ${statusEmoji[status]} **${overallScore}/100** (${status})

**Component Scores:**
| Component | Score | Target | Status |
|-----------|-------|--------|--------|
| Handler Coverage | ${components.handlerCoverage}% | 90%+ | ${parseFloat(components.handlerCoverage) >= 90 ? '✓' : '⚠'} |
| Beat Coverage | ${components.beatCoverage}% | 100% | ${parseFloat(components.beatCoverage) === 100 ? '✓' : '⚠'} |
| Mapping Confidence | ${components.mappingConfidence}% | 80%+ | ${parseFloat(components.mappingConfidence) >= 80 ? '✓' : '⚠'} |
| Distribution | ${components.distribution}% | 80%+ | ${parseFloat(components.distribution) >= 80 ? '✓' : '⚠'} |

**Metrics:**
- Mapped Handlers: ${metrics.mappedCount}/${metrics.totalHandlers}
- Orphaned Handlers: ${metrics.orphanedCount}
- Beats with Handlers: ${metrics.beatsWithHandlers}
- Beats Without Handlers: ${metrics.beatsWithoutHandlers}`;
}

module.exports = {
  loadOrchestrationBeats,
  matchHandlerToBeat,
  mapHandlersToBeat,
  calculateSympahonicHealthScore,
  formatHealthScoreMarkdown
};

// CLI execution
if (require.main === module) {
  const { scanHandlerExports } = require('./scan-handlers.cjs');
  
  (async () => {
    const handlerResults = await scanHandlerExports();
    const mappingResults = mapHandlersToBeat(handlerResults.handlers);
    const healthScore = calculateSympahonicHealthScore(mappingResults);
    
    console.log(formatHealthScoreMarkdown(healthScore));
    console.log('\n\n=== Detailed Mapping ===\n');
    console.log(JSON.stringify(mappingResults, null, 2));
    console.log('\n\n=== Health Score ===\n');
    console.log(JSON.stringify(healthScore, null, 2));
  })();
}
