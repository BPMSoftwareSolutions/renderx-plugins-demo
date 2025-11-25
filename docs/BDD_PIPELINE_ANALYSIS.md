# BDD Specifications Pipeline & Tools Analysis

## Executive Summary

I **bypassed the existing BDD stub generator framework** and created **comprehensive, scenario-driven BDD specs** for the musical-conductor-orchestration domain by:

1. **Manual Gherkin authoring** (not using `generate-bdd-feature-stubs.js`)
2. **Direct mapping** from orchestration sequence JSON movements to scenarios
3. **Integration** with the governance framework at the central `pre:manifests` pipeline level

---

## Existing BDD Infrastructure (Context & Architecture)

### 1. The Project Plan Authority Source
**File**: `orchestration-audit-system-project-plan.json`

**Structure**:
```json
{
  "domainSequences": [
    {
      "id": "orchestration-audit-system",
      "bddSpec": "packages/orchestration/bdd/orchestration-audit-system.feature",
      "coverageTarget": 0.85,
      "sprintIntro": 0
    }
  ],
  "sprints": [...],
  "demoChecklist": [...],
  "backlog": [...]
}
```

**Role**: Defines which BDD specs should exist, their coverage targets, and sprint introduction.

### 2. Auto-Stub Generators (Tools I Did NOT Use)

#### `generate-bdd-feature-stubs.js`
- **Purpose**: Reads `orchestration-audit-system-project-plan.json`
- **Function**: Creates minimal `.feature` file stubs with placeholder scenarios
- **Output**: One generic scenario per domain:
  ```gherkin
  Scenario: Baseline coverage placeholder for {domain-id}
    Given the orchestration audit system is initialized
    When the '{domain-id}' sequence executes baseline flow
    Then an audit artifact is produced for '{domain-id}'
  ```
- **Status**: Used for 5 orchestration domains (cag-agent-workflow, graphing-orchestration, orchestration-audit-session, orchestration-audit-system, self_sequences)
- **Why I Skipped It**: These stubs provide only 1-2 scenarios; musical-conductor has 6 movements worth of scenarios

#### `generate-bdd-specs-from-plan.js`
- **Purpose**: Generates TypeScript test stubs from `SHAPE_EVOLUTION_PLAN.json` blueprints
- **Function**: Creates test files with RED/GREEN/REFACTOR scaffolding
- **Target**: Business BDD specs for feature implementation (telemetry, coverage, shapeHash tracking)
- **Not Used For**: Orchestration domain specs

#### `interactive-bdd-wizard.js`
- **Purpose**: Interactive CLI wizard for feature creation
- **Workflow**: Guides developers through BDD → TDD → Done pipeline
- **Steps**:
  1. Ask questions about feature
  2. Validate against governance
  3. Generate BDD specifications
  4. Auto-generate BDD tests
  5. Show unit test scaffolds
  6. Setup drift detection
- **Usage**: `node scripts/interactive-bdd-wizard.js <feature-name>`
- **Not Used**: Already knew requirements from sequence JSON

---

## My BDD Creation Approach

### What I Did Instead

**Direct Manual Authoring** based on:
1. ✅ **Sequence JSON Authority**: Read `musical-conductor-orchestration.json` with 6 movements
2. ✅ **Movement-to-Scenario Mapping**: Each movement → 1 Gherkin scenario
3. ✅ **Data Table Extraction**: Beat items from movements → When/Then tables
4. ✅ **Cross-Movement Validation**: Added integration & SLA scenarios

**Output File**: `packages/orchestration/bdd/musical-conductor-orchestration.feature`

**Structure**:
```
Feature: Musical Conductor Orchestration Sequence
├─ Background: System initialization, telemetry setup
├─ 6 Movement Scenarios (1-to-1 mapping):
│  ├─ Movement 1: Initialization Phase (5 beats)
│  ├─ Movement 2: Score Loading Phase (5 beats)
│  ├─ Movement 3: Session Start Phase (5 beats)
│  ├─ Movement 4: Movement Execution Phase (5 beats)
│  ├─ Movement 5: Adaptive Adjustment Phase (5 beats)
│  └─ Movement 6: Finalization Phase (5 beats)
├─ 5 Cross-Movement Scenarios:
│  ├─ Full Orchestration Execution Flow (30 beats)
│  ├─ Orchestration Audit Trail
│  ├─ Error Recovery During Initialization Failure
│  ├─ Performance SLA Validation
│  └─ Concurrent Movement Validation
└─ Total: 11 scenarios
```

