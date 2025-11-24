# 🎼 Governance as Root System

**Everything is an expression of governance. Governance is the conductor.**

---

## The Core: Two Canonical Sources of Truth

### 1. SHAPE_EVOLUTION_PLAN.json
**What must be instrumented and how it evolves**

- Defines telemetry shaping, budgets, contracts
- Evolution rules and required fields
- CI hooks and validation gates
- Business-BDD spec generation blueprints
- TDD phase discipline (red/green/refactor)
- Handler expectations per feature

### 2. knowledge-index.json
**What exists, where it lives, and what's canonical**

- Global traceability map (17 packages)
- Project knowledge map (workflows, patterns)
- Telemetry & health metrics (5 components)
- SLO/SLI targets and compliance
- Canonical artifact locations
- Agent context remounting rules

---

## Everything Else is an Expression of These Two

### 🎭 BDD Specs = Governance Surface for Behavior

**Governed by:** SHAPE_EVOLUTION_PLAN.json `specGeneration.blueprints`

```
Blueprint → Generated Spec File
  ├─ Must exist (governance requirement)
  ├─ Must emit valid telemetry (shape governance)
  ├─ Must include required fields (feature, event, beats, status, correlationId, shapeHash)
  └─ Must respect contracts (failOnMissing: true)
```

**Result:** BDD is where governance meets behavior.

---

### 📊 Telemetry Shapes = Governance Over System Speech

**Governed by:** SHAPE_EVOLUTION_PLAN.json + shape-evolutions.json + shape-budgets.json

```
Sprint 1: Shape Persistence & History
Sprint 2: Enforcement + Coverage Coupling
Sprint 3: Shape Budgets + Visual Telemetry Map
Sprint 4: Shape Contracts + Composite Correlation

Every feature MUST:
  ├─ Emit a telemetry shape
  ├─ Conform to the contract
  ├─ Annotate any drift through evolution
  └─ Respect budgets & SLO overlays
```

**Result:** Telemetry is governed self-reporting, not just logs.

---

### 🧪 TDD Tests = Governance Over Change Discipline

**Governed by:** SHAPE_EVOLUTION_PLAN.json `tdd.phase`

```
Red Phase:
  ├─ Blueprints generate intentionally failing tests
  ├─ CI verifies: red features can't silently go green
  └─ Evolution entries required for red → green

Green Phase:
  ├─ Implementation makes tests pass
  ├─ Telemetry shape must be valid
  └─ Coverage coupling must attach

Refactor Phase:
  ├─ Tests still pass
  ├─ Shape remains valid
  └─ Evolution recorded
```

**Result:** TDD is governed, not just "best practice."

---

### 🔍 Integration Tests for Observability = Governance Over Seeing

**Governed by:** knowledge-index.json + SHAPE_EVOLUTION_PLAN.json

```
Integration tests assert:
  ├─ Telemetry emitted at key boundaries
  ├─ Coverage segments attach correctly (coverageId)
  ├─ Budgets trigger anomalies appropriately
  ├─ Composite chains match expected flows
  └─ End-to-end observability is complete
```

**Result:** Observability is governed and testable.

---

### 🧠 Context Remounting = Governance Over Agent Cognition

**Governed by:** knowledge-index.json + SHAPE_EVOLUTION_PLAN.json

```
Before each agent iteration:
  ├─ Load root context (from evolution plan)
  ├─ Load sub-context (from sprint objective)
  ├─ Load boundaries (from knowledge-index)
  └─ Load previous context (from context history)

Agent is governed by:
  ├─ What it's allowed to read
  ├─ What it's allowed to touch
  └─ What context it must reload every session
```

**Result:** Agent behavior is governed like code and specs.

---

## 🎼 The Unified System

```
┌─────────────────────────────────────────────────────┐
│ GOVERNANCE CORE                                     │
│ ├─ SHAPE_EVOLUTION_PLAN.json (what & how)          │
│ └─ knowledge-index.json (where & canonical)        │
└─────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    BDD Specs      Telemetry Shapes   TDD Tests
    (behavior)     (self-reporting)   (discipline)
        ↓               ↓               ↓
        └───────────────┼───────────────┘
                        ↓
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
    Integration    Context          Agent
    Observability  Remounting       Behavior
    (seeing)       (cognition)      (governed)
```

---

## 🎭 The Metaphor

- **Governance** = The conductor
- **BDD specs** = The score
- **Telemetry shapes** = The orchestra's sound
- **TDD tests** = Rehearsal discipline
- **Integration tests** = Sound check
- **Context remounting** = Musician's mental practice
- **knowledge-index.json** = Sheet music library
- **SHAPE_EVOLUTION_PLAN.json** = Show program

All of it is one thing: **A system that governs itself through explicit, traceable, testable rules.**

---

## ✅ What This Means

1. **No hidden behavior** - Everything is governed
2. **No stale context** - Agents reload before acting
3. **No silent drift** - All changes are annotated
4. **No untested claims** - Specs prove behavior
5. **No invisible system** - Telemetry is complete
6. **No agent confusion** - Context is explicit

---

**This is the missing piece: Governance as the root system that everything else expresses.**

