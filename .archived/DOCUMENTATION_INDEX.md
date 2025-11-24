# RenderX Documentation Index

## 🎯 Quick Start

**New to RenderX?** Start here:
1. Read **COMPLETE_SYSTEM_OVERVIEW.md** (5 min) - Get the big picture
2. Read **RENDERX_CATALOG_ASCII_SKETCH.txt** (5 min) - Visualize the architecture
3. Read **BUILD_PROCESS_SUMMARY.md** (10 min) - Understand the build pipeline
4. Read **RENDERX_CATALOG_INTEGRATION.md** (10 min) - Learn runtime integration

**Total time**: ~30 minutes to understand the entire system

---

## 📚 Documentation Files

### 1. **COMPLETE_SYSTEM_OVERVIEW.md** ⭐ START HERE
**What**: High-level system architecture and file organization
**Who**: Everyone
**Time**: 5 minutes
**Contains**:
- Project structure and directory layout
- Core technologies (React, Avalonia, TypeScript, C#)
- Key concepts (Musical Conductor, Symphonies, Plugins, Catalog)
- Runtime flow diagram
- Key files reference
- Build commands
- Architecture principles

### 2. **RENDERX_CATALOG_ASCII_SKETCH.txt**
**What**: Visual ASCII diagrams of the catalog architecture
**Who**: Visual learners, architects
**Time**: 5 minutes
**Contains**:
- Layer 1: Source of truth (catalog/)
- Layer 2: Build pipeline
- Layer 3: Runtime artifacts
- Layer 4: Runtime execution
- Data flow from source to runtime
- Manifest-driven architecture principle
- Plugin integration example

### 3. **BUILD_PROCESS_SUMMARY.md**
**What**: Detailed 12-step build pipeline
**Who**: Build engineers, DevOps, developers
**Time**: 10 minutes
**Contains**:
- 12-step build pipeline breakdown
- Phase 1: Preparation
- Phase 2: Code generation (OgraphX IR, sequences)
- Phase 3: Manifest generation
- Phase 4: Artifact generation
- Phase 5: Runtime preparation
- Key files generated
- npm scripts
- Data flow diagram
- Performance metrics
- Troubleshooting guide

### 4. **RENDERX_CATALOG_INTEGRATION.md**
**What**: Runtime integration and execution flow
**Who**: Runtime engineers, plugin developers
**Time**: 10 minutes
**Contains**:
- 3-phase runtime integration
- Phase 1: Startup & initialization
- Phase 2: User interaction
- Phase 3: Sequence execution
- Catalog directory structure
- Runtime data flow
- Key principles (manifest-driven, JSON-centric, etc.)
- Integration points (Web, Desktop)
- Build pipeline integration
- Validation & guardrails
- Performance characteristics
- Extensibility guide

### 5. **OGRAPHX_CATALOG_FIRST_ANALYSIS.md** ⭐ ARCHITECTURE IMPROVEMENT
**What**: Catalog-first analysis approach for OgraphX
**Who**: Build engineers, architects, OgraphX developers
**Time**: 10 minutes
**Contains**:
- Current problem: Source code analyzed first (wrong)
- Correct approach: Catalog analyzed first (right)
- Why catalog-first is better
- Required changes to build pipeline
- New scripts needed
- Artifacts generated at each phase
- Benefits and success criteria
- Implementation priority

---

## 🏗️ Architecture Documentation

### In `/docs/adr/`
- **ADR-001**: Manifest-driven architecture
- **ADR-002**: Plugin system design
- **ADR-003**: Musical Conductor orchestration
- **ADR-004**: Catalog as single source of truth
- **ADR-005**: Build pipeline automation

### In `/docs/issues/`
- Issue #115: Library component externalization
- Issue #122: Canvas component decoupling
- Issue #397: React rendering performance
- Issue #410: React JSX support
- Issue #411: Predictive sequence instrumentation

### In `/docs/prototypes/`
- Telemetry and dead-time analysis
- OgraphX integration prototypes
- Plugin architecture experiments

---

## 🔧 Developer Guides

### Getting Started
1. Clone repository
2. Run `npm install`
3. Run `npm run build`
4. Run `npm run dev`
5. Open http://localhost:5173

### Building a Plugin
1. Create package in `packages/my-plugin/`
2. Define sequences in `catalog/json-sequences/my-plugin/`
3. Define topics in `catalog/json-topics/my-plugin.json`
4. Add to `catalog/json-plugins/plugin-manifest.json`
5. Map interactions in `catalog/json-interactions/interaction-manifest.json`
6. Run `npm run pre:manifests`
7. Plugin automatically loaded at runtime

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Running Build Pipeline
```bash
npm run pre:manifests    # Run 12-step pipeline
npm run artifacts:build  # Generate artifacts
npm run dev:artifacts    # Dev with artifacts
```

### Using Conductor CLI
```bash
npm run conductor:play                    # Play a symphony
npm run conductor:play:list               # List available symphonies
npm run conductor:play:sequence <name>    # Play specific sequence
```

---

## 📊 Key Concepts Reference

### Musical Conductor
- **EventBus**: Pub/sub event routing
- **SequenceOrchestrator**: Plays symphonies
- **SequenceExecutor**: Executes beats
- **StatisticsManager**: Tracks metrics

### Symphonies & Beats
- **Symphony**: Orchestrated sequence of movements
- **Movement**: Logical grouping of beats
- **Beat**: Individual execution step

### Plugins
- **Handler**: Business logic (TypeScript/C#)
- **UI Component**: User interface (React/Avalonia)
- **Sequence**: Orchestration definition (JSON)
- **Topic**: Event definition (JSON)

### Catalog
- **json-sequences/**: Symphony definitions
- **json-topics/**: Topic definitions
- **plugin-manifest.json**: Plugin registry
- **interaction-manifest.json**: Event mappings

---

## 🚀 Common Tasks

### Add a new plugin
→ See **RENDERX_CATALOG_INTEGRATION.md** "Extensibility" section

### Debug a sequence
→ Use `npm run conductor:play` to trace execution

### Add instrumentation
→ See **BUILD_PROCESS_SUMMARY.md** "Phase 4: Artifact Generation"

### Fix a build error
→ See **BUILD_PROCESS_SUMMARY.md** "Troubleshooting" section

### Understand event routing
→ See **RENDERX_CATALOG_INTEGRATION.md** "Phase 2: User Interaction"

### Add a new topic
→ Create file in `catalog/json-topics/` and run `npm run pre:manifests`

---

## 📖 Reading Paths

### For Architects
1. COMPLETE_SYSTEM_OVERVIEW.md
2. RENDERX_CATALOG_ASCII_SKETCH.txt
3. /docs/adr/ (all ADRs)
4. RENDERX_CATALOG_INTEGRATION.md

### For Developers
1. COMPLETE_SYSTEM_OVERVIEW.md
2. BUILD_PROCESS_SUMMARY.md
3. RENDERX_CATALOG_INTEGRATION.md
4. /docs/issues/ (relevant issues)

### For DevOps/Build Engineers
1. BUILD_PROCESS_SUMMARY.md
2. OGRAPHX_CATALOG_FIRST_ANALYSIS.md (architecture improvement)
3. .github/workflows/ci.yml
4. package.json (build scripts)
5. /docs/adr/ADR-001 (manifest-driven)

### For Plugin Developers
1. COMPLETE_SYSTEM_OVERVIEW.md
2. RENDERX_CATALOG_INTEGRATION.md (Extensibility)
3. /docs/issues/ (plugin-related issues)
4. packages/*/README.md (plugin-specific docs)

---

## 🔗 Related Files

- `catalog/json-plugins/plugin-manifest.json` - Master plugin registry
- `catalog/json-interactions/interaction-manifest.json` - Event mappings
- `package.json` - Build scripts and workspace config
- `.github/workflows/ci.yml` - CI/CD pipeline
- `packages/musical-conductor/` - Orchestration engine
- `packages/ographx/` - Build pipeline

---

## 📝 Notes

- All documentation is markdown-based for easy version control
- ASCII diagrams are used for architecture visualization
- Code examples are provided where relevant
- Performance metrics are included for reference
- Troubleshooting guides are provided for common issues

---

## 🎓 Learning Resources

- **Musical Conductor**: See `packages/musical-conductor/README.md`
- **OgraphX**: See `packages/ographx/README.md`
- **Plugin Development**: See `packages/*/README.md`
- **Architecture Decisions**: See `/docs/adr/`
- **Issue Tracking**: See `/docs/issues/`

---

**Last Updated**: 2025-11-21
**Version**: 1.0
**Status**: Complete

