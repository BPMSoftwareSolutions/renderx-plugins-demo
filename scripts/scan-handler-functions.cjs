#!/usr/bin/env node

/**
 * Enhanced Handler Function Extractor
 * 
 * Extracts individual handler functions from handler exports.
 * Discovers both:
 * 1. Functions named "*handler*"
 * 2. Functions listed in "export const handlers = { func1, func2, ... }"
 * 
 * This provides true handler granularity (65 functions vs 38 exports).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Extract individual functions from a handler export object
 * @param {string} file File path
 * @param {number} exportLine Line where "export const handlers" appears
 * @returns {Array} Array of extracted functions
 */
function extractFunctionsFromExport(file, exportLine) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    // Find the line with "export const handlers"
    let startIdx = -1;
    for (let i = exportLine - 1; i < lines.length; i++) {
      if (lines[i].includes('export const handlers') && lines[i].includes('=')) {
        startIdx = i;
        break;
      }
    }
    
    if (startIdx === -1) return [];
    
    // Extract from opening brace to closing brace
    let braceCount = 0;
    let found = false;
    let functionNames = [];
    let buffer = '';
    
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '{') {
          braceCount++;
          found = true;
        } else if (char === '}') {
          braceCount--;
          if (found && braceCount === 0) {
            // End of export block
            functionNames = extractFunctionNames(buffer);
            return functionNames.map(name => ({
              name: name.trim(),
              exportLine,
              file
            }));
          }
        } else if (found) {
          buffer += char;
        }
      }
      buffer += '\n';
    }
  } catch (err) {
    // Silent fail
  }
  
  return [];
}

/**
 * Extract function names from handler export content
 * @param {string} content Export content (between braces)
 * @returns {Array} Array of function names
 */
function extractFunctionNames(content) {
  // Split by comma and extract identifiers
  const parts = content.split(',');
  const names = [];
  
  for (const part of parts) {
    // Match identifier: word characters only
    const match = part.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/);
    if (match && match[1]) {
      names.push(match[1]);
    }
  }
  
  return names;
}

/**
 * Scan for all handler exports and extract individual functions
 * @returns {Object} Handler extraction results
 */
async function scanHandlerFunctions() {
  const handlers = [];
  const exportObjects = [];
  
  try {
    // Get all source files
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

    // Pattern to find "export const handlers = { ... }"
    const handlerExportPattern = /export\s+const\s+handlers\s*=\s*\{/;

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          if (handlerExportPattern.test(lines[i])) {
            // Found an export, extract functions
            const lineNumber = i + 1;
            const extractedFunctions = extractFunctionsFromExport(file, lineNumber);
            
            if (extractedFunctions.length > 0) {
              // Record the export object
              exportObjects.push({
                file,
                line: lineNumber,
                functionCount: extractedFunctions.length
              });
              
              // Add each function as a handler
              for (const func of extractedFunctions) {
                handlers.push({
                  name: func.name,
                  file,
                  source: 'measured',
                  type: deriveHandlerType(func.name),
                  line: lineNumber,  // Line of the export (can find function definition)
                  sourceType: 'export-object',
                  exportLine: lineNumber
                });
              }
            }
          }
        }
      } catch (err) {
        // Skip files that can't be read
      }
    }

    // Also scan for individual functions named *handler*
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Pattern: function name containing "handler" (but not in exports we already have)
        const functionPatterns = [
          /(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+(\w*[Hh]andler\w*)\s*\(/g,
          /(?:^|\n)\s*(?:export\s+)?const\s+(\w*[Hh]andler\w*)\s*=\s*(?:async\s+)?\(/g,
          /(?:^|\n)\s*(?:export\s+)?const\s+(\w*[Hh]andler\w*)\s*=\s*(?:async\s+)?\w+\s*=>/g
        ];
        
        for (const pattern of functionPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const handlerName = match[1];
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
                line: lineNumber,
                sourceType: 'named-function'
              });
            }
          }
        }
      } catch (err) {
        // Skip
      }
    }

    // Remove duplicates and sort
    const uniqueHandlers = Array.from(
      new Map(handlers.map(h => [h.name + ':' + h.file, h])).values()
    );
    
    uniqueHandlers.sort((a, b) => {
      const fileCompare = a.file.localeCompare(b.file);
      return fileCompare !== 0 ? fileCompare : a.name.localeCompare(b.name);
    });

    return {
      discoveredCount: uniqueHandlers.length,
      handlers: uniqueHandlers,
      exportObjects: exportObjects.length,
      source: 'measured',
      timestamp: new Date().toISOString(),
      granularity: 'function-level',
      summary: {
        totalHandlers: uniqueHandlers.length,
        fromExports: handlers.filter(h => h.sourceType === 'export-object').length,
        namedFunctions: handlers.filter(h => h.sourceType === 'named-function').length,
        exportObjectCount: exportObjects.length
      }
    };

  } catch (err) {
    console.error('Handler extraction error:', err.message);
    return {
      discoveredCount: 0,
      handlers: [],
      source: 'measured',
      error: err.message,
      granularity: 'function-level'
    };
  }
}

/**
 * Derive handler type from naming convention
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
  if (lower.includes('attach') || lower.includes('overlay') || lower.includes('show') || lower.includes('hide')) {
    return 'ui-interaction';
  }
  if (lower.includes('listener') || lower.includes('observer') || lower.includes('subscribe')) {
    return 'event';
  }
  if (lower.includes('start') || lower.includes('end') || lower.includes('update')) {
    return 'state-management';
  }
  if (lower.includes('notify') || lower.includes('publish') || lower.includes('route')) {
    return 'communication';
  }
  
  return 'generic';
}

/**
 * Get statistics about extracted handlers
 */
function getExtractionStats(results) {
  const stats = {
    byType: {},
    byFile: {},
    bySourceType: {}
  };
  
  results.handlers.forEach(h => {
    // By type
    stats.byType[h.type] = (stats.byType[h.type] || 0) + 1;
    
    // By file
    const fileName = path.basename(h.file);
    stats.byFile[fileName] = (stats.byFile[fileName] || 0) + 1;
    
    // By source type
    stats.bySourceType[h.sourceType] = (stats.bySourceType[h.sourceType] || 0) + 1;
  });
  
  return stats;
}

module.exports = {
  scanHandlerFunctions,
  extractFunctionsFromExport,
  extractFunctionNames,
  deriveHandlerType,
  getExtractionStats
};

// CLI execution
if (require.main === module) {
  (async () => {
    const results = await scanHandlerFunctions();
    console.log(JSON.stringify(results, null, 2));
  })();
}
