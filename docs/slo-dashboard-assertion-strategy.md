# SLO Dashboard Assertion Strategy

## Categories & Core Expectations
| Category | Scenario Focus | Primary Assertions | Telemetry Targets |
|----------|----------------|--------------------|-------------------|
| Initial Load | Aggregate & list render | overallCompliance present; budgets sorted; burn classification | loadBudgets, loadMetrics events |
| Compliance Aggregation | Weighted & filtered calculations | Weighted mean correct; incomplete SLOs excluded | computeCompliance payload fields |
| Sorting & Prioritization | Error budget risk ordering | Sorted descending remaining %; ties break by burn rate | riskOrdering telemetry snapshot |
| Projection | Future breach prediction | status = breach-soon / breach-now triggers at thresholds; zero remaining handled | projectionCalculation metrics (hoursToBreach) |
| Burn Rate | Spike detection & classification | spike tag when short-term > 2x long-term avg; stable otherwise | burnRateWindow metrics (1h, 24h) |
| Export | Signed artifact generation | CSV+JSON produced; signature/hash present; integrity fields consistent | exportInvocation, exportArtifactHash |
| Accessibility | Color badge label pairing | Each badge exposes text alternative; status label matches color tier | accessibilityAudit events |
| Trend / Healing | Improvement detection | improving label & delta metrics vs prior window | healingImpact telemetry |

## Implementation Phases
1. Phase 1 (Bootstrap)
   - Ensure at least one real assertion per implemented scenario (expect() presence).
   - Validate weighted compliance locally (placeholder). 
   - Track TODO density (gate added).
2. Phase 2 (Instrumentation)
   - Introduce handler inputs & real computeCompliance logic.
   - Emit telemetry fields for compliance & projection, assert structural correctness.
3. Phase 3 (Edge Coverage)
   - Implement zero remaining budget, spike detection, partial data exclusion scenarios.
   - Tighten TODO ratio threshold (<=40%).
4. Phase 4 (Export & Accessibility)
   - Add export signing verification; validate accessibility labels & color codes.
   - TODO ratio threshold (<=10%).
5. Phase 5 (Hardening)
   - Replace inline calculations with utility module; snapshot test risk ordering.
   - TODO ratio threshold (0%).

## Assertion Patterns
- Numeric tolerance: use ±0.1% for compliance, ±5 minutes for projections.
- Sorting: compare array to its sorted clone; assert stability for equal remaining percentages.
- Edge Cases: zero budget, missing metrics (mark data-pending), high burn spike > 2x.
- Accessibility: query generated label map; ensure human-readable + status keyword.
- Export: recompute hash of JSON content; match signature; verify schema keys.

## Telemetry Integration Checklist (per scenario)
- Emit event with feature tag (e.g., `slo-dashboard` + sub-feature).
- Include scenario id or slug for trace correlation.
- Assert presence of mandatory fields (timestamp, feature, scenario, metrics subset).
- When projecting, assert `hoursToBreach` and `confidence` fields.
- For export, assert artifact hash matches recomputed digest.

## Progress Metrics Targets
| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|---------|---------|---------|---------|---------|
| Implementation Ratio | >30% | >60% | >80% | >90% | 100% |
| TODO Ratio (fail if >) | 70% | 40% | 25% | 10% | 0% |
| Telemetry Assertion Coverage | >0% | >40% | >60% | >80% | 100% |
| Accessibility Coverage | 0% | 0% | 50% | 100% | 100% |
| Export Integrity Coverage | 0% | 0% | 0% | 100% | 100% |

## Next Immediate Steps
- Refactor weighted compliance into utility module (`packages/slo-dashboard/src/domain/compliance.ts`).
- Implement sorting scenario assertions.
- Add projection imminent breach stub with local calculation util.
- Begin telemetry emission mock shape & evolve shape annotations accordingly.

## Risk & Mitigation
| Risk | Mitigation |
|------|------------|
| Handler signature churn | Introduce adapter layer isolating test domain utilities. |
| Telemetry shape diff failures | Pre-annotate planned hash changes with evolution reason. |
| Flaky projection timing | Use deterministic mock clock + synthetic metrics. |
| Accessibility regressions | Snapshot label map & run axe-core in integration later. |

## Governance Hooks
- `verify-bdd-assertion-completeness.js` enforces progress.
- Alignment script to be enhanced to require expect() per scenario.
- Shape evolution annotations updated per telemetry field changes.

