# 🔍 RAG Discovery Query Examples

## Real Queries New Agents Can Run

These are actual working queries agents can execute to discover workflows and patterns.

---

## Query 1: "I need a workflow from ideation to production"

```bash
$ node scripts/query-project-knowledge.js "workflow ideation production"
```

**System Returns:**
```json
{
  "query": "workflow ideation production",
  "matches": 1,
  "result": {
    "type": "workflow",
    "name": "Sprint-Based Implementation Workflow",
    "description": "7-phase sequential delivery from ideation through observation to production",
    "location": "packages/self-healing/IMPLEMENTATION_ROADMAP.md",
    "duration_weeks": 14,
    "phases": 7,
    "total_handlers": 67,
    "total_tests": 250,
    "phases_breakdown": [
      { "number": 1, "name": "Ideation - Parse/Collect", "weeks": 2, "handlers": 7, "tests": 25 },
      { "number": 2, "name": "Detect Issues", "weeks": 2, "handlers": 9, "tests": 35 },
      { "number": 3, "name": "Root Cause Analysis", "weeks": 2, "handlers": 11, "tests": 40 },
      { "number": 4, "name": "Solution Generation", "weeks": 2, "handlers": 9, "tests": 30 },
      { "number": 5, "name": "Demo/Observation - Test", "weeks": 2, "handlers": 10, "tests": 45 },
      { "number": 6, "name": "Production - Deploy", "weeks": 2, "handlers": 11, "tests": 40 },
      { "number": 7, "name": "Learning/Improvement", "weeks": 2, "handlers": 10, "tests": 35 }
    ],
    "applicable_to": [
      "Any phased sequential delivery",
      "Feature development",
      "System optimization",
      "SLO/SLI implementation",
      "Dashboard creation"
    ],
    "next_read": [
      "NEW_AGENT_DISCOVERY_DEMO.md (overview)",
      "WORKFLOW_DEMO.md (real example)",
      "packages/self-healing/IMPLEMENTATION_ROADMAP.md (detailed)"
    ]
  }
}
```

**Agent's next action:** Read NEW_AGENT_DISCOVERY_DEMO.md (step-by-step guide)

---

## Query 2: "Show me example JSON for phase 1"

```bash
$ node scripts/query-project-knowledge.js "json sequence phase 1"
```

**System Returns:**
```
📁 PROJECT: self-healing
════════════════════════════════════════════════════════════

📍 Phase 1 JSON: packages/self-healing/json-sequences/telemetry.parse.json

📝 Structure:
  • Event prefix: "self-healing:telemetry:parse"
  • Beats: 7 (requested → load → extract → normalize → aggregate → store → completed)
  • Handlers: 7 (one per beat)
  • Pattern: Pure functions + async side effects

🎯 Copy this structure for your own project:
  • Change "self-healing:telemetry:parse" → "my-project:phase-1-..."
  • Keep the 7-beat structure
  • Adapt handler names to your domain
  • Example: "my-project:data-collection:requested"

📚 Reference: packages/self-healing/json-sequences/telemetry.parse.json
```

**Agent's next action:** Study `packages/self-healing/json-sequences/telemetry.parse.json`, adapt for their project

---

## Query 3: "Where are the handlers for phase 1?"

```bash
$ node scripts/query-project-knowledge.js "handlers phase 1 implementation"
```

