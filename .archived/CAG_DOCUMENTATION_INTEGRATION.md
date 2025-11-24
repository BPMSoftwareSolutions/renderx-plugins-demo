# 🎼 CAG + Documentation Governance Integration

**Context-Augmented Generation meets Documentation-as-Code**

---

## The Vision

CAG maintains coherence of **context** across time.

Documentation Governance maintains coherence of **documentation** across time.

Together, they create a **self-coherent, self-aware system** where:
- Context is explicit and traceable
- Documentation is generated from truth
- Agents operate with complete visibility
- Drift is impossible

---

## How They Work Together

### 1. CAG Provides Context

CAG loads:
- Root goal
- Sub-context
- Boundaries
- Previous context

### 2. Documentation Governance Provides Views

Doc system generates:
- Narrative views (for humans)
- Spec views (for developers)
- Agent briefs (for AI)
- Operational guides (for operators)

### 3. Context Flows Into Docs

When generating a doc, the system:

```
1. Load DOC_INDEX.json (doc definition)
2. Load source JSON (authority)
3. Generate context envelope (from root-context.json)
4. Render context block (at top of doc)
5. Generate role-specific content
6. Add section map (traceability)
7. Save with hash verification
```

### 4. Docs Become CAG Fuel

Agents use docs as **explanations**, not as **authority**:

```
Agent Action:
1. Load context via CAG context engine
2. Read matching docs for explanation
3. Modify JSON (authority)
4. Emit telemetry
5. Feedback loop updates context
6. Docs regenerate automatically
```

---

## The Complete Loop

```
┌─────────────────────────────────────────────────────────┐
│                    GOVERNANCE CORE                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ SHAPE_EVOLUTION_PLAN.json (rules)               │   │
│  │ knowledge-index.json (artifact map)             │   │
│  │ root-context.json (root goal)                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              DOCUMENTATION GOVERNANCE                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ DOC_INDEX.json (doc definitions)                │   │
│  │ gen-docs-from-json.js (generator)               │   │
│  │ verify-docs-governance.js (verifier)            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  GENERATED MARKDOWN                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ docs/generated/*.md (context + narrative)       │   │
│  │ Each doc has:                                   │   │
│  │ - Context block (root goal, boundaries)         │   │
│  │ - Role-specific content                         │   │
│  │ - Section map (traceability)                    │   │
│  │ - Hash verification                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   CAG CONTEXT ENGINE                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Load governance core                            │   │
│  │ Load context providers (BDD, telemetry, etc)    │   │
│  │ Rehydrate context                               │   │
│  │ Enforce boundaries                              │   │
│  │ Calculate coherence score                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   AGENT ACTION                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 1. Load context via CAG                         │   │
│  │ 2. Read matching docs for explanation           │   │
│  │ 3. Modify JSON (authority)                      │   │
│  │ 4. Emit telemetry                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  FEEDBACK LOOP                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Analyze action results                          │   │
│  │ Update context for next iteration                │   │
│  │ Trigger doc regeneration                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
                    [LOOP BACK]
```

---

## Key Integration Points

### 1. Context Envelope in Docs

Every generated doc includes a context block:

```markdown
> **Context**
> Root Goal: *Telemetry-driven Feature Shape governance*
> Role: `narrative-core`
> Audience: architects, agents
> In Scope: governance, cag, context
> Out of Scope: demo-ui, internal-only
```

This is the **same context envelope** that CAG uses.

### 2. Section Map for Traceability

Docs map sections back to JSON:

```json
{
  "sectionId": "cag-loop",
  "jsonSource": "root-context.json#/contextLayers",
  "docAnchors": ["#the-cag-loop"]
}
```

Agents can:
- Read doc section
- Find JSON source
- Verify context
- Make changes

### 3. Hash Verification for Drift Detection

Docs store hashes:
- `lastGeneratedFromHash` - Hash of source JSON
- `docHash` - Hash of generated Markdown

CI checks:
- If source JSON changed → docs are stale
- If Markdown changed → manually edited (violation)

### 4. Role-Based Content for Different Audiences

Docs declare roles:
- `narrative-core` - For humans (architects, agents)
- `operational-guide` - For operators
- `spec-view` - For developers
- `agent-brief` - For AI agents (strict, machine-readable)

CAG can select docs by role:
- Agents read `agent-brief` docs
- Humans read `narrative-core` docs
- Operators read `operational-guide` docs

---

## Workflow Example

### Scenario: Update Shape Budgets Governance

1. **Modify JSON** (authority):
```bash
vim SHAPE_EVOLUTION_PLAN.json
# Update shape-budgets rules
```

2. **Update DOC_INDEX.json** (if needed):
```bash
vim DOC_INDEX.json
# Update doc definition if scope changed
```

3. **Regenerate docs**:
```bash
npm run gen:docs
```

4. **Verify governance**:
```bash
npm run verify:docs
```

5. **Commit**:
```bash
git add SHAPE_EVOLUTION_PLAN.json DOC_INDEX.json docs/generated/*.md
git commit -m "Update shape budgets governance"
```

6. **CI runs**:
```bash
npm run verify:docs  # Passes ✅
npm run test         # Runs with updated context
```

7. **Agents see updated docs**:
- CAG loads updated context
- Agents read regenerated docs
- Agents operate with latest truth

---

## Benefits

✅ **Complete Visibility** - Every doc's context is explicit  
✅ **Governance Enforcement** - Rules are checked automatically  
✅ **Drift Prevention** - Docs regenerate from JSON  
✅ **Traceability** - Docs ↔ JSON bidirectional  
✅ **Multi-Audience** - Different docs for different roles  
✅ **Self-Coherent** - Context + docs always aligned  
✅ **Agent-Friendly** - Agents read context-aware docs  

---

## Files Created

1. **`DOC_INDEX.json`** - Doc definitions
2. **`scripts/gen-docs-from-json.js`** - Generator
3. **`scripts/verify-docs-governance.js`** - Verifier
4. **`DOCUMENTATION_GOVERNANCE_SYSTEM.md`** - Guide
5. **`CAG_DOCUMENTATION_INTEGRATION.md`** - This document

---

## Next Steps

### Phase 1: Templates
- [ ] Create `docs/templates/cag-system-overview.mdx.hbs`
- [ ] Create `docs/templates/governance-overview.mdx.hbs`
- [ ] Create `docs/templates/agent-governance-brief.mdx.hbs`

### Phase 2: Integration
- [ ] Add `npm run gen:docs` to build pipeline
- [ ] Add `npm run verify:docs` to CI
- [ ] Update `package.json` scripts

### Phase 3: Migration
- [ ] Migrate existing docs to DOC_INDEX.json
- [ ] Generate markdown from templates
- [ ] Verify all docs pass governance

### Phase 4: Observability
- [ ] Dashboard showing doc coverage
- [ ] Governance compliance %
- [ ] Drift detection alerts

---

## The Transformation

**From:** Opaque docs that drift from code  
**To:** Generated docs that always reflect truth  

**From:** Agents reading stale documentation  
**To:** Agents reading context-aware, generated docs  

**From:** Manual doc updates  
**To:** Automatic doc regeneration  

**From:** Documentation as separate concern  
**To:** Documentation as expression of governance  

---

**Status:** ✅ ARCHITECTURE COMPLETE  
**Priority:** CRITICAL  
**Impact:** Complete coherence between code, context, and documentation  

**The system is now self-aware and self-documenting.**

