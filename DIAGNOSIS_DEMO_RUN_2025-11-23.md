# Diagnosis Analyze Demo Run (2025-11-23)

This document captures the first successful live demo execution of the diagnosis minimal vertical slice from built dist artifacts.

## Invocation
Executed via Node dynamic import of built package:
```
node -e "import('./packages/self-healing/dist/index.js').then(m=>{const r=m.runDiagnosisAnalyze(); console.log(JSON.stringify(r,null,2));}).catch(e=>console.error(e));"
```

## Result JSON
```
{
  "requested": { "handler": "analyzeRequested", "event": "diagnosis.analyze.requested", "timestamp": "2025-11-23T14:00:20.483Z", "context": { "sequenceId": "diagnosis-analyze" } },
  "anomalies": { "handler": "loadAnomalies", "event": "diagnosis.load.anomalies", "timestamp": "2025-11-23T14:00:20.485Z", "context": { "anomalies": [], "count": 0, "filePath": ".generated/anomalies.json", "missing": true } },
  "codebase": { "handler": "loadCodebaseInfo", "event": "diagnosis.load.codebase", "timestamp": "2025-11-23T14:00:21.307Z", "context": { "tsFiles": 767, "tsxFiles": 92, "totalFiles": 50583, "root": "." } },
  "performance": { "handler": "analyzePerformanceIssues", "event": "diagnosis.analyze.performance.issues", "timestamp": "2025-11-23T14:00:21.307Z", "context": { "issues": [], "count": 0, "scoring": "latency-ratio-v1" } },
  "store": { "handler": "storeDiagnosis", "event": "diagnosis.store.results", "timestamp": "2025-11-23T14:00:21.308Z", "context": { "filePath": ".generated/diagnosis-results.json", "stored": true, "slice": { "performanceIssues": [], "generatedAt": "2025-11-23T14:00:21.307Z", "sequenceId": "diagnosis-analyze" } } },
  "completed": { "handler": "analyzeCompleted", "event": "diagnosis.analyze.completed", "timestamp": "2025-11-23T14:00:21.308Z", "context": { "sequenceId": "diagnosis-analyze", "performanceIssueCount": 0 } },
  "slice": { "performanceIssues": [], "generatedAt": "2025-11-23T14:00:21.307Z", "sequenceId": "diagnosis-analyze" }
}
```

## Notes
- Anomalies file absent; handler gracefully marked `missing: true` (fallback path confirmed).
- Performance analysis produced zero issues (expected until anomalies + heuristics enriched).
- Persistence succeeded: `.generated/diagnosis-results.json` created/updated.
- Sequence timestamps show <1.0s end-to-end latency (dev environment, cold run including codebase scan).

## Next Opportunities
1. Implement behavioral / coverage / error diagnosis handlers to enrich slice.
2. Add impact assessment + fix recommendation stubs (will expand slice output fields).
3. Trigger follow-up WSJF reassessment once additional diagnosis dimensions exist.
4. Add a CLI wrapper (`bin/self-healing-diagnose.mjs`) for easier manual invocation.

Definition of Done for minimal vertical slice now satisfied (build, test, live demo artifact, documentation captured).
