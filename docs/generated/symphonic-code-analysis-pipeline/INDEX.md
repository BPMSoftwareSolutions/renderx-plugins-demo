<!-- AUTO-GENERATED -->
<!-- Source: c:\source\repos\bpm\internal\renderx-plugins-demo-fix-ac-to-test-alignment\packages\orchestration\json-sequences\symphonic-code-analysis-pipeline.json -->
<!-- Generated: 2025-12-20T17:00:45.081Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Symphonic Code Analysis Pipeline

**Status**: active  
**Version**: 1.0.0  
**Category**: analysis-pipeline  
**Beats**: 16 | **Movements**: 4

---

## Overview

Multi-movement orchestration for comprehensive code analysis of symphonic orchestration codebases, measuring code metrics per beat, test coverage, complexity, and architectural conformity.

**Purpose**: Provide comprehensive, per-beat code metrics, test coverage, and architecture conformity reporting across all orchestration domains without suppressing or masking missing data.

---

## Quick Start

```bash
npm run analyze:symphonic:code [--domain=<id>] [--baseline] [--trends]
```

**Options:**
- `--domain=<id>` - Analyze specific orchestration domain (default: all)
- `--baseline` - Create baseline for trend tracking
- `--trends` - Compare to baseline and show trends

---

## Movements (4 Total)


### Movement 1: Code Discovery & Beat Mapping

**Description**: Discover all source files, map them to orchestration beats, and collect baseline metrics

**Purpose**: undefined

**Beats**: [object Object],[object Object],[object Object],[object Object]


### Movement 2: Code Metrics Analysis

**Description**: Calculate LOC, complexity, duplication, and maintainability metrics per beat and movement

**Purpose**: undefined

**Beats**: [object Object],[object Object],[object Object],[object Object]


### Movement 3: Test Coverage Analysis

**Description**: Measure statement, branch, function, and line coverage with mapping to beats

**Purpose**: undefined

**Beats**: [object Object],[object Object],[object Object],[object Object]


### Movement 4: Architecture Conformity & Reporting

**Description**: Validate handler-to-beat mapping, calculate conformity score, generate reports and trends

**Purpose**: undefined

**Beats**: [object Object],[object Object],[object Object],[object Object]


---

## Metrics Framework

### Code Metrics


#### lines Of Code

- **Description**: Total and per-scope LOC across beats and movements
- **Benchmark**: Track trend vs. baseline; no hard threshold
- **Aggregation**: sum, perBeat, perMovement, perDomain
- **Visualization**: bar-chart


#### complexity

- **Description**: Cyclomatic and cognitive complexity per handler
- **Benchmark**: Average cyclomatic < 10; cognitive < 8
- **Aggregation**: average, perBeat
- **Visualization**: line-chart


#### duplication

- **Description**: Percentage of duplicated code
- **Benchmark**: < 5%
- **Aggregation**: percentage
- **Visualization**: gauge


#### maintainability

- **Description**: Maintainability index per module
- **Benchmark**: >= 80 (green)
- **Aggregation**: perModule
- **Visualization**: scatter


### Test Coverage


#### statement

- **Description**: Statement coverage across handlers
- **Benchmark**: >= 85%
- **Per-Beat**: Yes


#### branch

- **Description**: Branch coverage (decision points)
- **Benchmark**: >= 80%
- **Per-Beat**: Yes


#### function

- **Description**: Function coverage and handler execution
- **Benchmark**: >= 90%
- **Per-Beat**: Yes


#### line

- **Description**: Line coverage
- **Benchmark**: >= 85%
- **Per-Beat**: Yes


### Conformity Metrics


#### handler Completeness

- **Description**: All beats mapped to implemented handlers
- **Benchmark**: 100%
- **Impact**: high


#### test Coverage Conformity

- **Description**: Coverage meets minimum benchmarks
- **Benchmark**: >= 0.85 overall
- **Impact**: medium


#### fractal Architecture

- **Description**: Fractal architecture alignment across orchestration domains and sequences
- **Benchmark**: >= 0.85
- **Impact**: high


#### architecture Conformity

- **Description**: Alignment with orchestration and fractal architecture
- **Benchmark**: >= 0.85
- **Impact**: high


#### overall Score

- **Description**: Composite score of all metrics
- **Benchmark**: >= 0.85
- **Impact**: critical


---

## Reporting Artifacts

Analysis generates the following artifacts in `.generated/analysis/`:


### Beat Metrics Report

- **Type**: markdown
- **Description**: Per-beat LOC, complexity, and coverage
- **Purpose**: Enable targeted improvements
- **Auto-Generated**: Yes