**System Returns:**
```
📁 PROJECT: self-healing → Phase 1 Handlers
════════════════════════════════════════════════════════════

📍 Location: packages/self-healing/src/handlers/telemetry/

📝 7 Handler Files:
  1. parseTelemetryRequested.ts
     └─ Validates parse request, returns early if invalid
  
  2. loadLogFiles.ts
     └─ Loads .logs/ directory, lists all log files
  
  3. extractTelemetryEvents.ts
     └─ Parses logs, extracts beat-started/beat-completed/error events
  
  4. normalizeTelemetryData.ts
     └─ Normalizes timestamps, handlers, event types
  
  5. aggregateTelemetryMetrics.ts
     └─ Aggregates P50/P95/P99, frequency, error rates
  
  6. storeTelemetryDatabase.ts
     └─ Stores normalized data in database
  
  7. parseTelemetryCompleted.ts
     └─ Notifies completion, returns results

🎯 Implementation pattern:
  • Handler 1: Requested (validate)
  • Handler 2-6: Process (domain logic)
  • Handler 7: Completed (notify)

📚 Reference: packages/self-healing/src/handlers/telemetry/

💡 Tip: For your project, follow same pattern:
  Phase 1 Handler 1: baseMeasurementRequested (validate)
  Phase 1 Handler 2-6: Measurement logic (domain-specific)
  Phase 1 Handler 7: baseMeasurementCompleted (notify)
```

**Agent's next action:** Implement similar handlers for their project

---

## Query 4: "What tests should phase 1 have?"

```bash
$ node scripts/query-project-knowledge.js "tests phase 1 coverage"
```

**System Returns:**
```
📁 PROJECT: self-healing → Phase 1 Tests
════════════════════════════════════════════════════════════

📍 Location: packages/self-healing/__tests__/telemetry.parse.spec.ts

📊 Test Coverage: 25+ tests (95%+ code coverage target)

📝 Test Categories:

  [REQUESTED - 3 tests]
    • ✓ Valid parse request accepted
    • ✓ Invalid request rejected with error
    • ✓ Request metadata tracked

  [LOAD - 5 tests]
    • ✓ Loads .logs directory successfully
    • ✓ Handles empty directory gracefully
    • ✓ Handles permission errors
    • ✓ Counts files correctly
    • ✓ Filters non-log files

  [EXTRACT - 5 tests]
    • ✓ Extracts beat-started events
    • ✓ Extracts beat-completed events
    • ✓ Extracts error events
    • ✓ Handles malformed logs
    • ✓ Preserves event order

  [NORMALIZE - 4 tests]
    • ✓ Normalizes timestamps to ISO 8601
    • ✓ Maps handler names correctly
    • ✓ Deduplicates events
    • ✓ Handles timezone conversions

  [AGGREGATE - 4 tests]
    • ✓ Calculates P50 latency
    • ✓ Calculates P95/P99 latencies
    • ✓ Counts errors by type
    • ✓ Computes frequencies

  [STORE - 2 tests]
    • ✓ Stores to database successfully
    • ✓ Handles database errors

  [COMPLETED - 2 tests]
    • ✓ Returns all results
    • ✓ Notifies consumers

🎯 Test distribution pattern:
  • Early phases (1-2): 25-35 tests (foundation)
  • Middle phases (3-4): 30-40 tests (complexity increases)
  • Later phases (5-7): 35-45 tests (integration complexity)
  
📚 Reference: packages/self-healing/__tests__/telemetry.parse.spec.ts
```

**Agent's next action:** Write similar tests for their phase 1

---

## Query 5: "Show me all projects using this workflow"

```bash
$ node scripts/query-project-knowledge.js "projects using sprint workflow"
```

**System Returns (Current):**
```
🔄 WORKFLOW: Sprint-Based Implementation

📊 Projects Using This Pattern:
  1. self-healing
     └─ Active, production-ready
     └─ 7 sequences, 67 handlers, 250+ tests
     └─ Location: packages/self-healing/

  (More projects will appear as agents register theirs)

💡 How to see updated list:
  Projects automatically added to knowledge map when:
  • New agent creates project following this pattern
  • Agent updates .generated/project-knowledge-map.json
  • Next agent queries this same pattern

🚀 Next agents will see:
  Query 1: self-healing (original)
  Query 2: project-A (agent 1)
  Query 3: project-B (agent 2)
  Query 4: project-C (agent 3)
  ... and so on
```

**Agent's next action:** When complete, update knowledge map so next agent sees their project too

---

## Query 6: "What does an adapter look like?"

```bash
$ node scripts/query-project-knowledge.js "how to adapt pattern new project"
```

