# OgraphX Generators Layer

## Purpose

The Generators Layer contains tools for **Layer 3: Sequences** and **Layer 4: Visualization** of the OgraphX Self-Aware System (SAS).

This layer transforms the Intermediate Representation (IR) into sequences and visualizations that communicate OgraphX's structure and behavior.

## Questions

- **Layer 3**: "What does my structure mean?"
- **Layer 4**: "How do I explain myself?"

## Contents

### generate_self_sequences.py
**Purpose**: Convert IR to Musical Conductor sequences  
**Input**: self_graph.json (IR)  
**Output**: self_sequences.json (sequences with movements and beats)

**Key Features**:
- Builds call graph from IR
- Performs DFS traversal (max depth 3)
- Generates enriched call chains
- Creates sequences with movements and beats
- Outputs Musical Conductor format

**Usage**:
```bash
python generators/generate_self_sequences.py
```

### generate_orchestration_diagram.py
**Purpose**: Generate Mermaid diagrams from IR and sequences  
**Input**: self_graph.json, self_sequences.json  
**Output**: Mermaid markdown diagrams

**Diagrams Generated**:
1. **Summary Diagram** - High-level overview (31 symbols, 283 calls)
2. **Orchestration Diagram** - Hierarchical tree (sequences → movements → beats)
3. **Call Graph Diagram** - Network visualization (symbols and calls)

**Usage**:
```bash
python generators/generate_orchestration_diagram.py
```

### generate_sequence_flow.py
**Purpose**: Generate detailed sequence flow diagrams  
**Input**: self_sequences.json  
**Output**: Mermaid markdown diagrams

**Diagrams Generated**:
1. **Sequence Flow Diagram** - Beat-by-beat flows for key sequences
2. **Beat Timeline** - Linear timeline of all beats

**Usage**:
```bash
python generators/generate_sequence_flow.py
```

### convert_to_svg.py
**Purpose**: Convert Mermaid diagrams to SVG format  
**Input**: Mermaid markdown files  
**Output**: SVG files

**Conversion Methods**:
1. **Auto** (Recommended) - Tries CLI first, falls back to API
2. **CLI** - Requires `npm install -g @mermaid-js/mermaid-cli`
3. **API** - Uses Mermaid Live Editor API (no dependencies)

**Usage**:
```bash
# Convert all diagrams
python generators/convert_to_svg.py --all --method api

# Convert specific diagram
python generators/convert_to_svg.py --input summary_diagram.md --method api
```

## Data Flow

```
IR (self_graph.json)
    ↓
generate_self_sequences.py
    ↓
Sequences (self_sequences.json)
    ↓
generate_orchestration_diagram.py
    ↓
Mermaid Diagrams (*.md)
    ↓
convert_to_svg.py
    ↓
SVG Files (*.svg)
```

## Output Locations

All generated files are placed in `.ographx/`:

```
.ographx/
├── sequences/
│   └── self_sequences.json
├── visualization/diagrams/
│   ├── summary_diagram.md
│   ├── orchestration_diagram.md
│   ├── call_graph_diagram.md
│   ├── sequence_flow_diagram.md
│   ├── beat_timeline.md
│   ├── *.svg (all SVG exports)
```

## Regeneration Pipeline

To regenerate all artifacts:

```bash
cd packages/ographx

# 1. Generate sequences from IR
python generators/generate_self_sequences.py

# 2. Generate Mermaid diagrams
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py

# 3. Convert to SVG
python generators/convert_to_svg.py --all --method api
```

## Integration

The Generators Layer:
- **Consumes**: IR from Core Layer (Layer 1)
- **Produces**: Sequences and visualizations
- **Feeds into**: Analysis Layer (Layer 5)

## Architecture

### Sequence Format
```json
{
  "name": "sequenceName",
  "movements": [
    {
      "name": "calls",
      "beats": [
        {
          "symbol": "functionName",
          "line": 10,
          "depth": 1
        }
      ]
    }
  ]
}
```

### Diagram Types
- **Summary**: High-level overview
- **Orchestration**: Hierarchical structure
- **Call Graph**: Network visualization
- **Sequence Flow**: Detailed beat flows
- **Beat Timeline**: Linear execution

## Future Enhancements

- [ ] Interactive HTML diagrams
- [ ] Real-time diagram updates
- [ ] Custom diagram templates
- [ ] Performance metrics visualization
- [ ] Dependency analysis diagrams

## Related Files

- `../core/ographx_ts.py` - Generates IR
- `../analysis/analyze_self_graph.py` - Analyzes sequences
- `../.ographx/sequences/self_sequences.json` - Generated sequences
- `../.ographx/visualization/diagrams/` - Generated diagrams

## Meditation

> "The sequence reveals the dance; the diagram shows the choreography."

The Generators Layer transforms raw structure into meaningful communication.

---

**Status**: ✅ Complete  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

