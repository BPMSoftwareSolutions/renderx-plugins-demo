# Demo Traceability & Drill-Down Guide

**Date**: 2025-11-23  
**Status**: Complete — Demo now provides full file source traceability and component drill-down

## Overview

The demo execution pipeline now generates multiple interconnected artifacts that enable complete traceability from summary findings back to source files, specific components, and implementation recommendations.

### Key Artifacts (in reading order)

| Artifact | Purpose | Use Case |
|----------|---------|----------|
| **PROJECT_STATUS_REPORT.md** | Executive summary | Start here for overall demo health |
| **demo-output-drill-down.csv** | Drill-down index (tabular) | Quick reference; import into Excel |
| **anomalies.json** | All detected issues (11 total) | View details: severity, handler, metrics |
| **demo-lineage.json** | Traceability map | Understand issue → file → component → recommendation connections |
| **diagnosis-results.json** | Recommendations ranked by ROI | Pick which fix to implement first |
| **baseline-metrics.json** | Baseline statistics + metadata | Validate assumptions (why these anomalies matter) |
| **.logs/production-sample.log** | Source telemetry data | Deep-dive: examine original events causing anomalies |

---

## How to Drill Down

### Scenario 1: "I see a demo summary. Show me the top issues."

**Step 1**: Run demo output
```bash
npm run demo:output:enhanced
```

**Output**: Formatted console showing:
- ✅ Data sources (files parsed)
- ✅ Anomaly summary (11 total, 2 critical, etc.)
- ✅ Component impact (which handlers are problematic)
- ✅ Top 3 recommendations by ROI
- ✅ Drill-down paths to dig deeper

**Example output snippet**:
```
📁 DATA SOURCES
  • .logs/production-sample.log
    ├─ Events parsed: 1847 (success rate: 98.7%)
    ├─ Handlers invoked: 8
    └─ Anomalies contributed: 11

💡 TOP RECOMMENDATIONS
  1. Optimize handler loadLogFiles (benefitScore: 1000, effort: 4)
     ├─ File to edit: packages/self-healing/src/telemetry/handlers/load-logs.ts
     └─ Strategy: Profile hotspots; apply caching or batching
```

---

### Scenario 2: "Export findings for stakeholder review in Excel/Google Sheets"

**Step 1**: Generate CSV
```bash
npm run demo:output:csv
```

**Output**: `packages/self-healing/.generated/demo-output-drill-down.csv`

**Columns**:
- `anomalyId`: Unique issue identifier
- `type`: performance | behavioral | coverage | error | slo
- `severity`: critical | high | medium | low
- `handler`: Which handler (function) raised the issue
- `sourceFile`: Log file that produced the anomaly
- `component`: Package/component name
- `package`: NPM package affected
- `relatedRecommendations`: Which fixes address this issue
- `drillingPath`: Navigation steps to find more details

**Example row**:
```
loadLogFiles-perf-1763915211569, performance, high, loadLogFiles, .logs/production-sample.log, telemetry-parser, @renderx-plugins/self-healing, "fix-1; fix-4", "anomalies.json → filter type=performance → find id → check handler field → look up in componentMapping → trace to sourceFile"
```

**In Excel**: Filter by `severity=critical` or `component` to focus on specific areas.

---

### Scenario 3: "I found an anomaly. What file caused it? Which component owns it? What's the fix?"

**Step 1**: Open `anomalies.json`
```json
{
  "id": "loadLogFiles-perf-1763915211569",
  "type": "performance",
  "severity": "high",
  "handler": "loadLogFiles",
  "description": "Latency increased by 275% vs baseline"
}
```

**Step 2**: Note the `handler` name ("loadLogFiles"). Open `demo-lineage.json` and search for it:

```json
"loadLogFiles": {
  "component": "telemetry-parser",
  "package": "@renderx-plugins/self-healing",
  "sourceFile": "packages/self-healing/src/telemetry/handlers/load-logs.ts",
  "relatedRecommendations": ["fix-1", "fix-4"]
}
```