**System Returns:**
```
🔄 ADAPTING THE SPRINT WORKFLOW

📋 Step-by-Step Adaptation:

STEP 1: Map your domain to the 7 phases
────────────────────────────────────────
Self-Healing Domain:          Your Domain:
  Phase 1: Parse telemetry  →  Phase 1: Collect baseline
  Phase 2: Detect anomalies →  Phase 2: Profile application
  Phase 3: Diagnose         →  Phase 3: Analyze bottlenecks
  Phase 4: Generate fix     →  Phase 4: Generate solution
  Phase 5: Validate         →  Phase 5: Test in sandbox
  Phase 6: Deploy           →  Phase 6: Deploy to prod
  Phase 7: Learn            →  Phase 7: Measure improvement

STEP 2: Create project structure (copy self-healing layout)
───────────────────────────────────────────────────────────
packages/my-project/
├── src/handlers/
│   ├── phase-1/            ← 7 handlers
│   ├── phase-2/            ← 9 handlers
│   └── ... (7 phases total)
├── __tests__/
│   ├── phase-1.spec.ts     ← 25+ tests
│   ├── phase-2.spec.ts     ← 35+ tests
│   └── ... (7 phases total)
├── json-sequences/
│   ├── phase-1.json        ← Copy structure from self-healing
│   └── ... (7 phases total)
└── IMPLEMENTATION_ROADMAP.md

STEP 3: Adapt JSON sequences
──────────────────────────────
From:  "self-healing:telemetry:parse:requested"
To:    "my-project:phase-1:baseline:requested"

Keep:  beats structure (requested → process → store → completed)
Keep:  handler distribution (7-11 per phase)
Keep:  event flow pattern

STEP 4: Implement handlers (same pattern, new logic)
────────────────────────────────────────────────────
export async function baseline-requested(request) {
  // Validate request (same as self-healing)
  // But now: measure current app state
}

export async function collect-metrics() {
  // Self-healing: loads logs
  // Your project: collects app metrics
}

export async function analyze-metrics() {
  // Self-healing: detects anomalies
  // Your project: identifies bottlenecks
}

... 4 more handlers following same pattern

STEP 5: Write tests (same coverage targets)
────────────────────────────────────────────
Phase 1: 25+ tests (cover all 7 handlers + interactions)
Phase 2: 35+ tests
... (through Phase 7)
Total: 250+ tests across all phases

STEP 6: Register in knowledge map
──────────────────────────────────
.generated/project-knowledge-map.json:
  {
    "my-project": {
      "description": "Your feature description",
      "location": "packages/my-project/",
      "workflow_pattern": "7-phase-sprint",
      "adapted_from": "self-healing",
      ...
    }
  }

📚 References:
  • View full example: NEW_AGENT_DISCOVERY_DEMO.md
  • See real handlers: packages/self-healing/src/handlers/
  • See real JSON: packages/self-healing/json-sequences/
  • See real tests: packages/self-healing/__tests__/
```

**Agent's next action:** Follow step-by-step to create their project

---

## Query 7: "Where do I document my project?"

```bash
$ node scripts/query-project-knowledge.js "documentation IMPLEMENTATION_ROADMAP"
```

**System Returns:**
```
📚 DOCUMENTATION STRUCTURE

Each project has an IMPLEMENTATION_ROADMAP.md with:

📍 Location: packages/my-project/IMPLEMENTATION_ROADMAP.md

📝 Contents (7 sections, one per phase):

  Phase 1: [Title] (Week 1-2)
    • Handlers: [List 7 handlers]
    • Tests: 25+ [List test categories]
    • Effort: 8-10 hours
    • Deliverable: [What is produced]
    • Key Tasks: [Checklist]

  Phase 2: [Title] (Week 3-4)
    • Handlers: [List 9 handlers]
    • Tests: 35+ [List test categories]
    • Effort: 10-12 hours
    • Deliverable: [What is produced]
    • Key Tasks: [Checklist]

  ... (continue for all 7 phases)

🔗 Files referenced in documentation:
  • json-sequences/phase-1.json
  • src/handlers/phase-1/
  • __tests__/phase-1.spec.ts

💡 Why this matters:
  • Gives next developer clear roadmap
  • Shows phase dependencies
  • Lists deliverables
  • Estimates effort

📚 Reference: packages/self-healing/IMPLEMENTATION_ROADMAP.md
```

