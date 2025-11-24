# 🚀 Using the RAG System: Complete Reference

**Retrieval-Augmentation-Generation for Intelligent Project Discovery**

---

## What is the RAG System?

A **4-phase intelligent discovery system** that helps agents:
1. **RETRIEVE** proven workflows and patterns
2. **AUGMENT** with documentation, code, and tests
3. **GENERATE** new solutions following proven patterns
4. **FEEDBACK** to improve the system for next agent

---

## Phase 1: RETRIEVAL - Query the System

### Command
```bash
node scripts/query-project-knowledge.js "keyword"
```

### Supported Keywords

| Keyword | Returns |
|---------|---------|
| `workflow`, `sprint` | 7-phase sprint pattern (14 weeks, 67 handlers) |
| `self-healing` | Self-healing system (packages/self-healing) |
| `dashboard` | SLO/SLI dashboard (packages/slo-dashboard) |
| `ographx` | OGraphX analysis tool |
| `reusable patterns` | 4 discovered patterns |
| `self-healing files` | Complete file structure |

### Example Output
```
🔄 WORKFLOW: Sprint-Based Implementation
📍 Location: IMPLEMENTATION_ROADMAP.md
📊 Phases (7): 14 weeks total
   1. Telemetry Parsing (Week 1-2) - 7 handlers, 25+ tests
   2. Anomaly Detection (Week 3-4) - 9 handlers, 35+ tests
   3. Root Cause Diagnosis (Week 5-6) - 11 handlers, 40+ tests
   ...
```

---

## Phase 2: AUGMENTATION - Get Context

System provides:
- **Documentation** - IMPLEMENTATION_ROADMAP.md, README.md
- **Code** - 67 handlers across 7 phases
- **Tests** - 250+ tests (25-45+ per phase)
- **Templates** - json-sequences/*.json (copy-paste ready)
- **Patterns** - 4 reusable patterns

---

## Phase 3: GENERATION - Create Solution

### Step 1: Copy Template
```bash
cp packages/self-healing/json-sequences/phase-1.json \
   my-project/json-sequences/phase-1.json
```

### Step 2: Adapt to Your Domain
- Modify handler names
- Update sequence logic
- Adjust phase boundaries

### Step 3: Implement Handlers
```bash
mkdir -p my-project/src/handlers/phase-1
# Implement 7 handlers following pattern
```

### Step 4: Write Tests
```bash
mkdir -p my-project/__tests__
# Write 25+ tests for phase 1
```

---

## Phase 4: FEEDBACK - Register Project

### Update Knowledge Map
Edit `.generated/project-knowledge-map.json`:

```json
{
  "id": "my-project",
  "name": "My Project",
  "path": "packages/my-project",
  "workflows": {
    "sprint_workflow": {
      "location": "IMPLEMENTATION_ROADMAP.md",
      "phases": 7,
      "handlers": 67,
      "tests": 250
    }
  }
}
```

### Result
Next agent queries system:
- Finds 2 examples (self-healing + your project)
- Better context for decisions
- System improves automatically

---

## 5-Layer Knowledge Architecture

```
Layer 1: Global Traceability Map
├─ 17 packages, 11-stage pipeline
└─ Component health scores

Layer 2: Project Knowledge Map ← QUERY HERE
├─ Projects, workflows, patterns
└─ File locations

Layer 3: Telemetry & Health
├─ 5 components, 30 anomalies
└─ 100% source traceability

Layer 4: SLO/SLI Targets (Ready)
└─ Error budgets, compliance

Layer 5: SLA Compliance (Ready)
└─ Self-healing triggers
```

---

## Quick Reference

| Need | Query | Returns |
|------|-------|---------|
| Workflow structure | `workflow` | 7-phase sprint (14 weeks) |
| Code examples | `self-healing` | 67 handlers, 250+ tests |
| Reusable patterns | `reusable patterns` | 4 patterns |
| File locations | `self-healing files` | Complete structure |
| Dashboard info | `dashboard` | SLO/SLI visualization |

---

## Documentation

- `README.md` - Entry point
- `QUESTION_ANSWERED.md` - Complete example
- `RAG_SYSTEM_GUIDE.md` - System overview
- `KNOWLEDGE_LAYERS_ARCHITECTURE.md` - 5-layer design
- `TRACEABILITY_SYSTEM_SUMMARY.md` - Complete summary

---

**Status:** ✅ Production Ready  
**Query Tool:** ✅ Operational  
**Knowledge Base:** ✅ Complete

