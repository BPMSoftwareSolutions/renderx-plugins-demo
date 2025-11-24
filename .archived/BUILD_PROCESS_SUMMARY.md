# RenderX Build Process Summary

## Overview
The RenderX build pipeline is a 12-step process that transforms source files into runtime artifacts. It's manifest-driven and JSON-centric.

## 12-Step Build Pipeline

### Phase 1: Preparation (Steps 1-2)
**Step 1: Clean Output Directories**
- Remove `.ographx/artifacts/` and `dist/` directories
- Prepare fresh build environment

**Step 2: Validate Source Structure**
- Check catalog/json-* directories exist
- Verify plugin manifests are present
- Validate JSON schema compliance

### Phase 2: Catalog Analysis (Steps 3-5) ⭐ PRIMARY SOURCE OF TRUTH
**Step 3: Analyze Catalog Sequences**
- Parse all `catalog/json-sequences/` files
- Extract symphonies, movements, and beats
- Build sequence dependency graph
- Generate `catalog-sequences.json` with all defined beats
- **This is the INTENDED behavior** (what should happen)

**Step 4: Analyze Catalog Topics**
- Parse all `catalog/json-topics/` files
- Extract topic definitions and event schemas
- Build topic dependency graph
- Generate `catalog-topics.json`

**Step 5: Analyze Catalog Manifests**
- Parse `plugin-manifest.json` and `interaction-manifest.json`
- Extract plugin registrations and event mappings
- Validate handler references exist in source code
- Generate `catalog-manifest.json`

### Phase 3: Source Code Analysis (Steps 6-8) ⭐ SECONDARY VALIDATION
**Step 6: Generate OgraphX IR from Source Code**
- Extract TypeScript/JavaScript symbols (functions, classes, exports)
- Build call graph (dependencies between symbols)
- Generate `graph.json` with all symbols and relationships
- **Purpose**: Validate that handlers exist and are callable

**Step 7: Compare Catalog vs Source**
- Match catalog-defined beats with source handlers
- Identify missing handlers (catalog beat has no implementation)
- Identify orphaned handlers (source handler not in any catalog beat)
- Generate `coverage-report.json` with gaps
- **Purpose**: Ensure catalog is fully implemented

**Step 8: Generate Enhanced Sequences**
- Start with catalog sequences (source of truth)
- Enrich with source code metadata (handler signatures, dependencies)
- Add timing and performance data
- Generate `enhanced.sequences.json`
- **Purpose**: Combine catalog intent with source implementation details

### Phase 4: Artifact Generation (Steps 9-11)
**Step 9: Generate Diagrams**
- Create Mermaid diagrams from catalog sequences
- Generate orchestration flow diagrams
- Output `.mmd` and `.svg` files

**Step 10: Generate Analysis Reports**
- Compute metrics (sequence count, handler coverage)
- Generate gap analysis (catalog vs source)
- Create `analysis.json` with coverage percentage
- **Purpose**: Identify missing instrumentation

**Step 11: Package Artifacts**
- Copy all generated files to `.ographx/artifacts/renderx-web/`
- Organize by type (sequences, diagrams, analysis, etc.)
- Create manifest.json for artifact index

### Phase 5: Runtime Preparation (Step 12)
**Step 12: Copy to Public Directory**
- Copy artifacts to `public/artifacts/`
- Make available to web application at runtime
- Enable dynamic loading of sequences and manifests

## Key Files Generated

| File | Location | Purpose | Source |
|------|----------|---------|--------|
| catalog-sequences.json | `.ographx/artifacts/renderx-web/catalog/` | All catalog sequences (INTENDED) | catalog/json-sequences/ |
| catalog-topics.json | `.ographx/artifacts/renderx-web/catalog/` | All catalog topics | catalog/json-topics/ |
| catalog-manifest.json | `.ographx/artifacts/renderx-web/catalog/` | Merged manifests | plugin-manifest.json |
| graph.json | `.ographx/artifacts/renderx-web/ir/` | Symbol extraction and call graph | Source code |
| coverage-report.json | `.ographx/artifacts/renderx-web/analysis/` | Catalog vs source comparison | Catalog + Source |
| enhanced.sequences.json | `.ographx/artifacts/renderx-web/sequences/` | Catalog sequences + source metadata | Catalog + Source |
| analysis.json | `.ographx/artifacts/renderx-web/analysis/` | Metrics and gap analysis | All sources |
| *.mmd | `.ographx/artifacts/renderx-web/diagrams/` | Mermaid diagrams | Catalog sequences |
| *.svg | `.ographx/artifacts/renderx-web/diagrams/` | SVG visualizations | Catalog sequences |

## npm Scripts

```bash
npm run build:packages          # Build all workspace packages
npm run pre:manifests          # Run all 12 build steps
npm run artifacts:build        # Generate artifacts
npm run artifacts:build:integrity  # Build with integrity checks
npm run dev:artifacts          # Copy artifacts and start dev server
```

## Data Flow (Catalog-First)

```
CATALOG (Source of Truth)
├── catalog/json-sequences/
├── catalog/json-topics/
└── catalog/json-plugins/plugin-manifest.json
    ↓
[Phase 2: Catalog Analysis]
    ↓
catalog-sequences.json (INTENDED beats)
catalog-topics.json (INTENDED topics)
catalog-manifest.json (INTENDED plugins)
    ↓
SOURCE CODE (Implementation)
├── packages/*/src/symphonies/ (handlers)
├── packages/*/src/index.ts (exports)
└── TypeScript/JavaScript files
    ↓
[Phase 3: Source Code Analysis]
    ↓
graph.json (actual symbols and calls)
    ↓
[Phase 3: Compare Catalog vs Source]
    ↓
coverage-report.json (gaps and mismatches)
enhanced.sequences.json (catalog + source metadata)
    ↓
[Phase 4: Generate Artifacts]
    ↓
analysis.json (metrics and coverage)
*.mmd, *.svg (diagrams from catalog)
    ↓
[Phase 5: Package & Deploy]
    ↓
.ographx/artifacts/renderx-web/
    ↓
public/artifacts/
    ↓
Web Application (loads at runtime)
```

## Key Principles

1. **Manifest-Driven**: All behavior defined in JSON manifests
2. **Single Source of Truth**: Catalog files are authoritative
3. **Auto-Generated**: Artifacts derived from source, not maintained manually
4. **Build-Time Validation**: Errors caught before runtime
5. **JSON-Centric**: All configuration and data in JSON format

## Build Triggers

- **Local Development**: `npm run dev` (includes pre:manifests)
- **CI Pipeline**: Runs on every push/PR
- **Pre-Commit**: Validates manifests before commit
- **Production Build**: Full integrity checks

## Performance

- Total build time: ~30-45 seconds
- OgraphX IR extraction: ~8-10 seconds
- Sequence generation: ~5-7 seconds
- Manifest merging: ~2-3 seconds
- Artifact packaging: ~3-5 seconds
- Diagram generation: ~5-8 seconds

## Troubleshooting

**Build fails on manifest validation**
- Check `catalog/json-plugins/plugin-manifest.json` syntax
- Verify all plugin paths exist
- Run `npm run artifacts:build:integrity` for detailed errors

**Sequences not updating**
- Clear `.ographx/artifacts/` directory
- Run `npm run pre:manifests` again
- Check handler exports in source files

**Diagrams not generating**
- Verify Mermaid syntax in sequences
- Check `.ographx/artifacts/renderx-web/sequences/` exists
- Run diagram generator manually

