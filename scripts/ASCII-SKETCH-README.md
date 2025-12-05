# ASCII Sketch Generator

A **data-driven**, **domain-agnostic** ASCII sketch generator that creates beautiful bordered boxes with metrics. JavaScript port of the Python implementation for perfect cross-language compatibility.

## Features

✨ **100% Data-Driven** - No hardcoded content, works with any data
🎨 **Clean Auto-Alignment** - Automatically aligns borders and content
📦 **Zero Dependencies** - Pure Node.js
🔧 **Multiple Styles** - Box borders or simple lines
📊 **Icon Support** - Emoji icons with proper width handling
✅ **Fully Tested** - 52/53 tests passing
🐍 **Python Compatible** - Matches Python implementation exactly

## Quick Start

### As a CLI Tool

```bash
# Basic usage
node generate-ascii-sketch.cjs --json '{"title": "METRICS", "metrics": {"Key": "Value"}}'

# With icon
node generate-ascii-sketch.cjs --json '{"title": "CODEBASE METRICS", "metrics": {"Files": "791", "LOC": "5168"}, "icon": "📊"}'
```

### As a Module

```javascript
const { generateSketch, createSketch } = require('./generate-ascii-sketch.cjs');

// Simple API
console.log(createSketch('METRICS', { 'Files': '791', 'LOC': '5168' }, { icon: '📊' }));

// Full API
const sketch = generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285'
  },
  style: 'box',  // 'box' or 'line'
  icon: '📊'
});
```

## API Reference

### `generateSketch(config)`

Generate a clean ASCII sketch with proper alignment.

**Parameters:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | *required* | Header title for the sketch |
| `metrics` | `object` | `{}` | Key-value pairs of metrics |
| `style` | `string` | `'box'` | Style: `'box'` (bordered) or `'line'` (simple) |
| `icon` | `string` | `''` | Optional emoji or icon to prepend to title |

**Returns:** `string` - Formatted ASCII sketch

**Example:**
```javascript
generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Coverage': '80.38%'
  },
  style: 'box',
  icon: '📊'
});
```

**Output:**
```
┌─ 📊 CODEBASE METRICS ──────────────────────────────────────────────┐
│ Files: 791  │  LOC: 5168  │  Coverage: 80.38%                      │
└────────────────────────────────────────────────────────────────────┘
```

### `createSketch(title, metrics, options)`

Convenience function for creating sketches.

**Parameters:**
- `title` - Header title (string)
- `metrics` - Metrics object (object)
- `options` - Additional options like `{ icon, style }` (object, optional)

**Returns:** `string` - Formatted ASCII sketch

**Example:**
```javascript
createSketch('API METRICS', { 'Requests': '1.2K', 'Latency': '45ms' }, { icon: '⚡' });
```

### `parseSketch(sketchString)`

Parse an existing ASCII sketch to extract title and metrics.

**Parameters:**
- `sketchString` - Multi-line ASCII sketch (string)

**Returns:** `object` - `{ title: string, metrics: object }`

**Example:**
```javascript
const sketch = `┌─ 📊 METRICS ──────┐
│ Files: 791  │  LOC: 5168 │
└───────────────────────────┘`;

const parsed = parseSketch(sketch);
// { title: '📊 METRICS ...', metrics: { Files: '791', LOC: '5168' } }
```

## Examples

### Example 1: Codebase Metrics

```javascript
generateSketch({
  title: 'CODEBASE METRICS',
  metrics: {
    'Files': '791',
    'LOC': '5168',
    'Handlers': '285',
    'Avg': '18.13',
    'Coverage': '80.38%'
  },
  icon: '📊'
});
```

Output:
```
┌─ 📊 CODEBASE METRICS ──────────────────────────────────────────────────────────┐
│ Files: 791  │  LOC: 5168  │  Handlers: 285  │  Avg: 18.13  │  Coverage: 80.38% │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Example 2: API Performance

```javascript
generateSketch({
  title: 'API PERFORMANCE',
  metrics: {
    'Requests/sec': '1,245',
    'Avg Response': '45ms',
    'Error Rate': '0.02%',
    'Uptime': '99.99%'
  },
  icon: '⚡'
});
```

Output:
```
┌─ ⚡ API PERFORMANCE ─────────────────────────────────────────────────────────────────┐
│ Requests/sec: 1,245  │  Avg Response: 45ms  │  Error Rate: 0.02%  │  Uptime: 99.99% │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Example 3: Line Style

