# Baseline Establishment Demo Run (2025-11-23)

## Sequence Executed
1. Synthetic telemetry metrics artifact created for test (baseline.establish test)
2. Baseline establishment orchestrator `runBaselineEstablish` executed
3. Baseline persisted to `.generated/baseline-metrics.json`
4. Anomaly detection run referencing new baseline (no anomalies expected)

## Baseline Completion Event
```
{
  "handlerCount": 4,
  "lowConfidenceHandlers": ["newHandlerLowSample"],
  "filePath": ".generated/baseline-metrics.json",
  "stored": true
}
```

## Anomaly Detection Summary (Post-Baseline)
```
{ "total": 0, "byType": {}, "bySeverity": {}, "sequenceId": "anomaly-detect-demo" }
```

## Baseline File Excerpt
```
{
  "schemaVersion": "1.0",
  "handlers": {
    "parseTelemetry": { "count": 60, "avgTime": 42, "p50": 38, "p95": 67, "errorRate": 0.01, "confidence": "medium", "sampleSize": 60 },
    "detectAnomalies": { "count": 30, "avgTime": 75, "p50": 68, "p95": 120, "errorRate": 0.02, "confidence": "medium", "sampleSize": 30 },
    "diagnoseIssues": { "count": 10, "avgTime": 110, "p50": 99, "p95": 176, "errorRate": 0.0, "confidence": "medium", "sampleSize": 10 },
    "newHandlerLowSample": { "count": 4, "avgTime": 95, "p50": 86, "p95": 152, "errorRate": 0.05, "confidence": "low", "sampleSize": 4 }
  }
}
```

## Business Value Mapping
- Objective historical reference now exists for latency & error rates.
- Low-confidence handlers flagged for targeted data collection.
- Enables next slice: SLO evaluation and regression detection using stored baselines.

## Next Slice Recommendations
1. Implement `rebaseBaseline` with exponential decay to adapt over time.
2. Introduce SLO config referencing baseline-derived initial targets.
3. Add anomaly type for baseline drift (latency increase > X% across rebases).
4. Persist trend history for p95 latency to support learning sequence.

Definition of Done for minimal baseline slice achieved (sequence JSON, handlers, test, demo artifact).
