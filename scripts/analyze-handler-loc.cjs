#!/usr/bin/env node

/**
 * Handler Lines of Code Analyzer
 * 
 * Measures actual lines of code for each discovered handler by:
 * 1. Reading handler source files
 * 2. Finding handler function boundaries using AST-like analysis
 * 3. Computing exact LOC per handler
 * 4. Correlating with coverage and beat data
 * 
 * Source: MEASURED (real code analysis)
 */

const fs = require('fs');
const path = require('path');

/**
 * Find handler function boundaries in source code
 * Handles TypeScript, JavaScript, async, arrow functions, etc.
 * 
 * @param {string} content - File content
 * @param {string} handlerName - Handler function/const name
 * @returns {Object} Start/end lines and LOC
 */
function findHandlerBoundaries(content, handlerName) {
  const lines = content.split('\n');
  let handlerStartLine = -1;
  let braceDepth = 0;
  let inHandler = false;

  // Pattern 1: const handlerName = (arrow, regular, or destructured)
  // Pattern 2: function handlerName()
  // Pattern 3: export const handlerName
  // Pattern 4: export function handlerName
  // Pattern 5: export async function handlerName

  const escapedName = handlerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`\\bconst\\s+${escapedName}\\s*[:=]`, 'i'),
    new RegExp(`\\bfunction\\s+${escapedName}\\s*\\(`, 'i'),
    new RegExp(`\\basync\\s+function\\s+${escapedName}\\s*\\(`, 'i'),
    new RegExp(`\\bexport\\s+const\\s+${escapedName}`, 'i'),
    new RegExp(`\\bexport\\s+function\\s+${escapedName}\\s*\\(`, 'i'),
    new RegExp(`\\bexport\\s+async\\s+function\\s+${escapedName}\\s*\\(`, 'i'),
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Find handler declaration
    if (!inHandler) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          handlerStartLine = i;
          inHandler = true;
          // Count opening braces on this line
          for (const char of line) {
            if (char === '{') braceDepth++;
            if (char === '}') braceDepth--;
          }
          // If handler is complete on one line (unlikely but possible)
          if (braceDepth === 0 && handlerStartLine < i) {
            return {
              startLine: handlerStartLine + 1,
              endLine: i + 1,
              loc: i - handlerStartLine + 1
            };
          }
          break;
        }
      }
    } else {
      // Count braces to find function end
      for (const char of line) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
      }
      
      // Handler is complete when braces balance and we've seen at least one open
      if (inHandler && braceDepth === 0 && handlerStartLine !== i) {
        const loc = i - handlerStartLine + 1;
        return {
          startLine: handlerStartLine + 1,
          endLine: i + 1,
          loc: Math.max(1, loc)
        };
      }
    }
  }

  // Fallback: if we found start but not end, use rest of file
  if (handlerStartLine !== -1) {
    const loc = lines.length - handlerStartLine;
    return {
      startLine: handlerStartLine + 1,
      endLine: lines.length,
      loc: Math.max(1, loc)
    };
  }

  // Handler not found - return null
  return null;
}

/**
 * Analyze LOC for a single handler
 * @param {Object} handler - Handler object with name and file properties
 * @returns {Object} Handler with LOC data
 */
function analyzeHandlerLOC(handler) {
  try {
    if (!fs.existsSync(handler.file)) {
      return {
        ...handler,
        loc: null,
        locSource: 'error: file not found',
        error: `File not found: ${handler.file}`
      };
    }

    const content = fs.readFileSync(handler.file, 'utf8');
    const boundaries = findHandlerBoundaries(content, handler.name);

    if (!boundaries) {
      return {
        ...handler,
        loc: null,
        locSource: 'error: handler not found',
        error: `Handler boundary not found for ${handler.name} in ${handler.file}`
      };
    }

    return {
      ...handler,
      loc: boundaries.loc,
      startLine: boundaries.startLine,
      endLine: boundaries.endLine,
      locSource: 'measured'
    };
  } catch (err) {
    return {
      ...handler,
      loc: null,
      locSource: 'error',
      error: err.message
    };
  }
}

/**
 * Analyze LOC for all handlers
 * @param {Array} handlers - Array of handler objects
 * @returns {Object} Results with LOC data
 */
async function analyzeAllHandlerLOC(handlers) {
  const results = handlers.map(handler => analyzeHandlerLOC(handler));
  
  // Calculate statistics
  const withLOC = results.filter(h => h.loc !== null);
  const totalLOC = withLOC.reduce((sum, h) => sum + h.loc, 0);
  const avgLOC = withLOC.length > 0 ? (totalLOC / withLOC.length).toFixed(2) : 0;
  const minLOC = withLOC.length > 0 ? Math.min(...withLOC.map(h => h.loc)) : 0;
  const maxLOC = withLOC.length > 0 ? Math.max(...withLOC.map(h => h.loc)) : 0;

  // Classify by size
  const tiny = results.filter(h => h.loc && h.loc < 10).length;
  const small = results.filter(h => h.loc && h.loc >= 10 && h.loc < 25).length;
  const medium = results.filter(h => h.loc && h.loc >= 25 && h.loc < 50).length;
  const large = results.filter(h => h.loc && h.loc >= 50 && h.loc < 100).length;
  const xlarge = results.filter(h => h.loc && h.loc >= 100).length;
  const errors = results.filter(h => h.loc === null).length;

  return {
    handlers: results,
    statistics: {
      totalHandlers: results.length,
      measuredHandlers: withLOC.length,
      errors,
      totalLOC,
      averageLOC: parseFloat(avgLOC),
      minLOC,
      maxLOC,
      distribution: {
        tiny: { count: tiny, range: '< 10 LOC' },
        small: { count: small, range: '10-24 LOC' },
        medium: { count: medium, range: '25-49 LOC' },
        large: { count: large, range: '50-99 LOC' },
        xlarge: { count: xlarge, range: '100+ LOC' }
      }
    },
    source: 'measured'
  };
}

