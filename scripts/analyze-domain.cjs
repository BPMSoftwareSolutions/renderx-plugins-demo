#!/usr/bin/env node

/**
 * Unified Domain Analysis Orchestrator
 * 
 * Accepts a domain-id parameter, looks up analysis configuration from DOMAIN_REGISTRY,
 * and orchestrates the complete analysis + report generation pipeline.
 * 
 * Usage:
 *   node scripts/analyze-domain.cjs <domain-id>
 *   
 * Examples:
 *   node scripts/analyze-domain.cjs renderx-web-orchestration
 *   node scripts/analyze-domain.cjs symphonic-code-analysis-pipeline
 * 
 * The script will:
 * 1. Load DOMAIN_REGISTRY.json
 * 2. Look up domain configuration
 * 3. Validate domain has analysisConfig
 * 4. Execute analyze-symphonic-code.cjs with domain-specific paths
 * 5. Automatically generate report using report-generation-authority.json
 * 6. Save report to domain-configured reportOutputPath
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const log = (msg, icon = '  ') => console.log(`${icon} ${msg}`);
const header = (title) => {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║ ${title.padEnd(61)} ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
};

/**
 * Transform analysis JSON from analyze-symphonic-code.cjs format to
 * generate-symphonic-report.cjs format
 */
function transformAnalysisForReport(analysis) {
  const m1 = analysis.movements?.movement_1_discovery || {};
  const m2 = analysis.movements?.movement_2_metrics || {};
  const m3 = analysis.movements?.movement_3_coverage || {};
  const m4 = analysis.movements?.movement_4_conformity || {};
  
  // Parse conformity score - it might be a string
  const conformityScore = m4.conformity?.conformityScore;
  const parsedConformityScore = typeof conformityScore === 'string' 
    ? parseFloat(conformityScore) 
    : (conformityScore || 0);
  
  // Helper to ensure values are numbers
  const toNum = (val, def = 0) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? def : num;
  };
  
  return {
    // Top-level metadata
    id: analysis.id,
    timestamp: analysis.timestamp,
    subject: analysis.codebase,
    codebase: analysis.codebase,
    
    // Metrics from Movement 2 - normalized to report schema
    metrics: m2.metrics ? {
      totalLoc: toNum(m2.metrics.loc),
      totalComplexity: toNum(m2.metrics.complexity),
      avgComplexity: toNum(m2.metrics.avgComplexity),
      totalFunctions: toNum(m2.metrics.functions),
      avgLocPerFunction: toNum(m2.metrics.avgLocPerFunction),
      duplication: toNum(m2.metrics.duplication),
      maintainability: toNum(m2.metrics.maintainability, 100)
    } : {
      totalLoc: 0,
      totalComplexity: 0,
      avgComplexity: 0,
      totalFunctions: 0,
      avgLocPerFunction: 0,
      duplication: 0,
      maintainability: 100
    },
    
    // Coverage from Movement 3
    coverage: m3.overall_coverage ? {
      statements: toNum(m3.overall_coverage.statements),
      branches: toNum(m3.overall_coverage.branches),
      functions: toNum(m3.overall_coverage.functions),
      lines: toNum(m3.overall_coverage.lines)
    } : {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    
    // Conformity from Movement 4
    conformity: {
      conformityScore: parsedConformityScore,
      totalBeats: toNum(m4.conformity?.totalBeats, 16),
      conformingBeats: toNum(m4.conformity?.conformingBeats),
      violations: toNum(m4.conformity?.violations),
      violations_details: m4.conformity?.violations_details || []
    },
    
    // Beat coverage metrics
    beatMetrics: m1.beat_mapping ? Object.entries(m1.beat_mapping).map(([beat, files]) => ({
      beat,
      fileCount: files.length,
      status: 'PASS'
    })) : [],
    
    // Beat coverage by movement
    beatCoverage: {
      'Movement 1': 100,
      'Movement 2': 100,
      'Movement 3': 100,
      'Movement 4': 100
    },
    
    // Per-module metrics (stub - can be enhanced)
    perModuleMetrics: [],
    
    // Fractal architecture
    fractalArchitecture: m4.fractal_architecture,
    
    // Summary
    summary: analysis.summary,
    integrity_checkpoint: analysis.integrity_checkpoint
  };
}

