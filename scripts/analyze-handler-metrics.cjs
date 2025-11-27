#!/usr/bin/env node

/**
 * Enhanced Symphonic Code Analysis with Handler-Level Metrics
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_DIR = path.join(process.cwd(), '.generated', 'analysis');
const DOCS_DIR = path.join(process.cwd(), 'docs', 'generated', 'symphonic-code-analysis-pipeline');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

const log = (msg, icon = '  ') => console.log(`${icon} ${msg}`);
const header = (title) => console.log(`\n╔═══════════════════════════════════════════════════════════════╗\n║ ${title.padEnd(61)} ║\n╚═══════════════════════════════════════════════════════════════╝\n`);

// Load orchestration registry
function loadOrchestrationRegistry() {
  log('Loading orchestration registry...', '📦');
  
  const registryPath = path.join(process.cwd(), 'orchestration-domains.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  
  log(`Loaded ${registry.length} domains`, '✓');
  return registry;
}

// Extract handlers from orchestrations
function extractHandlersFromRegistry(registry) {
  log('Extracting handler definitions from orchestrations...', '🔍');
  
  const handlerMap = {};
  let totalHandlers = 0;

  const orchestrationIds = [
    'symphonic-code-analysis-pipeline',
    'safe-continuous-delivery-pipeline',
    'orchestration-registry-audit-pipeline',
    'architecture-governance-enforcement-symphony'
  ];

  orchestrationIds.forEach(orchId => {
    const orchDir = path.join(process.cwd(), 'packages', 'orchestration', 'json-sequences');
    const orchFile = path.join(orchDir, `${orchId}.json`);
    
    if (fs.existsSync(orchFile)) {
      try {
        const orch = JSON.parse(fs.readFileSync(orchFile, 'utf8'));
        
        if (orch.handlers && Array.isArray(orch.handlers)) {
          orch.handlers.forEach(handler => {
            const handlerId = handler.id || handler.name;
            handlerMap[handlerId] = {
              id: handlerId,
              name: handler.name,
              orchestration: orchId,
              type: handler.type || 'unknown',
              description: handler.description || '',
              script: handler.script || null,
              framework: handler.framework || null
            };
            totalHandlers++;
          });
        }
      } catch (e) {
        // Skip invalid files
      }
    }
  });

  log(`Extracted ${totalHandlers} handler definitions`, '✓');
  return handlerMap;
}

// Calculate handler metrics
function calculateHandlerMetrics(handlerMap) {
  log('Calculating per-handler metrics...', '📊');
  
  const metrics = {};
  let analyzedCount = 0;

  Object.entries(handlerMap).forEach(([handlerId, handler]) => {
    // Common patterns for handler file locations
    const possiblePaths = [
      path.join(process.cwd(), 'scripts', `${handlerId}.js`),
      path.join(process.cwd(), 'scripts', `${handlerId}.cjs`),
      path.join(process.cwd(), 'scripts', `${handlerId}.ts`)
    ];

    let found = false;
    let filePath = null;
    let loc = 0;
    let complexity = 0;
    let fileSize = 0;
    let patterns = { functions: 0, conditionals: 0, loops: 0, asyncOps: 0 };

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        found = true;
        filePath = testPath;
        try {
          const content = fs.readFileSync(testPath, 'utf8');
          const lines = content.split('\n');
          
          loc = lines.filter(l => {
            const trimmed = l.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
          }).length;

          patterns = {
            functions: (content.match(/function|const.*=.*=>|async/g) || []).length,
            conditionals: (content.match(/if|else|switch|case/g) || []).length,
            loops: (content.match(/for|while|forEach/g) || []).length,
            asyncOps: (content.match(/await|Promise|async/g) || []).length
          };

          complexity = (
            (patterns.functions * 0.3) +
            (patterns.conditionals * 0.3) +
            (patterns.loops * 0.2) +
            (patterns.asyncOps * 0.2)
          ).toFixed(2);

          fileSize = content.length;
          analyzedCount++;
        } catch (e) {
          // Silently skip
        }
        break;
      }
    }

    metrics[handlerId] = {
      ...handler,
      found,
      filePath,
      loc,
      complexity: parseFloat(complexity),
      fileSize,
      patterns
    };
  });

  log(`Analyzed ${analyzedCount} handler implementations`, '✓');
  return metrics;
}

// Generate JSON artifact
function generateHandlerMetricsJson(metrics) {
  log('Generating handler metrics JSON...', '📝');
  
  const sorted = Object.entries(metrics)
    .sort((a, b) => b[1].loc - a[1].loc)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  const handlerMetricsData = {
    timestamp: new Date().toISOString(),
    codebase: 'renderx-web',
    totalHandlers: Object.keys(metrics).length,
    implementedHandlers: Object.values(metrics).filter(m => m.found).length,
    handlers: sorted,
    summary: {
      totalLoc: Object.values(metrics).reduce((sum, m) => sum + m.loc, 0),
      averageLoc: (Object.values(metrics).reduce((sum, m) => sum + m.loc, 0) / Object.keys(metrics).length).toFixed(2),
      averageComplexity: (Object.values(metrics).reduce((sum, m) => sum + m.complexity, 0) / Object.keys(metrics).length).toFixed(2),
      mostComplex: Object.entries(metrics).sort((a, b) => b[1].complexity - a[1].complexity)[0],
      largestHandler: Object.entries(metrics).sort((a, b) => b[1].loc - a[1].loc)[0]
    }
  };

  const jsonPath = path.join(ANALYSIS_DIR, `renderx-web-handler-metrics-${TIMESTAMP}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(handlerMetricsData, null, 2));
  log(`Saved: ${path.relative(process.cwd(), jsonPath)}`, '✓');

  return handlerMetricsData;
}

// Generate CSV artifact
function generateHandlerMetricsCsv(metrics) {
  log('Generating handler metrics CSV...', '📋');
  
  const csvHeader = 'Handler ID,Handler Name,Orchestration,Type,LOC,Complexity,File Size,Functions,Conditionals,Loops,Async Ops,Status\n';
  
  const csvRows = Object.entries(metrics)
    .sort((a, b) => b[1].loc - a[1].loc)
    .map(([id, m]) => {
      const status = m.found ? 'FOUND' : 'NOT_FOUND';
      const patterns = m.patterns || {};
      return `"${id}","${m.name}","${m.orchestration}","${m.type}",${m.loc},${m.complexity},${m.fileSize},${patterns.functions || 0},${patterns.conditionals || 0},${patterns.loops || 0},${patterns.asyncOps || 0},"${status}"`;
    });

  const csvContent = csvHeader + csvRows.join('\n');
  const csvPath = path.join(ANALYSIS_DIR, `renderx-web-handler-metrics-${TIMESTAMP}.csv`);
  fs.writeFileSync(csvPath, csvContent);
  log(`Saved: ${path.relative(process.cwd(), csvPath)}`, '✓');

  return csvContent;
}

// Generate markdown report
function generateHandlerMarkdownReport(metricsData, csvContent) {
  log('Generating handler metrics markdown report...', '📄');
  
  const [mostComplexId, mostComplexData] = metricsData.summary.mostComplex;
  const [largestId, largestData] = metricsData.summary.largestHandler;
  const found = metricsData.implementedHandlers;
  const notFound = metricsData.totalHandlers - metricsData.implementedHandlers;

  // Build top 10 table
  const topTen = Object.entries(metricsData.handlers)
    .slice(0, 10)
    .map((entry, idx) => {
      const [id, h] = entry;
      return `| ${idx + 1} | \`${id}\` | ${h.loc} | ${h.complexity} | ${h.patterns.functions} | ${h.type} |`;
    })
    .join('\n');

  // Build orchestration distribution
  const orchDist = [];
  Object.entries(metricsData.handlers).forEach(([id, h]) => {
    let found = false;
    for (let i = 0; i < orchDist.length; i++) {
      if (orchDist[i].orch === h.orchestration) {
        orchDist[i].handlers.push(h);
        found = true;
        break;
      }
    }
    if (!found) {
      orchDist.push({ orch: h.orchestration, handlers: [h] });
    }
  });

  const orchLines = orchDist
    .map(dist => {
      const totalLoc = dist.handlers.reduce((sum, h) => sum + h.loc, 0);
      const avgComplexity = (dist.handlers.reduce((sum, h) => sum + h.complexity, 0) / dist.handlers.length).toFixed(2);
      return `${dist.orch}: ${dist.handlers.length} handlers, ${totalLoc} LOC, avg complexity ${avgComplexity}`;
    })
    .join('\n');

  const notFoundHandlers = Object.entries(metricsData.handlers)
    .filter(([id, h]) => !h.found)
    .map(([id, h]) => `- \`${id}\` (${h.orchestration})`)
    .slice(0, 10)
    .join('\n');

  const report = `# RenderX-Web Handler Metrics Report

Generated: ${new Date().toISOString()}  
Codebase: renderx-web-orchestration  
Analysis: Handler-Level Code Metrics

## Executive Summary

Detailed analysis of handler implementations across all orchestrations.

### Handler Inventory
- Total Handlers: ${metricsData.totalHandlers}
- Implemented: ${metricsData.implementedHandlers}
- Not Found: ${notFound}

### Code Metrics
| Metric | Value |
|--------|-------|
| Total Handler LOC | ${metricsData.summary.totalLoc.toLocaleString()} |
| Average LOC per Handler | ${metricsData.summary.averageLoc} |
| Average Complexity | ${metricsData.summary.averageComplexity} |

## Top 10 Handlers by Lines of Code

| Rank | Handler | LOC | Complexity | Functions | Type |
|------|---------|-----|-----------|-----------|------|
${topTen}

## Complexity Analysis

### Most Complex Handler
- ID: ${mostComplexId}
- Name: ${mostComplexData.name}
- Complexity Score: ${mostComplexData.complexity}
- Functions: ${mostComplexData.patterns.functions}
- Conditionals: ${mostComplexData.patterns.conditionals}
- Loops: ${mostComplexData.patterns.loops}
- Async Operations: ${mostComplexData.patterns.asyncOps}

### Largest Handler
- ID: ${largestId}
- Name: ${largestData.name}
- Lines of Code: ${largestData.loc}
- File Size: ${(largestData.fileSize / 1024).toFixed(2)} KB
- Complexity Score: ${largestData.complexity}

## Handler Distribution by Orchestration

\`\`\`
${orchLines}
\`\`\`

## Implementation Status

### Found (${found})
Handlers with identified implementation files:
- Successfully analyzed and metrics calculated
- LOC and complexity scores available

### Not Found (${notFound})
Handlers without implementation files (first 10):
${notFoundHandlers}

## Recommendations

1. Refactor Complex Handlers: ${mostComplexData.name} (complexity: ${mostComplexData.complexity}) should be reviewed for refactoring.
2. Monitor Large Handlers: ${largestData.name} (${largestData.loc} LOC) may benefit from decomposition.
3. Find Missing Implementations: ${notFound} handlers lack implementation files - investigate if these are external or need implementation.

Report auto-generated from symphonic-code-analysis-pipeline handler analysis.
`;

  const reportPath = path.join(DOCS_DIR, `renderx-web-HANDLER-METRICS-REPORT.md`);
  fs.writeFileSync(reportPath, report);
  log(`Saved: ${path.relative(process.cwd(), reportPath)}`, '✓');

  return report;
}

// Main execution
async function run() {
  header('HANDLER METRICS ANALYSIS - RENDERX-WEB');

  try {
    const registry = loadOrchestrationRegistry();
    const handlerMap = extractHandlersFromRegistry(registry);
    const metrics = calculateHandlerMetrics(handlerMap);
    
    log('Generating analysis artifacts...', '🎬');
    const metricsData = generateHandlerMetricsJson(metrics);
    const csvContent = generateHandlerMetricsCsv(metrics);
    generateHandlerMarkdownReport(metricsData, csvContent);

    header('HANDLER ANALYSIS COMPLETE');
    log(`✓ ${metricsData.totalHandlers} handlers analyzed`, '✓');
    log(`✓ ${metricsData.implementedHandlers} implementations found`, '✓');
    log(`✓ ${metricsData.summary.totalLoc.toLocaleString()} total LOC across handlers`, '📊');
    log(`✓ Average complexity: ${metricsData.summary.averageComplexity}`, '📈');
    
    log(`\n✓ Handler metrics artifacts generated:`, '📁');
    log(`  • renderx-web-handler-metrics-${TIMESTAMP}.json`);
    log(`  • renderx-web-handler-metrics-${TIMESTAMP}.csv`);
    log(`  • renderx-web-HANDLER-METRICS-REPORT.md`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

run();
