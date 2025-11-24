# 🧠 Context Remounting System (CRS)

**Architectural Primitive for Multi-Agent Context Coherence**

---

## The Problem

Multi-agent systems suffer from **context drift**:
- ❌ Agents forget previous work
- ❌ Re-derive already-solved problems
- ❌ Touch files out of scope
- ❌ Confuse sequences and handlers
- ❌ Repeat work from previous iterations

**Root Cause:** No deliberate re-alignment before each workload iteration.

---

## The Solution: 4-Layer Context Envelope

Before **every** workload iteration, mount four layers:

```
┌─────────────────────────────────────────┐
│ 🟪 ROOT CONTEXT                         │
│ (MVP, MMF, Sprint Goal, Foundational)   │
├─────────────────────────────────────────┤
│ 🟦 SUB-CONTEXT                          │
│ (Current focused feature/task)          │
├─────────────────────────────────────────┤
│ 🟩 CONTEXT BOUNDARIES                   │
│ (Allowed/Forbidden Zones)               │
├─────────────────────────────────────────┤
│ 🟨 MOST RECENT CONTEXT                  │
│ (Previous iteration memory)             │
└─────────────────────────────────────────┘
```

---

## Layer 1: 🟪 Root Context

**The big why. Persistent identity of the work.**

Answers:
- "What universe am I operating in?"
- "What outcome defines completeness?"
- "What governing rules cannot change?"

Examples:
- MVP: "Thin-client host with plugin architecture"
- MMF: "5-layer telemetry governance system"
- Sprint Goal: "Implement SLO/SLI dashboard"
- Non-negotiable: "100% traceability, manifest-driven, JSON-first"

---

## Layer 2: 🟦 Sub-Context

**The current "slice" being addressed. Working memory.**

Answers:
- "What exactly am I working on right now?"
- "What's in scope for this iteration?"

Examples:
- "Implement metrics.ts handlers for SLO dashboard"
- "Add compliance calculation with telemetry"
- "Build context remounting system"

---

## Layer 3: 🟩 Context Boundaries

**The edges of allowed behavior.**

### In-Scope
- Files permitted to modify
- Allowed handlers/sequences
- Allowed directory roots
- Features tied to sprint objective

### Out-of-Scope
- Demo UI
- Unrelated sequences
- Other plugins
- OGraphX IR (unless involved)
- Self-healing code (unless touched)

Answers:
- "Where can I act?"
- "Where must I avoid acting?"
- "What would be drift?"

---

## Layer 4: 🟨 Most Recent Context

**Last known mental state before current iteration.**

Includes:
- Previous action summary
- Last modified files
- Last touched handler/spec
- Pending items
- Partial reasoning
- Diff summary
- Evolution plan checkpoint

Prevents:
- ❌ Forgetting
- ❌ Re-deriving
- ❌ Drifting
- ❌ Repeating work
- ❌ Touching out-of-scope files

---

## Implementation: agent-load-context.js

```bash
node scripts/agent-load-context.js \
  --root "5-layer telemetry system" \
  --sub "Implement metrics.ts handlers" \
  --boundaries "packages/slo-dashboard/*" \
  --previous ".generated/context-history/latest.json"
```

Returns: **Context Envelope** (4-layer payload)

---

## Meditative Framing for Agents

> "Before each action, return to clarity.
> Re-anchor to your core purpose (root).
> Focus on the present work (sub).
> Respect the boundaries (scope).
> Remember where you came from (previous).
> This is how you prevent drift."

---

## Benefits

✅ **Coherence** - Agents stay aligned across iterations  
✅ **Efficiency** - No re-derivation of solved problems  
✅ **Safety** - Boundaries prevent out-of-scope changes  
✅ **Traceability** - Complete history of mental state  
✅ **Scalability** - Works with multiple concurrent agents  

---

**Status:** Ready for Implementation  
**Priority:** HIGH (Prevents multi-agent drift)  
**Integration:** With knowledge-index.json

