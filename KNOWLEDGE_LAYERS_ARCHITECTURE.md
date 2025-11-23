# Knowledge Layers System Architecture

*Comprehensive Integration Guide for Traceability + Project Knowledge + Telemetry + SLO/SLI*

**Last Updated:** 2025-11-23  
**Status:** Complete (Layers 1-2), Ready for Phases 3-5 (Layers 3-5)

---

## 5-Layer Knowledge Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: Compliance & Triggering                            │
│          .generated/sla-compliance-report.json              │
│          ↑ Monitors SLO adherence, triggers self-healing    │
├─────────────────────────────────────────────────────────────┤
│ LAYER 4: SLO/SLI Targets & Budgets                          │
│          .generated/slo-targets.json                        │
│          .generated/error-budgets.json                      │
│          ↑ Defines acceptable performance, tracks spend      │
├─────────────────────────────────────────────────────────────┤
│ LAYER 3: Telemetry & Health Status (REAL-TIME)            │
│          .generated/sli-metrics.json                        │
│          .generated/renderx-web-telemetry.json              │
│          ↑ Current health, anomalies, performance           │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Project Knowledge (STRUCTURAL)                    │
│          .generated/project-knowledge-map.json              │
│          • File locations • Workflows • Patterns            │
│          ↑ WHERE things are, HOW they're structured         │
├─────────────────────────────────────────────────────────────┤
│ LAYER 1: Global Traceability (ARCHITECTURAL)               │
│          .generated/global-traceability-map.json            │
│          • Components • Pipelines • Integrations            │
│          ↑ WHAT things are, HOW they connect               │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Details & Integration Points

### Layer 1: Global Traceability Map
**File:** `.generated/global-traceability-map.json` (Generated)  
**Purpose:** System-wide architecture and data flows  
**Contains:**
- 17 packages with roles (active, standalone, deprecated)
- 11-stage data transformation pipeline (ographx → self-healing → dashboard)
- Component health status (Canvas: 49.31, Host SDK: 56.08)
- Proposed dashboard architecture specification
- Robotics deprecation plan

**Query Examples:**
```bash
# What components exist?
jq '.packages.active_packages[] | {name, path, role}' \
  .generated/global-traceability-map.json

# What's the complete data pipeline?
jq '.data_transformation_pipelines.pipeline_ographx_to_self_healing_to_traceability.stages' \
  .generated/global-traceability-map.json
```

**Consumes:**
- Architecture decisions
- Component definitions
- Data flow analysis

**Produces:**
- System topology for Layer 2 (project discovery)
- Data model for Layer 3 (telemetry integration)
- Integration points for Layer 4-5

---

### Layer 2: Project Knowledge Map
**File:** `.generated/project-knowledge-map.json` (Generated)  
**Purpose:** Project-level intelligence for practical work  
**Contains:**
- Self-Healing project structure (src/handlers/, json-sequences/, __tests__/)
- OGraphX analysis tool details
- SLO Dashboard package specification
- Workflows: Sprint-based implementation, Handler-to-JSON-to-Test pattern, Anomaly → Fix loop
- Reusable patterns (domain organization, JSON-first design, test parity)

**Query Tool:** `scripts/query-project-knowledge.js`

**Example Queries:**
```bash
# Find self-healing project files
node scripts/query-project-knowledge.js "self-healing"

# Locate sprint workflow implementation
node scripts/query-project-knowledge.js "sprint workflow"

# Show reusable patterns
node scripts/query-project-knowledge.js "reusable patterns"
```

**Consumes:**
- Layer 1 (architectural decisions inform file organization)
- Actual project structure (scanned from filesystem)

**Produces:**
- File locations for Layer 3-5 implementation
- Workflow templates for future projects
- Pattern library for code reuse

---

### Layer 3: Telemetry & Health Status (Real-Time)
**Files:** 
- `.generated/sli-metrics.json` (Phase 2 output, current)
- `.generated/renderx-web-telemetry.json` (30 anomalies)
- `.generated/log-source-lineage/` (100% lineage with line numbers)

**Purpose:** Current production health and anomalies  
**Current Status:** ✅ Complete (Phase 2)

**Contains:**
- 5 components with health scores (Canvas: 49.31 CRITICAL, Host SDK: 56.08 BEST)
- SLI metrics: latencies (P50/P95/P99), error rates, availability %
- 30 detected anomalies with severity
- 100% traceability to source files + line numbers

**Real-Time Update Cycle:**
```
Production → .logs/ (87 files, 120,994 lines)
   ↓
scripts/calculate-sli-metrics.js (Phase 2)
   ↓
.generated/sli-metrics.json (UPDATED)
   ↓
Phase 3 consumes (SLO targets based on real data)
   ↓
Phase 5 compares (breach detection)
   ↓
Self-healing triggered
   ↓
Fixes deployed
   ↓
Phase 2 recalculates (proves improvement)
```

**Consumes:**
- Layer 1 (knows component definitions)
- Layer 2 (scripts location from project knowledge)
- Production logs (real telemetry)

