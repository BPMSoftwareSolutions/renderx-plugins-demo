<!-- AUTO-GENERATED -->
<!-- Source: C:\source\repos\bpm\Internal\renderx-plugins-demo\packages\orchestration\json-sequences\symphonic-code-analysis-pipeline.json -->
<!-- Generated: 2025-11-27T07:29:54.585Z -->
<!-- DO NOT EDIT - Regenerate with: npm run build -->

# Symphonic Code Analysis Pipeline

**Status**: active  
**Version**: 1.0.0  
**Category**: orchestration  
**Beats**: 16 | **Movements**: 4

---

## Overview

Multi-movement orchestration for comprehensive code analysis of symphonic orchestration codebases, measuring code metrics per beat, test coverage, complexity, and architectural conformity.

**Purpose**: Analyze and visualize symphonic orchestration code quality, providing per-beat metrics, coverage analysis, complexity scoring, and architecture conformity validation.

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

**Purpose**: Establish beat-to-code correlation and prepare for analysis

**Beats**: 4


### Movement 2: Code Metrics Analysis

**Description**: Calculate LOC, complexity, duplication, and maintainability metrics per beat and movement

**Purpose**: Quantify code quality dimensions aligned with orchestration structure

**Beats**: 4


### Movement 3: Test Coverage Analysis

**Description**: Measure statement, branch, function, and line coverage with mapping to beats

**Purpose**: Ensure test coverage correlates to beat implementation completeness

**Beats**: 4


### Movement 4: Architecture Conformity & Reporting

**Description**: Validate handler-to-beat mapping, calculate conformity score, generate reports and trends

**Purpose**: Synthesize analysis into actionable insights and governance metrics

**Beats**: 4


---

## Metrics Framework

### Code Metrics


#### lines Of Code

- **Description**: Total lines of code per beat, movement, and domain
- **Benchmark**: varies by beat complexity
- **Aggregation**: sum
- **Visualization**: bar chart per movement


#### complexity

- **Description**: Cyclomatic complexity score per beat handler
- **Benchmark**: ≤ 10 (good), ≤ 15 (acceptable), > 15 (refactor)
- **Aggregation**: average per movement
- **Visualization**: scatter plot with trend


#### duplication

- **Description**: Percentage of duplicated code blocks
- **Benchmark**: ≤ 5%
- **Aggregation**: global percentage
- **Visualization**: percentage gauge


#### maintainability

- **Description**: Maintainability Index (0-100) per module
- **Benchmark**: ≥ 80 (good), 60-80 (fair), < 60 (poor)
- **Aggregation**: average
- **Visualization**: heatmap per beat


### Test Coverage


#### statement Coverage

- **Description**: Percentage of statements executed by tests
- **Benchmark**: ≥ 85%
- **Per-Beat**: Yes


#### branch Coverage

- **Description**: Percentage of code branches (if/else) covered
- **Benchmark**: ≥ 80%
- **Per-Beat**: Yes


#### function Coverage

- **Description**: Percentage of functions called by tests
- **Benchmark**: ≥ 90%
- **Per-Beat**: Yes


#### line Coverage

- **Description**: Percentage of lines executed by tests
- **Benchmark**: ≥ 85%
- **Per-Beat**: Yes


### Conformity Metrics


#### handler Completeness

- **Description**: Percentage of beats with implemented handlers
- **Benchmark**: = 100%
- **Impact**: CRITICAL


#### test Coverage Conformity

- **Description**: Average coverage across all beats vs governance threshold
- **Benchmark**: ≥ 85%
- **Impact**: HIGH


#### architecture Conformity

- **Description**: Conformity score based on all metrics (0-1)
- **Benchmark**: ≥ 0.85
- **Impact**: CRITICAL


---

## Reporting Artifacts

Analysis generates the following artifacts in `.generated/analysis/`:


### {codebase}-code-analysis-{timestamp}.json

- **Type**: JSON
- **Description**: Raw analysis data with all metrics per beat
- **Purpose**: Machine-readable, immutable analysis snapshot
- **Auto-Generated**: No