### Domain Analysis JSON

- **Type**: json
- **Description**: Machine-readable analysis for automation
- **Purpose**: CI validation and trend tracking
- **Auto-Generated**: Yes


### Trend Comparison

- **Type**: markdown
- **Description**: Baseline vs. current deltas
- **Purpose**: Reveal regressions and improvements
- **Auto-Generated**: Yes


---

## Governance Policies

- No masking of missing data
- Publish all analysis artifacts
- Require handler-to-beat mapping
- Validate coverage thresholds

---

## Implementation Details

### Beat Bindings


**Beat 1**: `analysis.discovery#scanOrchestrationFiles`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 2**: `analysis.discovery#discoverSourceCode`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 3**: `analysis.discovery#mapBeatsToCode`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 4**: `analysis.discovery#collectBaseline`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 5**: `analysis.metrics#countLinesOfCode`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 6**: `analysis.metrics#analyzeComplexity`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 7**: `analysis.metrics#detectDuplication`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 8**: `analysis.metrics#calculateMaintainability`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 9**: `analysis.coverage#measureStatementCoverage`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 10**: `analysis.coverage#measureBranchCoverage`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 11**: `analysis.coverage#measureFunctionCoverage`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 12**: `analysis.coverage#calculateGapAnalysis`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 13**: `analysis.conformity#validateHandlerMapping`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 14**: `analysis.conformity#calculateConformityScore`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 15**: `analysis.conformity#generateTrendReport`
- Script: `scripts/analyze-symphonic-code.cjs`


**Beat 16**: `analysis.conformity#generateAnalysisReport`
- Script: `scripts/analyze-symphonic-code.cjs`


---

## Related Orchestrations

- build-pipeline-symphony
- orchestration-core
- renderx-web-orchestration
- graphing-orchestration
- symphonia-conformity-alignment-pipeline
- safe-continuous-delivery-pipeline

---

## Events

The pipeline emits the following orchestration events:

- `analysis.discovery.started`
- `analysis.discovery.completed`
- `analysis.metrics.completed`
- `analysis.coverage.completed`
- `analysis.conformity.completed`
- `analysis.reporting.completed`
- `movement-4:fractal-architecture-analyzed`

---

## Integration

### Register as npm script

Add to `package.json`:

```json
{
  "scripts": {
    "analyze:symphonic:code": "node scripts/orchestrate-symphonic-code-analysis.js",
    "analyze:symphonic:code:baseline": "node scripts/orchestrate-symphonic-code-analysis.js --baseline",
    "analyze:symphonic:code:trends": "node scripts/orchestrate-symphonic-code-analysis.js --trends"
  }
}
```

### Run from orchestration

```bash
# Analyze all orchestrations
npm run analyze:symphonic:code

# Analyze specific domain
npm run analyze:symphonic:code -- --domain=renderx-web-orchestration

# Create/update baseline
npm run analyze:symphonic:code:baseline

# Show trends vs baseline
npm run analyze:symphonic:code:trends
```

---

## Data Schema

Analysis output follows this JSON schema:

```json
{
  "timestamp": "ISO-8601",
  "domain": "orchestration-id",
  "codeMetrics": {
    "linesOfCode": {
      "perBeat": [{ "beat": 1, "loc": 150 }],
      "perMovement": [{ "movement": 1, "totalLoc": 750 }],
      "total": 3000
    },
    "complexity": {
      "perBeat": [{ "beat": 1, "cyclomatic": 8, "cognitive": 5 }],
      "average": 6.5
    },
    "duplication": { "percentage": 2.3 },
    "maintainability": [{ "module": "handler1.ts", "index": 82 }]
  },
  "testCoverage": {
    "statement": { "percent": 86, "perBeat": [...] },
    "branch": { "percent": 81, "perBeat": [...] },
    "function": { "percent": 92, "perBeat": [...] },
    "line": { "percent": 86, "perBeat": [...] }
  },
  "conformity": {
    "handlerCompleteness": 1.0,
    "testCoverageConformity": 0.86,
    "architectureConformity": 0.88,
    "overallScore": 0.88
  },
  "trends": {
    "comparison": "baseline",
    "changes": {
      "locTrend": "+2.3%",
      "complexityTrend": "-1.2%",
      "coverageTrend": "+3.5%"
    }
  }
}
```

---

## Governance Compliance

✅ This documentation is auto-generated from JSON source  
✅ Generated on every `npm run build`  
✅ Marked as AUTO-GENERATED (cannot be manually edited)  
✅ Located in domain-scoped docs directory  
✅ Prevents documentation drift

<!-- DO NOT EDIT - Regenerate with: npm run build -->
