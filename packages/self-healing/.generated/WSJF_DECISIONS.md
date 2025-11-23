# WSJF Decisions (Iteration Start)

Version: 1.0.0
Date: 2025-11-23
Workflow Phase: 0 (WSJF Prioritization)

## Scoring Model
WSJF = (Business Value + Time Criticality + Risk Reduction / Opportunity Enablement) / Job Size
Scores use a relative 1–10 scale. Job Size uses inverse sizing (larger effort => higher JS value, thus lowers WSJF).

| Handler Slice (Epic or Vertical) | BV | TC | RR/OE | JS | WSJF | Notes |
|----------------------------------|----|----|-------|----|------|-------|
| Diagnosis Minimal Vertical (analyzeRequested + loadAnomalies + loadCodebaseInfo + analyzePerformanceIssues + storeDiagnosis + analyzeCompleted + orchestrator) | 8 | 7 | 7 | 4 | (8+7+7)/4=5.5 | Unlocks root-cause layer; enables downstream fix generation. |
| Full Diagnosis (all analysis handlers: performance, behavioral, coverage, error, impact, recommendFixes, aggregate) | 9 | 6 | 8 | 8 | (9+6+8)/8=2.9 | Larger; defer until minimal vertical demo validated. |
| Fix Generation Starter (generateFixRequested + loadDiagnosis + generateCodeFix + generateTestFix + createPatch + validateSyntax) | 7 | 6 | 8 | 6 | (7+6+8)/6=3.5 | Requires diagnosis artifact; sequence dependency not satisfied yet. |
| Validation Slice (validateFixRequested + loadPatch + runUnitTests + runIntegrationTests + validateCoverage + aggregateValidation + storeValidation) | 6 | 5 | 7 | 7 | (6+5+7)/7=2.6 | Dependent on patch generation; later. |
| Deployment & Learning Starter (deployFixRequested + mergePR + deployToStaging + monitor + trackEffectivenessRequested) | 5 | 4 | 6 | 6 | (5+4+6)/6=2.5 | Far future; prerequisite sequences missing. |

## Selection
Chosen vertical slice for this iteration: **Diagnosis Minimal Vertical** (WSJF 5.5 highest).

## Goals for Slice
1. Produce `diagnosis-results.json` containing performance issue findings from stored anomalies.
2. Provide new orchestrator `runDiagnosisAnalyze` returning a summary object (counts of issues + file path persisted).
3. Integrate into Live Demo (Phase 6) showing telemetry → anomaly → diagnosis chain.

## Acceptance Criteria
- All new handlers return structured event envelopes consistent with existing telemetry/anomaly patterns.
- Business BDD tests for `analyzeRequested` and `loadAnomalies` implemented and passing.
- Diagnosis orchestrator test verifies end-to-end minimal slice.
- Demo checklist satisfied; stakeholder feedback captured in `DEMO_FEEDBACK.md`.

## Risks / Mitigations
- Risk: Missing anomalies file. Mitigation: Fallback to empty anomalies array with warning in context.
- Risk: Performance scoring simplistic. Mitigation: Flag as `scoreMethod: 'latency-ratio-v1'` to allow evolution.
- Risk: Over-expansion mid-slice. Mitigation: Explicit out-of-scope handlers deferred until next WSJF cycle.

## Next Steps
- Implement handlers per updated workflow phases 1–4.
- Add orchestrator + tests.
- Run demo and capture feedback.

---
This document will be updated at the start of each iteration (Phase 0) before committing to new handler work.