**Produces:**
- Input for Layer 4 (SLO target definition)
- Input for dashboard visualization
- Self-healing trigger data

---

### Layer 4: SLO/SLI Targets & Budgets (Phases 3-4)
**Files:**
- `.generated/slo-targets.json` (Phase 3, READY)
- `.generated/error-budgets.json` (Phase 4, READY)

**Purpose:** Define acceptable performance and track budget consumption  
**Current Status:** 🟡 Design Complete, Implementation Ready

**Phase 3: SLO Definition Engine**
```
Input:  .generated/sli-metrics.json (real data)
        {
          "canvas": {
            "health_score": 49.31,
            "availability": "99.71%",
            "latency_p95": "45.2ms"
          }
        }

Script: scripts/define-slo-targets.js
        Analyze: Is 99.71% availability sustainable?
        Analyze: Can we target 45ms P95 latency?
        Decide: Conservative targets with headroom

Output: .generated/slo-targets.json
        {
          "canvas": {
            "availability_target": "99.9%",
            "latency_p95_target": "50ms",
            "error_rate_target": "0.1%"
          }
        }
```

**Phase 4: Error Budget Calculator**
```
Input:  .generated/slo-targets.json (targets)
        .generated/sli-metrics.json (actual metrics)

Script: scripts/calculate-error-budgets.js
        Calculate monthly error allowance per component
        Track actual consumption vs budget
        Alert when approaching exhaustion

Output: .generated/error-budgets.json
        {
          "canvas": {
            "budget_monthly_minutes": 4.32,    // 99.9% = 43.2 seconds/day
            "consumed_minutes": 1.8,
            "remaining_minutes": 2.52,
            "budget_percentage_consumed": 41.7,
            "days_until_breach": 8
          }
        }
```

**Consumes:**
- Layer 3 (real metrics)
- Domain knowledge (component criticality)

**Produces:**
- Input for Layer 5 (compliance monitoring)
- Dashboard visualization inputs

---

### Layer 5: Compliance & Triggering (Phase 5)
**File:** `.generated/sla-compliance-report.json` (Phase 5, CRITICAL)

**Purpose:** Monitor SLA adherence and trigger self-healing on breach  
**Current Status:** 🟡 Design Complete, Ready for Phase 5

**Phase 5: SLA Compliance Tracker**
```
Real-Time Monitoring Loop:
  ┌─ Every 60 seconds ─┐
  ↓                     ↓
Calculate current metrics vs SLO targets
  ↓
.generated/sla-compliance-report.json
  {
    "canvas": {
      "compliant": false,     ← SLO BREACHED!
      "compliance_percentage": 98.5,
      "breach_reason": "availability dropped below 99.9%"
    }
  }
  ↓
IF breach detected:
  ┌──────────────────────────────┐
  │ TRIGGER SELF-HEALING SYSTEM  │
  └──────────────────────────────┘
  ↓
packages/self-healing/json-sequences/*
  ├─ telemetry.parse (extract events from .logs/)
  ├─ anomaly.detect (find root cause)
  ├─ diagnosis.analyze (assess impact)
  ├─ fix.generate (create code fix)
  ├─ validation.run (test the fix)
  ├─ deployment.deploy (ship to production)
  └─ learning.track (track improvement)
  ↓
Phase 2 recalculates metrics
  ↓
Canvas health improves → New compliance status
  ↓
Dashboard shows RECOVERY in real-time
```

**Consumes:**
- Layer 4 (SLO targets, error budgets)
- Layer 3 (current metrics)
- Layer 2 (self-healing project location)

**Produces:**
- Self-healing trigger signals
- Compliance reports
- Dashboard updates

---

## Complete Integration Example: Canvas Component Recovery

### Scenario
Canvas health score is 49.31 (CRITICAL). We want to understand the entire flow.

### Layer 1: Architectural Understanding
```bash
# Check global traceability
jq '.packages.active_packages[] | select(.id=="canvas-component")' \
  .generated/global-traceability-map.json

# Result: Canvas is critical component, health 49.31, 3 known issues
# → Identified root cause candidates from Layer 3 anomalies
```

### Layer 2: Project Discovery
```bash
# Find where self-healing sequences are defined
node scripts/query-project-knowledge.js "self-healing"

# Result: packages/self-healing/json-sequences/
# → Know exactly where to trigger from for Phase 5
```

### Layer 3: Current Health
```bash
# Check real metrics
jq '.components[] | select(.id=="canvas-component")' \
  .generated/sli-metrics.json

# Result: health: 49.31, availability: 99.71%, 3 anomalies
# → Can immediately identify Canvas degradation
```

### Layer 4: Targets & Budget
```bash
# Define SLO target (Phase 3)
# "Canvas should target 99.9% availability"
# .generated/slo-targets.json will have: availability_target: 99.9%

# Calculate error budget (Phase 4)
# "With 99.9% target, Canvas gets 4.32 minutes/month downtime"
# .generated/error-budgets.json will track consumption
```

