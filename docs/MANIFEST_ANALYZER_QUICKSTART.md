# Quick Start Guide - Manifest Flow Analyzer

## TL;DR

```bash
# Generate full analysis of pre:manifests build chain
python manifest_flow_analyzer.py

# View the report
cat manifest_flow_report.txt

# Generate quick summary only
python manifest_flow_analyzer.py --format summary
```

## What You Get

### 1. Tree View
Shows each script with its sources, processing steps, and outputs:

```
1. sync-json-sources.js
   Copies JSON catalogs from catalog/ to repo root

   📥 SOURCES:
      ├─ catalog/json-sequences/**/*.json
      ├─ catalog/json-components/**/*.json

   📤 OUTPUTS:
      ├─ json-sequences/**/*.json (repo root)
      └─ json-components/**/*.json (repo root)
```

### 2. Flow Diagrams
ASCII box diagrams showing the complete data flow:

```
┌────────────────────────────────────────────┐
│ [1] sync-json-sources.js                   │
├────────────────────────────────────────────┤
│ Copies JSON catalogs from catalog/         │
├────────────────────────────────────────────┤
│ SOURCES:                                   │
│   • catalog/json-sequences/**/*.json       │
│   • catalog/json-components/**/*.json      │
│                                            │
│ OUTPUTS:                                   │
│   → json-sequences/**/*.json (repo root)   │
│   → json-components/**/*.json (repo root)  │
└────────────────────────────────────────────┘
    │
    ▼
```

### 3. Generated Files Summary
All 16 generated files grouped by directory:

```
📁 catalog/
   ├─ catalog/json-interactions/.generated/app.json
   ├─ catalog/json-interactions/.generated/canvas.json
   ├─ catalog/json-interactions/.generated/control.json
   ├─ catalog/json-interactions/.generated/library.json
   └─ catalog/json-plugins/.generated/plugin-manifest.json

📁 public/
   ├─ public/interaction-manifest.json
   ├─ public/topics-manifest.json
   ├─ public/layout-manifest.json
   └─ public/plugins/plugin-manifest.json
```

### 4. Dependency Graph
Shows which scripts depend on outputs from others:

```
📜 generate-json-interactions-from-plugins.js
   ↳ depends on:
      • sync-json-sequences.js
      • aggregate-plugins.js

📜 generate-interaction-manifest.js
   ↳ depends on:
      • generate-json-interactions-from-plugins.js
      • aggregate-plugins.js
```

## The Build Chain Explained

### Phase 1: Sync Source Catalogs
1. **sync-json-sources.js** - Copy catalog/ to repo root
2. **sync-json-components.js** - Sync components from npm packages
3. **sync-json-sequences.js** - Sync sequences from npm packages

### Phase 2: Generate Derived Catalogs
4. **generate-json-interactions-from-plugins.js** - Auto-generate interactions
5. **generate-interaction-manifest.js** - Build unified interaction manifest
6. **generate-topics-manifest.js** - Generate topics from lifecycle sequences
7. **generate-layout-manifest.js** - Copy layout configuration

### Phase 3: Aggregate & Distribute
8. **aggregate-plugins.js** - Discover and aggregate plugin manifests
9. **sync-plugins.js** - Copy plugin manifest to public/
10. **sync-control-panel-config.js** - Sync control panel config

## Key Concepts

### Three-Tier Architecture

```
catalog/               public/                 repo root/
(Staging)              (Browser-Served)        (Tool/Test Access)
    │                       │                        │
    ├─ json-sequences       ├─ json-sequences        ├─ json-sequences
    ├─ json-components      ├─ json-components       ├─ json-components
    ├─ json-interactions    ├─ interaction-manifest  ├─ interaction-manifest
    ├─ json-plugins         ├─ plugins/              ├─ topics-manifest
    └─ json-layout          ├─ topics-manifest       └─ layout-manifest
                            └─ layout-manifest
```

### Plugin Discovery

