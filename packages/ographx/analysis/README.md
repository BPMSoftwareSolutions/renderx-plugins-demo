# OgraphX Analysis Layer

## Purpose

The Analysis Layer is **Layer 5: Telemetry** of the OgraphX Self-Aware System (SAS).

This layer contains tools for extracting insights, metrics, and telemetry from the IR and sequences. It answers the question: "What do I learn about myself?"

## Question

> "What do I learn about myself?"

## Contents

### analyze_self_graph.py
**Purpose**: Display and analyze IR statistics  
**Input**: self_graph.json (IR)  
**Output**: Console output with statistics

**Metrics Extracted**:
- Total symbols (functions, classes, methods)
- Total calls (function invocations)
- Total contracts (parameter signatures)
- Symbol breakdown by type
- Call distribution
- Contract analysis

**Usage**:
```bash
python analysis/analyze_self_graph.py
```

**Example Output**:
```
OgraphX Self-Graph Analysis
===========================

Symbols: 31
├── Functions: 15
├── Classes: 8
├── Methods: 8

Calls: 283
├── Direct calls: 200
├── Method calls: 83

Contracts: 19
├── With parameters: 15
├── Without parameters: 4
```

### show_sequences.py
**Purpose**: Display sequence structure  
**Input**: self_sequences.json (sequences)  
**Output**: Console output with sequence details

**Information Displayed**:
- Total sequences
- Sequences per symbol
- Movements per sequence
- Beats per movement
- Sequence hierarchy

**Usage**:
```bash
python analysis/show_sequences.py
```

**Example Output**:
```
OgraphX Sequences
=================

Total Sequences: 31
Total Movements: 31
Total Beats: 4000

Sequence: functionA
├── Movement: calls
│   ├── Beat 1: functionB (line 10)
│   ├── Beat 2: functionC (line 15)
│   └── Beat 3: functionD (line 20)
```

### show_rich_sequence.py
**Purpose**: Find and display a sequence with actual beats  
**Input**: self_sequences.json (sequences)  
**Output**: Console output with rich sequence details

**Features**:
- Finds sequences with beats
- Displays beat details
- Shows call hierarchy
- Displays line numbers

**Usage**:
```bash
python analysis/show_rich_sequence.py
```

## Telemetry Metrics

### System Metrics
- **Symbols**: Total functions, classes, methods
- **Calls**: Total function invocations
- **Contracts**: Total parameter signatures
- **Sequences**: Total sequences (one per symbol)
- **Beats**: Total function calls in sequences

### Quality Metrics
- **Complexity**: Average calls per symbol
- **Depth**: Maximum call depth
- **Connectivity**: Call graph density
- **Coverage**: Percentage of symbols with calls

### Performance Metrics
- **Extraction time**: Time to generate IR
- **Sequence compilation time**: Time to generate sequences
- **Visualization time**: Time to generate diagrams
- **Total pipeline time**: End-to-end time

## Data Flow

```
IR (self_graph.json)
    ↓
analyze_self_graph.py
    ↓
System Metrics

Sequences (self_sequences.json)
    ↓
show_sequences.py / show_rich_sequence.py
    ↓
Sequence Metrics
```

## Integration

The Analysis Layer:
- **Consumes**: IR from Core Layer, Sequences from Generators Layer
- **Produces**: Metrics and insights
- **Feeds into**: Inter-Awareness Layer (Layer 6)

## Telemetry Pipeline

To extract all telemetry:

```bash
cd packages/ographx

# 1. Analyze IR
python analysis/analyze_self_graph.py

# 2. Display sequences
python analysis/show_sequences.py

# 3. Show rich sequence
python analysis/show_rich_sequence.py
```

## Future Enhancements

- [ ] JSON output for metrics
- [ ] Time-series metrics tracking
- [ ] Anomaly detection
- [ ] Performance profiling
- [ ] Dependency analysis
- [ ] Complexity scoring
- [ ] Health checks

## Related Files

- `../core/ographx_ts.py` - Generates IR
- `../generators/generate_self_sequences.py` - Generates sequences
- `../.ographx/self-observation/self_graph.json` - IR data
- `../.ographx/sequences/self_sequences.json` - Sequence data

## Meditation

> "The metrics reveal the truth; the analysis shows the meaning."

The Analysis Layer transforms data into wisdom.

---

**Status**: ✅ Complete  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

