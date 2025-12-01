# AC-to-Test Alignment for renderx-web-orchestration

Labels: `area:quality`, `area:testing`, `governance`, `priority:P1`

## Summary
Structured acceptance criteria (GWT) are now the canonical source of truth across `renderx-web-orchestration`, but the analysis report shows 0% Average AC coverage. We need to implement AC-to-test alignment so each AC is discoverable in tests and measured in CI.

## Background
- ACs migrated to `acceptanceCriteriaStructured` (Given/When/Then/And), centralized in `docs/renderx-web/ac.txt`, and emitted per-beat in JSON sequences.
- The symphonic code analysis pipeline runs and reports an AC validation section, but data is currently 0% because tests are not mapped to ACs.
- Domain registry is consolidated to `renderx-web-orchestration` with aliases (`renderx`, `renderx-web`, `renderx-orchestration`).

## Goals
- Achieve ≥70% Average AC coverage (Good) for `renderx-web-orchestration`.
- Integrate alignment into analysis artifacts and CI gates.
- Keep test authoring overhead minimal (lightweight tagging first).

## Non-Goals
- No heavy semantic AI matching in Phase 1; start with stable tag presence mapping.
- No changes to test runner frameworks beyond optional reporters/helpers.

## Approach
1. Generate a canonical AC registry (normalized IDs and text) from `acceptanceCriteriaStructured`.
2. Introduce a lightweight tagging convention in tests, e.g.: `[AC:renderx-web-orchestration:create:1.1:1]` or `[BEAT:renderx-web-orchestration:create:1.1]`.
3. Collect test results (vitest/jest + Cypress JSON) and extract tags to correlate with the AC registry.
4. Compute alignment metrics and output in the code analysis report and JSON artifacts.
5. Phase 2: Add simple THEN-to-assertion heuristics and optional assertion markers (e.g., `ASSERT:event`, `ASSERT:dom`).
6. Add CI thresholds and fail/warn rules.

## Acceptance Criteria
- Reported “Average AC coverage” ≥70% for `renderx-web-orchestration`.
- Beats with at least one mapped test ≥80%.
- Alignment results included in `docs/generated/renderx-web/*-CODE-ANALYSIS-REPORT.md` and JSON artifacts under `.generated/analysis/renderx-web/`.
- Tagging guide available and adopted in representative tests across key symphonies (e.g., Create, Select, UI, Export).

## Work Breakdown
- [ ] Generator: `scripts/generate-ac-registry.cjs` produces `.generated/acs/renderx-web-orchestration.registry.json`.
- [ ] Test Tagging Guide: `docs/TEST_TAGGING_GUIDE.md` with examples and snippets.
- [ ] Test Parsers: `scripts/ac-alignment/collect-test-results.cjs` supporting vitest/jest and Cypress Mocha JSON.
- [ ] Alignment Engine: `scripts/ac-alignment/compute-alignment.cjs` (presence-based; Phase 2: THEN heuristics).
- [ ] Pipeline Integration: call alignment step from `scripts/analyze-symphonic-code.cjs` (or `scripts/validate-ac-alignment.cjs`) and publish artifacts.
- [ ] Reporting: embed summary + details into the existing Markdown report.
- [ ] CI Gate: add thresholds (warn <70%, fail <50% on critical beats) and a job to run alignment in PRs.

## Workflow Reference
- Sequence JSON: `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.v2.json`
- Registry: added under `renderx-web-orchestration` in `DOMAIN_REGISTRY.json` → `orchestration.sequence_files`
- Movements overview:
  - M1 AC Registry → generate normalized AC registry
  - M2 Tagging Enablement → publish guide, adopt tags in tests
  - M3 Result Collection → collect vitest/jest + cypress results
  - M4 Alignment Computation → presence coverage + THEN heuristics
  - M5 Reporting → emit JSON + Markdown into analysis report
  - M6 CI Gate & Rollout → thresholds and progressive rollout

## Tagging Convention (Phase 1)
- AC ID (full): `[AC:<domain>:<sequence>:<beat>:<acIndex>]`
  - Example: `[AC:renderx-web-orchestration:create:1.1:1]`
- Beat-only (aggregated): `[BEAT:<domain>:<sequence>:<beat>]`
  - Example: `[BEAT:renderx-web-orchestration:create:1.1]`

Works in `describe()` or `it()` titles for both unit/integration and Cypress tests. Titles are collected via reporters and parsed by the alignment engine.

## Metrics & Definition of Done
- DoD when the analysis report shows:
  - Average AC coverage ≥70%
  - Beats with mapped tests ≥80%
  - Artifacts generated and linked in CI

## Risks & Mitigations
- Tag drift or typos → provide helper function / snippet generator; add PR check to validate tags against registry.
- Heuristic false positives → keep Phase 2 optional and transparent with a confidence score.

## References
- Strategic plan: `docs/AC_TO_TEST_ALIGNMENT_PLAN.md`
- Workflow sequence: `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.v2.json`
- Current report: `docs/generated/renderx-web/renderx-web-orchestration-CODE-ANALYSIS-REPORT.md`
- Domain registry: `DOMAIN_REGISTRY.json` (aliases enabled)

## Owners & Timeline
- Owner: TBD (Architecture + QA coordination)
- Timeline: M1 (2 days), M2 (3 days), M3 (5 days)

---

Paste-ready GitHub Issue. Adjust labels/assignees/milestones before creating.