**Step 3**: Look up recommendations in `diagnosis-results.json`:
- Recommendation `fix-1`: "Optimize handler loadLogFiles" (effort: 4, benefitScore: 1000)
- Recommendation `fix-4`: "Increase coverage for handler loadLogFiles" (effort: 5, benefitScore: 800)

**Step 4**: Check implementation guide in `demo-lineage.json → recommendationLineage`:
```json
{
  "recommendationId": "fix-1",
  "fileToEdit": "packages/self-healing/src/telemetry/handlers/load-logs.ts",
  "strategy": "Profile hotspots in loadLogFiles(); apply caching for repeated log parsing or batch processing"
}
```

✅ **Result**: You now know:
- What file caused the issue (`.logs/production-sample.log`)
- Which handler is problematic (`loadLogFiles`)
- Which component owns it (`telemetry-parser`)
- What to fix and where (`load-logs.ts` - caching optimization)
- Impact (1000 affected users, severity=high)

---

### Scenario 4: "Show me the error samples that led to this diagnosis"

**Step 1**: Find the anomaly in `anomalies.json`:
```json
{
  "id": "extractTelemetryEvents-errors-1763915211570",
  "type": "error",
  "severity": "medium",
  "description": "Error rate increased 16.0% (current 21.0%, baseline 5.0%)"
}
```

**Step 2**: Look up in `demo-lineage.json → issueLineage` for anomalyId `extractTelemetryEvents-errors-1763915211570`:
```json
{
  "errorSamples": [
    {
      "event": 1,
      "timestamp": "2025-11-23T16:26:51.100Z",
      "error": "Failed to parse event structure (invalid JSON)",
      "sourceLineRange": "1-50"
    },
    {
      "event": 2,
      "timestamp": "2025-11-23T16:26:51.250Z",
      "error": "Missing required field: correlationId",
      "sourceLineRange": "451-500"
    }
  ]
}
```

**Step 3**: Open `.logs/production-sample.log` and examine line ranges:
- Lines 1-50: See invalid JSON event → understand why parser fails
- Lines 451-500: See event missing `correlationId` → understand validation gap

✅ **Result**: Root cause is clear. Fix: Add JSON schema validation + required field checks.

---

### Scenario 5: "Validate the baseline is credible"

**Step 1**: Open `baseline-metrics.json`:

```json
"baselineMeta": {
  "methodology": "Statistical aggregation of 100+ test runs collected from production telemetry...",
  "collectionDate": "2025-11-23T16:00:00.000Z",
  "collectionSource": "self-healing test suite (Business BDD handlers...)",
  "rebaseThreshold": 0.05,
  "confidence": "high for handlers with 30+ samples, medium for 10-29, low for <10"
}
```

**Step 2**: Check handler statistics:
```json
"handlers": {
  "parseTelemetry": {
    "count": 60,
    "avgTime": 42,
    "p50": 38,
    "p95": 67,
    "confidence": "high"
  },
  "newHandlerLowSample": {
    "count": 4,
    "confidence": "low"
  }
}
```

✅ **Result**: You understand:
- Baseline is from production-representative test runs (credible)
- High-sample handlers (60+ runs) are very reliable
- Low-sample handlers (4 runs) should be retested
- 5% rebase threshold means automatically re-baseline if performance drifts >5%

---

## Navigation Quick Reference

### From Summary → Details
```
PROJECT_STATUS_REPORT.md
  ↓
demo-output-enhanced.js (console output)
  ↓
demo-output-drill-down.csv (Excel export)
  ↓
anomalies.json (see specific anomaly details)
  ↓
demo-lineage.json (find handler, component, source file, error samples)
  ↓
diagnosis-results.json (see recommendations + benefitScore ranking)
  ↓
packages/self-healing/src/telemetry/handlers/*.ts (implement fix)
```

### From Issue → Implementation
```
anomalies.json (anomalyId + handler)
  ↓
demo-lineage.json → componentMapping (handler → sourceFile + component)
  ↓
demo-lineage.json → recommendationLineage (related recommendations + error samples)
  ↓
diagnosis-results.json → recommendations (implementation guide)
  ↓
Edit the file specified in fileToEdit
```

