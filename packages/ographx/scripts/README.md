# OgraphX Scripts

## Purpose

This directory contains utility scripts for managing the OgraphX Self-Aware System (SAS).

These scripts automate common tasks like regenerating artifacts, watching for changes, and running the complete pipeline.

## Contents

### regenerate_all.sh
**Purpose**: Regenerate all SAS artifacts from source  
**Status**: 📋 Planned

**Functionality**:
- Regenerate IR from source code
- Regenerate sequences from IR
- Regenerate diagrams from sequences
- Convert diagrams to SVG
- Extract telemetry

**Usage**:
```bash
./scripts/regenerate_all.sh
```

**Steps**:
1. Run `core/ographx_ts.py` to generate IR
2. Run `generators/generate_self_sequences.py` to generate sequences
3. Run `generators/generate_orchestration_diagram.py` to generate diagrams
4. Run `generators/generate_sequence_flow.py` to generate flow diagrams
5. Run `generators/convert_to_svg.py` to convert to SVG
6. Run `analysis/analyze_self_graph.py` to extract telemetry

### watch_and_regenerate.sh
**Purpose**: Watch for changes and regenerate artifacts  
**Status**: 📋 Planned

**Functionality**:
- Watch source code for changes
- Automatically regenerate artifacts
- Display regeneration status
- Log changes

**Usage**:
```bash
./scripts/watch_and_regenerate.sh
```

**Features**:
- Watches `core/`, `generators/`, `analysis/` directories
- Triggers regeneration on file changes
- Displays timestamps and status
- Logs to `regeneration.log`

## Regeneration Pipeline

The complete pipeline:

```
Source Code
    ↓
core/ographx_ts.py
    ↓
.ographx/self-observation/self_graph.json
    ↓
generators/generate_self_sequences.py
    ↓
.ographx/sequences/self_sequences.json
    ↓
generators/generate_orchestration_diagram.py
    ↓
.ographx/visualization/diagrams/*.md
    ↓
generators/convert_to_svg.py
    ↓
.ographx/visualization/diagrams/*.svg
    ↓
analysis/analyze_self_graph.py
    ↓
Telemetry & Insights
```

## Usage Examples

### Regenerate All Artifacts
```bash
cd packages/ographx
./scripts/regenerate_all.sh
```

### Watch and Regenerate
```bash
cd packages/ographx
./scripts/watch_and_regenerate.sh
```

### Manual Regeneration

If scripts are not available, regenerate manually:

```bash
cd packages/ographx

# 1. Generate IR
python core/ographx_ts.py . > .ographx/self-observation/self_graph.json

# 2. Generate sequences
python generators/generate_self_sequences.py

# 3. Generate diagrams
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py

# 4. Convert to SVG
python generators/convert_to_svg.py --all --method api

# 5. Extract telemetry
python analysis/analyze_self_graph.py
```

## Integration

These scripts integrate all layers:

```
Core Layer (extraction)
    ↓
Generators Layer (sequences & visualization)
    ↓
Analysis Layer (telemetry)
    ↓
Inter-Awareness Layer (ecosystem analysis)
```

## Future Enhancements

- [ ] Parallel regeneration
- [ ] Incremental updates
- [ ] Performance profiling
- [ ] Change detection
- [ ] Caching
- [ ] Distributed regeneration

## Related Files

- `../core/` - Core extraction tools
- `../generators/` - Sequence and visualization generators
- `../analysis/` - Analysis and telemetry tools
- `../inter-awareness/` - Inter-system analyzers

## Meditation

> "The script orchestrates the dance; the pipeline reveals the flow."

Scripts automate the journey from observation to insight.

---

**Status**: 📋 Planned  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

