# Symphony Handler Scanner

🎼 **Traces JSON sequence/symphony definitions to their TypeScript/JavaScript handler implementations**

## Overview

The Symphony Handler Scanner is a comprehensive analysis tool that maps declarative JSON sequence files (symphonies) to their actual code implementations. It discovers all movements and beats, extracts metadata, and traces handler functions to their source files.

## Features

✅ **JSON Sequence Discovery** - Automatically finds all JSON sequence files in `json-sequences/` directories  
✅ **Beat Metadata Extraction** - Captures event, title, dynamics, timing, kind, handler, and more  
✅ **Handler Tracing** - Locates handler implementations in TypeScript/JavaScript files  
✅ **Function Type Detection** - Identifies async/sync functions, arrow functions, class methods  
✅ **Cross-Reference Mapping** - Shows which handlers are used in which sequences  
✅ **Orphaned Handler Detection** - Finds handlers defined in JSON but missing in code  
✅ **Unused Handler Detection** - Identifies handler files not referenced by any sequence  
✅ **Multiple Report Formats** - Group by sequence, package, handler, or event  
✅ **100% Implementation Rate** - Validates complete coverage (currently 84/84 handlers found!)

## Quick Start

### Scan All Packages
```bash
python symphony_handler_scanner.py packages --stats
```

### Scan Specific Package
```bash
python symphony_handler_scanner.py packages\canvas-component --stats
```

### Generate Reports
```bash
# Full sequence-by-sequence report
python symphony_handler_scanner.py packages --output symphony_report.txt

# Group by handler (code → JSON mapping)
python symphony_handler_scanner.py packages --group-by handler --output handlers.txt

# Group by package
python symphony_handler_scanner.py packages --group-by package --stats

# Group by event type
python symphony_handler_scanner.py packages --group-by event
```

### Find Problems
```bash
# Show orphaned handlers (JSON references missing code)
python symphony_handler_scanner.py packages --show-orphans

# Show unused handlers (code not referenced in JSON)
python symphony_handler_scanner.py packages --show-unused --trace-depth full

# Filter by minimum beats
python symphony_handler_scanner.py packages --min-beats 5
```

### Export Data
```bash
# Export as JSON for programmatic analysis
python symphony_handler_scanner.py packages --json symphony_data.json
```

## Report Examples

### Sequence Report Format
```
├── canvas-component-create-symphony (canvas-component)
│   ├── 📄 JSON: packages\canvas-component\json-sequences\canvas-component\create.json
│   ├── 🎵 Movements: 1
│   ├── 🥁 Total Beats: 6
│   └── 🎼 MOVEMENTS:
│       ├── Movement 0: Create
│       └── 🥁 BEATS (6):
│           ├── Beat 1: Resolve Template
│           │   ├── 📡 Event: canvas:component:resolve-template
│           │   ├── 🎯 Handler: resolveTemplate
│           │   ├── 🎚️  Dynamics: mf
│           │   ├── ⏱️  Timing: immediate
│           │   ├── 🏷️  Kind: pure
│           │   └── 💻 IMPLEMENTATION:
│           │       ├── 📁 File: canvas-component\src\symphonies\create\create.arrangement.ts:1
│           │       ├── 🔧 Type: arrow-function
│           │       ├── ✅ Exported: Yes
│           │       └── 📋 Params: data, ctx
```

### Handler Report Format
```
├── 🎯 resolveTemplate (used 1 times)
│   ├── 💻 IMPLEMENTATION:
│   │   ├── src\symphonies\create\create.arrangement.ts:1 (arrow-function)
│   │   └── Params: data, ctx
│   └── 📍 USED IN:
│       ├── canvas-component-create-symphony (canvas-component)
│       │   └── Movement 0, Beat 1: canvas:component:resolve-template
```

