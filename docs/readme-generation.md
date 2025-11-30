# Auto-Generated README System

## Overview

The root [README.md](../README.md) contains an **auto-generated "Domain Registry Overview" section** that stays synchronized with the domain registry and code analysis reports. The rest of the README is manually maintained to preserve rich documentation.

**Key Point**: Only the "Domain Registry Overview" section is auto-generated. All other sections (Overview, Telemetry System, Governance, Getting Started, etc.) are preserved exactly as written.

## How It Works

### Data Sources

The README generator pulls data from:

1. **DOMAIN_REGISTRY.json** - Complete domain registry with:
   - Domain count by type (orchestration, capability, infrastructure)
   - Domain ownership breakdown
   - Domain status (active, deprecated, experimental)
   - Domain descriptions

2. **Code Analysis Reports** - Latest analysis from `.generated/analysis/**`:
   - Handler counts
   - Test coverage percentages
   - Conformity scores
   - Maintainability metrics
   - Code duplication stats
   - Overall health status

### Generation Script

**Location**: [scripts/generate-readme.cjs](../scripts/generate-readme.cjs)

The script:
- Loads the domain registry
- Scans for latest analysis reports per domain
- Extracts metrics from markdown reports
- Categorizes domains by type and ownership
- **Inserts/updates** a single section between HTML markers

### Insertion Strategy

The auto-generated section is inserted into the existing README using HTML comment markers:

```html
<!-- AUTO-GENERATED:START - Do not modify this section manually -->
... generated content ...
<!-- AUTO-GENERATED:END -->
```

- **Insertion Point**: After "Related Resources", before "Governance Tooling Registry"
- **Method**: Markers preserve boundaries
- **Updates**: Script replaces only the marked section
- **Preservation**: All other content remains untouched

### Auto-Generated Section

The **"Domain Registry Overview"** section includes:

- Total domain counts (active, deprecated, experimental)
- Breakdown by type (orchestration, capability, workflow)
- Breakdown by ownership (Platform teams)
- Key orchestration domains (top 8 with metrics)
- Infrastructure domains
- Capability domains (collapsible)
- Analysis status

### Manually Maintained Sections

All other README sections are preserved:

- Overview & Monorepo Benefits
- Related Resources
- Governance Tooling Registry
- Telemetry Governance & Traceability System
- Refactoring Zones
- Getting Started
- Example Plugins
- Development Workflow
- And much more...

## Usage

### Manual Generation

```bash
# Generate README
npm run generate:readme
```

### Automatic Generation

The README is automatically regenerated during the build process:

```bash
npm run build
# ↳ runs validate:domains → generate:readme → ...
```

### Integration Points

The `generate:readme` script is integrated into:

- **Build Pipeline**: Runs after domain validation
- **Can be run standalone**: For quick updates without full build

## Customization

### Adding Static Content

To add static sections, edit [scripts/generate-readme.cjs](../scripts/generate-readme.cjs):

```javascript
function generateReadme(registry) {
  // ... existing code ...

  let readme = `# RenderX Plugins Demo

> Auto-generated...

// Add your custom section here
## 🆕 My Custom Section

Custom content here...

`;

  return readme;
}
```

### Modifying Metrics Extraction

To extract additional metrics from analysis reports, update the `extractMetrics()` function:

```javascript
function extractMetrics(reportPath) {
  // ... existing patterns ...

  // Add new metric extraction
  const myMetricMatch = content.match(/My Metric:\s*([\d.]+)/);
  if (myMetricMatch) metrics.myMetric = parseFloat(myMetricMatch[1]);

  return metrics;
}
```

### Changing Domain Categorization

To modify how domains are categorized, edit the `generateDomainSummary()` function:

```javascript
// Example: Add new category
summary.myCategory = [];

// In the forEach loop:
if (someCondition) {
  summary.myCategory.push({ id, ...def });
}
```

## File Structure

```
renderx-plugins-demo/
├── README.md                          # ← Auto-generated
├── DOMAIN_REGISTRY.json              # → Source of truth
├── .generated/
│   └── analysis/
│       ├── orchestration-core/
│       │   └── orchestration-core-rich-markdown-*.md  # → Latest metrics
│       ├── build-pipeline/
│       │   └── build-pipeline-orchestration-rich-markdown-*.md
│       └── ...
└── scripts/
    └── generate-readme.cjs           # → Generator script
```

## Maintenance

### When to Regenerate

The README should be regenerated when:

1. **Domains change** - New domains added/removed from registry
2. **Analysis runs** - After `npm run analyze:all:domains`
3. **Build time** - Automatically during `npm run build`
4. **Manual updates needed** - When static sections need refresh

### Verification

After generation, verify:

```bash
# Check README was updated
git status

# View the generated README
cat README.md | head -50

# Validate domain counts match registry
grep "Total Domains:" README.md
```

## Benefits

✅ **Always Up-to-Date** - README reflects actual codebase state
✅ **Metrics Integration** - Shows real analysis data
✅ **Zero Manual Effort** - Automatic during builds
✅ **Consistency** - Same format every time
✅ **Traceability** - Links to analysis reports
✅ **Governance** - Enforces documentation standards

## Future Enhancements

Potential improvements:

- [ ] Add trend graphs (coverage over time)
- [ ] Include package dependency visualization
- [ ] Show test health per domain
- [ ] Add architecture diagrams
- [ ] Include recent commits/changes
- [ ] Show domain dependency graph
- [ ] Add performance metrics
- [ ] Include API documentation links

## Related Documentation

- [Domain Registry](../DOMAIN_REGISTRY.json) - Source of truth
- [analyze-all-domains.cjs](../scripts/analyze-all-domains.cjs) - Batch analysis
- [analyze-domain.cjs](../scripts/analyze-domain.cjs) - Single domain analysis
- [Governance Docs](./governance/) - Governance framework

---

**Last Updated**: Auto-generated on build
**Maintainer**: Platform-Orchestration team
