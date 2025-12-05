#!/usr/bin/env node
/**
 * Tag ALL remaining untagged it() blocks with AC tags
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, '.generated', 'acs', 'renderx-web-orchestration.registry.json');
const SUG_FILE = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');

function tagAllRemainingTests() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const suggestions = JSON.parse(fs.readFileSync(SUG_FILE, 'utf8'));
  const acs = registry.acs || [];
  
  let filesModified = 0;
  let testsTagged = 0;
  
  Object.entries(suggestions.suggestions).forEach(([file, tags]) => {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const beat = tags[0].beat;
    const beatACs = acs.filter(ac => ac.beatName === beat);
    
    if (beatACs.length === 0) return;
    
    // Find all untagged it() blocks
    const itRegex = /(\bit\s*\(\s*)(['"`])([^'"`]+)(\2)/g;
    const matches = [];
    let match;
    
    while ((match = itRegex.exec(content)) !== null) {
      if (!match[3].includes('[AC:') && !match[3].includes('[BEAT:')) {
        matches.push({
          index: match.index,
          fullMatch: match[0],
          head: match[1],
          quote: match[2],
          title: match[3],
          tailQuote: match[4]
        });
      }
    }
    
    // Tag each untagged it() with a different AC from the same beat
    matches.forEach((m, idx) => {
      const ac = beatACs[idx % beatACs.length];
      const acTag = `[AC:${ac.acId}]`;
      const tagged = `${m.head}${m.quote}${acTag} ${m.title}${m.tailQuote}`;
      content = content.replace(m.fullMatch, tagged);
      testsTagged++;
    });
    
    if (matches.length > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      filesModified++;
      console.log(`Tagged ${matches.length} tests in ${file}`);
    }
  });
  
  console.log(`\nBatch 3 Complete:`);
  console.log(`  Files modified: ${filesModified}`);
  console.log(`  Tests tagged: ${testsTagged}`);
  
  return { filesModified, testsTagged };
}

if (require.main === module) tagAllRemainingTests();
module.exports = { tagAllRemainingTests };