### Statistics Summary
```
📊 Total Sequences: 53
🎵 Total Movements: 48
🥁 Total Beats: 103
🎯 Unique Handlers: 84
✅ Implemented: 84
⚠️  Orphaned: 0
📈 Implementation Rate: 100.0%

📦 By Package:
  canvas-component                 58 beats
  control-panel                    37 beats
  header                            3 beats
  library-component                 3 beats
  library                           2 beats

📡 By Event (Top 10):
  control:panel:css:notify         3×
  control:panel:classes:notify     2×
  canvas:component:copy:serialize  1×

🔧 Handler Types:
  sync-function         53
  class-method          22
  arrow-function        20
  async-function        19
```

## Beat Metadata

Each beat captures comprehensive metadata from JSON:

| Field | Description | Example |
|-------|-------------|---------|
| `beat` | Beat number in movement | `1` |
| `event` | Event identifier | `canvas:component:resolve-template` |
| `title` | Human-readable title | `Resolve Template` |
| `handler` | Handler function name | `resolveTemplate` |
| `dynamics` | Performance dynamics | `mf`, `ff`, `pp` |
| `timing` | Execution timing | `immediate`, `deferred` |
| `kind` | Handler classification | `pure`, `io`, `stage-crew` |
| `transition` | State transition type | `sync`, `async` |
| `description` | Optional description | Beat purpose |

## Handler Detection Patterns

The scanner recognizes multiple TypeScript/JavaScript patterns:

```typescript
// ✅ Exported async function
export async function handleEvent(data, ctx) { }

// ✅ Exported sync function
export function handleEvent(data, ctx) { }

// ✅ Exported const with arrow function
export const handleEvent = async (data, ctx) => { }

// ✅ Named exports
const handleEvent = (data, ctx) => { }
export { handleEvent }

// ✅ Class methods
class StageCrew {
  async handleEvent(data, ctx) { }
}
```

## Use Cases

### 1. Architecture Validation
Verify all JSON sequences have corresponding handler implementations:
```bash
python symphony_handler_scanner.py packages --show-orphans --stats
```

### 2. Code Coverage Analysis
Find unused handler files that can be cleaned up:
```bash
python symphony_handler_scanner.py packages --show-unused --trace-depth full
```

### 3. Documentation Generation
Generate cross-reference documentation for developers:
```bash
python symphony_handler_scanner.py packages --group-by handler --output HANDLER_REFERENCE.txt
```

### 4. Refactoring Planning
Identify which sequences will be affected by handler changes:
```bash
python symphony_handler_scanner.py packages --group-by handler | grep "myHandler"
```

### 5. Event Flow Analysis
Understand event-driven architecture:
```bash
python symphony_handler_scanner.py packages --group-by event
```

### 6. Package Audit
See which packages have the most complex sequences:
```bash
python symphony_handler_scanner.py packages --group-by package --stats
```

## Current Statistics

**Latest Scan Results (packages/):**
- 📊 **53 sequences** across 5 packages
- 🎵 **48 movements** orchestrating workflows
- 🥁 **103 beats** defining operations
- 🎯 **84 unique handlers** implemented
- ✅ **100% implementation rate** - all handlers found!
- 📦 **Top package:** canvas-component (58 beats)

**Handler Type Distribution:**
- `sync-function`: 53 (63%)
- `class-method`: 22 (26%)
- `arrow-function`: 20 (24%)
- `async-function`: 19 (23%)

## Architecture Insights

### Symphony Structure
```
Sequence (JSON file)
  ├── Trigger (optional)
  │   ├── event: string
  │   └── topic: string
  └── Movements[]
      └── Beats[]
          ├── event: string
          ├── handler: string ──> Traced to implementation
          ├── dynamics: string
          ├── timing: string
          └── kind: string
```

### Handler Naming Conventions
- **camelCase**: Standard function names (`resolveTemplate`, `createNode`)
- **verb-first**: Action-oriented (`createNode`, `deleteComponent`, `notifyUi`)
- **domain-specific**: Business logic names (`serializeSelectedComponent`)

