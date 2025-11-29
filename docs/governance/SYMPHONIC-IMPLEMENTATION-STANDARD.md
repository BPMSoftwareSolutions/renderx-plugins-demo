# Symphonic Implementation Standard (The Bible)

**Authority**: This document defines the CANONICAL pattern for implementing symphonic orchestration domains that can be properly analyzed by the symphonic-code-analysis-pipeline.

**Reference Implementation**: `renderx-web-orchestration` domain

**Last Updated**: 2025-11-29
**Status**: AUTHORITATIVE

---

## Purpose

This standard ensures that ALL orchestration domains follow a consistent, analyzable pattern. Any domain claiming to be "symphonic" MUST implement this structure, or it cannot be analyzed by the code analysis pipeline.

---

## The Golden Rule

> **Every beat in a sequence JSON MUST have a corresponding handler implementation.**
>
> If you define orchestration in JSON, you MUST implement the handlers that execute it.

---

## Required Structure

### 1. Domain Registry Entry

Every symphonic domain MUST have this in `DOMAIN_REGISTRY.json`:

```json
{
  "domain_id": "your-domain-name",
  "domain_type": "orchestration",
  "status": "active",
  "analysisConfig": {
    "analysisSourcePath": "packages/",              // WHERE the implementation code lives
    "analysisOutputPath": ".generated/analysis/your-domain/",
    "reportOutputPath": "docs/generated/your-domain/",
    "reportAuthorityRef": "docs/authorities/report-generation-authority.json"
  },
  "orchestration": {
    "schema_ref": "docs/schemas/musical-sequence.schema.json",
    "registry_ref": {
      "file": "orchestration-domains.json",
      "id": "orchestration-domains-registry"
    }
  }
}
```

**Critical**: `analysisSourcePath` MUST point to a directory containing actual TypeScript/JavaScript implementation code.

---

### 2. Package Structure (Implementation Code)

Based on renderx-web-orchestration reference implementation:

```
packages/
├── your-package-name/
│   ├── src/
│   │   ├── index.ts                           # Package entry point
│   │   └── symphonies/                        # 🎵 REQUIRED: Symphony implementations
│   │       ├── create/                        # Symphony 1: CREATE operations
│   │       │   ├── create.symphony.ts         # Main symphony orchestrator
│   │       │   ├── create.arrangement.ts      # Beat/handler definitions
│   │       │   ├── create.css.stage-crew.ts   # Handler: CSS operations
│   │       │   ├── create.dom.stage-crew.ts   # Handler: DOM operations
│   │       │   └── create.interactions.stage-crew.ts  # Handler: Event wiring
│   │       ├── select/                        # Symphony 2: SELECT operations
│   │       │   ├── select.symphony.ts
│   │       │   └── select.stage-crew.ts
│   │       └── update/                        # Symphony 3: UPDATE operations
│   │           ├── update.symphony.ts
│   │           └── update.stage-crew.ts
│   ├── package.json
│   └── tsconfig.json
```

**Key Pattern**: Each symphony is a **folder** containing:
- `*.symphony.ts` - The main orchestrator that coordinates the symphony
- `*.stage-crew.ts` - Handler implementations (the actual work)
- `*.arrangement.ts` - Optional beat/handler mapping metadata

---

### 3. Handler Implementation Pattern

Every handler file MUST export handler functions:

```typescript
// Example: create.css.stage-crew.ts
export const createCssClass = (payload: CreatePayload) => {
  // Implementation here
};

export const injectCssFallback = (payload: CreatePayload) => {
  // Implementation here
};
```

**Naming Convention**:
- `*.symphony.ts` - Orchestrator files
- `*.stage-crew.ts` - Handler implementation files
- `*.arrangement.ts` - Metadata/mapping files

---

### 4. JSON Sequence Definition

Located in `packages/orchestration/json-sequences/`:

```json
{
  "id": "your-domain-symphony",
  "sequenceId": "your-domain-symphony",
  "name": "Your Domain Symphony",
  "packageName": "your-package-name",
  "movements": [
    {
      "id": "movement-1",
      "name": "Discovery",
      "beats": [
        {
          "id": "beat-1-1",
          "name": "Initialization",
          "handler": {
            "name": "initializeContext",
            "scope": "orchestration",
            "kind": "orchestration"
          }
        }
      ]
    }
  ]
}
```

**Critical**: Each beat MUST reference a handler that EXISTS in your symphony implementation code.

---

## Analysis-Ready Checklist

A domain is "analysis-ready" when:

- [x] Domain registered in `DOMAIN_REGISTRY.json` with correct `analysisSourcePath`
- [x] `analysisSourcePath` contains actual `.ts` or `.js` files (not empty)
- [x] Handlers organized in `/symphonies/` folder structure
- [x] Each symphony has handler implementations (`*.stage-crew.ts`)
- [x] Handlers are exported functions (not just interfaces)
- [x] JSON sequence exists in `packages/orchestration/json-sequences/`
- [x] Every beat in JSON references an actual implemented handler

---

## Anti-Patterns (DO NOT DO THIS)

### ❌ Anti-Pattern 1: JSON-Only Orchestration