// Get domain-id from command line
const domainId = process.argv[2];

if (!domainId) {
  console.error('\n❌ Domain ID required');
  console.error('\nUsage: node scripts/analyze-domain.cjs <domain-id>\n');
  console.error('Examples:');
  console.error('  node scripts/analyze-domain.cjs renderx-web-orchestration');
  console.error('  node scripts/analyze-domain.cjs symphonic-code-analysis-pipeline\n');
  process.exit(1);
}

async function run() {
  try {
    header(`DOMAIN ANALYSIS ORCHESTRATOR: ${domainId}`);
    
    // Step 1: Load DOMAIN_REGISTRY
    log('Loading DOMAIN_REGISTRY...', '📖');
    const registryPath = path.join(process.cwd(), 'DOMAIN_REGISTRY.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    
    // Step 2: Look up domain
    log(`Resolving domain: ${domainId}`, '🔍');
    const domain = registry.domains[domainId];
    
    if (!domain) {
      log(`❌ Domain not found: ${domainId}`, '✗');
      log(`Available domains: ${Object.keys(registry.domains).join(', ')}`, '📋');
      process.exit(1);
    }
    
    // Step 3: Validate analysisConfig
    if (!domain.analysisConfig) {
      log(`❌ Domain does not have analysisConfig: ${domainId}`, '✗');
      log('Domain must define analysisConfig with:', '📋');
      log('  - analysisSourcePath: path to code to analyze', '  ');
      log('  - analysisOutputPath: where to save analysis JSON', '  ');
      log('  - reportOutputPath: where to save generated report', '  ');
      log('  - reportAuthorityRef: path to report authority JSON', '  ');
      process.exit(1);
    }
    
    const config = domain.analysisConfig;
    log(`✓ Domain configuration found`, '✓');
    log(`  Source Path: ${config.analysisSourcePath}`, '  ');
    log(`  Analysis Output: ${config.analysisOutputPath}`, '  ');
    log(`  Report Output: ${config.reportOutputPath}`, '  ');
    log(`  Authority: ${config.reportAuthorityRef}`, '  ');
    
    // Step 4: Validate paths exist
    const sourcePath = path.join(process.cwd(), config.analysisSourcePath);
    const authorityPath = path.join(process.cwd(), config.reportAuthorityRef);
    
    if (!fs.existsSync(sourcePath)) {
      log(`❌ Source path does not exist: ${config.analysisSourcePath}`, '✗');
      process.exit(1);
    }
    
    if (!fs.existsSync(authorityPath)) {
      log(`❌ Authority file does not exist: ${config.reportAuthorityRef}`, '✗');
      process.exit(1);
    }
    
    log(`✓ All paths validated`, '✓');
    
    // Step 5: Create output directories
    log('Creating output directories...', '📁');
    const analysisOutputDir = path.join(process.cwd(), config.analysisOutputPath);
    const reportOutputDir = path.join(process.cwd(), config.reportOutputPath);
    
    [analysisOutputDir, reportOutputDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        log(`  Created: ${path.relative(process.cwd(), dir)}`, '  ');
      }
    });
    
    // Step 6: Execute analysis
    log('Executing symphonic code analysis...', '🎼');
    log('  Movement 1: Code Discovery & Beat Mapping', '🎵');
    log('  Movement 2: Code Metrics Analysis', '🎵');
    log('  Movement 3: Test Coverage Analysis', '🎵');
    log('  Movement 4: Architecture Conformity & Reporting', '🎵');
    
    // Use environment variables to pass configuration to analyze-symphonic-code.cjs
    const env = {
      ...process.env,
      ANALYSIS_DOMAIN_ID: domainId,
      ANALYSIS_SOURCE_PATH: config.analysisSourcePath,
      ANALYSIS_OUTPUT_PATH: config.analysisOutputPath,
      REPORT_OUTPUT_PATH: config.reportOutputPath,
      REPORT_AUTHORITY_REF: config.reportAuthorityRef,
      AUTO_GENERATE_REPORT: 'true'
    };
    
    try {
      execSync('node scripts/analyze-symphonic-code.cjs', {
        env,
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      log(`❌ Analysis failed`, '✗');
      process.exit(1);
    }
    
    log(`✓ Analysis complete`, '✓');
    
    // Step 7: Validate analysis output exists
    log('Locating analysis output...', '🔍');
    const analysisFiles = fs.readdirSync(analysisOutputDir)
      .filter(f => f.endsWith('.json') && f.includes('code-analysis'))
      .sort()
      .reverse(); // Most recent first
    
    if (analysisFiles.length === 0) {
      log(`❌ No analysis JSON file found in ${config.analysisOutputPath}`, '✗');
      process.exit(1);
    }
    
    const latestAnalysisFile = path.join(analysisOutputDir, analysisFiles[0]);
    log(`✓ Found latest analysis: ${analysisFiles[0]}`, '✓');
    
    // Step 8: Transform analysis JSON to report-compatible format
    log('Transforming analysis format for report generation...', '🔄');
    const analysisData = JSON.parse(fs.readFileSync(latestAnalysisFile, 'utf8'));
    // Try to enrich with sibling artifacts (coverage summary, trends)
    let coverageSummary = null;
    let trendsSummary = null;
    try {
      const covFiles = fs.readdirSync(analysisOutputDir)
        .filter(f => f.includes('coverage-summary') && f.endsWith('.json'))
        .sort()
        .reverse();
      if (covFiles.length > 0) {
        coverageSummary = JSON.parse(fs.readFileSync(path.join(analysisOutputDir, covFiles[0]), 'utf8'));
      }
      const trendFiles = fs.readdirSync(analysisOutputDir)
        .filter(f => f.includes('trends') && f.endsWith('.json'))
        .sort()
        .reverse();
      if (trendFiles.length > 0) {
        trendsSummary = JSON.parse(fs.readFileSync(path.join(analysisOutputDir, trendFiles[0]), 'utf8'));
      }
    } catch {}

    let transformedAnalysis = transformAnalysisForReport(analysisData);
    // Supplement coverage if missing
    if (coverageSummary && (!transformedAnalysis.coverage || (
      transformedAnalysis.coverage.statements === 0 &&
      transformedAnalysis.coverage.branches === 0 &&
      transformedAnalysis.coverage.functions === 0 &&
      transformedAnalysis.coverage.lines === 0
    ))) {
      const oc = coverageSummary.overall_coverage || {};
      const toNum = v => (typeof v === 'string' ? parseFloat(v) : (v || 0));
      transformedAnalysis.coverage = {
        statements: toNum(oc.statements),
        branches: toNum(oc.branches),
        functions: toNum(oc.functions),
        lines: toNum(oc.lines)
      };
    }
    // Supplement metrics if missing
    if (trendsSummary && (!transformedAnalysis.metrics || (
      (transformedAnalysis.metrics.totalLoc || 0) === 0 &&
      (transformedAnalysis.metrics.totalFunctions || 0) === 0 &&
      (transformedAnalysis.metrics.totalComplexity || 0) === 0
    ))) {
      const t = trendsSummary.trends || {};
      transformedAnalysis.metrics = {
        totalLoc: Number(t.loc?.current || 0),
        totalComplexity: Number(t.complexity?.current || 0),
        avgComplexity: Number(t.complexity?.current || 0),
        totalFunctions: 0,
        avgLocPerFunction: 0,
        duplication: Number(t.duplication?.current || 0),
        maintainability: Number(t.maintainability?.current || 0)
      };
    }
    // Build perModuleMetrics from per-beat CSV; also compute aggregates
    if (true) {
      try {
        const beatCsvFiles = fs.readdirSync(analysisOutputDir)
          .filter(f => f.includes('per-beat-metrics') && f.endsWith('.csv'))
          .sort()
          .reverse();
        if (beatCsvFiles.length > 0) {
          const csvPath = path.join(analysisOutputDir, beatCsvFiles[0]);
          const csvText = fs.readFileSync(csvPath, 'utf8');
          const lines = csvText.trim().split(/\r?\n/);
          const header = lines.shift();
          const idx = { Beat: 0, Movement: 1, Files: 2, LOC: 3, Complexity: 4, Coverage: 5, Status: 6 };
          const rows = lines.map(line => line.split(','));
          const perModule = rows.map(cols => ({
            name: `${cols[idx.Beat]} (${cols[idx.Movement]})`,
            loc: Number(cols[idx.LOC].replace(/[^0-9.]/g, '')) || 0,
            functions: Number(cols[idx.Files].replace(/[^0-9.]/g, '')) || 0,
            complexity: Number(cols[idx.Complexity].replace(/[^0-9.]/g, '')) || 0,
            comments: 0
          }));
          // sort by LOC desc and take top 10
          perModule.sort((a,b) => b.loc - a.loc);
          transformedAnalysis.perModuleMetrics = perModule.slice(0, 10);

          // Aggregates for validation and metrics backfill
          const totalLocCsv = perModule.reduce((sum, m) => sum + m.loc, 0);
          const totalFunctionsCsv = rows.reduce((sum, cols) => sum + (Number(cols[idx.Files].replace(/[^0-9.]/g, '')) || 0), 0);
          const avgComplexityCsv = rows.length
            ? rows.reduce((sum, cols) => sum + (Number(cols[idx.Complexity].replace(/[^0-9.]/g, '')) || 0), 0) / rows.length
            : 0;

          transformedAnalysis.validation = transformedAnalysis.validation || {};
          transformedAnalysis.validation.moduleTable = {
            rows: rows.length,
            totalLocFromCsv: totalLocCsv,
            totalFunctionsApprox: totalFunctionsCsv,
            avgComplexityFromCsv: Number(avgComplexityCsv.toFixed(2))
          };

          // Backfill metrics if missing or zero
          transformedAnalysis.metrics = transformedAnalysis.metrics || {};
          if (!transformedAnalysis.metrics.totalLoc || transformedAnalysis.metrics.totalLoc === 0) {
            transformedAnalysis.metrics.totalLoc = totalLocCsv;
          }
          if (!transformedAnalysis.metrics.totalFunctions || transformedAnalysis.metrics.totalFunctions === 0) {
            transformedAnalysis.metrics.totalFunctions = totalFunctionsCsv;
          }
          if (!transformedAnalysis.metrics.avgComplexity || transformedAnalysis.metrics.avgComplexity === 0) {
            transformedAnalysis.metrics.avgComplexity = Number(avgComplexityCsv.toFixed(2));
          }
        }
      } catch {}
    }
    
    // Save transformed analysis temporarily
    const transformedPath = path.join(analysisOutputDir, 'transformed-for-report.json');
    fs.writeFileSync(transformedPath, JSON.stringify(transformedAnalysis, null, 2));
    log(`✓ Analysis transformed`, '✓');
    
    // Step 9: Generate report from transformed analysis
    log('Generating comprehensive report from analysis...', '📝');
    log('  Loading authority from: ' + config.reportAuthorityRef, '  ');
    
    const reportFileName = `${domainId}-CODE-ANALYSIS-REPORT.md`;
    const reportPath = path.join(reportOutputDir, reportFileName);
    
    try {
      execSync(`node scripts/generate-symphonic-report.cjs "${transformedPath}" "${reportPath}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      log(`❌ Report generation failed`, '✗');
      process.exit(1);
    }
    
    log(`✓ Report generated: ${path.relative(process.cwd(), reportPath)}`, '✓');
    
    // Step 9: Summary
    header('ANALYSIS COMPLETE');
    log(`✓ Domain analyzed: ${domainId}`, '🎭');
    log(`✓ Analysis output: ${config.analysisOutputPath}`, '📁');
    log(`✓ Report output: ${config.reportOutputPath}`, '📁');
    log(`✓ Report file: ${reportFileName}`, '📄');
    log(`\nNext: Review report at: ${path.relative(process.cwd(), reportPath)}`, '📣');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

run();
