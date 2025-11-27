# Entity Mapping: Symphonic/Symphony Terminology

## Conflation Rule (AUTHORITATIVE)

```
Orchestration Domain = Symphony
Sub-Orchestration Domain = Sub-Symphony
```

These are **synonymous terms** for the same concept. Use them interchangeably.

---

## Your Question

**Are these the same entity or different?**
- Symphonic Pipeline
- Symphonic Orchestration
- Symphony Pipeline
- Orchestration Domain
- **Orchestration Domain = Symphony** ✅ CONFLATED
- **Sub-Orchestration Domain = Sub-Symphony** ✅ CONFLATED

## The Answer: UNIFIED TERMINOLOGY With Clear Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│         UNIFIED SYMPHONIA ENTITY HIERARCHY                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 1: SYMPHONY / ORCHESTRATION DOMAIN (Broadest)       │
│  ══════════════════════════════════════════════════         │
│  ├─ CONFLATION: Symphony = Orchestration Domain            │
│  ├─ Definition: A sequence with movements, beats, events   │
│  ├─ Files: orchestration-domains.json (registry)           │
│  │          build-pipeline-symphony.json (sequences)       │
│  ├─ Contains: 55+ sequences (plugins + orchestrations)     │
│  ├─ Scope: All musical sequences                           │
│  └─ Purpose: Registry + sequence definitions               │
│                                                             │
│     CATEGORIZATION:                                         │
│     ├─ "orchestration" (system-level) = Major Symphony     │
│     └─ "plugin" (feature-level) = Plugin Symphony          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 2: SUB-SYMPHONY / SUB-ORCHESTRATION DOMAIN          │
│  ═════════════════════════════════════════════             │
│  ├─ CONFLATION: Sub-Symphony = Sub-Orchestration Domain    │
│  ├─ Definition: Nested compartments within a symphony      │
│  ├─ Examples:                                              │
│  │   ├─ Movement = sub-symphony (phase container)          │
│  │   ├─ Beat = sub-symphony (operation container)          │
│  │   └─ Handler = sub-symphony (action execution)          │
│  │                                                         │
│  └─ Usage: Python gap analysis for modular decomposition   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 3: SYMPHONIC ORCHESTRATION (Framework-level)        │
│  ══════════════════════════════════════════════════        │
│  ├─ Definition: Multi-symphony integrated system           │
│  ├─ Components: All symphonies + sub-symphonies working    │
│  ├─ Scope: SAFe-based continuous delivery framework        │
│  ├─ Terminology: Descriptive term (not a distinct entity)  │
│  │                                                         │
│  │ USAGE EXAMPLES:                                         │
│  │ ├─ "Symphonic Orchestration Framework"                  │
│  │ ├─ "Symphonic orchestration system"                     │
│  │ ├─ "Symphonia orchestration architecture"               │
│  │                                                         │
│  └─ Key Property: Adjective describing symphony            │
│                   coordination & integration               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LEVEL 4: SYMPHONIC PIPELINE (Adjective modifier)          │
│  ════════════════════════════════════════════════          │
│  ├─ NOT a distinct entity                                  │
│  ├─ Usage: Emphasizes symphony patterns                    │
│  ├─ Examples:                                              │
│  │   ├─ "symphonic build symphony" = build symphony       │
│  │   ├─ "symphonic conformity symphony" = conformity      │
│  │                                                         │
│  └─ Definition: Same as "Symphony / Orchestration Domain"  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Breakdown

### Entity 1: SYMPHONY / ORCHESTRATION DOMAIN

**What it is:**
- A sequence with movements, beats, events, and handlers
- Can be either:
  - **Master Registry** (aggregates all sequences): `orchestration-domains.json`
  - **Individual Sequence** (single symphony spec): `build-pipeline-symphony.json`
- Contains metadata, categories, dynamics, timing, etc.
- Registered in domain registry with `"kind": "orchestration"` or `"kind": "plugin"`

**Canonical Terms (CONFLATED - USE INTERCHANGEABLY):**
- "Orchestration Domain"
- "Symphony"
- "Symphonic Domain"
- "Orchestration Sequence"