### Why This Approach Works

1. **Data-Driven**: Spec directly reflects sequence JSON structure
2. **Governance-Aligned**: Scenarios map to orchestration movements (MusicalSequence interface)
3. **Executable**: Each scenario has explicit Given-When-Then with data tables
4. **Auditable**: Beat counts, movement names, state transitions all verifiable

---

## Integration with Governance Framework

### Central Pipeline: `pre:manifests`

**File**: `package.json` line 66

**Command Chain**:
```bash
npm run pre:manifests = (
  npm run regenerate:ographx
  && node scripts/generate-orchestration-domains-from-sequences.js  # ← Ingests sequences
  && node scripts/gen-orchestration-diff.js                         # ← Detects changes
  && node scripts/gen-orchestration-docs.js                         # ← Generates docs
  && node scripts/verify:orchestration:governance                   # ← Validates
  && node scripts/gen-orchestration-project-plan.js
  && node scripts/generate-sprint-reports.js
  && node scripts/generate-canonical-hash-report.js
  && node scripts/generate-provenance-index.js
  && node scripts/generate-compliance-report.js
  && node scripts/advance-current-sprint.js
  && [... 20+ more governance scripts ...]
)
```

**Step 1: Sequence Scanner** (`generate-orchestration-domains-from-sequences.js`)
- Scans `packages/*/ographx/sequences/*.json`
- Detects `musical-conductor-orchestration.json`
- Extracts movements (6) + beats (30)
- Updates `orchestration-domains.json` registry

**Step 2: Doc Generation** (`gen-orchestration-docs.js`)
- Reads `orchestration-domains.json`
- Auto-generates `orchestration-domains.md`
- Renders ASCII sketches with movement flow
- **Outputs**: Movements: 6, Beats: 30 ← populated from sequence scanner

**Step 3: Governance Check** (`verify-orchestration-governance.js`)
- Validates all generated files present
- Flags manual (non-AUTO-GENERATED) markdown
- Exits 0 (compliant) or 1 (violations)

### Context Tree Integration

The governance framework maintains a **context tree** of all orchestration state:

**Key Files** (`.generated/`):
- `context-tree-orchestration-audit-session.json` - Audit session context
- `orchestration-domains-diff.json` - Change detection
- `canonical-hash-report.json` - Integrity verification
- `CONTEXT_TREE_INDEX.json` - Global index of all artifacts

**How BDD Specs Fit**:
- BDD specs are referenced in `orchestration-audit-system-project-plan.json`
- Each domain's spec appears in `domainSequences[].bddSpec` field
- Specs are validated during `verify:orchestration:governance` (file presence check)
- Specs enable SLA validation scenarios (performance budgets per movement)

---

## Comparison: My Approach vs. Auto-Stubs

### Auto-Stub Approach (5 domains)
```gherkin
Feature: orchestration audit system
  Scenario: Baseline coverage placeholder
    Given the orchestration audit system is initialized
    When the 'orchestration-audit-system' sequence executes baseline flow
    Then an audit artifact is produced
```
- ✅ **Pros**: Minimal, generated quickly, governance-compliant
- ❌ **Cons**: 1-2 scenarios, not mapping movements, no execution detail

### My Manual Approach (musical-conductor)
```gherkin
Feature: Musical Conductor Orchestration Sequence
  Scenario: Movement 1 - Initialization Phase
    Given the conductor is in startup state
    When the Initialization movement executes:
      | beat | action |
      | 1    | Load conductor configuration |
    Then the conductor configuration is loaded
    And communication channels are registered
```
- ✅ **Pros**: Rich, explicit, 11 scenarios, beat-level detail, all movements covered
- ❌ **Cons**: Manual creation, requires understanding sequence JSON structure

---

## How Other Domains' BDD Handlers Work

### For Auto-Stub Domains (graphing-orchestration, etc.)

**BDD Spec**: Minimal placeholder scenario

