# 🎯 RAG System Guide: Using the Traceability System

**Retrieval-Augmentation-Generation (RAG) for Project Knowledge Discovery**

---

## What is the RAG System?

The RAG system enables **intelligent project discovery** through 4 phases:

1. **RETRIEVAL** - Query the knowledge base
2. **AUGMENTATION** - System provides rich context
3. **GENERATION** - You create solutions
4. **FEEDBACK** - System learns from your work

---

## Quick Start: Query the System

### Basic Queries

```bash
# Find the sprint workflow
node scripts/query-project-knowledge.js "workflow"

# Locate the self-healing system
node scripts/query-project-knowledge.js "self-healing"

# Discover reusable patterns
node scripts/query-project-knowledge.js "reusable patterns"

# Find the dashboard project
node scripts/query-project-knowledge.js "dashboard"

# Get OGraphX analysis tool info
node scripts/query-project-knowledge.js "ographx"
```

### What You Get Back

Each query returns:
- **Location** - Where to find the project/workflow
- **Purpose** - What it does
- **Structure** - Key files and components
- **Workflows** - How it's organized
- **Patterns** - Reusable approaches

---

## The 4 RAG Phases in Action

### Phase 1: RETRIEVAL
```bash
$ node scripts/query-project-knowledge.js "workflow"
→ Returns: 7-phase sprint workflow (14 weeks, 67 handlers)
```

### Phase 2: AUGMENTATION
System provides:
- Documentation links (4 guides)
- Real examples (Canvas fix)
- Code templates (67 handlers)
- Test patterns (250+ tests)

### Phase 3: GENERATION
You create:
- Adapt JSON templates
- Implement handlers
- Write tests
- Follow proven pattern

### Phase 4: FEEDBACK
You register:
- Update `.generated/project-knowledge-map.json`
- Add your project entry
- Next agent finds 2 examples (better!)

---

## Knowledge Layers (5-Layer Architecture)

| Layer | File | Purpose |
|-------|------|---------|
| **1** | `global-traceability-map.json` | Architecture & components |
| **2** | `project-knowledge-map.json` | Projects & workflows |
| **3** | `sli-metrics.json` | Health & anomalies |
| **4** | `slo-targets.json` | SLO targets |
| **5** | `sla-compliance-report.json` | Compliance & triggers |

---

## Common Queries & Answers

```bash
# "What workflow should I use?"
node scripts/query-project-knowledge.js "workflow"
→ 7-phase sprint pattern (proven, reusable)

# "Where is the self-healing system?"
node scripts/query-project-knowledge.js "self-healing"
→ packages/self-healing (67 handlers, 250+ tests)

# "What patterns can I reuse?"
node scripts/query-project-knowledge.js "reusable patterns"
→ 4 patterns: handler organization, JSON-first design, test parity, progressive phases

# "How do I structure my project?"
node scripts/query-project-knowledge.js "self-healing files"
→ Complete file structure with handler distribution
```

---

## Next Steps

1. **Read** `QUESTION_ANSWERED.md` - Complete RAG workflow example
2. **Query** the system for your use case
3. **Study** the returned documentation
4. **Copy** templates from `json-sequences/`
5. **Implement** following the proven pattern
6. **Register** your project in the knowledge map

---

**Status:** ✅ RAG System Ready  
**Query Tool:** `scripts/query-project-knowledge.js`  
**Knowledge Base:** `.generated/project-knowledge-map.json`