---

### Entity 2: SYMPHONY PIPELINE

**What it is:**
- Individual system-level orchestration sequence
- Defined in JSON with: movements, beats, events, handlers
- Registered with `"kind": "orchestration"` in domain registry

**Canonical Examples:**

```json
{
  "id": "build-pipeline-symphony",
  "name": "build pipeline symphony",
  "kind": "orchestration",
  "movements": 6,
  "beats": 34,
  "events": ["build:initiated", "build:success", ...]
}
```

**Current Symphony Pipelines:**
- `build-pipeline-symphony` (Build Pipeline Symphony)
- `safe-continuous-delivery-pipeline` (SAFe CD Pipeline)
- `symphonia-conformity-alignment-pipeline` (Conformity Pipeline)
- `symphony-report-pipeline` (Report Pipeline)

**Key Properties:**
- JSON-defined
- Event-driven
- Handler-based
- Orchestration-aware

**Aliases:**
- "Build pipeline symphony"
- "Symphonic build pipeline" (when emphasizing the adjective)
- "Symphony orchestration" (when emphasizing the framework nature)

---

### Entity 3: SYMPHONIC ORCHESTRATION (Framework)

**What it is:**
- **NOT a standalone entity**
- **A descriptor for the entire integrated system**
- Used as: "Symphonic Orchestration Framework"

**Usage:**
- Refers to the collection of 4 symphony pipelines working together
- Describes the approach (musical composition as metaphor)
- Used in documentation and architecture discussions

**Examples:**
- "The Symphonic Orchestration Framework consists of 4 pipelines"
- "Symphonia orchestration system"
- "Symphonic orchestration architecture"

**Key Insight:**
- "Symphonic" = adjective (means: having symphony pipeline characteristics)
- "Orchestration" = noun (means: coordination of multiple components)
- Together = descriptor of the integrated approach

**NOT a canonical entity** - instead, it's a descriptive term for the Framework as a whole.

---

### Entity 4: SYMPHONIC PIPELINE

**What it is:**
- **NOT a separate entity**
- **Adjective phrase applying "symphonic" to "pipeline"**
- Emphasizes that a pipeline IS orchestrated as symphonic

**Usage Pattern:**
```
SYMPHONY PIPELINE = A JSON-defined pipeline with movements/beats
SYMPHONIC PIPELINE = A pipeline that IS symphonic (adjective application)
```

**Examples in Codebase:**
- "symphonic build pipeline" = build-pipeline-symphony.json
- "symphonic orchestration pipeline" = one of the 4 symphony pipelines
- "symphonic conformity pipeline" = conformity alignment pipeline

**Key Insight:**
Not a separate entity, just a stylistic way to emphasize that the pipeline follows symphony patterns.

---

## Canonical Entity Mapping

### Entity: CORE ORCHESTRATION SYSTEM

```json
{
  "canonical_name": "Symphonia Orchestration System",
  "entity_type": "framework",
  "components": [
    {
      "type": "registry",
      "name": "Orchestration Domain",
      "file": "orchestration-domains.json"
    },
    {
      "type": "pipeline",
      "name": "Symphony Pipeline",
      "examples": [
        "build-pipeline-symphony.json",
        "safe-continuous-delivery-pipeline.json"
      ]
    }
  ],
  "aliases": [
    "Symphonic Orchestration Framework",
    "Symphony Orchestration Framework",
    "Symphonia",
    "Symphonic orchestration system",
    "Symphony pipeline system"
  ],
  "adjective_modifiers": [
    "symphonic" (when describing individual pipelines),
    "symphony" (when describing the pattern/type)
  ]
}
```

---

## Answer to Your Question

### Are they one and the same or different?

| Term | Type | Is Separate Entity? | Relationship |
|------|------|-------------------|--------------|
| **Symphonic Pipeline** | Adjective phrase | ❌ NO | Describes a symphony pipeline using symphonic pattern |
| **Symphonic Orchestration** | Descriptive term | ❌ NO | Describes the framework-level coordination |
| **Symphony Pipeline** | Entity | ✅ YES | Individual orchestration sequence (4 primary examples) |
| **Orchestration Domain** | Entity | ✅ YES | Master registry of all sequences |

