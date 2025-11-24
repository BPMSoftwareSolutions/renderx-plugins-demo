# Shape Evolution

This living document will track conceptual evolution of telemetry shapes across sprints.

## Layers
- Persistence → Hash → Diff → Coverage → Budgets → Contracts → Domains → Correlation

## Baseline Features
- shape-persistence: persisted runs + hash
- shape-hash-annotation: reproducible hash + evolution cycle
- coverage-coupling: coverageId scaffold

## Pending
- Budgets evaluator (beats, durationMs, batonDiffCount thresholds)
- Domain mutation tagging
- Composite correlation aggregation

## Governance Hooks
- Pretest: contracts validation, diff enforcement
- Posttest: history generation