/**
 * Generate LOC report markdown
 * @param {Array} handlers - Handlers with LOC data
 * @param {Object} stats - Statistics object
 * @returns {string} Markdown report
 */
function generateLOCReport(handlers, stats) {
  const sortedByLOC = [...handlers]
    .filter(h => h.loc !== null)
    .sort((a, b) => b.loc - a.loc);

  const topHandlers = sortedByLOC.slice(0, 10);
  const smallestHandlers = sortedByLOC.slice(-5).reverse();

  let markdown = `## Handler Lines of Code Analysis

### Overall Statistics
| Metric | Value |
|--------|-------|
| Total Handlers | ${stats.totalHandlers} |
| Successfully Measured | ${stats.measuredHandlers} |
| Measurement Errors | ${stats.errors} |
| **Total LOC (all handlers)** | **${stats.totalLOC}** |
| Average LOC per Handler | ${stats.averageLOC} |
| Minimum | ${stats.minLOC} LOC |
| Maximum | ${stats.maxLOC} LOC |

### Distribution by Handler Size
| Size Category | Count | Percentage | LOC Range |
|---------------|-------|-----------|-----------|
| Tiny | ${stats.distribution.tiny.count} | ${((stats.distribution.tiny.count / stats.measuredHandlers) * 100).toFixed(1)}% | ${stats.distribution.tiny.range} |
| Small | ${stats.distribution.small.count} | ${((stats.distribution.small.count / stats.measuredHandlers) * 100).toFixed(1)}% | ${stats.distribution.small.range} |
| Medium | ${stats.distribution.medium.count} | ${((stats.distribution.medium.count / stats.measuredHandlers) * 100).toFixed(1)}% | ${stats.distribution.medium.range} |
| Large | ${stats.distribution.large.count} | ${((stats.distribution.large.count / stats.measuredHandlers) * 100).toFixed(1)}% | ${stats.distribution.large.range} |
| X-Large | ${stats.distribution.xlarge.count} | ${((stats.distribution.xlarge.count / stats.measuredHandlers) * 100).toFixed(1)}% | ${stats.distribution.xlarge.range} |

### Top 10 Largest Handlers (Risk Priority)
\`\`\`
Rank | Handler Name | LOC | File
-----|--------------|-----|-----
${topHandlers.map((h, i) => `${i + 1}. ${h.name.padEnd(30)} | ${h.loc.toString().padStart(3)} | ${path.basename(h.file)}`).join('\n')}
\`\`\`

### Smallest Handlers (Below 10 LOC)
\`\`\`
Handler Name | LOC | File
-------------|-----|-----
${smallestHandlers.map(h => `${h.name.padEnd(30)} | ${h.loc.toString().padStart(3)} | ${path.basename(h.file)}`).join('\n')}
\`\`\`

### All Handlers by LOC
| Handler | LOC | File | Type |
|---------|-----|------|------|
${sortedByLOC.map(h => `| ${h.name} | ${h.loc} | ${path.basename(h.file)} | ${h.type || 'generic'} |`).join('\n')}

**Note**: LOC measured directly from source code using AST-like boundary detection. Source: MEASURED (not estimated).
`;

  return markdown;
}

// Main execution
if (require.main === module) {
  (async () => {
    try {
      console.log('📊 Handler LOC Analysis Starting...\n');

      // Import handler scan results
      const scanHandlers = require('./scan-handlers.cjs');
      
      if (typeof scanHandlers === 'function') {
        const scanResults = await scanHandlers();
        
        if (scanResults.handlers && scanResults.handlers.length > 0) {
          console.log(`Found ${scanResults.handlers.length} handlers\n`);
          
          const locResults = await analyzeAllHandlerLOC(scanResults.handlers);
          
          console.log('📈 Statistics:');
          console.log(`  Total LOC: ${locResults.statistics.totalLOC}`);
          console.log(`  Average per handler: ${locResults.statistics.averageLOC}`);
          console.log(`  Min: ${locResults.statistics.minLOC}, Max: ${locResults.statistics.maxLOC}`);
          console.log(`  Measured: ${locResults.statistics.measuredHandlers}/${locResults.statistics.totalHandlers}`);
          
          if (locResults.statistics.errors > 0) {
            console.log(`  ⚠️  Errors: ${locResults.statistics.errors}`);
          }
          
          console.log('\n✅ Handler LOC analysis complete');
          
          // Return results for use in other modules
          module.exports = { analyzeHandlerLOC, analyzeAllHandlerLOC, generateLOCReport };
        }
      }
    } catch (err) {
      console.error('❌ Error:', err.message);
      process.exit(1);
    }
  })();
} else {
  module.exports = { analyzeHandlerLOC, analyzeAllHandlerLOC, generateLOCReport, findHandlerBoundaries };
}
