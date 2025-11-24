# Root Cause: Missing SLO Dashboard Scenario Assertion Coverage

## Summary
During the compliance recovery and gap‑closing workflow the 13 SLO dashboard business scenarios remained mostly as generated stubs with placeholder TODO comments and only one partially enriched test. Governance passed because existing gates validated *artifact presence* (spec JSON, handler files, alignment heuristics, project plan) rather than *assertion substance*. No gate measured implementation depth inside the scenario test file.

## Key Contributing Factors
1. Generation Pipeline Scope
   - `generate-bdd-stubs.js` intentionally produced inert skeletons to avoid false failures early.
   - No subsequent mandatory enrichment step was scheduled or enforced.
2. Enforcement Script Domain Mismatch
   - `verify-bdd-spec.js` targets the self-healing domain, not the SLO dashboard scenarios file.
   - SLO dashboard lacked a spec freshness / completeness check focusing on assertion content.
3. Alignment Heuristic Limitations
   - `verify-shape-bdd-alignment.js` only checked keyword → handler presence and telemetry feature hinting.
   - It did not parse test bodies or look for `expect(` calls or TODO density.
4. Absence of Assertion Completeness Metric
   - Pipeline had no quantitative measure (e.g., min implemented ratio, max TODO threshold).
5. Strict Mode Disabled by Default
   - Alignment script ran in non‑STRICT mode, converting coverage gaps into warnings instead of hard failures.
6. Telemetry Instrumentation Lag
   - Lack of emitted telemetry for SLO dashboard reduced pressure to add assertions validating telemetry payloads.
7. Cognitive Load / Parallel Governance Tasks
   - Focus on shape diff resolution and project plan provenance overshadowed the enrichment of scenario test bodies.

## Impact
- Reduced confidence that business requirements (ordering, projection warnings, accessibility, export guarantees) are actually enforced.
- Potential drift between evolving handler logic and unverified business expectations.
- Missed opportunity to catch early design flaws in compliance aggregation and projection logic.

## Missed Detection Opportunities
| Opportunity | What Existed | Why It Didn’t Fire |
|-------------|--------------|--------------------|
| Scenario TODO count gate | None | No script referencing TODO density |
| Telemetry assertion presence | Alignment heuristic only | Did not inspect test bodies |
| Expect() existence check | None | No parsing step in pretest |
| Spec vs test ratio check | Self-healing only | SLO dashboard spec out of scope |
| Business scenario evolution annotation | Manual | Not tied to assertion progression |

## Remediation (Implemented Now)
- Added `verify-bdd-assertion-completeness.js` integrated into `pretest` to fail if TODO ratio exceeds threshold or implemented count below minimum.
- Will progressively tighten thresholds (start permissive, then escalate). Default: max TODO ratio 70%, min implemented 1.

## Forward Actions
1. Lower TODO ratio threshold every enrichment phase (70% → 40% → 10% → 0%).
2. Add telemetry field validation once handlers emit compliance / projection / burn artifacts.
3. Tag each scenario with an implementation phase marker (phase:1..n) for progress tracking.
4. Extend alignment script to require at least one `expect` per scenario.
5. Add export artifact signature verification for `export-produces-signed-csv-json-artifacts` scenario.
6. Introduce accessibility label snapshot test for color indicators.

## Lessons Learned
- Presence gates alone create a false sense of completion; substance gates (assertion completeness) must accompany them.
- Domain‑specific enforcement should follow artifact generation immediately to prevent stubs lingering.
- Quantitative metrics (ratios, counts) provide objective advancement triggers for pipeline escalation.

## Metrics to Track Going Forward
| Metric | Definition | Target (Phase 1) |
|--------|------------|------------------|
| Scenario Implementation Ratio | Implemented / Total | > 30% |
| TODO Density | TODO lines / Total tests | < 70% (fail > 70%) |
| Telemetry Assertion Coverage | Scenarios asserting telemetry / Telemetry‑relevant scenarios | > 0 initially, grows |
| Accessibility Assertion Coverage | Scenarios with label checks / Accessibility scenarios | 0 → 100% |
| Projection Edge Coverage | Edge projection scenarios implemented / defined | 50% Phase 2 |

## Root Cause Category
Process & Governance Scope – lack of assertion completeness enforcement combined with domain mismatch in existing spec verification.
