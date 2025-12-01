# AC-to-Test Alignment Plan — renderx-web-orchestration

Generated: 2025-12-01

## Objectives
- Establish measurable alignment between structured acceptance criteria (GWT) and automated tests.
- Lift “Average AC coverage” in the analysis report from 0% to ≥70% (Good) for `renderx-web-orchestration`.
- Integrate alignment checks into the symphonic code analysis pipeline for CI visibility and gating.

## Scope
- Domain: `renderx-web-orchestration` (aliases: `renderx`, `renderx-web`, `renderx-orchestration`).
- Sources of truth: `acceptanceCriteriaStructured` in JSON sequences (beats), centralized AC text in `docs/renderx-web/ac.txt`.
- Test surfaces: unit/integration tests (vitest/jest if present), E2E tests (Cypress).

## Constraints & Assumptions
- ACs are in structured GWT form and kept up to date; single-item arrays are inlined.
- We prefer non-invasive test changes (light-weight tagging first), deeper semantic checks later.
- Analyzer already generates artifacts and reports; we will extend, not replace, it.

## Strategy
1. Canonical AC Registry
   - Generate a normalized AC registry from `acceptanceCriteriaStructured` including:
     - Keys: `domainId`, `sequenceId`, `beatId`, `acIndex`, stable `acId` (`<domain>:<sequence>:<beat>:<ac>`), and normalized text (Given/When/Then/And).
   - Store at `.generated/acs/renderx-web-orchestration.registry.json` for analyzer and tests.
  - Workflow reference: `packages/orchestration/json-sequences/ac-to-test-alignment.workflow.json` (Movement 1 / Beat 1)

2. Lightweight Test Tagging (Phase 1)
   - Introduce a concise, copy-pastable tag convention in test titles or `describe/it` blocks:
     - `[AC:renderx-web-orchestration:create:1.1:1]` → domain:sequence:beat:ac-index
     - Beat-only tagging when appropriate: `[BEAT:renderx-web-orchestration:create:1.1]`.
  - Provide a small helper (optional) that formats tags and reduces typos.
  - Workflow reference: Movement 2 (publish-tagging-guide, adopt-tags)
   - Outcome: Presence-based alignment (AC has at least one matching test tag).

3. Reporter Integration (Phase 1)
  - Parse test results (vitest/jest and Cypress Mocha JSON) to collect test titles.
   - Extract AC and BEAT tags and correlate with the AC registry.
   - Compute per-AC, per-beat coverage: present vs. missing tags.
  - Workflow reference: Movement 3 (collect-vitest-jest, collect-cypress)

4. Heuristic Assertion Mapping (Phase 2)
   - Add minimal heuristics to check alignment depth:
     - THEN clauses mapped to assertions pattern sets (e.g., DOM state, event telemetry, API response) via keyword dictionaries.
     - Allow test to optionally declare `ASSERT:[event|dom|api|perf]` markers for clarity.
   - Score AC coverage by matched THEN assertions (≥1 assertion per THEN → covered).
   - Workflow reference: Movement 4 (compute-presence-coverage, compute-then-heuristics)

5. Deep Semantic Checks (Phase 3)
   - Optional: AST or runtime hooks to detect actual assertions corresponding to THEN conditions.
   - Optional: SLA timing checks and telemetry event verification when defined in AC.

6. Pipeline Integration
   - Extend `scripts/analyze-symphonic-code.cjs` (or add `scripts/validate-ac-alignment.cjs`) to:
     - Load AC registry + test results
     - Compute alignment metrics
     - Emit JSON + Markdown sections currently shown in the report
     - Gate CI on thresholds (e.g., warn <70%, fail <50% for key beats)
   - Workflow reference: Movements 5–6 (emit-artifacts, enforce-thresholds, rollout)

## Milestones & Deliverables
- M1: Tagging + Presence Mapping (1–2 days)
  - Deliverables: AC registry generator; test result parser; alignment summary (presence-based); docs for tagging.
  - Target: Average AC coverage ≥30%.

- M2: THEN Assertion Heuristics (2–3 days)
  - Deliverables: Simple assertion keyword map; assertion markers; scored alignment; enhanced report.
  - Target: Average AC coverage ≥60%.

- M3: CI Gate + Optional Semantic Depth (3–5 days)
  - Deliverables: CI thresholds; optional deeper checks; stable artifact layout.
  - Target: Average AC coverage ≥70% (Good) sustained.

## Metrics & Success Criteria
- Primary: Average AC coverage in report ≥70%.
- Secondary:
  - Beats with at least one tagged test ≥80%.
  - THEN-to-assertion mapping coverage ≥60% in Phase 2.
  - No drift: ACs without tags trend → 0 over time.

## Work Breakdown
1. Generator: `scripts/generate-ac-registry.cjs` → produce normalized `.generated/acs/*.json`.
2. Test Tagging Guide: `docs/TEST_TAGGING_GUIDE.md`.
3. Test Parsers: `scripts/ac-alignment/collect-test-results.cjs` (vitest/jest + Cypress JSON).
4. Alignment Engine: `scripts/ac-alignment/compute-alignment.cjs` → presence + Phase 2 heuristics.
5. Pipeline Hook: integrate in `analyze-symphonic-code.cjs` or `validate-ac-alignment.cjs`.
6. Report Writer: emit JSON + Markdown and feed into existing docs generation.

## Risks & Mitigations
- Inconsistent test naming → Mitigate with helper/tag generator and PR checks.
- False positives in heuristics → Keep Phase 2 opt-in; display confidence.
- Developer friction adding tags → Provide snippet examples and lint rules.

## Implementation Notes
- AC ID Format: `AC:<domain>:<sequence>:<beat>:<index>` (e.g., `AC:renderx-web-orchestration:create:1.1:1`).
- Beat ID Format: `BEAT:<domain>:<sequence>:<beat>`.
- Cypress: enable JSON reporter or use `after:spec` hook to write summarized titles.
- Vitest/Jest: use built-in JSON reporters (or custom) to export results.

## Definition of Done
- Report shows ≥70% Average AC coverage for `renderx-web-orchestration`.
- CI includes alignment step with thresholds and clear failure messages.
- Documentation explains tagging and local validation steps.