### Common Event Patterns
- `package:domain:action` - Standard format
- `package:domain:action:detail` - Extended format
- Examples:
  - `canvas:component:resolve-template`
  - `control:panel:css:notify`
  - `library:component:drop`

## Integration with Desktop (Avalonia)

This scanner helps port web symphonies to desktop by:

1. **Mapping Data Flow** - Shows how events trigger handlers
2. **Identifying Dependencies** - Reveals handler parameters and return types
3. **Understanding Timing** - Shows immediate vs deferred execution
4. **Classifying Logic** - Separates pure/io/stage-crew handlers
5. **Documentation** - Generates reference for desktop implementation

## Related Tools

Part of the **RenderX Analysis Suite**:
- `folder_tree_scanner.py` - Directory structure visualization
- `log_message_scanner.py` - Log statement tracking (1,993 logs)
- `event_sequence_scanner.py` - Event flow visualization
- `css_class_scanner.py` - CSS class usage analysis (2,824 occurrences)
- `symphony_handler_scanner.py` - **This tool** (103 beats tracked)
- `manifest_flow_analyzer.py` - Build pipeline analysis

## Command Line Options

```
usage: symphony_handler_scanner.py [-h] [--output FILE] [--json FILE]
                                   [--group-by {sequence,package,handler,event}]
                                   [--show-orphans] [--show-unused] [--stats]
                                   [--min-beats N]
                                   [--trace-depth {basic,detailed,full}]
                                   directory

Options:
  directory                     Directory to scan (e.g., packages/)
  --output FILE                 Save report to file
  --json FILE                   Export as JSON
  --group-by MODE              Group by: sequence, package, handler, event
  --show-orphans               Show handlers not found in code
  --show-unused                Show handler files without JSON references
  --stats                      Show statistics summary
  --min-beats N                Only show sequences with N+ beats
  --trace-depth LEVEL          Handler trace depth: basic, detailed, full
```

## Technical Details

### File Discovery
- Searches `json-sequences/` directories recursively
- Parses JSON files for symphony definitions
- Extracts package name from directory structure

### Handler Search
- Scans `src/` and `symphonies/` directories
- Matches multiple TypeScript/JavaScript patterns
- Detects function types and signatures
- Extracts JSDoc/TSDoc comments

### Performance
- **Fast scanning**: 53 sequences analyzed in <1 second
- **Efficient pattern matching**: Regex-based detection
- **Minimal memory**: Streaming file processing

## Examples

### Example 1: Canvas Component Create Symphony
**JSON:** `packages/canvas-component/json-sequences/canvas-component/create.json`

**Beat 1:**
- Event: `canvas:component:resolve-template`
- Handler: `resolveTemplate`
- Dynamics: `mf`
- Timing: `immediate`
- Kind: `pure`
- **Implementation:** `src/symphonies/create/create.arrangement.ts:1`

### Example 2: Control Panel CSS Management
**Multiple sequences** with CSS-related handlers spread across:
- `control-panel/json-sequences/control-panel/css/`
- Handlers in: `src/symphonies/css/css-management.stage-crew.ts`

## Troubleshooting

### No sequences found
- Ensure directory contains `json-sequences/` subdirectories
- Check JSON file validity

### Handlers not detected
- Verify handler is exported
- Check function naming matches JSON
- Ensure file has `.ts`, `.tsx`, `.js`, or `.jsx` extension

### Performance issues
- Use `--min-beats` to filter small sequences
- Reduce `--trace-depth` to `basic` for faster scans
- Scan specific packages instead of entire workspace

## Future Enhancements

- [ ] Parameter type validation
- [ ] Return type analysis
- [ ] Dependency graph generation
- [ ] Sequence execution simulation
- [ ] Dead code detection (handlers defined but never called)
- [ ] Event naming convention validation
- [ ] Beat complexity metrics

---

**Created:** November 9, 2025  
**Status:** ✅ Production Ready  
**Implementation Rate:** 100% (84/84 handlers traced)