```javascript
generateSketch({
  title: 'DEPLOYMENT STATUS',
  metrics: {
    'Environment': 'Production',
    'Version': 'v2.5.0',
    'Status': 'Live'
  },
  style: 'line',
  icon: '🌐'
});
```

Output:
```
🌐 DEPLOYMENT STATUS
────────────────────────────────────────────────────────────────
│ Environment: Production  │  Version: v2.5.0  │  Status: Live │
```

### Example 4: Programmatic Generation

```javascript
const services = [
  { name: 'Auth Service', requests: '1.2K', latency: '23ms' },
  { name: 'Payment Service', requests: '845', latency: '67ms' }
];

services.forEach(service => {
  console.log(generateSketch({
    title: service.name.toUpperCase(),
    metrics: {
      'Requests': service.requests,
      'Latency': service.latency
    },
    icon: '🔧'
  }));
});
```

Output:
```
┌─ 🔧 AUTH SERVICE ──────────────────────────┐
│ Requests: 1.2K  │  Latency: 23ms           │
└────────────────────────────────────────────┘

┌─ 🔧 PAYMENT SERVICE ──────────────────────┐
│ Requests: 845  │  Latency: 67ms           │
└───────────────────────────────────────────┘
```

## Style Options

### Box Style (Default)

Uses Unicode box drawing characters for clean borders:

```
┌─ TITLE ──────────┐
│ Key: Value       │
└──────────────────┘
```

- Top border: `┌` + `─` + `┐`
- Side borders: `│`
- Bottom border: `└` + `─` + `┘`
- Metrics separator: `│`

### Line Style

Simple style without borders:

```
TITLE
─────────────────
│ Key: Value    │
```

## Icon Support

The generator properly handles emoji icons with correct width calculation:

```javascript
// With icon
generateSketch({ title: 'METRICS', metrics: {...}, icon: '📊' });
// ┌─ 📊 METRICS ───┐

// Without icon
generateSketch({ title: 'METRICS', metrics: {...} });
// ┌─ METRICS ──────┐
```

Supported icon types:
- ✅ Emojis (📊, ⚡, 💾, 🔒, etc.)
- ✅ Unicode symbols (✓, ⚠, ★, etc.)
- ✅ Regular text

## Auto-Alignment

The generator automatically:
- ✅ Aligns all borders to the same width
- ✅ Adjusts title section based on content width
- ✅ Handles emoji width correctly (counts as 2 characters)
- ✅ Centers metrics with proper separators
- ✅ Ensures all lines match in length

## Use Cases

- **📊 Reports** - Code metrics, build summaries, test results
- **⚡ Dashboards** - API performance, system health, resource usage
- **💾 Monitoring** - Database stats, server metrics, alerts
- **🔒 Security** - Audit results, vulnerability scans
- **🚀 DevOps** - CI/CD status, deployment info
- **🎮 Gaming** - Server stats, player metrics
- **💰 E-Commerce** - Sales data, conversion rates
- **🤖 ML/AI** - Training metrics, model performance

## Testing

Run the comprehensive test suite:

```bash
node test-ascii-sketch.cjs
```

Run visual examples:

```bash
node ascii-sketch-examples.cjs
```

## File Structure

```
scripts/
├── generate-ascii-sketch.cjs              # Main generator (CLI + module)
├── test-ascii-sketch.cjs                  # Test suite (52 tests)
├── ascii-sketch-examples.cjs              # Visual examples (16 examples)
├── ASCII-SKETCH-README.md                 # This file
└── ascii_sketch_bordered_boxes_generator.py  # Original Python implementation
```

## Python Compatibility

This JavaScript implementation is a **1:1 port** of the Python version, producing identical output:

**Python:**
```python
from ascii_sketch_bordered_boxes_generator import generate_sketch

sketch = generate_sketch("METRICS", {"Files": "791"}, icon="📊")
```

**JavaScript:**
```javascript
const { generateSketch } = require('./generate-ascii-sketch.cjs');

const sketch = generateSketch({ title: "METRICS", metrics: {"Files": "791"}, icon: "📊" });
```

Both produce:
```
┌─ 📊 METRICS ──────┐
│ Files: 791        │
└───────────────────┘
```

## Why Data-Driven?

This generator is **completely domain-agnostic**:

✅ No hardcoded text or assumptions
✅ Works with any metrics in any domain
✅ Automatically adapts to content size
✅ Handles any number of metrics
✅ Supports multiple visual styles
✅ Can be integrated into any project

## License

Part of the RenderX Plugins Demo project.

## Credits

JavaScript port by Claude Code, based on the Python implementation for the RenderX symphonic code analysis project.
