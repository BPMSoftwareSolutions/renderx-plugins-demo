# 🏗️ Orchestration Architecture: The Complete Picture

**Date:** 2025-11-24  
**Status:** CLARIFIED  
**Source of Truth:** Audit System + Sequence Files

---

## The Three Layers

### Layer 1: Audit System (55 Plugin Sequences)
**Location:** `packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json`

The audit system scans all plugin directories and catalogs **55 web sequences**:
- Canvas sequences (copy, create, select, delete, etc.)
- Canvas-component sequences (import, export, drag, etc.)
- Control-panel sequences (selection, classes, CSS, etc.)
- Library sequences
- Header sequences
- Components sequences
- Real-estate-analyzer sequences

**These are PLUGIN sequences** - they implement specific features.

### Layer 2: Orchestration Domain Sequences (2 Implemented)
**Location:** `packages/ographx/.ographx/sequences/`

Only **2 orchestration domain sequences** have been implemented:

1. **cag-agent-workflow.json** (8 movements, 41 beats)
   - Maps to: `cag-orchestration` domain
   - Purpose: Context-Augmented Generation agent workflow

2. **graphing-orchestration.json** (8 movements, 43 beats)
   - Maps to: `self-awareness-orchestration` domain
   - Purpose: System introspection and analysis

**These are SYSTEM sequences** - they orchestrate the entire system.

### Layer 3: Orchestration Registry (16 Conceptual Domains)
**Location:** `orchestration-domains.json`

Defines **16 conceptual orchestration domains**:
- 2 with actual sequences (implemented)
- 14 without sequences (planned)

**This is the GOVERNANCE layer** - defines what should be orchestrated.

---

## The Relationship

```
┌─────────────────────────────────────────────────────────┐
│ Orchestration Registry (16 domains)                     │
│ - Governance: What should be orchestrated               │
│ - 2 implemented, 14 planned                             │
└─────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────────┐
        │ Orchestration Domain Sequences (2)   │
        │ - cag-agent-workflow.json            │
        │ - graphing-orchestration.json        │
        └─────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────────┐
        │ Plugin Sequences (55)                │
        │ - Canvas, Control-Panel, Library    │
        │ - Implement specific features       │
        └─────────────────────────────────────┘
```

---

## Single Source of Truth

**The audit system is the source of truth for what sequences exist.**

- ✅ Audit system: Automatically scans and catalogs all sequences
- ✅ Orchestration sequences: Manually created when needed
- ✅ Registry: Manually maintained governance document

**No duplication. No drift. Each layer has a clear purpose.**

---

## How to Add a New Orchestration Domain

1. **Create the sequence file:**
   ```
   packages/ographx/.ographx/sequences/{domain-id}.json
   ```

2. **Update the registry:**
   ```json
   {
     "id": "new-domain",
     "sequenceFile": "packages/ographx/.ographx/sequences/new-domain.json",
     ...
   }
   ```

3. **Run validation:**
   ```bash
   node scripts/validate-orchestration-registry.js
   ```

4. **Verify in audit:**
   ```bash
   npm run run-full-audit
   ```

---

## Key Principles

1. **Audit system is source of truth** - Don't reinvent sequence discovery
2. **Three distinct layers** - Registry (governance), Orchestration (system), Plugins (features)
3. **No hardcoding** - Use existing audit infrastructure
4. **Validation over generation** - Validate against audit, don't duplicate it
5. **Senior architecture** - Each layer has one responsibility

---

## Validation Script

Run `scripts/validate-orchestration-registry.js` to see:
- How many orchestration sequences are implemented
- How many are planned
- How many plugin sequences exist in the audit system
- Status of each domain

This is the **single source of truth** for orchestration status.

