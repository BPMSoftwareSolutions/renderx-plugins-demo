# Manifest Flow Analyzer

A Python script that analyzes the `pre:manifests` build chain and generates ASCII flow diagrams showing data sources and generated JSON files.

## What It Does

The script analyzes the 9-step build pipeline defined in `package.json` under `pre:manifests` and creates visual documentation of:

1. **Data Sources** - Where input data comes from (catalog files, npm packages, etc.)
2. **Processing Steps** - How data is transformed by each script
3. **Generated Outputs** - What JSON files are created and where
4. **Dependencies** - Which scripts depend on outputs from other scripts

## Generated Reports

### Full Report (`manifest_flow_report.txt`)
- **Size**: ~28 KB, 372 lines
- **Contains**: 
  - Tree view of all data flows
  - Detailed flow diagrams with boxes
  - Generated files summary grouped by directory
  - Script dependency graph

### Summary Report (`manifest_flow_summary.txt`)
- **Size**: ~2 KB, 31 lines
- **Contains**: Quick reference of all generated files grouped by directory

## Usage

```bash
# Generate full report with all visualizations
python manifest_flow_analyzer.py

# Generate only the summary
python manifest_flow_analyzer.py --format summary --output manifest_flow_summary.txt

# Generate specific format types
python manifest_flow_analyzer.py --format tree    # Tree view only
python manifest_flow_analyzer.py --format flow    # Flow diagrams only
python manifest_flow_analyzer.py --format deps    # Dependencies only
```

## Build Chain Analyzed

The script analyzes these 9 scripts in order:

1. **sync-json-sources.js** - Copies JSON catalogs to repo root
2. **sync-json-components.js** - Syncs component catalogs from npm packages
3. **sync-json-sequences.js** - Syncs sequence catalogs from packages
4. **generate-json-interactions-from-plugins.js** - Auto-generates interaction catalogs
5. **generate-interaction-manifest.js** - Builds unified interaction manifest
6. **generate-topics-manifest.js** - Generates topics from lifecycle sequences
7. **generate-layout-manifest.js** - Copies layout configuration
8. **aggregate-plugins.js** - Discovers and aggregates plugin manifests
9. **sync-plugins.js** - Syncs plugin manifest to public/
10. **sync-control-panel-config.js** - Syncs control panel config

## Key Generated Files (16 total)

### Catalog Directory
- `catalog/json-interactions/.generated/app.json`
- `catalog/json-interactions/.generated/canvas.json`
- `catalog/json-interactions/.generated/control.json`
- `catalog/json-interactions/.generated/library.json`
- `catalog/json-plugins/.generated/plugin-manifest.json`

### Public Directory (served to browser)
- `public/json-sequences/**/*.json`
- `public/interaction-manifest.json`
- `public/topics-manifest.json`
- `public/layout-manifest.json`
- `public/plugins/plugin-manifest.json`
- `public/control-panel-config/*.json`

### Repo Root (for tools/tests)
- `interaction-manifest.json`
- `topics-manifest.json`
- `layout-manifest.json`
- `json-sequences/**/*.json`
- `json-components/**/*.json`

## Data Flow Highlights

### Plugin Discovery
- Scans `node_modules` for packages with `renderx-plugin` keyword
- Reads `renderx.manifest`, `renderx.sequences`, `renderx.components` fields
- Aggregates into consolidated manifests

### Interaction Generation
- Reads plugin sequences from `public/json-sequences`
- Groups routes by first segment (app, canvas, control, library)
- Generates per-plugin interaction catalogs

### Topic Generation
- Extracts lifecycle topics from plugin sequences
- Auto-generates topic manifest (no manual authoring needed)

### Manifest Consolidation
- Merges multiple sources (generated + hand-authored)
- Applies component-level route overrides
- Outputs to both repo root (for tools) and public/ (for browser)

## Dependencies Between Scripts

The analyzer also shows which scripts depend on outputs from others:

- `generate-json-interactions-from-plugins.js` depends on:
  - `sync-json-sequences.js` (needs sequences synced first)
  - `aggregate-plugins.js` (needs plugin manifest)

- `generate-interaction-manifest.js` depends on:
  - `generate-json-interactions-from-plugins.js` (needs generated catalogs)
  - `aggregate-plugins.js` (needs plugin info)

- `sync-plugins.js` depends on:
  - `aggregate-plugins.js` (needs generated manifest)

## Implementation Details

The script uses:
- **JSON parsing** to read `package.json` and extract the script chain
- **Regex matching** to identify script names from command strings
- **Dataclasses** to model data flows with sources, processing, and outputs
- **ASCII box drawing** characters for professional visualizations
- **Path pattern matching** to detect dependencies between scripts

## Related Scripts

This analyzer complements the other scanning tools:
- `folder_tree_scanner.py` - Directory structure visualization
- `log_message_scanner.py` - Log statement analysis
- `event_sequence_scanner.py` - Event flow analysis

Together, these tools provide comprehensive documentation of the codebase architecture and build pipeline.