### {codebase}-CODE-ANALYSIS-REPORT.md

- **Type**: Markdown
- **Description**: Human-readable analysis report with visualizations
- **Purpose**: Executive summary of code quality and metrics
- **Auto-Generated**: Yes


### {codebase}-coverage-summary.json

- **Type**: JSON
- **Description**: Coverage percentages aggregated by beat/movement
- **Purpose**: Coverage trends and governance tracking
- **Auto-Generated**: No


### {codebase}-per-beat-metrics.csv

- **Type**: CSV
- **Description**: Tabular metrics per beat for spreadsheet analysis
- **Purpose**: Data export for external tools
- **Auto-Generated**: No


### {codebase}-trends.json

- **Type**: JSON
- **Description**: Historical trends and comparison to baseline
- **Purpose**: Track metric evolution across builds
- **Auto-Generated**: No


---

## Governance Policies

- All code analysis must be correlatable to orchestration beats
- Metrics collected per beat and per movement
- Coverage thresholds must meet governance standards (≥85% required)
- Complexity scoring aligned with orchestration conformity
- Analysis results must be stored as immutable JSON artifacts
- All generated reports auto-generated from analysis JSON
- Trend analysis must track metrics across builds

---

## Implementation Details

### Beat Bindings


**Beat 1**: `discoverOrchestrationSequences`
- Script: `scripts/analyze-symphonic-discover.js`


**Beat 2**: `discoverSourceCode`
- Script: `scripts/analyze-symphonic-discover.js`


**Beat 3**: `mapBeatsToCode`
- Script: `scripts/analyze-symphonic-map-beats.js`


**Beat 4**: `collectBaseline`
- Script: `scripts/analyze-symphonic-baseline.js`


**Beat 5**: `calculateLinesOfCode`
- Script: `scripts/analyze-symphonic-metrics-loc.js`


**Beat 6**: `analyzeComplexity`
- Script: `scripts/analyze-symphonic-metrics-complexity.js`


**Beat 7**: `detectDuplication`
- Script: `scripts/analyze-symphonic-metrics-duplication.js`


**Beat 8**: `calculateMaintainability`
- Script: `scripts/analyze-symphonic-metrics-maintainability.js`


**Beat 9**: `measureStatementCoverage`
- Script: `scripts/analyze-symphonic-coverage-statement.js`


**Beat 10**: `measureBranchCoverage`
- Script: `scripts/analyze-symphonic-coverage-branch.js`


**Beat 11**: `measureFunctionCoverage`
- Script: `scripts/analyze-symphonic-coverage-function.js`


**Beat 12**: `calculateGapAnalysis`
- Script: `scripts/analyze-symphonic-coverage-gaps.js`


**Beat 13**: `validateHandlerMapping`
- Script: `scripts/analyze-symphonic-validate-mapping.js`


**Beat 14**: `calculateConformityScore`
- Script: `scripts/analyze-symphonic-conformity.js`


**Beat 15**: `analyzeTrends`
- Script: `scripts/analyze-symphonic-trends.js`


**Beat 16**: `generateReports`
- Script: `scripts/analyze-symphonic-reports.js`


---

## Related Orchestrations

- build-pipeline-symphony
- architecture-governance-enforcement-symphony
- symphonia-conformity-alignment-pipeline

---

## Events

The pipeline emits the following orchestration events:

- `analysis:initiated`
- `movement-1:discovery:started`
- `movement-1:beat:files:collected`
- `movement-1:beat:handlers:identified`
- `movement-1:discovery:complete`
- `movement-2:metrics:started`
- `movement-2:loc:calculated`
- `movement-2:complexity:analyzed`
- `movement-2:duplication:detected`
- `movement-2:metrics:complete`
- `movement-3:coverage:started`
- `movement-3:statement:coverage:calculated`
- `movement-3:branch:coverage:calculated`
- `movement-3:coverage:complete`
- `movement-4:conformity:started`
- `movement-4:architecture:validated`
- `movement-4:trend:analyzed`
- `movement-4:report:generated`
- `analysis:complete`

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
