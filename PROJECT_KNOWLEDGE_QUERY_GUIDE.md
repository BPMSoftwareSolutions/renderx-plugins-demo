# Project Knowledge Map - Query Guide

*Generated from: `.generated/project-knowledge-map.json`*
*Last Updated: 2025-11-23*

## Overview

The Project Knowledge Map extends the Global Traceability Map with **project-level intelligence** that answers practical questions like:

- "Where is the self-healing project file?"
- "I need the sprint workflow implementation—where is it?"
- "What patterns from self-healing can I reuse?"
- "Show me all handler files in self-healing"

## Quick Reference

### Find Self-Healing Project
```bash
node scripts/query-project-knowledge.js "self-healing"
```

**Result:** 
- Location: `packages/self-healing`
- Key files: README.md, IMPLEMENTATION_ROADMAP.md, PACKAGE_CHECKLIST.md, etc.
- 7 core sequences, 67 handlers
- Workflows and reusable patterns

### Find Sprint Workflow Implementation
```bash
node scripts/query-project-knowledge.js "sprint workflow"
```

**Result:**
- Location: `packages/self-healing/IMPLEMENTATION_ROADMAP.md`
- 7 phases with clear deliverables
- Handler distribution: 7-11 per phase
- Test coverage: 25-45+ tests per phase
- Reusable for SLO/SLI system (8 phases) and other large projects

### Find All Handler Files
```bash
node scripts/query-project-knowledge.js "self-healing files"
```

**Result:**
- Source structure: `src/handlers/[domain]/`
- Domains: telemetry (7), anomaly (9), diagnosis (11), fix (9), validation (10), deployment (11), learning (10)
- JSON definitions: `json-sequences/[sequence-name].json`
- Tests: `__tests__/[sequence-name].spec.ts`

### Find Reusable Patterns
```bash
node scripts/query-project-knowledge.js "reusable patterns"
```

**Result:**
- Handler organization by domain
- JSON-first sequence design
- Test parity (spec file per sequence)
- Progressive phase delivery

## Data Structure

### Project Registry

Each project in the registry contains:

```json
{
  "id": "self-healing",
  "name": "Self-Healing System",
  "path": "packages/self-healing",
  "project_files": {
    "root_files": [...],
    "source_structure": {...}
  },
  "workflows": {...},
  "patterns": {...}
}
```

### Project Files

- **Root Files:** README.md, IMPLEMENTATION_ROADMAP.md, etc.
- **Source Structure:** Organized by domain (handlers/, json-sequences/, tests/)
- **File Metadata:** Purpose, queryable tags, relationships

### Workflows

Each workflow includes:
- **Name & Location:** Where to find it
- **Description:** What it does
- **Phases/Steps:** Detailed breakdown
- **Reusable For:** What other systems can use this pattern
- **Why Effective:** Key benefits

### Patterns

Reusable patterns include:
- **Handler Organization:** Domain-based structure
- **JSON-First Design:** Separate JSON from implementation
- **Test Parity:** One spec per sequence
- **Progressive Enhancement:** Ship after Phase 1, add more phases

## Common Queries

### "Find all files in project X"
```bash
node scripts/query-project-knowledge.js "self-healing files"
```

### "Show me workflow X implementation"
```bash
node scripts/query-project-knowledge.js "sprint workflow"
```

### "What patterns can I reuse?"
```bash
node scripts/query-project-knowledge.js "reusable patterns"
```

### "Show project X overview"
```bash
node scripts/query-project-knowledge.js "ographx"
node scripts/query-project-knowledge.js "dashboard"
```

## Integration with SLO/SLI System

### Using Sprint Workflow Pattern
The sprint workflow from self-healing is designed for the SLO/SLI system:

- **Current:** 7 phases for self-healing (Phases 1-7 in IMPLEMENTATION_ROADMAP.md)
- **Future:** 8 phases for SLO/SLI system (Phases 1-8 in Phase 3 planning)
- **Pattern Match:** Similar structure with 7-11 handlers per phase
- **Test Coverage:** 25-45+ tests per phase ensures quality
- **Dependency Flow:** Natural progression through phases

### Using Handler Organization Pattern
For SLO/SLI dashboard:
- Organize components by domain: metrics, budgets, compliance, health, activity
- Each domain has its own reducer, hooks, services
- Tests mirror component structure

### Using JSON-First Design
For SLO/SLI system:
- Define SLO targets in JSON before implementation
- Define error budgets in JSON
- Define workflow state machine in JSON
- Handlers/components consume JSON specifications

## Extending the Knowledge Map

To add new projects:

1. Add entry to `project_registry.projects[]`
2. Include `project_files` with root files and source structure
3. Document workflows with reusable potential
4. Identify patterns for future projects
5. Update query tool to recognize new project patterns

## Cross-Project Discovery

The knowledge map enables these discovery flows:

```
Self-Healing Project
  ↓
Find sprint workflow (IMPLEMENTATION_ROADMAP.md)
  ↓
Identify 7-phase pattern with 7-11 handlers/phase
  ↓
Apply to SLO/SLI system (similar structure, 8 phases)
  ↓
Reuse handler organization pattern in dashboard
  ↓
Reuse test parity pattern (spec per component)
```

## Next Steps

1. **Query the knowledge map** using `query-project-knowledge.js` to find what you need
2. **Reference results** in your code/documentation with full paths
3. **Extend the knowledge map** when creating new projects
4. **Improve patterns** as you discover better ways of doing things

---

**Last Updated:** 2025-11-23  
**Pattern:** JSON knowledge base → Script-driven queries → Shareable results
