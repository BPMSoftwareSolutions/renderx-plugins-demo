# OgraphX: Catalog-First Analysis Architecture

## Current Problem

OgraphX currently analyzes **source code FIRST**, then syncs catalog files. This is backwards.

### Current Pipeline (❌ WRONG)
```
npm run pre:manifests
    ↓
npm run regenerate:ographx          ← Analyzes source code (packages/*)
    ↓
node scripts/sync-json-sources.js   ← Copies catalog files
    ↓
node scripts/sync-json-sequences.js ← Copies catalog sequences
    ↓
node scripts/generate-*.js          ← Generates manifests from source
```

**Problem**: Source code is treated as source of truth, catalog is secondary

### Correct Pipeline (✅ RIGHT)
```
npm run pre:manifests
    ↓
[PHASE 1: Analyze Catalog]
    ↓
node scripts/analyze-catalog-sequences.js    ← Parse catalog/json-sequences/
node scripts/analyze-catalog-topics.js       ← Parse catalog/json-topics/
node scripts/analyze-catalog-manifests.js    ← Parse plugin-manifest.json
    ↓
Generate: catalog-sequences.json, catalog-topics.json, catalog-manifest.json
    ↓
[PHASE 2: Analyze Source Code]
    ↓
npm run regenerate:ographx                   ← Extract IR from source
    ↓
Generate: graph.json (symbols, calls, contracts)
    ↓
[PHASE 3: Compare & Validate]
    ↓
node scripts/compare-catalog-vs-source.js    ← Find gaps
    ↓
Generate: coverage-report.json, enhanced-sequences.json
    ↓
[PHASE 4: Generate Artifacts]
    ↓
node scripts/generate-diagrams.js            ← From catalog sequences
node scripts/generate-analysis.js            ← Coverage metrics
    ↓
[PHASE 5: Sync & Deploy]
    ↓
node scripts/sync-json-sources.js            ← Copy to public/
```

## Why Catalog-First?

### 1. Catalog is the Contract
- Defines what SHOULD happen (intended behavior)
- Is human-readable and maintainable
- Is the architecture specification
- Should be reviewed and approved

### 2. Source Code is the Implementation
- Implements the catalog's intent
- Can have bugs or missing implementations
- Should be validated against catalog
- Is the "how" not the "what"

### 3. Validation Flow
```
Catalog (Intent)
    ↓
Source Code (Implementation)
    ↓
Comparison (Validation)
    ↓
Gap Report (What's missing)
```

## Required Changes

### 1. Create Catalog Analysis Scripts

**analyze-catalog-sequences.js**
- Parse all `catalog/json-sequences/` files
- Extract symphonies, movements, beats
- Build sequence dependency graph
- Output: `catalog-sequences.json`

**analyze-catalog-topics.js**
- Parse all `catalog/json-topics/` files
- Extract topic definitions
- Build topic dependency graph
- Output: `catalog-topics.json`

**analyze-catalog-manifests.js**
- Parse `plugin-manifest.json`
- Parse `interaction-manifest.json`
- Extract plugin registrations
- Output: `catalog-manifest.json`

### 2. Create Comparison Script

**compare-catalog-vs-source.js**
- Load catalog-sequences.json (intended)
- Load graph.json (actual)
- Match beats with handlers
- Identify gaps:
  - Catalog beat with no handler
  - Handler with no catalog beat
- Output: `coverage-report.json`

### 3. Update pre:manifests Order

```javascript
"pre:manifests": 
  "npm run analyze:catalog:sequences && " +
  "npm run analyze:catalog:topics && " +
  "npm run analyze:catalog:manifests && " +
  "npm run regenerate:ographx && " +
  "npm run compare:catalog:vs:source && " +
  "node scripts/sync-json-sources.js --srcRoot=catalog && " +
  "npm run sync:json-components && " +
  "node scripts/sync-json-sequences.js --srcRoot=catalog && " +
  "node scripts/generate-json-interactions-from-plugins.js && " +
  "node scripts/generate-interaction-manifest.js --srcRoot=catalog && " +
  "node scripts/generate-topics-manifest.js --srcRoot=catalog && " +
  "node scripts/generate-layout-manifest.js --srcRoot=catalog && " +
  "node scripts/aggregate-plugins.js && " +
  "node scripts/sync-plugins.js --srcRoot=catalog && " +
  "node scripts/sync-control-panel-config.js && " +
  "node scripts/generate-versions-manifest.js"
```

## Artifacts Generated

### Phase 1: Catalog Analysis
- `catalog-sequences.json` - All intended beats
- `catalog-topics.json` - All intended topics
- `catalog-manifest.json` - All intended plugins

### Phase 2: Source Analysis
- `graph.json` - All actual symbols and calls

### Phase 3: Comparison
- `coverage-report.json` - Gaps and mismatches
- `enhanced-sequences.json` - Catalog + source metadata

### Phase 4: Artifacts
- `analysis.json` - Metrics and coverage
- `*.mmd`, `*.svg` - Diagrams from catalog

## Benefits

1. **Catalog is Authoritative**
   - Catalog defines the contract
   - Source must implement it
   - Gaps are immediately visible

2. **Better Gap Detection**
   - Missing handlers are caught
   - Orphaned handlers are identified
   - Coverage percentage is accurate

3. **Clearer Architecture**
   - Catalog is the specification
   - Source is the implementation
   - Validation is explicit

4. **Easier Debugging**
   - Start with catalog (what should happen)
   - Check source (what actually happens)
   - Compare (what's missing)

5. **Better Documentation**
   - Catalog sequences are the spec
   - Coverage report shows gaps
   - Analysis shows what's implemented

## Implementation Priority

### Phase 1: Create Catalog Analysis Scripts
- `analyze-catalog-sequences.js`
- `analyze-catalog-topics.js`
- `analyze-catalog-manifests.js`

### Phase 2: Create Comparison Script
- `compare-catalog-vs-source.js`

### Phase 3: Update Build Pipeline
- Reorder `pre:manifests` script
- Add new npm scripts
- Test end-to-end

### Phase 4: Validation
- Run build pipeline
- Verify coverage report
- Check for gaps
- Update documentation

## Success Criteria

✅ Catalog analysis runs before source analysis
✅ Coverage report shows all gaps
✅ Enhanced sequences include source metadata
✅ Build pipeline completes successfully
✅ No regressions in existing functionality
✅ Documentation updated

