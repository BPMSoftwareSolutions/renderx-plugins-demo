# OgraphX Self-Orchestration Visualization

This directory contains the complete self-observation system for OgraphX, including IR generation, sequence compilation, and powerful Mermaid visualizations.

## Quick Start

### Generate Everything

```bash
# Generate IR and sequences
python generate_orchestration_diagram.py
python generate_sequence_flow.py
```

### View Diagrams

Open any `.md` file in a Markdown viewer that supports Mermaid:
- GitHub (renders automatically)
- VS Code with Markdown Preview
- Mermaid Live Editor (https://mermaid.live)

## Files

### Core Data

- `self_graph.json` - OgraphX IR (31 symbols, 283 calls, 19 contracts)
- `self_sequences.json` - Conductor sequences (31 sequences, 4000 beats)

### Generators

- `generate_orchestration_diagram.py` - Generate summary, orchestration, and call graph diagrams
- `generate_sequence_flow.py` - Generate detailed sequence flows and beat timelines

### Visualizations

- `summary_diagram.md` - High-level overview
- `orchestration_diagram.md` - Hierarchical structure
- `call_graph_diagram.md` - Network of symbols and calls
- `sequence_flow_diagram.md` - Detailed sequence flows
- `beat_timeline.md` - Linear beat timeline

### Documentation

- `ORCHESTRATION_DIAGRAMS.md` - Diagram reference with examples
- `VISUALIZATION_GUIDE.md` - Complete visualization guide
- `README.md` - This file

### Analysis

- `analyze_self_graph.py` - Analyze IR statistics
- `show_self_graph.py` - Display IR structure
- `show_sequences.py` - Display sequence structure
- `show_rich_sequence.py` - Find and display sequences with beats

## The Visualization Stack

```
OgraphX Source Code
    ↓
ographx_py.py (Python extractor)
    ↓
self_graph.json (IR: symbols, calls, contracts)
    ↓
generate_self_sequences.py
    ↓
self_sequences.json (Sequences: movements, beats)
    ↓
generate_orchestration_diagram.py
    ↓
Mermaid Diagrams (visual orchestration)
```

## Key Insights

### Scale

- **31 Symbols**: Functions, classes, methods
- **283 Calls**: Function invocations
- **19 Contracts**: Parameter signatures
- **31 Sequences**: One per exported symbol
- **4000 Beats**: Total function calls across all sequences

### Most Called Functions

1. `append` - 36 calls (building lists)
2. `strip` - 25 calls (string cleaning)
3. `group` - 24 calls (regex grouping)
4. `match` - 12 calls (pattern matching)
5. `basename` - 10 calls (file path extraction)

### Orchestration

OgraphX is fundamentally a **string processor** using **regex matching** to build **lists of symbols**.

The orchestration follows four movements:
1. **SCAN** - Walk files and gather sources
2. **PARSE** - Extract symbols and calls
3. **BUILD** - Construct IR
4. **EMIT** - Write output

## The Meditation

OgraphX observes itself through three layers:

1. **Observation** - IR reveals structure
2. **Awareness** - Sequences organize behavior
3. **Insight** - Diagrams visualize relationships

Each run deepens understanding of its own architecture—no ego, just observation.

## Usage Examples

### View Summary

```bash
cat summary_diagram.md
```

### View Orchestration

```bash
cat orchestration_diagram.md
```

### View Call Graph

```bash
cat call_graph_diagram.md
```

### View Sequence Flows

```bash
cat sequence_flow_diagram.md
```

### View Beat Timeline

```bash
cat beat_timeline.md
```

### Analyze IR

```bash
python analyze_self_graph.py
```

### Show Sequences

```bash
python show_sequences.py
```

## Integration

### GitHub

Mermaid diagrams render automatically in GitHub markdown files.

### Documentation

Include diagrams in project documentation:
```markdown
## Architecture

![OgraphX Orchestration](packages/ographx/.ographx/summary_diagram.md)
```

### Presentations

Export diagrams to PNG/SVG for presentations:
```bash
mmdc -i summary_diagram.md -o summary_diagram.png
```

## Advanced

### Customize Diagrams

Edit `generate_orchestration_diagram.py` to:
- Change colors and styling
- Limit depth or breadth
- Focus on specific sequences
- Add custom annotations

### Extend Analysis

Create new analysis scripts:
```python
import json
data = json.load(open('self_graph.json'))
# Your analysis here
```

## References

- [Mermaid Documentation](https://mermaid.js.org/)
- [OgraphX README](../README.md)
- [ORCHESTRATION_DIAGRAMS.md](./ORCHESTRATION_DIAGRAMS.md)
- [VISUALIZATION_GUIDE.md](./VISUALIZATION_GUIDE.md)

---

**Status**: ✅ Complete and Ready  
**Version**: OgraphX MVP+ with Self-Orchestration Visualization  
**Meditation**: The observer observes the observer observing.

