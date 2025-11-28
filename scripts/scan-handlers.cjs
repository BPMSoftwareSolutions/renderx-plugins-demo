#!/usr/bin/env node

/**
 * Handler Export Scanner
 * 
 * Scans the codebase for exported handler functions and returns
 * a measured list of discovered handlers with their locations and metadata.
 * 
 * This module replaces the synthetic 1/18 handler metric with real data.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Scan for handler exports in TypeScript and JavaScript files
 * @returns {Object} Handler scan results with source:'measured'
 */
async function scanHandlerExports() {
  const handlers = [];
  
  try {
    // Get all source files matching patterns
    const sourcePatterns = [
      'packages/*/src/**/*.ts',
      'packages/*/src/**/*.tsx',
      'packages/*/src/**/*.js',
      'packages/*/src/**/*.jsx',
      '!packages/**/node_modules/**',
      '!packages/**/*.d.ts',
      '!**/.generated/**'
    ];

    const files = execSync(`git ls-files ${sourcePatterns.join(' ')}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).split('\n').filter(f => f);

    // Patterns to match all exported functions (not just "handler" naming)
    const handlerPatterns = [
      // Match: export const handlers = { ... } and extract the object
      /export\s+const\s+handlers\s*=/g,
      // Match: export const functionName = (async)? (args) => { ... }
      /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      // Match: export function functionName(...)
      /export\s+(?:async\s+)?function\s+(\w+)\s*\(/g,
      // Match: export const functionName: FunctionType = ...
      /export\s+const\s+(\w+)\s*:\s*[A-Z]\w*\s*=/g,
      // Legacy handler-specific patterns for backward compatibility
      /export\s+const\s+(\w*[Hh]andler\w*)\s*[=:]/g
    ];

    // Scan each file for handler exports
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        // Find all handler matches
        for (const pattern of handlerPatterns) {
          let match;
          let searchStart = 0;
          
          while ((match = pattern.exec(content)) !== null) {
            const handlerName = match[1];
            
            // Find line number by counting newlines up to match position
            const beforeMatch = content.substring(0, match.index);
            const lineNumber = beforeMatch.split('\n').length;
            
            // Avoid duplicates
            const isDuplicate = handlers.some(
              h => h.name === handlerName && h.file === file
            );
            
            if (!isDuplicate) {
              handlers.push({
                name: handlerName,
                file,
                source: 'measured',
                type: deriveHandlerType(handlerName),
                line: lineNumber  // Add line number for LOC analysis
              });
            }
          }
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }

    // Sort by file and name
    handlers.sort((a, b) => {
      const fileCompare = a.file.localeCompare(b.file);
      return fileCompare !== 0 ? fileCompare : a.name.localeCompare(b.name);
    });

    return {
      discoveredCount: handlers.length,
      handlers,
      source: 'measured',
      timestamp: new Date().toISOString(),
      scanPatterns: handlerPatterns.map(p => p.toString())
    };

  } catch (err) {
    console.error('Handler scan error:', err.message);
    return {
      discoveredCount: 0,
      handlers: [],
      source: 'measured',
      error: err.message
    };
  }
}

/**
 * Derive handler type from naming convention
 * @param {string} name Handler name
 * @returns {string} Handler type classification
 */
function deriveHandlerType(name) {
  const lower = name.toLowerCase();
  
  if (lower.includes('create') || lower.includes('init') || lower.includes('setup')) {
    return 'initialization';
  }
  if (lower.includes('validate') || lower.includes('check') || lower.includes('verify')) {
    return 'validation';
  }
  if (lower.includes('transform') || lower.includes('convert') || lower.includes('map')) {
    return 'transformation';
  }
  if (lower.includes('export') || lower.includes('generate') || lower.includes('write')) {
    return 'output';
  }
  if (lower.includes('load') || lower.includes('read') || lower.includes('fetch')) {
    return 'input';
  }
  if (lower.includes('execute') || lower.includes('run') || lower.includes('process')) {
    return 'execution';
  }
  if (lower.includes('error') || lower.includes('exception') || lower.includes('recover')) {
    return 'error-handling';
  }
  if (lower.includes('stage') || lower.includes('crew') || lower.includes('overlay')) {
    return 'ui-interaction';
  }
  if (lower.includes('listener') || lower.includes('observer') || lower.includes('subscribe')) {
    return 'event';
  }
  
  return 'generic';
}

/**
 * Get handler statistics by type
 * @param {Array} handlers Handler list
 * @returns {Object} Statistics by type
 */
function getHandlerStats(handlers) {
  const stats = {};
  
  handlers.forEach(h => {
    if (!stats[h.type]) {
      stats[h.type] = 0;
    }
    stats[h.type]++;
  });
  
  return stats;
}

/**
 * Format handler metrics for markdown
 * @param {Object} scanResults Handler scan results
 * @returns {string} Markdown formatted output
 */
function formatHandlersMarkdown(scanResults) {
  const { discoveredCount, handlers } = scanResults;
  
  if (discoveredCount === 0) {
    return '⚠ No handler exports discovered in scan.';
  }
  
  const stats = getHandlerStats(handlers);
  const typesList = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `  * ${type}: ${count}`)
    .join('\n');
  
  const topHandlers = handlers.slice(0, 5)
    .map(h => `  * ${h.name} (${h.type}) — ${h.file}`)
    .join('\n');

  return `✅ **${discoveredCount} handlers discovered**

**By Type:**
${typesList}

**Top Handlers:**
${topHandlers}${handlers.length > 5 ? `\n  * ... and ${handlers.length - 5} more` : ''}`;
}

module.exports = {
  scanHandlerExports,
  deriveHandlerType,
  getHandlerStats,
  formatHandlersMarkdown
};

// CLI execution
if (require.main === module) {
  (async () => {
    const results = await scanHandlerExports();
    console.log(JSON.stringify(results, null, 2));
  })();
}
