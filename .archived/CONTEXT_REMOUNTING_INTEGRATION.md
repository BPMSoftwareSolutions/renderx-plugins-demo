# 🧠 Context Remounting System - Integration Guide

**How to integrate CRS into your workflow**

---

## Quick Start

### Before Each Workload Iteration

```bash
# Load context envelope
node scripts/agent-load-context.js \
  --root "5-layer telemetry system" \
  --sub "Implement metrics.ts handlers" \
  --boundaries "packages/slo-dashboard/*" \
  --previous ".generated/context-history/latest.json"
```

### Output
```
🧠 CONTEXT REMOUNTING SYSTEM - 4-LAYER ENVELOPE
═══════════════════════════════════════════════

📍 Session: session-1700000000000-abc123def
⏰ Timestamp: 2025-11-23T21:00:00.000Z

🟪 ROOT CONTEXT (Big Why)
─────────────────────────
   5-layer telemetry system
   MVP: Thin-client host with plugin architecture
   Non-negotiable: 100% traceability, Manifest-driven, JSON-first, Self-improving

🟦 SUB-CONTEXT (Current Focus)
─────────────────────────
   Implement metrics.ts handlers

🟩 CONTEXT BOUNDARIES (Allowed/Forbidden)
─────────────────────────
   In-Scope: packages/slo-dashboard/*, src/handlers/*, scripts/agent-*.js
   Out-of-Scope: packages/*/demo/*, packages/self-healing/*, .ographx/*

🟨 MOST RECENT CONTEXT (Previous Iteration)
─────────────────────────
   Last Modified: packages/slo-dashboard/src/handlers/metrics.ts
   Pending Items: Add compliance calculation, Add telemetry events

✅ Context saved to: .generated/context-envelope.json
```

---

## Integration Points

### 1. Knowledge Index Integration

Add to `.generated/project-knowledge-map.json`:

```json
{
  "contextRemounting": {
    "enabled": true,
    "layers": {
      "root": "5-layer telemetry governance system",
      "sub": "Current sprint objective",
      "boundaries": "PROJECT_BOUNDARIES.json",
      "previous": ".generated/context-history/latest.json"
    }
  }
}
```

### 2. Context History Tracking

Directory structure:
```
.generated/context-history/
├── latest.json (current context)
├── session-1700000000000-abc123def.json
├── session-1700000001000-def456ghi.json
└── archive/
    └── 2025-11-23/
        ├── session-*.json
        └── ...
```

### 3. Agent Workflow

```
┌─────────────────────────────────────────┐
│ 1. Agent Starts                         │
│    Load context envelope                │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 2. Mount 4 Layers                       │
│    Root → Sub → Boundaries → Previous   │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 3. Agent Operates Within Boundaries     │
│    Respects scope, remembers history    │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 4. Agent Completes Iteration            │
│    Save context for next iteration      │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│ 5. Next Agent Loads Context             │
│    Continues from where previous left   │
└─────────────────────────────────────────┘
```

---

## Context Envelope Structure

```json
{
  "timestamp": "2025-11-23T21:00:00.000Z",
  "layers": {
    "root": {
      "description": "5-layer telemetry system",
      "mvp": "Thin-client host with plugin architecture",
      "nonNegotiable": ["100% traceability", "Manifest-driven", "JSON-first"]
    },
    "sub": {
      "description": "Implement metrics.ts handlers",
      "focus": "Current iteration only"
    },
    "boundaries": {
      "inScope": ["packages/slo-dashboard/*", "src/handlers/*"],
      "outOfScope": ["packages/*/demo/*", "packages/self-healing/*"]
    },
    "previous": {
      "summary": "Completed compliance calculation",
      "lastModifiedFiles": ["packages/slo-dashboard/src/handlers/metrics.ts"],
      "pendingItems": ["Add telemetry events", "Write tests"]
    }
  },
  "metadata": {
    "agentId": "agent-001",
    "sessionId": "session-1700000000000-abc123def",
    "iterationNumber": 1
  }
}
```

---

## Meditative Framing

Before each action, agents should recite:

> "Before each action, return to clarity.
> Re-anchor to my core purpose (root).
> Focus on the present work (sub).
> Respect the boundaries (scope).
> Remember where I came from (previous).
> This is how I prevent drift."

---

## Benefits

✅ **Coherence** - Agents stay aligned across iterations  
✅ **Efficiency** - No re-derivation of solved problems  
✅ **Safety** - Boundaries prevent out-of-scope changes  
✅ **Traceability** - Complete history of mental state  
✅ **Scalability** - Works with multiple concurrent agents  

---

## Next Steps

1. ✅ Review CONTEXT_REMOUNTING_SYSTEM.md
2. ✅ Run: `node scripts/agent-load-context.js --help`
3. ✅ Integrate with knowledge-index.json
4. ✅ Create PROJECT_BOUNDARIES.json
5. ✅ Start using before each workload iteration

---

**Status:** Ready for Implementation  
**Priority:** HIGH (Prevents multi-agent drift)

