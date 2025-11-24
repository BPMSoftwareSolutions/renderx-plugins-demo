# Data Transformation Pipeline Guide

*Generated from: `.generated/global-traceability-map.json`*
*Last Updated: 2025-11-23T21:09:45.432Z*

## Complete Pipeline: OGraphX → Self-Healing → Traceability → SLO/SLA → Dashboard

This guide traces data transformations from code analysis through visualization.

## Pipeline Stages (11 total)

### Stage 1: OGraphX Analysis Generation

**From:** `packages/ographx/generators/*`

**To:** `.ographx/artifacts/renderx-web/*`

**Purpose:** Generate self-awareness artifacts: sequence flows, symbol graph, code relationships

**Artifacts:**
- catalog/sequences/
- catalog/topics/
- ir/graph.json
- analysis/

### Stage 2: Telemetry Governance Analysis

**From:** `.logs/* + package.json + test results`

**To:** `.generated/renderx-web-telemetry.json`

**Script:** `scripts/demo-renderx-web-analysis.js`

**Purpose:** Detect 30 anomalies from production logs; map to components; diagnose root causes

**Artifacts:**
- renderx-web-telemetry.json (30 anomalies)
- renderx-web-mapping.json (6 components)
- diagnosis-results.json

### Stage 3: Traceability Mapping

**From:** `.generated/renderx-web-telemetry.json + .logs/*`

**To:** `.generated/log-source-lineage/*`

**Script:** `scripts/trace-logs-to-telemetry.js`

**Purpose:** 100% lineage: anomaly → handler → exact source file + line number

**Artifacts:**
- source-lineage.json (100% mapping)
- component-lineage-breakdown.json
- lineage-audit-trail.json

### Stage 4: SLI Metrics Calculation

**From:** `.generated/renderx-web-telemetry.json`

**To:** `.generated/sli-metrics.json`

**Script:** `scripts/calculate-sli-metrics.js`

**Purpose:** Calculate P50/P95/P99 latencies, error rates, availability for 5 components

**Artifacts:**
- sli-metrics.json (real metrics per component)
- Health scores, latencies, availability

### Stage 5: Self-Healing Diagnosis

**From:** `.generated/renderx-web-telemetry.json + .generated/log-source-lineage.json`

**To:** `packages/self-healing/.generated/*`

**Sequence:** telemetry.parse → anomaly.detect → diagnosis.analyze

**Purpose:** Extract anomalies, categorize by component, analyze root causes with precision

### Stage 6: Self-Healing Fix Generation & Deployment

**From:** `anomaly diagnoses + source line numbers`

**To:** `production code + test cases`

**Sequence:** fix.generate → validation.run → deployment.deploy

**Purpose:** undefined

### Stage 7: SLI Metrics Recalculation (Feedback Loop)

**From:** `Fixed production code`

**To:** `.generated/sli-metrics.json (updated)`

**Script:** `scripts/calculate-sli-metrics.js (re-run)`

**Purpose:** Health scores improve after fixes; proves self-healing effectiveness

### Stage 8: SLO Target Definition

**From:** `.generated/sli-metrics.json`

**To:** `.generated/slo-targets.json`

**Script:** `scripts/define-slo-targets.js (Phase 3)`

**Purpose:** Define realistic SLO targets based on actual performance data

### Stage 9: Error Budget Calculation

**From:** `.generated/slo-targets.json`

**To:** `.generated/error-budgets.json`

**Script:** `scripts/calculate-error-budgets.js (Phase 4)`

**Purpose:** Compute allowed failures per component, track budget consumption

### Stage 10: SLA Compliance Tracking

**From:** `.generated/error-budgets.json`

**To:** `.generated/sla-compliance-report.json`

**Script:** `scripts/track-sla-compliance.js (Phase 5)`

**Purpose:** Monitor SLO adherence; trigger automated remediation on breach

🚨 **CRITICAL:** ACTIVATE SELF-HEALING

### Stage 11: Dashboard Visualization

**From:** `All .generated/*.json artifacts + self-healing activity logs`

**To:** `Real-time dashboard display`

**Purpose:** Visualize metrics, budgets, compliance, self-healing activity