**Agent's next action:** Create similar documentation for their project

---

## Query 8: "Ready to deploy - what's the checklist?"

```bash
$ node scripts/query-project-knowledge.js "deployment checklist phases"
```

**System Returns:**
```
✅ DEPLOYMENT & VERIFICATION CHECKLIST

Before moving from phase to phase, verify:

PHASE COMPLETION CHECKLIST:
  ☐ All handlers implemented
  ☐ All tests passing (green)
  ☐ Code coverage > 95%
  ☐ JSON sequence validated
  ☐ Documentation up to date
  ☐ Changes reviewed

PHASE 5 (DEMO/OBSERVATION) CHECKLIST:
  ☐ Tests passing in staging
  ☐ Performance benchmarks met
  ☐ All alerts firing correctly
  ☐ Error handling validated
  ☐ Rollback plan documented
  ☐ Stakeholders approve demo

PHASE 6 (PRODUCTION) CHECKLIST:
  ☐ Monitoring configured
  ☐ Logging enabled
  ☐ Metrics dashboard setup
  ☐ Alerts configured
  ☐ On-call rotation assigned
  ☐ Deployment automated

PHASE 7 (LEARNING) CHECKLIST:
  ☐ Metrics collected
  ☐ Improvement measured
  ☐ Patterns documented
  ☐ Knowledge map updated
  ☐ Ready for next cycle

💡 Self-healing example: All checkpoints completed, 7/7 phases delivered
```

**Agent's next action:** Use checklist before moving to next phase

---

## Quick Reference: Query Syntax

```bash
# General workflow queries
node scripts/query-project-knowledge.js "workflow"
node scripts/query-project-knowledge.js "sprint"
node scripts/query-project-knowledge.js "7-phase"

# Project discovery
node scripts/query-project-knowledge.js "self-healing"
node scripts/query-project-knowledge.js "projects"

# Phase-specific queries
node scripts/query-project-knowledge.js "phase 1"
node scripts/query-project-knowledge.js "handlers"
node scripts/query-project-knowledge.js "tests"

# Implementation queries
node scripts/query-project-knowledge.js "json sequences"
node scripts/query-project-knowledge.js "handlers phase 2"
node scripts/query-project-knowledge.js "how to adapt"

# Documentation queries
node scripts/query-project-knowledge.js "IMPLEMENTATION_ROADMAP"
node scripts/query-project-knowledge.js "documentation"
node scripts/query-project-knowledge.js "deployment"
```

---

## Why These Queries Work

The query tool searches `.generated/project-knowledge-map.json` which contains:

```json
{
  "project_registry": {
    "self-healing": {
      "workflows": [
        {
          "name": "Sprint-Based Implementation",
          "description": "7-phase workflow...",
          "phases": 7,
          "applicable_to": ["Any phased sequential implementation", ...]
        }
      ],
      "patterns": [...],
      "documentation": [...]
    }
  }
}
```

Each query is matched against descriptions, names, and tags. Close matches bubble up.

---

## Next Queries You'll See

Once agents start implementing with this pattern, you'll be able to query:

```bash
# After Agent 1 completes SLO Definition Engine:
$ node scripts/query-project-knowledge.js "slo-definition-engine"
# Returns: Another working 7-phase example

# After Agent 2 completes Dashboard:
$ node scripts/query-project-knowledge.js "slo-dashboard sprint"
# Returns: Two phase projects + dashboard-specific info

# Pattern discovery strengthens with each agent!
```

---

**Status:** ✅ Complete Query Examples Available  
**How to Try:** Copy any query above and run in terminal  
**Expected Result:** Immediate discovery of workflows, templates, examples
