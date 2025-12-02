#!/usr/bin/env node
/**
 * Apply BEAT tags to all describe blocks in suggested files
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SUG_FILE = path.join(ROOT, '.generated', 'ac-alignment', 'suggestions.json');

function applyBeatTagsToDescribes() {
  const suggestions = JSON.parse(fs.readFileSync(SUG_FILE, 'utf8'));
  let filesModified = 0;
  
  Object.entries(suggestions.suggestions || {}).forEach(([file, tags]) => {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const beatTag = tags[0].beatTag;
    
    if (!beatTag || content.includes(beatTag)) return;
    
    // Find first describe block and add BEAT tag
    const describeRegex = /(describe\s*\(\s*)(['"`])([^'"`]+)(\2)/;
    const match = content.match(describeRegex);
    
    if (match) {
      const [full, head, quote, title, tailQuote] = match;
      const tagged = `${head}${quote}${beatTag} ${title}${tailQuote}`;
      content = content.replace(full, tagged);
      
      fs.writeFileSync(fullPath, content, 'utf8');
      filesModified++;
      console.log(`Tagged: ${file}`);
    }
  });
  
  console.log(`\nModified ${filesModified} files with BEAT tags`);
  return filesModified;
}

if (require.main === module) applyBeatTagsToDescribes();
module.exports = { applyBeatTagsToDescribes };
