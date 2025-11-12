# Mermaid to SVG Conversion Guide

Convert your Mermaid diagrams to high-quality SVG format for presentations, documentation, and web use.

## Quick Start

### Convert All Diagrams

```bash
python convert_to_svg.py --all
```

This converts all 5 diagrams to SVG:
- `summary_diagram.svg` (16 KB)
- `orchestration_diagram.svg` (35 KB)
- `call_graph_diagram.svg` (21 KB)
- `sequence_flow_diagram.svg` (106 KB)
- `beat_timeline.svg` (81 KB)

### Convert Specific Diagram

```bash
python convert_to_svg.py summary_diagram
python convert_to_svg.py orchestration_diagram
python convert_to_svg.py call_graph_diagram
python convert_to_svg.py sequence_flow_diagram
python convert_to_svg.py beat_timeline
```

## Conversion Methods

### Method 1: Automatic (Recommended)

```bash
python convert_to_svg.py --all --method auto
```

**How it works:**
1. Tries Mermaid CLI (mmdc) if installed
2. Falls back to Mermaid Live Editor API if CLI not available
3. No external dependencies required for API method

### Method 2: Mermaid CLI (Fastest)

```bash
python convert_to_svg.py --all --method cli
```

**Requirements:**
```bash
npm install -g @mermaid-js/mermaid-cli
```

**Advantages:**
- Fastest conversion
- Works offline
- Full control over output

**Installation:**
```bash
# Using npm
npm install -g @mermaid-js/mermaid-cli

# Or using yarn
yarn global add @mermaid-js/mermaid-cli
```

### Method 3: Mermaid Live Editor API (No Dependencies)

```bash
python convert_to_svg.py --all --method api
```

**Advantages:**
- No installation required
- Works immediately
- Always up-to-date

**Limitations:**
- Requires internet connection
- Slightly slower than CLI
- Rate limited (but generous)

## Usage Examples

### Convert All Diagrams

```bash
# Using automatic method (recommended)
python convert_to_svg.py --all

# Using API method (no dependencies)
python convert_to_svg.py --all --method api

# Using CLI method (fastest)
python convert_to_svg.py --all --method cli
```

### Convert Specific Diagram

```bash
# Convert summary diagram
python convert_to_svg.py summary_diagram

# Convert with custom output
python convert_to_svg.py summary_diagram --output my_summary.svg

# Convert with specific method
python convert_to_svg.py summary_diagram --method api
```

### Batch Conversion

```bash
# Convert all diagrams to a specific directory
for diagram in summary orchestration call_graph sequence_flow beat_timeline; do
    python convert_to_svg.py $diagram --output ../exports/$diagram.svg
done
```

## Output Files

| Diagram | File Size | Use Case |
|---------|-----------|----------|
| summary_diagram.svg | 16 KB | Quick overview, presentations |
| orchestration_diagram.svg | 35 KB | Architecture documentation |
| call_graph_diagram.svg | 21 KB | Dependency analysis |
| sequence_flow_diagram.svg | 106 KB | Detailed flow documentation |
| beat_timeline.svg | 81 KB | Execution flow documentation |

## Using SVG Files

### In Markdown

```markdown
![OgraphX Summary](summary_diagram.svg)
![OgraphX Orchestration](orchestration_diagram.svg)
```

### In HTML

```html
<img src="summary_diagram.svg" alt="OgraphX Summary" />
<object data="orchestration_diagram.svg" type="image/svg+xml"></object>
```

### In PowerPoint/Presentations

1. Insert → Pictures → From this device
2. Select `.svg` file
3. SVG will scale perfectly to any size

### In Documentation

```markdown
## Architecture Overview

![Architecture](orchestration_diagram.svg)

## Execution Flow

![Flow](sequence_flow_diagram.svg)
```

### In Web Pages

```html
<!-- Inline SVG -->
<div id="diagram"></div>
<script>
  fetch('summary_diagram.svg')
    .then(r => r.text())
    .then(svg => document.getElementById('diagram').innerHTML = svg);
</script>

<!-- Or as image -->
<img src="summary_diagram.svg" alt="Diagram" />
```

## Advantages of SVG

✅ **Scalable** - Perfect at any size  
✅ **Searchable** - Text is selectable  
✅ **Editable** - Can be modified in vector editors  
✅ **Small** - Compressed text format  
✅ **Web-friendly** - Native browser support  
✅ **Print-ready** - Perfect for printing  
✅ **Accessible** - Can include alt text  

## Troubleshooting

### "Mermaid CLI not found"

**Solution:** Use API method instead
```bash
python convert_to_svg.py --all --method api
```

Or install Mermaid CLI:
```bash
npm install -g @mermaid-js/mermaid-cli
```

### "API conversion error"

**Possible causes:**
- No internet connection
- Rate limit exceeded
- Diagram too large

**Solutions:**
1. Check internet connection
2. Wait a few minutes and retry
3. Use CLI method instead

### "File not found"

**Solution:** Make sure you're in the correct directory
```bash
cd packages/ographx/.ographx
python convert_to_svg.py --all
```

### SVG looks different from Mermaid preview

**Possible causes:**
- Different rendering engine
- Browser compatibility
- Font differences

**Solutions:**
1. Try different method (CLI vs API)
2. Open in different browser
3. Check SVG in vector editor

## Advanced Usage

### Custom Output Directory

```bash
# Create output directory
mkdir -p ../exports

# Convert all to output directory
python convert_to_svg.py summary_diagram --output ../exports/summary.svg
python convert_to_svg.py orchestration_diagram --output ../exports/orchestration.svg
```

### Batch Processing

```bash
# Convert all and copy to docs
python convert_to_svg.py --all
cp *.svg ../../docs/diagrams/
```

### Integration with Build System

```bash
# Add to package.json scripts
"scripts": {
  "diagrams:svg": "cd packages/ographx/.ographx && python convert_to_svg.py --all"
}
```

Then run:
```bash
npm run diagrams:svg
```

## Performance

| Method | Speed | Dependencies | Offline |
|--------|-------|--------------|---------|
| CLI | ⚡⚡⚡ Fast | npm, Node.js | ✅ Yes |
| API | ⚡⚡ Medium | None | ❌ No |

## File Sizes

```
summary_diagram.svg          16 KB
orchestration_diagram.svg    35 KB
call_graph_diagram.svg       21 KB
sequence_flow_diagram.svg   106 KB
beat_timeline.svg            81 KB
─────────────────────────────────
Total                        259 KB
```

## Next Steps

1. ✅ Convert diagrams to SVG
2. 📁 Copy to documentation directory
3. 📝 Include in README or docs
4. 🎨 Customize colors if needed
5. 📤 Share with team

## References

- [Mermaid Documentation](https://mermaid.js.org/)
- [Mermaid CLI](https://github.com/mermaid-js/mermaid-cli)
- [SVG Specification](https://www.w3.org/TR/SVG2/)
- [convert_to_svg.py](convert_to_svg.py) - Conversion script

---

**Status**: ✅ Ready to use  
**Version**: 1.0  
**Last Updated**: 2025-11-12