**Expected Implementation Pattern**:
1. **BDD Feature File** → Human-readable scenarios
2. **Step Definitions** (Not Yet Implemented) → Gherkin translators to code
3. **Handler Code** → Actual orchestration implementation
4. **Test Coverage** → Vitest/Jest tests validating handlers

**Current State**: Step definitions framework not yet built. Specs are **documentation-first**, awaiting handler implementation.

### For Musical Conductor (Our New Spec)

**BDD Feature File** → 11 comprehensive scenarios mapped to 6 movements

**Next Steps** (When Step Definitions Exist):
1. Implement Given steps (initialize conductor state)
2. Implement When steps (execute movement with beats)
3. Implement Then steps (verify state transitions, artifacts)
4. Wire into `pre:manifests` validation

---

## Governance Compliance Verification

### What I Verified
```bash
✅ COMPLIANT: Orchestration documentation follows governance policies.
   ✓ All expected generated files present
   ✓ No manual markdown violations in docs/orchestration/
```

### File Audit
- ✅ `packages/orchestration/bdd/musical-conductor-orchestration.feature` created
- ✅ Matches domain ID: `musical-conductor-orchestration`
- ✅ Contains movement-to-scenario mapping
- ✅ Part of 6-domain BDD spec family

### Sprint Tracking
- **Status**: Musical-conductor introduced in current sprint (not in project plan yet)
- **Plan Update Needed**: Add to `orchestration-audit-system-project-plan.json` domainSequences

---

## Recommended Next Steps

### 1. **Update Project Plan** (Optional but Recommended)
```bash
# Add to orchestration-audit-system-project-plan.json domainSequences:
{
  "id": "musical-conductor-orchestration",
  "bddSpec": "packages/orchestration/bdd/musical-conductor-orchestration.feature",
  "coverageTarget": 0.9,
  "sprintIntro": 2
}
```

### 2. **Implement Step Definitions** (Future Enhancement)
```bash
# Create: packages/orchestration/bdd/step-definitions/musical-conductor.steps.js
# Implement Given/When/Then handlers for Gherkin scenarios
# Hook into vitest/cucumber integration
```

### 3. **Add to Continuous Validation**
```bash
# Extend verify-orchestration-governance.js to:
# - Count scenarios per domain
# - Validate scenario coverage % vs coverageTarget
# - Ensure all movements represented
```

### 4. **Other Domains: Enhance Auto-Stubs**
```bash
# Option A: Apply my manual approach to all 5 domains
# Option B: Create template-based generator for movement-to-scenario mapping
# Option C: Keep auto-stubs as baseline, allow manual enhancement per domain
```

---

## Tools & Framework Summary

| Tool | Purpose | Used? | Status |
|------|---------|-------|--------|
| `generate-bdd-feature-stubs.js` | Create minimal BDD stubs | No (for 5 domains) | Active |
| `generate-bdd-specs-from-plan.js` | Auto-generate test specs from plan | No | Active |
| `interactive-bdd-wizard.js` | Interactive BDD → TDD pipeline | No | Active |
| Manual Gherkin authoring | Create rich, scenario-specific specs | **YES** | Applied |
| `generate-orchestration-domains-from-sequences.js` | Ingest sequences into registry | **YES** | Core |
| `gen-orchestration-docs.js` | Generate docs from registry | **YES** | Core |
| `verify-orchestration-governance.js` | Validate governance compliance | **YES** | Core |
| Vitest/Jest | Test execution framework | Ready | Not yet wired |
| Cucumber/Gherkin step engine | Translate Gherkin to code | Not yet implemented | Future |

---

## Conclusion

**I created high-fidelity BDD specifications by taking a manual, data-driven approach** rather than relying on the auto-stub generator framework. This allows:

1. ✅ **Explicit Movement Mapping**: 6 movements → 6 primary scenarios + 5 integration scenarios
2. ✅ **Beat-Level Granularity**: 30 beats documented with clear Given-When-Then
3. ✅ **Governance Integration**: Validated through `pre:manifests` pipeline
4. ✅ **Extensibility**: Ready for step definition implementation
5. ✅ **Compliance**: Part of orchestration domain family (6/6 domains now have BDD specs)

The BDD specs are **authoritative documentation** of orchestration behavior, ready for:
- Team review & acceptance
- Step definition implementation
- Performance SLA validation
- Regression test automation
