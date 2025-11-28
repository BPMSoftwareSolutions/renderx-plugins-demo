#!/usr/bin/env node

/**
 * Handler Export Scanner
 *
 * Scans the codebase for exported handler functions and returns
 * a measured list of discovered handlers with their locations and metadata.
 *
 * This module replaces the synthetic 1/18 handler metric with real data.
 *
 * DOMAIN AWARENESS:
 * - Reads ANALYSIS_DOMAIN_ID environment variable to determine scope
 * - Loads analysisSourcePath from DOMAIN_REGISTRY.json
 * - Only scans files within the domain-specific source path
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Load domain-specific source path from DOMAIN_REGISTRY.json
 * @returns {string} Source path for the current domain
 */
function getDomainSourcePath() {
  const domainId = process.env.ANALYSIS_DOMAIN_ID;

  // Default to packages/ if no domain specified (legacy behavior)
  if (!domainId) {
    return 'packages/';
  }

  try {
    const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
    if (!fs.existsSync(registryPath)) {
      console.warn('[scan-handlers] DOMAIN_REGISTRY.json not found, using default packages/');
      return 'packages/';
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    // Try exact match first, then search by domain_id field
    let domainConfig = registry.domains[domainId];
    if (!domainConfig) {
      domainConfig = Object.values(registry.domains).find(d => d.domain_id === domainId);
    }

    if (domainConfig?.analysisConfig?.analysisSourcePath) {
      const sourcePath = domainConfig.analysisConfig.analysisSourcePath;
      console.log(`[scan-handlers] Using domain source path: ${sourcePath} (domain: ${domainId})`);
      return sourcePath;
    }

    console.warn(`[scan-handlers] Domain '${domainId}' not found in registry, using default packages/`);
    return 'packages/';
  } catch (err) {
    console.warn(`[scan-handlers] Error loading domain config: ${err.message}, using default packages/`);
    return 'packages/';
  }
}

/**
 * Scan for handler exports in TypeScript and JavaScript files
 * @returns {Object} Handler scan results with source:'measured'
 */
async function scanHandlerExports() {
  const handlers = [];

  try {
    // Get domain-specific source path from DOMAIN_REGISTRY.json
    const domainSourcePath = getDomainSourcePath();

    // Build source patterns based on domain source path
    // Handle both 'packages/' style and 'scripts/' style paths
    const sourcePatterns = domainSourcePath.startsWith('packages')
      ? [
          `${domainSourcePath}*/src/**/*.ts`,
          `${domainSourcePath}*/src/**/*.tsx`,
          `${domainSourcePath}*/src/**/*.js`,
          `${domainSourcePath}*/src/**/*.jsx`,
          `!${domainSourcePath}**/node_modules/**`,
          `!${domainSourcePath}**/*.d.ts`,
          '!**/.generated/**'
        ]
      : [
          `${domainSourcePath}**/*.ts`,
          `${domainSourcePath}**/*.js`,
          `${domainSourcePath}**/*.cjs`,
          `${domainSourcePath}**/*.mjs`,
          `!${domainSourcePath}**/node_modules/**`,
          `!${domainSourcePath}**/*.d.ts`,
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
            
            // Skip if no capturing group (e.g., first pattern which just finds "handlers" object)
            if (!handlerName) {
              continue;
            }
            
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
