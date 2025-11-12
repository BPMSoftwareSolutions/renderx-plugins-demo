# OgraphX Quick Start Guide

## What is OgraphX?

OgraphX is a **minimal TypeScript flow extractor** that analyzes your codebase and generates:
1. **graph.json** - Intermediate representation (IR) with symbols, calls, and contracts
2. **sequences.json** - Naive sequences bundle for Conductor playground

## Running OgraphX

### Basic Usage

```bash
# From the musical-conductor directory
cd packages/musical-conductor

# Generate IR only
python ../../packages/ographx/ographx_ts.py --root ./modules --out ./.ographx/graph.json

# Generate IR + Sequences
python ../../packages/ographx/ographx_ts.py --root ./modules \
  --out ./.ographx/graph.json \
  --emit-sequences ./.ographx/sequences.json
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `--root` | Yes | Root directory to scan for TS/TSX files |
| `--out` | Yes | Output path for graph.json |
| `--emit-sequences` | No | Optional path to write sequences.json |

## Understanding the Output

### graph.json - The IR

**Symbols** - Functions and methods found:
```json
{
  "id": "DomainEventSystem.ts::DomainEventSystem.emit",
  "file": "./modules/communication/DomainEventSystem.ts",
  "kind": "method",
  "name": "emit",
  "class_name": "DomainEventSystem",
  "exported": true,
  "params_contract": "DomainEventSystem.emitParams@0.1.0::eventNamestring-dataany",
  "range": [42, 58]
}
```

**Calls** - Function invocations detected:
```json
{
  "frm": "DomainEventSystem.ts::DomainEventSystem.emit",
  "to": "EventBus.ts::EventBus.emit",
  "name": "emit",
  "line": 45
}
```

**Contracts** - Parameter signatures:
```json
{
  "id": "DomainEventSystem.emitParams@0.1.0::eventNamestring-dataany",
  "kind": "params",
  "props": [
    {"name": "eventName", "raw": "string"},
    {"name": "data", "raw": "any"}
  ]
}
```

### sequences.json - Conductor Format

Each exported function becomes a **sequence** with **movements** and **beats**:

```json
{
  "id": "DomainEventSystem.ts__DomainEventSystem.emit",
  "name": "DomainEventSystem.emit Flow",
  "category": "analysis",
  "key": "C Major",
  "tempo": 100,
  "movements": [
    {
      "id": "calls",
      "beats": [
        {
          "beat": 1,
          "event": "call:emit",
          "handler": "emit",
          "timing": "immediate",
          "dynamics": "mf",
          "in": ["DomainEventSystem.emitParams@0.1.0::eventNamestring-dataany"]
        }
      ]
    }
  ]
}
```

## Analyzing the Results

### Find All Exported Functions

```bash
# Extract exported symbols from graph.json
python -c "
import json
data = json.load(open('.ographx/graph.json'))
exported = [s for s in data['symbols'] if s['exported']]
print(f'Found {len(exported)} exported symbols')
for s in exported[:10]:
    print(f'  - {s[\"name\"]} ({s[\"kind\"]})')
"
```

### Trace Call Dependencies

```bash
# Find all calls from a specific function
python -c "
import json
data = json.load(open('.ographx/graph.json'))
target = 'DomainEventSystem.ts::DomainEventSystem.emit'
calls = [c for c in data['calls'] if c['frm'] == target]
print(f'{target} calls:')
for c in calls:
    print(f'  - {c[\"name\"]} (line {c[\"line\"]})')
"
```

### View Parameter Contracts

```bash
# List all contracts with their properties
python -c "
import json
data = json.load(open('.ographx/graph.json'))
for contract in data['contracts'][:5]:
    print(f'{contract[\"id\"]}:')
    for prop in contract['props']:
        print(f'  - {prop[\"name\"]}: {prop[\"raw\"]}')
"
```

## Use Cases

### 1. **Architecture Review**
- Identify entry points (exported functions)
- Trace call chains to understand data flow
- Detect circular dependencies

### 2. **Sequence Visualization**
- Load sequences.json into Conductor playground
- Visualize function flows as musical movements
- Test execution with beat-level granularity

### 3. **Dependency Analysis**
- Find all callers of a specific function
- Identify unused exported functions
- Map cross-module dependencies

### 4. **Type Extraction**
- Extract parameter types from contracts
- Validate type consistency across calls
- Generate documentation from contracts

## Limitations

- **Heuristic-based** - Uses regex, not a full TypeScript parser
- **Conservative** - May miss some calls in complex code
- **Local resolution only** - Doesn't resolve imports across files
- **No generics expansion** - Treats generic types as raw strings

## Tips & Tricks

1. **Regenerate after code changes** - IR is a snapshot at analysis time
2. **Use for code review** - Quickly understand new module structure
3. **Combine with git history** - Track how call graphs evolve
4. **Feed to visualization tools** - Create architecture diagrams
5. **Validate with tests** - Use sequences to generate test cases

## Troubleshooting

**No symbols found?**
- Check that `--root` points to directory with .ts/.tsx files
- Verify files aren't excluded (e.g., .d.ts files are skipped)

**Incomplete call graph?**
- Tool uses regex matching - complex patterns may be missed
- Check for dynamic calls (e.g., `obj[methodName]()`)

**Large output files?**
- Normal for large codebases - graph.json can be 50KB+
- Consider filtering by exported symbols only

## Next Steps

1. Load sequences.json into Conductor playground
2. Analyze graph.json for architectural insights
3. Use contracts for type validation
4. Generate documentation from extracted metadata

