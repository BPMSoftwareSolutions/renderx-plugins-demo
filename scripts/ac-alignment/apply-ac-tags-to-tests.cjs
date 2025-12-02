#!/usr/bin/env node
/**
 * Apply AC tags to individual it() blocks based on suggestions
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SUG_FILE = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');

function applyACTagsToTests() {
  const suggestions = JSON.parse(fs.readFileSync(SUG_FILE, 'utf8'));
  let testsModified = 0;
  let filesModified = 0;
  
  Object.entries(suggestions.suggestions || {}).forEach(([file, tags]) => {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Tag up to 3 it() blocks per file with different AC tags
    tags.slice(0, 3).forEach((tag, index) => {
      const acTag = tag.tag.match(/\[AC:[^\]]+\]/)?.[0];
      if (!acTag || content.includes(acTag)) return;
      
      // Find it() blocks that don't already have tags
      const itRegex = /(\bit\s*\(\s*)(['"`])([^'"`]+)(\2)/g;
      let matches = [];
      let match;
      
      while ((match = itRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const title = match[3];
        
        // Skip if already tagged
        if (title.includes('[AC:') || title.includes('[BEAT:')) continue;
        
        matches.push({
          index: match.index,
          fullMatch,
          head: match[1],
          quote: match[2],
          title: match[3],
          tailQuote: match[4]
        });
      }
      
      // Tag the nth untagged it() block (where n = index)
      if (matches[index]) {
        const m = matches[index];
        const tagged = `${m.head}${m.quote}${acTag} ${m.title}${m.tailQuote}`;
        content = content.replace(m.fullMatch, tagged);
        modified = true;
        testsModified++;
      }
    });
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      filesModified++;
      console.log(`Tagged ${file}`);
    }
  });
  
  console.log(`\nModified ${filesModified} files`);
  console.log(`Tagged ${testsModified} individual test cases`);
  return { filesModified, testsModified };
}

if (require.main === module) applyACTagsToTests();
module.exports = { applyACTagsToTests };
