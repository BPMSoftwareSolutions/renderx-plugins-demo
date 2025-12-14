#!/usr/bin/env node
/**
 * Batch Tag Tests by Beat Mapping
 * Intelligently maps test files to beats based on content analysis
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', 'renderx-web-orchestration.registry.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'batch-suggestions.json');

// Beat-to-Test mapping based on file names and content keywords
const BEAT_MAPPINGS = {
  'resolve-theme': ['theme-toggle', 'theme', 'dark-mode'],
  'apply-theme': ['theme', 'styling'],
  'init-control-panel': ['control-panel', 'config'],
  'init-resolver': ['resolver', 'init'],
  'render-template-preview': ['render', 'template', 'preview'],
  'show-selection-overlay': ['select', 'overlay', 'selection'],
  'hide-selection-overlay': ['select', 'overlay', 'hide'],
  'ensure-line-overlay': ['overlay', 'line'],
  'compute-cursor-offsets': ['cursor', 'offset'],
  'register-observers': ['observer', 'watch'],
  'export-gif': ['export', 'gif'],
  'export-mp4': ['export', 'mp4', 'video'],
  'notify-ready': ['ready', 'notification'],
  'notify-ui': ['notify', 'ui'],
  'generate-ac-registry': ['registry', 'ac', 'generation'],
  'collect-vitest-jest': ['vitest', 'jest', 'collect'],
  'collect-cypress': ['cypress', 'e2e'],
  'suggest-tags': ['suggest', 'tag'],
  'apply-tags': ['apply', 'tag'],
  'compute-presence-coverage': ['coverage', 'presence'],
  'emit-artifacts': ['artifact', 'emit'],
  'enforce-thresholds': ['threshold', 'enforce']
};

function findBestBeatForTest(fileName, content) {
  const lower = fileName.toLowerCase() + ' ' + content.toLowerCase();
  let bestBeat = null;
  let bestScore = 0;
  
  for (const [beat, keywords] of Object.entries(BEAT_MAPPINGS)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) score += 10;
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestBeat = beat;
    }
  }
  
  return { beat: bestBeat, score: bestScore };
}

function generateBatchSuggestions() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const acs = registry.acs || [];
  
  // Group ACs by beat
  const beatToACs = {};
  acs.forEach(ac => {
    const key = ac.beatName;
    if (!beatToACs[key]) beatToACs[key] = [];
    beatToACs[key].push(ac);
  });
  
  // Find relevant test files
  const testFiles = [
    'tests/react-component-theme-toggle.spec.ts',
    'tests/react-component-theme-toggle-e2e.spec.ts',
    'tests/react-component-e2e.spec.ts',
    'tests/react-component-communication.spec.ts',
    'tests/react-component-validation-e2e.spec.ts',
    'tests/select.overlay.dom.spec.ts',
    'tests/select.overlay.helpers.spec.ts',
    'tests/renderx-web-orchestration-sequences-validation.spec.ts',
    'tests/renderx-web-orchestration-conflation.spec.ts',
    'tests/no-local-control-panel-sequences.spec.ts',
    'tests/orchestration-registry-completeness.spec.ts',
    'tests/ui-event-wiring.spec.ts',
    'tests/host-sdk.v1.spec.ts',
    'tests/domain-registry-orchestration-invariants.spec.ts',
    'tests/domain-registry-orchestration-spike.spec.ts',
    'tests/musical-sequence-schema.spec.ts',
    'tests/stats-enhancements.spec.ts',
    'tests/symphonic-code-analysis-fractal.spec.ts'
  ];
  
  const suggestions = { suggestions: {} };
  let totalSuggestions = 0;
  
  testFiles.forEach(file => {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) return;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(file, '.spec.ts');
    
    const { beat, score } = findBestBeatForTest(fileName, content.substring(0, 1000));
    
    if (beat && beatToACs[beat] && score > 0) {
      const matchingACs = beatToACs[beat];
      const firstAC = matchingACs[0];
      
      if (!suggestions.suggestions[file]) {
        suggestions.suggestions[file] = [];
      }
      
      matchingACs.slice(0, 3).forEach(ac => {
        suggestions.suggestions[file].push({
          testTitle: 'describe block',
          tag: `[AC:${ac.acId}]`,
          beatTag: `[BEAT:renderx-web-orchestration:${ac.sequenceId}:${ac.beatId}]`,
          acId: ac.acId,
          beat: beat,
          score: score,
          confidence: score >= 20 ? 'high' : score >= 10 ? 'medium' : 'low',
          strategy: 'beat-mapping'
        });
        totalSuggestions++;
      });
    }
  });
  
  suggestions.generatedAt = new Date().toISOString();
  suggestions.domain = 'renderx-web-orchestration';
  suggestions.totalACs = acs.length;
  suggestions.suggestionsGenerated = totalSuggestions;
  suggestions.filesAffected = Object.keys(suggestions.suggestions).length;
  suggestions.strategy = 'beat-based-batch-mapping';
  
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(suggestions, null, 2));
  
  console.log(`Generated ${totalSuggestions} suggestions`);
  console.log(`Files affected: ${suggestions.filesAffected}`);
  console.log(`Output: ${OUTPUT}`);
  
  return suggestions;
}

if (require.main === module) generateBatchSuggestions();
module.exports = { generateBatchSuggestions };