The build system auto-discovers plugins from npm packages:

```javascript
// In package.json of a plugin package
{
  "keywords": ["renderx-plugin"],
  "renderx": {
    "manifest": "./dist/plugin-manifest.json",  // Path to manifest
    "sequences": ["./dist/sequences"],          // Sequence catalogs
    "components": ["./dist/components"],        // Component catalogs
    "plugins": [{ /* inline plugin def */ }]    // Inline plugins
  }
}
```

### Auto-Generation Strategy

**Interactions**: Derived from plugin sequences
- Read all sequences from `public/json-sequences`
- Extract route definitions
- Group by first segment (app, canvas, control, library)
- Generate per-plugin interaction catalogs

**Topics**: Derived from lifecycle sequences
- Find sequences with lifecycle: true
- Extract topic definitions
- Auto-generate topics manifest (no hand-authoring needed)

**Plugins**: Aggregated from npm packages
- Scan node_modules for renderx-plugin packages
- Load manifests via renderx.manifest path
- Merge with existing catalog/json-plugins/plugin-manifest.json

## Use Cases

### 1. Understanding the Build
**Problem**: "What files does `npm run pre:manifests` generate?"

**Solution**:
```bash
python manifest_flow_analyzer.py --format summary
# See all 16 generated files grouped by directory
```

### 2. Debugging Build Issues
**Problem**: "Why isn't my plugin's interaction catalog showing up?"

**Solution**:
```bash
python manifest_flow_analyzer.py
# Check the flow diagram for generate-json-interactions-from-plugins.js
# Verify it reads from public/json-sequences (requires sync-json-sequences first)
```

### 3. Documenting Architecture
**Problem**: "Need to onboard new developers on the manifest system"

**Solution**:
```bash
python manifest_flow_analyzer.py
# Share manifest_flow_report.txt
# Shows complete data flow with sources, processing, and outputs
```

### 4. Verifying Dependencies
**Problem**: "Which scripts must run before generate-interaction-manifest.js?"

**Solution**:
```bash
python manifest_flow_analyzer.py --format deps
# See dependency graph showing all prerequisites
```

## Advanced Usage

### Custom Output File
```bash
python manifest_flow_analyzer.py --output my_analysis.txt
```

### Specific Visualizations
```bash
# Just the tree view
python manifest_flow_analyzer.py --format tree

# Just the flow diagrams
python manifest_flow_analyzer.py --format flow

# Just the dependency graph
python manifest_flow_analyzer.py --format deps
```

### Different Root Directory
```bash
python manifest_flow_analyzer.py --root /path/to/project
```

## Troubleshooting

### Script Not Found
**Error**: "Found 0 scripts in pre:manifests chain"

**Fix**: Run from the repo root directory where `package.json` exists

### Missing package.json
**Error**: File reading errors

**Fix**: Ensure you're in the correct directory:
```bash
cd /path/to/renderx-plugins-demo
python manifest_flow_analyzer.py
```

### Python Version
**Requirement**: Python 3.7+

**Check**:
```bash
python --version
# Should show Python 3.7 or higher
```

## Output Files

| File | Size | Lines | Description |
|------|------|-------|-------------|
| `manifest_flow_report.txt` | 28 KB | 372 | Complete analysis with all visualizations |
| `manifest_flow_summary.txt` | 2 KB | 31 | Quick reference of generated files |

## Related Tools

- **folder_tree_scanner.py** - Directory structure visualization
- **log_message_scanner.py** - Log statement analysis  
- **event_sequence_scanner.py** - Event flow tracking

See `PYTHON_ANALYSIS_TOOLS_SUITE.md` for complete documentation.

## Support

For issues or questions:
1. Check `MANIFEST_FLOW_ANALYZER_README.md` for detailed documentation
2. Review the generated `manifest_flow_report.txt`
3. Examine the actual build scripts in `scripts/` directory

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
**Python Version**: 3.7+
