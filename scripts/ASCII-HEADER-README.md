# ASCII Header Generator

A **fully data-driven**, **domain-agnostic** ASCII box header generator that creates beautiful centered headers without any knowledge of your domain or content.

## Features

✨ **Completely Data-Driven** - Works with any text, any domain, no hardcoding
🎨 **Customizable Styling** - Control borders, corners, width, alignment
📦 **Zero Dependencies** - Pure Node.js, no external packages
🔧 **Flexible API** - Use as CLI tool or import as module
✅ **Fully Tested** - 33 passing tests covering all features

## Quick Start

### As a CLI Tool

```bash
# Simple usage
node generate-ascii-header.cjs "Title" "Subtitle"

# Custom width
node generate-ascii-header.cjs --json '{"lines": ["Title"], "width": 100}'
```

### As a Module

```javascript
const { generateHeader, createHeader } = require('./generate-ascii-header.cjs');

// Simple API
console.log(createHeader('Title', 'Subtitle'));

// Full API with options
const header = generateHeader({
  lines: ['Title', 'Subtitle'],
  width: 120
});
```

## API Reference

### `createHeader(...lines)`

Simple convenience function for creating headers with default settings.

**Parameters:**
- `...lines` - Variable number of strings to display

**Returns:** String containing the formatted ASCII header

**Example:**
```javascript
createHeader('Hello World', 'Welcome');
```

**Output:**
```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                    Hello World                                                       ║
║                                                      Welcome                                                         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

### `generateHeader(config)`

Full-featured function with customization options.

**Parameters:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lines` | `string[]` | `[]` | Array of text lines to display |
| `width` | `number` | `120` | Total width of the box (including borders) |
| `topBorder` | `string` | `'═'` | Character for top border |
| `bottomBorder` | `string` | `'═'` | Character for bottom border |
| `leftBorder` | `string` | `'║'` | Character for left border |
| `rightBorder` | `string` | `'║'` | Character for right border |
| `topLeftCorner` | `string` | `'╔'` | Character for top-left corner |
| `topRightCorner` | `string` | `'╗'` | Character for top-right corner |
| `bottomLeftCorner` | `string` | `'╚'` | Character for bottom-left corner |
| `bottomRightCorner` | `string` | `'╝'` | Character for bottom-right corner |
| `padding` | `string` | `' '` | Character for padding |
| `center` | `boolean` | `true` | Whether to center text |

**Returns:** String containing the formatted ASCII header

## Examples

### Example 1: Your Original Format

```javascript
generateHeader({
  lines: [
    'SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION',
    'Enhanced Handler Portfolio & Orchestration Framework'
  ],
  width: 120
});
```

Output:
```
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                           SYMPHONIC CODE ANALYSIS ARCHITECTURE - RENDERX WEB ORCHESTRATION                           ║
║                                 Enhanced Handler Portfolio & Orchestration Framework                                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

### Example 2: Different Domain (E-Commerce)

```javascript
generateHeader({
  lines: [
    'E-COMMERCE PLATFORM ARCHITECTURE',
    'Payment Processing & Order Management System'
  ],
  width: 100
});
```

Output:
```
╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                 E-COMMERCE PLATFORM ARCHITECTURE                                 ║
║                           Payment Processing & Order Management System                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
```

### Example 3: Classic ASCII Style

```javascript
generateHeader({
  lines: ['CLASSIC ASCII HEADER', 'Using Simple Characters'],
  topBorder: '-',
  bottomBorder: '-',
  leftBorder: '|',
  rightBorder: '|',
  topLeftCorner: '+',
  topRightCorner: '+',
  bottomLeftCorner: '+',
  bottomRightCorner: '+',
  width: 80
});
```

Output:
```
+------------------------------------------------------------------------------+
|                             CLASSIC ASCII HEADER                             |
|                           Using Simple Characters                            |
+------------------------------------------------------------------------------+
```

### Example 4: Heavy Box Style

```javascript
generateHeader({
  lines: ['HEAVY BOX HEADER', 'Bold and Prominent'],
  topBorder: '━',
  bottomBorder: '━',
  leftBorder: '┃',
  rightBorder: '┃',
  topLeftCorner: '┏',
  topRightCorner: '┓',
  bottomLeftCorner: '┗',
  bottomRightCorner: '┛',
  width: 85
});
```

Output:
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                 HEAVY BOX HEADER                                  ┃
┃                                Bold and Prominent                                 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Example 5: Left-Aligned Text

```javascript
generateHeader({
  lines: ['Left-Aligned Header', 'No centering applied'],
  center: false,
  width: 70
});
```

Output:
```
╔════════════════════════════════════════════════════════════════════╗
║Left-Aligned Header                                                 ║
║No centering applied                                                ║
╚════════════════════════════════════════════════════════════════════╝
```

### Example 6: Programmatic Generation

```javascript
const services = [
  { name: 'User Service', version: '1.2.3' },
  { name: 'Payment Gateway', version: '2.0.1' }
];

services.forEach(service => {
  console.log(generateHeader({
    lines: [service.name.toUpperCase(), `Version ${service.version}`],
    width: 60
  }));
});
```

Output:
```
╔══════════════════════════════════════════════════════════╗
║                       USER SERVICE                       ║
║                      Version 1.2.3                       ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║                     PAYMENT GATEWAY                      ║
║                      Version 2.0.1                       ║
╚══════════════════════════════════════════════════════════╝
```

## Box Drawing Characters

Here are common box drawing character sets you can use:

### Double Line (Default)
```
╔═══╗
║   ║
╚═══╝
```

### Single Line
```
┌───┐
│   │
└───┘
```

### Heavy Line
```
┏━━━┓
┃   ┃
┗━━━┛
```

### Classic ASCII
```
+---+
|   |
+---+
```

### Mixed Styles
```
╒═══╕  ╓───╖  ╭───╮
│   │  ║   ║  │   │
╘═══╛  ╙───╜  ╰───╯
```

## Testing

Run the comprehensive test suite:

```bash
node test-ascii-header.cjs
```

Run visual examples:

```bash
node ascii-header-examples.cjs
```

## Use Cases

- **Documentation headers** - Beautiful section separators
- **Report generation** - Professional-looking report titles
- **CLI tools** - Eye-catching output headers
- **Log files** - Clear section markers
- **Code generation** - Dynamic header creation
- **API responses** - Formatted text output
- **Email templates** - Text-based headers
- **Configuration files** - Visual section separators

## Why Data-Driven?

This generator is **completely domain-agnostic**:

✅ No hardcoded text or domains
✅ No assumptions about content
✅ Works with any language or character set
✅ Dynamically adapts to any text length
✅ Fully configurable styling
✅ Can be used across any project type

## File Structure

```
scripts/
├── generate-ascii-header.cjs      # Main generator (CLI + module)
├── test-ascii-header.cjs          # Comprehensive test suite
├── ascii-header-examples.cjs      # Visual examples
└── ASCII-HEADER-README.md         # This file
```

## License

Part of the RenderX Plugins Demo project.

## Credits

Created as a data-driven, domain-agnostic ASCII art generator for the RenderX symphonic code analysis project.