### From Recommendation → Impact
```
diagnosis-results.json (benefitScore ranking)
  ↓
demo-lineage.json → recommendationLineage (affected component, effort, users impacted)
  ↓
demo-lineage.json → issueLineage (error samples, root cause)
  ↓
Understand why this fix helps (business impact)
```

---

## Demo Artifacts Checklist

- ✅ `PROJECT_STATUS_REPORT.md` — Executive summary
- ✅ `demo-lineage.json` — Complete traceability map
- ✅ `demo-output-drill-down.csv` — Tabular drill-down index
- ✅ `anomalies.json` — All 11 issues with source files & components
- ✅ `diagnosis-results.json` — 6 recommendations with benefitScore ranking
- ✅ `baseline-metrics.json` — Baseline with methodology metadata
- ✅ `.logs/production-sample.log` — Original telemetry events
- ✅ `service_level.objectives.json` — SLO targets + severity mapping
- ✅ `comprehensive-business-bdd-specifications.json` — 78 Business BDD handlers (100% coverage)

---

## Running the Full Demo

```bash
# Step 1: Build
npm run build

# Step 2: Run tests (generates telemetry)
npm test

# Step 3: View formatted console output
npm run demo:output:enhanced

# Step 4: Export for stakeholder review
npm run demo:output:csv

# Step 5: Deep-dive into specific anomalies/recommendations
# → Open packages/self-healing/.generated/demo-lineage.json
# → Open packages/self-healing/.generated/demo-output-drill-down.csv
# → Open packages/self-healing/.generated/anomalies.json
# → Open packages/self-healing/.generated/diagnosis-results.json
```

---

## Key Metrics (Demo-Ready State)

| Metric | Value |
|--------|-------|
| **Total Anomalies** | 11 (3 performance + 3 behavioral + 2 coverage + 1 error + 2 SLO) |
| **Critical Issues** | 2 (availability breach + invocation surge) |
| **High Issues** | 3 (latency spikes) |
| **Source Files** | 1 (production-sample.log: 1,847 events parsed) |
| **Components Affected** | 4 (telemetry-parser, metrics-aggregator, anomaly-detector, system) |
| **Handlers Involved** | 8 (loadLogFiles, extractTelemetryEvents, aggregateTelemetryMetrics, etc.) |
| **Recommendations** | 6 (ranked by ROI: 1000 → 800 → 666.67 benefitScore) |
| **Top Fix Impact** | 1,000 users; effort=4; benefitScore=1000 (best ROI) |
| **Baseline Confidence** | High (60+ samples for key handlers) |
| **Rebase Threshold** | 5% drift triggers automatic re-baseline |

---

## Files Created (This Session)

| File | Purpose |
|------|---------|
| `scripts/fuse-slo-breaches.js` | Ingest SLO breaches into anomalies |
| `scripts/compute-benefit-scores.js` | Rank recommendations by ROI |
| `scripts/demo-output-enhanced.js` | Generate traceability console output + CSV |
| `packages/self-healing/.generated/demo-lineage.json` | Traceability map (11 KB) |
| `packages/self-healing/.generated/demo-output-drill-down.csv` | Drill-down index (2 KB) |
| `DEMO_TRACEABILITY_GUIDE.md` | This document |

---

## Next Steps

1. **Demo Execution**: Run `npm run demo:output:enhanced` to see formatted output with traceability
2. **CSV Export**: Run `npm run demo:output:csv` to generate drill-down spreadsheet
3. **Deep-Dive**: Use navigation paths above to trace issues to source files
4. **Implementation**: Use recommendations' `fileToEdit` paths to locate code needing fixes
5. **Validation**: Check baseline metadata to ensure assumptions are sound

---

*Generated by: demo-output-enhanced.js, fuse-slo-breaches.js, compute-benefit-scores.js*  
*Last Updated: 2025-11-23*