### Layer 5: Trigger Self-Healing
```bash
# Phase 5 detects compliance breach
# "Canvas is at 99.71%, target is 99.9% → BREACH!"

# Automatically invoke:
conductor.play('self-healing:telemetry:parse', { logsDirectory: '.logs' })
→ Find Canvas anomalies in logs
→ Extract to diagnosis
→ Generate fixes
→ Deploy fixes
→ Recalculate metrics

# New Canvas metrics come back improved → Dashboard shows recovery
```

---

## Data Flow Across Layers

```
        PRODUCTION
            ↓
        .logs/ files (87, 120,994 lines)
            ↓
    Layer 3 (Phase 2): Calculate Metrics
    scripts/calculate-sli-metrics.js
            ↓
    .generated/sli-metrics.json (Canvas: 49.31)
    │         │
    │         ├─→ Layer 2 Query: "Where is self-healing?"
    │         │   → packages/self-healing/
    │         │
    │         └─→ Layer 4 (Phase 3): Define SLO Targets
    │             scripts/define-slo-targets.js
    │             → .generated/slo-targets.json (Canvas target: 99.9%)
    │
    └─→ Layer 5 (Phase 5): Compliance Tracking
        scripts/track-sla-compliance.js
        → Compare 99.71% actual vs 99.9% target
        → BREACH DETECTED
        → Invoke Layer 2: self-healing sequences
        → packages/self-healing/json-sequences/telemetry.parse.json
        → ... through all 7 sequences ...
        → Deploy fixes to production
        → Recalculate Layer 3 metrics
        → New Canvas: 99.95% availability
        → Dashboard shows improvement
```

---

## Operational Workflows

### Daily Operations
1. **Morning Check** (Layer 3): `jq '.components[]' .generated/sli-metrics.json` → See health
2. **Problem Found** (Layer 2): `node scripts/query-project-knowledge.js` → Find where to look
3. **Deep Dive** (Layer 1): `jq '.data_transformation_pipelines'` → Understand impact
4. **Implement** (Layer 2): Use sprint workflow from `IMPLEMENTATION_ROADMAP.md`

### SLO/SLI Management
1. **Set Targets** (Layer 4, Phase 3): Based on Layer 3 real metrics
2. **Track Budgets** (Layer 4, Phase 4): Monitor spend over time
3. **Monitor Compliance** (Layer 5, Phase 5): Layer 5 continuous tracking
4. **Auto-Remediate** (Layer 2 + Layer 5): Self-healing triggered on breach

### New Project Onboarding
1. **Understand Architecture** (Layer 1): Read global traceability
2. **Learn Patterns** (Layer 2): `query-project-knowledge.js "reusable patterns"`
3. **Apply Pattern**: Use sprint workflow or handler organization
4. **Register** in Layer 2: Add to project-knowledge-map.json

---

## Next Implementation Steps

### Phase 3 (Layer 4): SLO Definition Engine
**Dependencies:** ✅ Complete (Layer 3 metrics available)  
**Script:** `scripts/define-slo-targets.js`  
**Input:** `.generated/sli-metrics.json`  
**Output:** `.generated/slo-targets.json`

### Phase 4 (Layer 4): Error Budget Calculator
**Dependencies:** ✅ Complete (Layer 4 Phase 3 targets)  
**Script:** `scripts/calculate-error-budgets.js`  
**Input:** `.generated/slo-targets.json`  
**Output:** `.generated/error-budgets.json`

### Phase 5 (Layer 5): SLA Compliance Tracker
**Dependencies:** ✅ Complete (Layer 4 budgets + Layer 2 self-healing)  
**Script:** `scripts/track-sla-compliance.js`  
**Input:** `.generated/error-budgets.json`  
**Output:** `.generated/sla-compliance-report.json` + **Self-Healing Trigger**

### Phase 6 (New Layer): Real-Time Dashboard
**Dependencies:** ✅ Complete (Layer 5 compliance data)  
**Package:** `packages/slo-dashboard/`  
**Consumes:** All Layer 3-5 outputs  
**Displays:** Metrics, budgets, compliance, self-healing activity

---

## Architecture Summary

| Layer | File | Focus | Status | Next Layer |
|-------|------|-------|--------|-----------|
| 1 | global-traceability-map.json | WHAT (architecture, components) | ✅ Complete | 2 |
| 2 | project-knowledge-map.json | WHERE (files, workflows, patterns) | ✅ Complete | 3 |
| 3 | sli-metrics.json | NOW (current health, real metrics) | ✅ Complete | 4 |
| 4 | slo-targets.json, error-budgets.json | TARGETS (goals, budgets) | 🟡 Phase 3-4 | 5 |
| 5 | sla-compliance-report.json | COMPLIANCE (adherence, triggers) | 🟡 Phase 5 | 6 |

---

**Pattern:** Layers 1-2 are **structural** (understand the system).  
**Layers 3-5 are **operational** (run the system).  
**All 5 together enable**: Understanding → Planning → Execution → Monitoring → Auto-Remediation → Improvement

