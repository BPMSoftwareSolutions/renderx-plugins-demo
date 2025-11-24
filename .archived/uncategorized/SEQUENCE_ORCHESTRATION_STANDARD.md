# 🎼 Sequence Orchestration Standard

**The canonical documentation structure for all work in this codebase**

---

## Core Principle

**Sequence orchestration IS documentation.**

Not markdown. Not prose. The sequence itself is the truth.

Every workload, feature, workflow, and process is documented as a **MusicalSequence** - a formal orchestration structure that:
- ✅ Defines what happens (movements)
- ✅ Defines how it happens (beats)
- ✅ Defines when it happens (timing, dynamics)
- ✅ Defines error handling (abort vs continue)
- ✅ Is machine-readable and executable
- ✅ Can be visualized, analyzed, and traced

---

## The MusicalSequence Interface

**Source:** `packages/musical-conductor/modules/communication/sequences/SequenceTypes.ts`

```typescript
interface MusicalSequence {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  description: string;           // Purpose and behavior
  key: string;                   // Musical key (organizational)
  tempo: number;                 // BPM (beats per minute)
  timeSignature?: string;        // Time signature (organizational)
  category: SequenceCategory;    // Sequence category
  movements: SequenceMovement[]; // Array of movements
  metadata?: {
    version?: string;
    author?: string;
    created?: Date;
    tags?: string[];
  };
}

interface SequenceMovement {
  id: string;                    // Unique movement identifier
  name: string;                  // Movement name
  description?: string;          // Movement description
  beats: SequenceBeat[];         // Array of beats
  tempo?: number;                // BPM override
  errorHandling?: "continue" | "abort-sequence";
}

interface SequenceBeat {
  beat: number;                  // Beat number (1-based)
  event: string;                 // Event type to emit
  title?: string;                // Human-readable title
  description?: string;          // What this beat does
  dynamics: MusicalDynamic;      // Priority: pp, p, mp, mf, f, ff
  timing?: MusicalTiming;        // When: immediate, after-beat, delayed, synchronized, on-beat
  data?: Record<string, any>;    // Data to pass
  dependencies?: string[];       // Events this depends on
  errorHandling?: "continue" | "abort-sequence" | "retry" | "abort";
}
```

---

## Sequence Categories

```
COMPONENT_UI          - UI component interactions
CANVAS_OPERATIONS     - Canvas manipulation
DATA_FLOW             - Data processing and flow
SYSTEM                - System sequences
SYSTEM_EVENTS         - System-level events
USER_INTERACTIONS     - User input handling
INTEGRATION           - External integrations
PERFORMANCE           - Performance testing
LAYOUT                - Layout-related sequences
```

---

## Dynamics (Priority Levels)

```
pp (pianissimo)  - Very soft - lowest priority
p  (piano)       - Soft - low priority
mp (mezzo-piano) - Medium soft - medium-low priority
mf (mezzo-forte) - Medium loud - medium priority
f  (forte)       - Loud - high priority
ff (fortissimo)  - Very loud - highest priority
```

---

## Timing Options

```
immediate      - Execute immediately when beat is reached
after-beat     - Execute after dependencies complete
delayed        - Execute with intentional delay
synchronized   - Execute synchronized with other events
on-beat        - Execute exactly on the next musical beat
```

---

## Where Sequences Live

### Orchestration Sequences
**Location:** `packages/ographx/.ographx/sequences/`

Examples:
- `graphing-orchestration.json` - OgraphX codebase graphing pipeline
- `cag-agent-workflow.json` - CAG agent 8-phase workflow

### Plugin Sequences
**Location:** `packages/{plugin}/json-sequences/{plugin}/`

Examples:
- `packages/library/json-sequences/library/library-load.json`
- `packages/canvas/json-sequences/canvas/canvas-init.json`

---

## How CAG Uses Sequences

1. **Context Loading** - Load sequence definitions
2. **Context Verification** - Validate sequence structure
3. **Workload Analysis** - Map workload to sequence phases
4. **Context Tree Mapping** - Extract dependencies from sequences
5. **Action Planning** - Plan actions based on sequence structure
6. **Action Execution** - Execute according to sequence
7. **Telemetry Emission** - Emit structured telemetry from sequence
8. **Feedback Loop** - Update sequences based on results

---

## Key Rules

1. **Sequences are authority** - Not markdown, not prose
2. **Sequences are executable** - Can be run by the conductor
3. **Sequences are traceable** - Every beat is logged and tracked
4. **Sequences are composable** - Movements can be reused
5. **Sequences are versioned** - Metadata tracks version and author
6. **Sequences are categorized** - Category determines context
7. **Sequences are documented** - Description and beat titles are required

---

## Example: CAG Agent Workflow

**File:** `packages/ographx/.ographx/sequences/cag-agent-workflow.json`

- **8 movements** (one per phase)
- **41 beats** (events)
- **Each beat** has: event, title, description, dynamics, timing, error handling
- **Dynamics:** mf (medium), f (high), ff (critical)
- **Timing:** immediate
- **Error handling:** abort (halt), continue (skip)

---

## Status

✅ **STANDARD DEFINED**
✅ **INTERFACE DOCUMENTED**
✅ **CATEGORIES ESTABLISHED**
✅ **ORCHESTRATION SEQUENCES CREATED**

**All agents must use this standard for all documentation and orchestration.**

---

## Next Steps

1. **Democratize** - Make all agents aware of this standard
2. **Enforce** - ESLint rules to prevent non-sequence documentation
3. **Compose** - Build complex workflows from sequence movements
4. **Trace** - Use sequences as the source of truth for traceability
5. **Evolve** - Update sequences as the system evolves

