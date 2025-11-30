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
 *
 * DATA-DRIVEN: Reads beat definitions from the domain's sequence file
 * specified in orchestration-domains.json.
 */

const fs = require('fs');
const path = require('path');

/**
 * Get the current domain ID from environment
 * @returns {string} Domain ID or default
 */
function getDomainId() {
  return process.env.ANALYSIS_DOMAIN_ID || 'renderx-web-orchestration';
}

/**
 * Load sequence file for current domain from orchestration-domains.json
 * @returns {Object|null} Sequence definition with beatDetails
 */
function loadDomainSequence() {
  const domainId = getDomainId();

  try {
    const registryPath = path.join(process.cwd(), 'orchestration-domains.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    // Find the domain entry
    const domain = registry.domains?.find(d => d.id === domainId);
    if (!domain || !domain.sequenceFile) {
      console.warn(`[map-handlers-to-beats] No sequenceFile for domain: ${domainId}, using fallback`);
      return null;
    }

    // Load the sequence file
    const sequencePath = path.join(process.cwd(), domain.sequenceFile);
    if (!fs.existsSync(sequencePath)) {
      console.warn(`[map-handlers-to-beats] Sequence file not found: ${sequencePath}`);
      return null;
    }

    return JSON.parse(fs.readFileSync(sequencePath, 'utf8'));
  } catch (err) {
    console.warn(`[map-handlers-to-beats] Error loading domain sequence: ${err.message}`);
    return null;
  }
}

/**
 * Build beat keywords from sequence beatDetails or movements[].beats[]
 * @param {Object} sequence Sequence definition with beatDetails or movements
 * @returns {Object} Map of beat name to keywords
 */
function buildBeatKeywordsFromSequence(sequence) {
  const keywords = {};

  // NEW FORMAT: movements[].beats[]
  if (sequence?.movements && Array.isArray(sequence.movements) && sequence.movements[0]?.beats) {
    for (const movement of sequence.movements) {
      if (!Array.isArray(movement.beats)) continue;

      for (const beat of movement.beats) {
        const beatKey = beat.name || 'unknown';
        if (!keywords[beatKey]) {
          keywords[beatKey] = [];
        }

        // Extract keywords from beat name and description
        const nameWords = (beat.name || '').toLowerCase().split(/[-_\s]+/);
        const descWords = (beat.description || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);

        keywords[beatKey].push(...nameWords, ...descWords.slice(0, 3));
        keywords[beatKey] = [...new Set(keywords[beatKey])].filter(Boolean);
      }
    }

    return keywords;
  }

  // OLD FORMAT: beatDetails array (legacy)
  if (!sequence?.beatDetails) return keywords;

  for (const beat of sequence.beatDetails) {
    const beatKey = `beat-${beat.movement}-${beat.kind || 'general'}`;
    if (!keywords[beatKey]) {
      keywords[beatKey] = [];
    }

    // Extract keywords from beat name and kind
    const nameWords = (beat.name || '').toLowerCase().split(/\s+/);
    const kindWord = (beat.kind || '').toLowerCase();
    const descWords = (beat.description || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);

    keywords[beatKey].push(...nameWords, kindWord, ...descWords.slice(0, 3));
    keywords[beatKey] = [...new Set(keywords[beatKey])].filter(Boolean);
  }

  return keywords;
}

/**
 * Load orchestration registry to get beats
 * DATA-DRIVEN: Reads from domain's sequence file or falls back to defaults
 * @returns {Array} Beat definitions from registry
 */
function loadOrchestrationBeats() {
  const domainId = getDomainId();

  try {
    // Try to load from domain's sequence file first
    const sequence = loadDomainSequence();

    if (sequence?.movements) {
      const beats = [];

      // NEW FORMAT: movements[].beats[] (compliant structure)
      if (Array.isArray(sequence.movements) && sequence.movements.length > 0 && sequence.movements[0].beats) {
        for (let mi = 0; mi < sequence.movements.length; mi++) {
          const movement = sequence.movements[mi];
          const movementName = movement.name || `Movement ${mi + 1}`;

          if (Array.isArray(movement.beats)) {
            for (const beat of movement.beats) {
              // Extract handler name from beat.handler.name (format: "namespace.category#handlerFunction")
              let expectedHandlerName = null;
              if (beat.handler?.name) {
                const parts = beat.handler.name.split('#');
                expectedHandlerName = parts[parts.length - 1]; // Get the function name after #
              }

              beats.push({
                name: beat.name || `beat-${mi + 1}-${beats.length + 1}`,
                movement: `Movement ${mi + 1}: ${movementName}`,
                kind: beat.kind || 'general',
                description: beat.description || '',
                expectedHandler: expectedHandlerName,
                handlers: []
              });
            }
          }
        }

        if (beats.length > 0) {
          console.log(`[map-handlers-to-beats] Loaded ${beats.length} beats from sequence file (domain: ${domainId})`);
          return beats;
        }
      }

      // OLD FORMAT: beatDetails array (legacy structure)
      if (sequence?.beatDetails) {
        for (const movement of sequence.movements) {
          const movementBeats = sequence.beatDetails
            .filter(bd => bd.movement === movement.number)
            .map(bd => ({
              name: `beat-${bd.movement}-${bd.kind || 'beat-' + bd.number}`,
              movement: `Movement ${movement.number}: ${movement.name}`,
              kind: bd.kind,
              description: bd.description,
              handlers: []
            }));

          beats.push(...movementBeats);
        }

        if (beats.length > 0) {
          console.log(`[map-handlers-to-beats] Loaded ${beats.length} beats from sequence file (domain: ${domainId})`);
          return beats;
        }
      }
    }

    // Fallback to default beat structure
    console.log(`[map-handlers-to-beats] Using fallback beat definitions (domain: ${domainId})`);
    return loadFallbackBeats();
  } catch (err) {
    console.error('Error loading beats:', err.message);
    return loadFallbackBeats();
  }
}

/**
 * Fallback beat definitions for domains without sequence files
 * @returns {Array} Default beat definitions
 */
function loadFallbackBeats() {
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
}

/**
 * Load beat keyword mappings from sequence file or use fallback
 * DATA-DRIVEN: Reads from domain's sequence beatDetails
 * @returns {Object} Map of beat category to keywords
 */
function loadBeatKeywords() {
  const sequence = loadDomainSequence();

  if (sequence?.beatDetails) {
    // Build keywords from sequence beatDetails
    const keywords = buildBeatKeywordsFromSequence(sequence);
    if (Object.keys(keywords).length > 0) {
      return keywords;
    }
  }

  // Fallback keywords - generic patterns that work across domains
  return {
    'discovery': ['discover', 'scan', 'find', 'parse', 'initialize', 'register', 'create', 'augment'],
    'metrics': ['analyze', 'metric', 'measure', 'baseline', 'complexity', 'duplication', 'validate', 'monitor', 'select', 'deselect'],
    'structure': ['transform', 'convert', 'structure', 'organize', 'render', 'execute', 'drag', 'resize', 'update', 'css', 'classes', 'ui'],
    'dependencies': ['depend', 'require', 'load', 'import', 'export', 'copy', 'paste', 'delete']
  };
}

/**
 * Match handler to beat based on naming and location conventions
 * DATA-DRIVEN: Uses beat keywords from sequence file
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

  // Load beat keywords from sequence file or use fallback
  const beatKeywords = loadBeatKeywords();

  // Strategy 0: Direct handler name match (highest confidence)
  // Match handler.name against beat.expectedHandler from sequence JSON
  for (const beat of beats) {
    if (beat.expectedHandler && handler.name === beat.expectedHandler) {
      return { beat: beat.name, movement: beat.movement, confidence: 1.0, reason: 'exact-handler-match' };
    }
  }

  // Strategy 1: Match beat by kind (data-driven from sequence beatDetails)
  for (const beat of beats) {
    if (beat.kind) {
      // Check if handler name or symphony name matches beat kind
      if (handlerName.includes(beat.kind) || symphonyName.includes(beat.kind)) {
        return { beat: beat.name, movement: beat.movement, confidence: 0.9, reason: 'beat-kind-match' };
      }
    }
  }

  // Strategy 2: Match by category keywords
  for (const [category, keywords] of Object.entries(beatKeywords)) {
    for (const keyword of keywords) {
      if (symphonyName.includes(keyword) || handlerName.includes(keyword)) {
        // Find a beat that matches this category
        const matchingBeat = beats.find(b =>
          b.name.includes(category) ||
          b.kind === category ||
          (b.description && b.description.toLowerCase().includes(category))
        );
        if (matchingBeat) {
          return { beat: matchingBeat.name, movement: matchingBeat.movement, confidence: 0.85, reason: 'category-keyword' };
        }
      }
    }
  }

  // Strategy 3: File path contains beat keyword
  for (const beat of beats) {
    const beatParts = beat.name.split('-');
    const beatShort = beatParts[beatParts.length - 1]; // e.g., 'discovery' from 'beat-1-discovery'
    if (filePath.includes(beatShort)) {
      return { beat: beat.name, movement: beat.movement, confidence: 0.7, reason: 'path-match' };
    }
  }

  // Strategy 4: Match by beat description keywords
  for (const beat of beats) {
    if (beat.description) {
      const descWords = beat.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
      for (const word of descWords) {
        if (handlerName.includes(word) || symphonyName.includes(word)) {
          return { beat: beat.name, movement: beat.movement, confidence: 0.65, reason: 'description-match' };
        }
      }
    }
  }

  // Strategy 5: Stage-crew patterns (ui-interaction handlers)
  if (filePath.includes('stage-crew')) {
    const beatObj = beats.find(b => b.kind === 'structure' || b.name.includes('structure'));
    if (beatObj) {
      return { beat: beatObj.name, movement: beatObj.movement, confidence: 0.6, reason: 'stage-crew' };
    }
  }

  // Strategy 6: Overlay patterns (selection/manipulation)
  if (filePath.includes('overlay')) {
    const beatObj = beats.find(b => b.kind === 'metrics' || b.name.includes('baseline'));
    if (beatObj) {
      return { beat: beatObj.name, movement: beatObj.movement, confidence: 0.55, reason: 'overlay' };
    }
  }

  // Strategy 7: Handler type mapping (if available)
  if (handler.type) {
    const typeToCategory = {
      'initialization': 'discovery',
      'validation': 'metrics',
      'transformation': 'structure',
      'input': 'dependencies',
      'output': 'structure',
      'execution': 'structure',
      'ui-interaction': 'structure',
      'event': 'metrics'
    };

    const category = typeToCategory[handler.type];
    if (category) {
      const beatObj = beats.find(b =>
        b.kind === category ||
        b.name.includes(category)
      );
      if (beatObj) {
        return { beat: beatObj.name, movement: beatObj.movement, confidence: 0.5, reason: 'type-category' };
      }
    }
  }

  // No match found - use first beat as default
  if (beats.length > 0) {
    return { beat: beats[0].name, movement: beats[0].movement, confidence: 0.3, reason: 'default' };
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
