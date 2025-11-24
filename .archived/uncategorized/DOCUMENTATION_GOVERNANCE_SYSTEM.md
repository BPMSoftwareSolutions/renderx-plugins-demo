# 📄 Documentation Governance System

**JSON is Authority. Markdown is Reflection.**

---

## The Problem

Documentation drifts. Code changes, but docs don't. Agents read stale docs. Humans get confused.

**Root cause:** Docs are treated as independent sources of truth, not as generated views of JSON.

---

## The Solution

Treat documentation as **first-class JSON objects** that generate Markdown.

```
JSON (Authority)
    ↓
DOC_INDEX.json (Doc Definitions)
    ↓
gen-docs-from-json.js (Generator)
    ↓
Markdown Files (Reflection)
```

---

## Architecture

### 1. DOC_INDEX.json - Single Source of Truth for Docs

Defines every document:

```json
{
  "docs": [
    {
      "id": "cag-system-overview",
      "title": "CAG System Overview",
      "role": "narrative-core",
      "audience": ["architects", "agents"],
      "sourceJson": ["SHAPE_EVOLUTION_PLAN.json", "root-context.json"],
      "context": {
        "rootGoalId": "telemetry-driven-feature-shape-governance",
        "boundaries": { "inScopeTags": [...], "outOfScopeTags": [...] }
      },
      "generation": {
        "templateId": "doc/cag-system-overview.mdx.hbs",
        "lastGeneratedFromHash": "sha256:...",
        "docHash": "sha256:..."
      }
    }
  ]
}
```

### 2. Doc Roles - Enforce Style & Audience

Each doc declares a **role** that determines:
- Template used
- Style (narrative, procedural, strict)
- Max length
- Machine readability

**Roles:**
- `narrative-core` - High-level conceptual (no length limit)
- `operational-guide` - How-to procedures (max 2000 chars)
- `spec-view` - Specification views (max 3000 chars)
- `agent-brief` - Strict agent instructions (max 500 chars, machine-readable)

### 3. Context Envelope - Every Doc Knows Its Context

Before generating, the system builds a context envelope:

```json
{
  "rootContext": {
    "goal": "Implement telemetry-driven Feature Shape governance..."
  },
  "subContext": {
    "docId": "cag-system-overview",
    "role": "narrative-core"
  },
  "boundaries": {
    "inScope": ["governance", "cag", "context"],
    "outOfScope": ["demo-ui", "internal-only"]
  }
}
```

This envelope is rendered as a **context block** at the top of every generated doc:

```markdown
> **Context**
> Root Goal: *Telemetry-driven Feature Shape governance*
> Role: `narrative-core`
> Audience: architects, agents
> In Scope: governance, cag, context
> Out of Scope: demo-ui, internal-only
```

### 4. Section Map - Bidirectional Traceability

Each doc section maps back to JSON:

```json
{
  "sectionMap": [
    {
      "sectionId": "cag-loop",
      "jsonSource": "root-context.json#/contextLayers",
      "docAnchors": ["#the-cag-loop", "#8-step-loop"]
    }
  ]
}
```

Benefits:
- When JSON changes, know which doc sections need updating
- Agents can trace from Markdown → back to JSON source

### 5. Hash Verification - Detect Drift

Each doc stores:
- `lastGeneratedFromHash` - Hash of source JSON when doc was generated
- `docHash` - Hash of generated Markdown

CI checks:
- If source JSON changed but `lastGeneratedFromHash` wasn't updated → **STALE**
- If generated Markdown changed but source JSON didn't → **MANUALLY EDITED** (violation)

---

## Workflow

### Generate Docs

```bash
# Generate all docs
npm run gen:docs

# Generate one doc
npm run gen:docs -- --doc "cag-system-overview"

# Verify docs are up-to-date
npm run verify:docs
```

### Modify a Doc

**WRONG:**
```bash
# Don't edit markdown directly
vim docs/generated/cag-system-overview.md
```

**RIGHT:**
```bash
# 1. Modify the source JSON
vim SHAPE_EVOLUTION_PLAN.json

# 2. Update DOC_INDEX.json if needed
vim DOC_INDEX.json

# 3. Regenerate
npm run gen:docs

# 4. Verify
npm run verify:docs
```

### Add a New Doc

1. Add entry to `DOC_INDEX.json`:

```json
{
  "id": "my-new-doc",
  "title": "My New Document",
  "role": "narrative-core",
  "audience": ["developers"],
  "sourceJson": ["my-source.json"],
  "context": { ... }
}
```

2. Create template (if needed):

```bash
touch docs/templates/my-new-doc.mdx.hbs
```

3. Generate:

```bash
npm run gen:docs -- --doc "my-new-doc"
```

---

## Governance Rules

✅ **DO:**
- Modify JSON sources
- Regenerate documentation
- Update DOC_INDEX.json
- Run `npm run verify:docs` before committing

❌ **DON'T:**
- Edit generated markdown files directly
- Commit stale docs
- Ignore hash mismatches
- Skip verification

---

## Integration with CAG

The documentation system integrates with CAG:

1. **Context Envelope** - Every doc has a context envelope (like CAG context)
2. **Boundaries** - Docs declare in-scope/out-of-scope tags
3. **Traceability** - Docs map back to JSON sources
4. **Verification** - CI enforces governance

---

## Files

### Core Files
- **`DOC_INDEX.json`** - Doc definitions and metadata
- **`scripts/gen-docs-from-json.js`** - Generator
- **`scripts/verify-docs-governance.js`** - Verifier

### Generated Files
- **`docs/generated/*.md`** - Generated markdown (DO NOT EDIT)

### Templates
- **`docs/templates/*.mdx.hbs`** - Handlebars templates

---

## CI Integration

Add to `package.json`:

```json
{
  "scripts": {
    "gen:docs": "node scripts/gen-docs-from-json.js",
    "verify:docs": "node scripts/verify-docs-governance.js",
    "pretest": "npm run verify:docs"
  }
}
```

Now CI will:
1. Verify docs before running tests
2. Fail if docs are stale or manually edited
3. Enforce governance rules

---

## Key Principles

1. **JSON is Authority** - All truth lives in JSON
2. **Markdown is Reflection** - Docs are generated views
3. **Context is Explicit** - Every doc knows its context
4. **Traceability is Bidirectional** - Docs ↔ JSON
5. **Governance is Enforced** - CI prevents violations
6. **Drift is Detected** - Hash verification catches changes

---

## Status

✅ **COMPLETE**

- ✅ DOC_INDEX.json created
- ✅ gen-docs-from-json.js created
- ✅ verify-docs-governance.js created
- ✅ Documentation governance system ready

**Next:** Integrate into CI pipeline and create templates.

