# OgraphX Core Layer

## Purpose

The Core Layer is **Layer 1: Observation** of the OgraphX Self-Aware System (SAS).

This layer contains the fundamental extraction tools that scan source code and generate the Intermediate Representation (IR) - OgraphX's self-description.

## Question

> "What is my structure?"

## Contents

### ographx_ts.py
**Purpose**: TypeScript/JavaScript code extractor  
**Input**: TypeScript/JavaScript source files  
**Output**: IR with symbols, calls, and contracts  
**Method**: Regex-based heuristic extraction (not AST-based)

**Key Features**:
- Extracts function declarations
- Extracts class definitions
- Extracts method calls
- Extracts parameter signatures
- Handles export statements

### ographx_py.py
**Purpose**: Python code extractor  
**Input**: Python source files  
**Output**: IR with symbols, calls, and contracts  
**Method**: Regex-based heuristic extraction

**Key Features**:
- Extracts function definitions
- Extracts class definitions
- Extracts method calls
- Extracts parameter signatures
- Handles import statements

## Data Flow

```
Source Code
    ↓
ographx_ts.py / ographx_py.py
    ↓
Intermediate Representation (IR)
    ↓
self_graph.json
```

## Usage

### Extract TypeScript/JavaScript
```bash
python ographx_ts.py <source_file_or_directory>
```

### Extract Python
```bash
python ographx_py.py <source_file_or_directory>
```

### Generate OgraphX Self-Description
```bash
# From packages/ographx/
python core/ographx_ts.py . > .ographx/self-observation/self_graph.json
```

## Output Format

The IR is a JSON file with the following structure:

```json
{
  "symbols": [
    {
      "name": "functionName",
      "kind": "function",
      "export": true,
      "line": 10,
      "endLine": 20
    }
  ],
  "calls": [
    {
      "from": "functionA",
      "to": "functionB",
      "line": 15
    }
  ],
  "contracts": [
    {
      "symbol": "functionName",
      "parameters": [
        {
          "name": "param1",
          "type": "string"
        }
      ]
    }
  ]
}
```

## Architecture

### Extraction Strategy
- **Heuristic-based**: Uses regex patterns, not AST parsing
- **Minimal dependencies**: No external parsing libraries
- **Fast**: Suitable for large codebases
- **Approximate**: May miss some edge cases

### Symbol Types
- `function` - Function declarations
- `class` - Class definitions
- `method` - Class methods
- `interface` - TypeScript interfaces
- `type` - TypeScript type definitions

### Call Types
- Direct function calls
- Method invocations
- Constructor calls
- Import/require statements

## Integration

The Core Layer feeds into:
- **Layer 2**: Self-Observation (generates self_graph.json)
- **Layer 3**: Sequences (compiles sequences from IR)
- **Layer 5**: Analysis (analyzes IR for insights)

## Future Enhancements

- [ ] AST-based extraction for higher accuracy
- [ ] Support for additional languages (Go, Rust, Java)
- [ ] Incremental extraction for large codebases
- [ ] Caching for performance optimization
- [ ] Type inference from annotations

## Related Files

- `../generators/generate_self_sequences.py` - Converts IR to sequences
- `../analysis/analyze_self_graph.py` - Analyzes IR
- `../.ographx/self-observation/self_graph.json` - Generated IR

## Meditation

> "The observer observes the observer observing the observer."

The Core Layer is where OgraphX begins to see itself - the first step in self-awareness.

---

**Status**: ✅ Complete  
**Version**: SAS Architecture v1.1  
**Date**: 2025-11-12

