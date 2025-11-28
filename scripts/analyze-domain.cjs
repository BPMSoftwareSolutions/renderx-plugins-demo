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
  
  // Build beat -> sequence map from Movement 1 beat_mapping if available
  const beatMap = m1.beat_mapping || {};
  const beatSequenceMap = Object.keys(beatMap).map((beat) => {
    const entry = beatMap[beat];
    return {
      beat,
      movement: entry?.movement || entry?.section || null,
      sequenceId: entry?.sequenceId || entry?.sequence_id || null,
      sequenceName: entry?.sequenceName || entry?.sequence_name || null,
    };
  });

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

    // Beat → Sequence mapping
    beatSequenceMap,
    
    // Beat coverage by movement
    beatCoverage: {
      'Movement 1': 100,
      'Movement 2': 100,
      'Movement 3': 100,
      'Movement 4': 100
    },
    
    // Per-module metrics (stub - can be enhanced)
    perModuleMetrics: [],

    // Handler portfolio (optional; enriched later if artifacts exist)
    handlerPortfolio: {
      symphonies: [],
      handlers: [],
      summary: { totalHandlers: 0, totalSymphonies: 0, avgCoverage: 0 }
    },
    handlerDistributions: {
      sizeBands: { tiny: 0, small: 0, medium: 0, large: 0, xl: 0 },
      coverageBands: { b0_30: 0, b30_60: 0, b60_80: 0, b80_100: 0 }
    },
    godHandlers: [],
    ciReadiness: { verdict: 'Unknown', notes: [] },
    refactorRoadmap: [],
    
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
      // Suppress inner (subject) report generation; orchestrator will generate domain report
      AUTO_GENERATE_REPORT: 'false'
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
                    // Build per-beat coverage table
                    transformedAnalysis.perBeatCoverage = rows.map(cols => ({
                      beat: cols[idx.Beat],
                      movement: cols[idx.Movement],
                      coverage: Number(String(cols[idx.Coverage]).replace(/[^0-9.]/g, '')) || 0,
                      status: cols[idx.Status]
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

    // Enrich with handler metrics artifacts if present
    try {
      const files = fs.readdirSync(analysisOutputDir);
      const handlerJson = files.filter(f => /handler-metrics.*\.json$/i.test(f)).sort().reverse()[0];
      const handlerCsv = files.filter(f => /handler-metrics.*\.csv$/i.test(f)).sort().reverse()[0];
      const portfolioJson = files.filter(f => /handler-portfolio.*\.json$/i.test(f)).sort().reverse()[0];
      const refactorJson = files.filter(f => /refactor-suggestions.*\.json$/i.test(f)).sort().reverse()[0];

      if (handlerJson) {
        const hm = JSON.parse(fs.readFileSync(path.join(analysisOutputDir, handlerJson), 'utf8'));
        const handlers = Array.isArray(hm.handlers) ? hm.handlers : (hm.data || []);
        transformedAnalysis.handlerPortfolio.handlers = handlers.map(h => ({
          name: h.name || h.id || 'unknown',
          symphony: h.symphony || h.group || 'unknown',
          loc: Number(h.loc || h.lines || 0),
          complexity: Number(h.complexity || h.cyclomatic || 0),
          coverage: Number(h.coverage || h.coverage_pct || 0),
          sizeBand: h.sizeBand || h.size_band || null,
          risk: h.risk || h.risk_level || null
        }));
        const symphonyAgg = {};
        transformedAnalysis.handlerPortfolio.handlers.forEach(h => {
          const key = h.symphony;
          symphonyAgg[key] = symphonyAgg[key] || { symphony: key, count: 0, totalLoc: 0, coverageSum: 0 };
          symphonyAgg[key].count += 1;
          symphonyAgg[key].totalLoc += h.loc;
          symphonyAgg[key].coverageSum += h.coverage;
        });
        transformedAnalysis.handlerPortfolio.symphonies = Object.values(symphonyAgg).map(s => ({
          symphony: s.symphony,
          count: s.count,
          totalLoc: s.totalLoc,
          avgCoverage: s.count ? Number((s.coverageSum / s.count).toFixed(1)) : 0
        }));
        transformedAnalysis.handlerPortfolio.summary = {
          totalHandlers: transformedAnalysis.handlerPortfolio.handlers.length,
          totalSymphonies: transformedAnalysis.handlerPortfolio.symphonies.length,
          avgCoverage: transformedAnalysis.handlerPortfolio.handlers.length 
            ? Number((transformedAnalysis.handlerPortfolio.handlers.reduce((a,b)=>a+b.coverage,0) / transformedAnalysis.handlerPortfolio.handlers.length).toFixed(1))
            : 0
        };
        // distributions
        const sizes = { tiny: 0, small: 0, medium: 0, large: 0, xl: 0 };
        const cov = { b0_30: 0, b30_60: 0, b60_80: 0, b80_100: 0 };
        transformedAnalysis.handlerPortfolio.handlers.forEach(h => {
          const band = (h.sizeBand || '').toLowerCase();
          if (sizes[band] !== undefined) sizes[band] += 1;
          const c = h.coverage || 0;
          if (c < 30) cov.b0_30 += 1; else if (c < 60) cov.b30_60 += 1; else if (c < 80) cov.b60_80 += 1; else cov.b80_100 += 1;
        });
        transformedAnalysis.handlerDistributions = { sizeBands: sizes, coverageBands: cov };
        // god handlers
        transformedAnalysis.godHandlers = transformedAnalysis.handlerPortfolio.handlers
          .filter(h => (h.loc || 0) >= 500 || (h.complexity || 0) >= 25)
          .slice(0, 10);
      }

      if (handlerCsv && transformedAnalysis.handlerPortfolio.handlers.length === 0) {
        const csvText = fs.readFileSync(path.join(analysisOutputDir, handlerCsv), 'utf8');
        const lines = csvText.trim().split(/\r?\n/);
        const header = lines.shift();
        const cols = header.split(',');
        const idx = {
          name: cols.findIndex(c=>/name|handler/i.test(c)),
          symphony: cols.findIndex(c=>/symphony|group/i.test(c)),
          loc: cols.findIndex(c=>/loc|lines/i.test(c)),
          complexity: cols.findIndex(c=>/complexity|cyclomatic/i.test(c)),
          coverage: cols.findIndex(c=>/coverage/i.test(c)),
          sizeBand: cols.findIndex(c=>/size.?band|category/i.test(c))
        };
        transformedAnalysis.handlerPortfolio.handlers = lines.map(l => {
          const c = l.split(',');
          const num = v => Number(String(v).replace(/[^0-9.]/g,'')) || 0;
          return {
            name: c[idx.name] || 'unknown',
            symphony: c[idx.symphony] || 'unknown',
            loc: num(c[idx.loc]),
            complexity: num(c[idx.complexity]),
            coverage: num(c[idx.coverage]),
            sizeBand: c[idx.sizeBand] || null,
            risk: null
          };
        });
      }

      if (refactorJson) {
        const rr = JSON.parse(fs.readFileSync(path.join(analysisOutputDir, refactorJson), 'utf8'));
        transformedAnalysis.refactorRoadmap = Array.isArray(rr.items) ? rr.items : (rr.roadmap || rr.suggestions || []);
      }

      // CI/CD readiness verdict from authority-like artifact if exists
      const readinessJson = files.filter(f => /ci-readiness.*\.json$/i.test(f)).sort().reverse()[0];
      if (readinessJson) {
        const cr = JSON.parse(fs.readFileSync(path.join(analysisOutputDir, readinessJson), 'utf8'));
        transformedAnalysis.ciReadiness = {
          verdict: cr.verdict || cr.status || 'Unknown',
          notes: cr.notes || cr.reasons || []
        };
      }
    } catch {}
    
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