**Problem**: `build-pipeline-orchestration` currently does this

```
packages/orchestration/
├── json-sequences/
│   └── build-pipeline-symphony.json  ✅ Has sequence definition
└── bdd/                               ❌ NO IMPLEMENTATIONS!
```

**Result**: 0 handlers discovered, 0 LOC analyzed, meaningless report

**Fix**: Create `packages/build-pipeline/src/symphonies/` with actual handler implementations

---

### ❌ Anti-Pattern 2: Wrong analysisSourcePath

```json
{
  "analysisSourcePath": "packages/orchestration"  // ❌ Only has JSON, no code!
}
```

**Fix**: Point to where the IMPLEMENTATION code lives:

```json
{
  "analysisSourcePath": "packages/build-pipeline"  // ✅ Has src/symphonies/
}
```

---

### ❌ Anti-Pattern 3: Flat Handler Structure

```
packages/your-package/src/
├── handler1.ts
├── handler2.ts
└── handler3.ts
```

**Problem**: No symphony organization = analysis can't group by symphony

**Fix**: Organize into symphonies:

```
packages/your-package/src/symphonies/
├── create/
│   ├── handler1.stage-crew.ts
│   └── handler2.stage-crew.ts
└── update/
    └── handler3.stage-crew.ts
```

---

## Reference Implementation: renderx-web-orchestration

**Location**: `packages/canvas-component/`, `packages/control-panel/`, etc.

**Why it works**:
1. ✅ `analysisSourcePath: "packages/"` points to actual code
2. ✅ Each package has `src/symphonies/` folder structure
3. ✅ Handlers are in `*.stage-crew.ts` files
4. ✅ 147 handlers discovered across 25 symphonies
5. ✅ Analysis produces rich symphony breakdowns with beat/handler portfolios

**Analysis Report**: `docs/generated/renderx-web/renderx-web-orchestration-CODE-ANALYSIS-REPORT.md`

Lines 115-168 show the detailed symphony breakdowns that ALL domains should produce.

---

## Migration Path for Non-Compliant Domains

If your domain currently shows "0 handlers discovered":

### Step 1: Identify the Problem

Run analysis and check the report:
- "0 source files discovered" → Wrong `analysisSourcePath`
- "0 handlers discovered" → No handler implementations exist
- "Generic summary" shown → No `/symphonies/` folder structure

### Step 2: Create Implementation Package

```bash
mkdir -p packages/your-domain/src/symphonies
```

### Step 3: Implement Handlers for Each Movement

For each movement in your JSON sequence, create corresponding handler files:

```typescript
// packages/your-domain/src/symphonies/movement1/init.stage-crew.ts
export const initializeContext = (payload: InitPayload) => {
  // Move implementation here from wherever it currently lives
};
```

### Step 4: Update Domain Registry

```json
{
  "analysisSourcePath": "packages/your-domain"  // Point to NEW implementation
}
```

### Step 5: Verify

```bash
npm run analyze:symphonic:code:domain -- your-domain
```

Check report for:
- ✅ Handlers discovered > 0
- ✅ Symphony breakdowns appear
- ✅ Beat/handler portfolio tables shown

---

## Enforcement

**Code Analysis Pipeline**: The symphonic-code-analysis-pipeline is the **enforcer** of this standard. If your domain doesn't follow this pattern, the analysis will show:

1. 0 handlers discovered
2. Generic summary (not detailed symphony breakdowns)
3. No handler portfolio metrics

**CI/CD Gate**: Domains with 0 handlers CANNOT pass quality gates.

---

## Questions & Answers

### Q: Can I have handlers outside `/symphonies/` folder?

**A**: Yes, but they won't be grouped by symphony in the analysis report. You'll lose the detailed symphony breakdowns that make the analysis valuable.

### Q: What if my orchestration is in scripts, not packages?

**A**: That's fine! See `symphonic-code-analysis-pipeline` domain:
- `analysisSourcePath: "scripts/"`
- Handlers in `scripts/*.cjs`
- Analysis shows "fractal self-analysis" banner
- Still gets full handler metrics

The key is having ACTUAL IMPLEMENTATION CODE at the `analysisSourcePath`.

### Q: Can I use CommonJS (.cjs) instead of TypeScript?

**A**: Yes! The scanner supports `.ts`, `.tsx`, `.js`, `.jsx`, `.cjs`, `.mjs`. Any exported functions will be detected.

---

## Conclusion

**The Bible is simple**:

1. JSON sequences define WHAT to do (orchestration metadata)
2. Handler implementations define HOW to do it (executable code)
3. BOTH must exist and align
4. Organize handlers in `/symphonies/` folders for rich analysis
5. Point `analysisSourcePath` to where the implementations live

**ONE source of truth**: renderx-web-orchestration
**ONE correct pattern**: Symphonies as folders with stage-crew handlers
**ONE analysis result**: Detailed symphony breakdowns with beat/handler portfolios

Any deviation from this pattern will produce degraded analysis with missing symphony details.

---

**Next Action for build-pipeline-orchestration**:
Create `packages/build-pipeline/src/symphonies/` with handler implementations for the 4 movements defined in `build-pipeline-symphony.json`.