### Hierarchy (Correct to Broadest)

```
1. ORCHESTRATION DOMAIN (registry of everything)
   └─ Contains categories: "orchestration" + "plugin"
      
2. SYMPHONY PIPELINE (individual orchestration sequence)
   ├─ Build Pipeline Symphony
   ├─ SAFe Continuous Delivery Pipeline
   ├─ Conformity Alignment Pipeline
   └─ Report Pipeline

3. SYMPHONIC ORCHESTRATION (framework-level term)
   └─ Descriptor: "The system where symphony pipelines work together"

4. SYMPHONIC PIPELINE (adjective application)
   └─ Usage: "a symphonic build pipeline" = "build-pipeline-symphony"
```

---

## How to Address Each Entity

### When You Mean...

**"The whole system"**
→ Use: **"Symphonia"** or **"Symphonic Orchestration Framework"**
→ Refers to all 4 pipelines + registry + coordination

**"An individual system-level pipeline"**
→ Use: **"Symphony Pipeline"**
→ Example: "the build-pipeline-symphony is a symphony pipeline"

**"The registry of sequences"**
→ Use: **"Orchestration Domain"** or **"orchestration-domains.json"**
→ Technical reference to the master registry

**"When emphasizing the orchestration pattern"**
→ Use: **"Symphonic"** as adjective
→ Example: "symphonic build pipeline" or "symphonic orchestration"

---

## Recommended Canonical Form

For consistency across documentation, use:

```
Level 1 (Broadest):  Symphonia Orchestration Framework
                     (or: Symphonic Orchestration System)

Level 2 (Pipeline):  Symphony Pipeline
                     Example: "The Build Pipeline Symphony"
                     Or adjective: "The symphonic build pipeline"

Level 3 (Registry):  Orchestration Domain
                     File: orchestration-domains.json
```

---

## Entity Resolution Mapping

If you encounter these terms, resolve them as:

```
"Symphonic Pipeline"           → Symphony Pipeline (individual)
"Symphonic Orchestration"      → Symphonia Framework (system-level)
"Symphony Orchestration"       → Symphonia Framework (system-level)
"Orchestration Domain"         → Registry (orchestration-domains.json)
"Symphony Domain"              → Orchestration Domain (registry)
"Symphonic System"             → Symphonia Framework (system-level)
"Build Pipeline"               → Build Pipeline Symphony (specific pipeline)
```

---

## Key Distinction in Codebase

The actual JSON shows this clearly:

```
orchestration-domains.json (THE REGISTRY)
├─ "categories": [
│  ├─ "orchestration" (system-level sequences)
│  └─ "plugin" (feature-level sequences)
│
├─ domains.orchestration-core:
│  └─ build-pipeline-symphony.json ← SYMPHONY PIPELINE #1
│  └─ safe-continuous-delivery-pipeline.json ← SYMPHONY PIPELINE #2
│  └─ symphonia-conformity-alignment-pipeline.json ← SYMPHONY PIPELINE #3
│  └─ symphony-report-pipeline.json ← SYMPHONY PIPELINE #4
│
└─ domains.plugin.*:
   └─ 51+ plugin sequences (not symphonic pipelines)
```

So in short:
- **Orchestration Domain** = the JSON registry itself
- **Symphony Pipelines** = the 4 entries under "orchestration" category
- **Symphonic Orchestration** = descriptive term for how they all work together

---

## Summary

✅ **One and the same (same system):** Symphonia + Symphonic Orchestration Framework + Symphony Pipeline System
❌ **Different entities:** Orchestration Domain (registry) vs. Symphony Pipeline (individual sequence)

When in doubt, use the most specific term:
- **"Symphony Pipeline"** for individual pipelines
- **"Orchestration Domain"** for the registry
- **"Symphonia"** for the overall framework
