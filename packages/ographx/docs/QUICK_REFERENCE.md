# OgraphX Quick Reference Guide

## TL;DR - Graph a Codebase in 3 Steps

```bash
cd packages/ographx
python generators/regenerate_all.py
ls -la .ographx/
```

Done! Your codebase is now graphed with JSON, Mermaid diagrams, and SVG visualizations.

---

## The Six Meditation Layers (Quick Overview)

| Layer | Name | Purpose | Input | Output |
|-------|------|---------|-------|--------|
| 1 | **Extraction** | Extract code structure | Source files | `self_graph.json` |
| 2 | **Validation** | Validate IR integrity | `self_graph.json` | Validated IR |
| 3 | **Sequences** | Generate orchestration | `self_graph.json` | `self_sequences.json` |
| 4 | **Visualization** | Create diagrams & SVG | IR + Sequences | `.mmd` + `.svg` files |
| 5 | **Analysis** | Extract metrics | IR + Sequences | `analysis.json` |
| 6 | **Inter-Awareness** | Cross-system analysis | Multiple graphs | Insights |

---

## Key Tools

### Layer 1: Extraction
```bash
# TypeScript/JavaScript
python core/ographx_ts.py --root ./src --out .ographx/self_graph.json

# Python
python core/ographx_py.py --root ./src --out .ographx/self_graph.json
```

### Layer 3: Sequences
```bash
python generators/generate_self_sequences.py
```

### Layer 4: Visualization
```bash
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py
python generators/convert_to_svg.py
```

### Layer 5: Analysis
```bash
python analysis/analyze_self_graph.py
```

### All Layers (Master Script)
```bash
python generators/regenerate_all.py
```

---

## Output Files

```
.ographx/
├── self-observation/
│   └── self_graph_validated.json          # Validated IR
├── sequences/
│   └── self_sequences.json                # Conductor sequences
├── visualization/
│   ├── orchestration_diagram.mmd          # Call graph (Mermaid)
│   ├── orchestration_diagram.svg          # Call graph (SVG)
│   ├── sequence_flow_diagram.mmd          # Sequence flows (Mermaid)
│   └── sequence_flow_diagram.svg          # Sequence flows (SVG)
└── analysis/
    └── self_graph_analysis.json           # Metrics & telemetry
```

---

## IR Structure (self_graph.json)

```json
{
  "files": ["src/index.ts", "src/utils.ts"],
  "symbols": [
    {
      "id": "src/index.ts:initApp",
      "file": "src/index.ts",
      "kind": "function",
      "name": "initApp",
      "exported": true,
      "params_contract": "config: Config",
      "range": [10, 25]
    }
  ],
  "calls": [
    {
      "frm": "src/index.ts:initApp",
      "to": "src/utils.ts:setupLogger",
      "name": "setupLogger",
      "line": 15
    }
  ],
  "contracts": [
    {
      "id": "src/index.ts:initApp",
      "kind": "params",
      "props": [{"name": "config", "raw": "Config"}]
    }
  ]
}
```

---

## Sequences Structure (self_sequences.json)

```json
{
  "sequences": [
    {
      "id": "initApp",
      "movements": [
        {
          "movement": 1,
          "name": "initApp",
          "beats": [
            {
              "beat": 1,
              "event": "call:setupLogger",
              "handler": "setupLogger"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Analysis Structure (self_graph_analysis.json)

```json
{
  "summary": {
    "total_files": 42,
    "total_symbols": 156,
    "total_calls": 423,
    "exported_symbols": 28
  },
  "complexity": {
    "average_calls_per_symbol": 2.7,
    "max_call_depth": 5,
    "cyclic_dependencies": 0
  },
  "coverage": {
    "exported_coverage": 0.85,
    "call_coverage": 0.92
  }
}
```

---

## Integration with Build Pipeline

Automatically triggered:

```bash
npm run build              # Regenerates after build
npm run dev                # Regenerates before dev
npm run pre:manifests      # Regenerates before manifests
npm run pretest            # Regenerates test graph
```

---

## Common Tasks

### Graph TypeScript Project
```bash
python core/ographx_ts.py --root ./packages/my-package --out .ographx/my_graph.json
```

### Generate Only Diagrams
```bash
python generators/generate_orchestration_diagram.py
python generators/generate_sequence_flow.py
python generators/convert_to_svg.py
```

### Generate Only Analysis
```bash
python analysis/analyze_self_graph.py
```

### View Sequences
```bash
python analysis/show_sequences.py
```

### View Rich Sequence
```bash
python analysis/show_rich_sequence.py
```

---

## Performance

| Operation | Time |
|-----------|------|
| Extract IR | ~0.5s |
| Generate Sequences | ~0.3s |
| Generate Diagrams | ~0.4s |
| Convert to SVG | ~0.2s |
| Extract Analysis | ~0.2s |
| **Total** | **~1.4s** |

---

## Troubleshooting

### No output files generated
- Check Python version (requires 3.8+)
- Verify source files exist
- Check file permissions

### Mermaid diagrams not rendering
- Ensure Mermaid CLI is installed
- Check diagram syntax in `.mmd` files
- Verify SVG conversion completed

### Analysis shows zero metrics
- Verify IR was generated correctly
- Check that symbols were extracted
- Ensure call edges were discovered

---

## Next Steps

1. **View Diagrams**: Open `.svg` files in browser
2. **Analyze Metrics**: Review `analysis.json`
3. **Generate Sequences**: Use `self_sequences.json` for orchestration
4. **Compare Systems**: Use Layer 6 for cross-system analysis
5. **Integrate CI/CD**: Add to build pipeline

---

## Resources

- **Full Guide**: `GRAPHING_PROCESS_GUIDE.md`
- **Architecture**: `ARCHITECTURE_ROADMAP.md`
- **Testing**: `TESTING_STRATEGY.md`
- **Build Integration**: `BUILD_INTEGRATION.md`

