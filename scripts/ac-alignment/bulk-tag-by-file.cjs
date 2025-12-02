#!/usr/bin/env node
/**
 * Bulk Tag Tests by File Pattern
 * Tags entire test files based on file naming patterns and manual mapping
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', 'renderx-web-orchestration.registry.json');
const OUTPUT = path.join(ROOT, '.generated', 'ac-alignment', 'bulk-suggestions.json');

// File pattern to AC/Beat mapping
const FILE_MAPPINGS = {
  // Theme-related tests
  'theme': { beat: '1.1', acs: [1, 2, 3, 4] },
  'dark-mode': { beat: '1.1', acs: [1, 2] },
  
  // UI and rendering tests
  'ui-': { beat: '2.1', acs: [1] },
  'render': { beat: '2.1', acs: [1] },
  'react-component': { beat: '2.2', acs: [1, 2] },
  
  // Event and communication tests
  'event': { beat: '3.1', acs: [1] },
  'communication': { beat: '3.1', acs: [1] },
  'eventrouter': { beat: '3.1', acs: [1] },
  
  // Selection tests
  'select': { beat: '4.1', acs: [1] },
  'overlay': { beat: '4.2', acs: [1] },
  
  // Sequence and orchestration tests
  'sequence': { beat: '5.1', acs: [1] },
  'orchestration': { beat: '5.2', acs: [1] },
  'symphonic': { beat: '5.3', acs: [1] },
  'musical': { beat: '5.1', acs: [1] }
};

function generateBulkSuggestions() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const acs = registry.acs || [];
  
  const { execSync } = require('child_process');
  const result = execSync('npx glob "tests/**/*.spec.ts"', { 
    cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] 
  });
  
  const files = result.split('\n').filter(Boolean);
  const suggestions = {};
  let totalSuggestions = 0;
  
  files.forEach(file => {
    const fileName = path.basename(file, '.spec.ts').toLowerCase();
    
    // Find matching pattern
    for (const [pattern, mapping] of Object.entries(FILE_MAPPINGS)) {
      if (fileName.includes(pattern)) {
        const beatId = mapping.beat;
        const acIndices = mapping.acs;
        
        // Find ACs for this beat
        const matchingACs = acs.filter(ac => 
          ac.beatId === beatId && acIndices.includes(ac.acIndex)
        );
        
        if (matchingACs.length > 0) {
          const firstAC = matchingACs[0];
          const tag = `[AC:${firstAC.acId}]`;
          const beatTag = `[BEAT:renderx-web-orchestration:${firstAC.sequenceId}:${beatId}]`;
          
          if (!suggestions[file]) suggestions[file] = [];
          
          suggestions[file].push({
            pattern,
            tag,
            beatTag,
            acId: firstAC.acId,
            matchingACs: matchingACs.length,
            confidence: 'file-based'
          });
          
          totalSuggestions++;
          break;
        }
      }
    }
  });
  
  const output = {
    generatedAt: new Date().toISOString(),
    strategy: 'file-pattern-based',
    totalFiles: files.length,
    suggestionsGenerated: totalSuggestions,
    filesAffected: Object.keys(suggestions).length,
    suggestions
  };
  
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  
  console.log(`Total test files: ${files.length}`);
  console.log(`Suggestions generated: ${totalSuggestions}`);
  console.log(`Files affected: ${Object.keys(suggestions).length}`);
  console.log(`Output: ${OUTPUT}`);
  
  return output;
}

if (require.main === module) generateBulkSuggestions();
module.exports = { generateBulkSuggestions };
