# Auto-Generated README System - Fully Data-Driven

## Overview

The root [README.md](../README.md) is **completely data-driven** from [DOMAIN_REGISTRY.json](../DOMAIN_REGISTRY.json). The registry serves as the **single source of truth** for all README content through the `readme_metadata` section.

**Key Principle**: Content comes from JSON, not hardcoded in scripts. To change the README, edit the domain registry.

## Architecture

### Data Flow

```
DOMAIN_REGISTRY.json (readme_metadata)
         ↓
  generate-readme.cjs
         ↓
     README.md
```

### Content Sources

1. **Generated from Metadata** (`readme_metadata` in registry):
   - Title & subtitle
   - Overview (architecture, benefits, contents)
   - Related resources
   - Getting Started (prerequisites, installation, commands)
   - Documentation links
   - Testing commands
   - Packages list
   - Domain analysis commands
   - Contributing info
   - License

2. **Generated from Domain Data**:
   - Domain counts (total, active, deprecated, experimental)
   - Breakdown by type
   - Breakdown by ownership
   - Key orchestration domains with live metrics
   - Infrastructure domains
   - Capability domains

3. **Preserved from Existing README** (`preserve_sections` list):
   - Governance Tooling Registry
   - Telemetry Governance & Traceability System
   - Active Refactoring Zones
   - And other legacy rich documentation

## Single Source of Truth: DOMAIN_REGISTRY.json

### readme_metadata Structure

```json
{
  "readme_metadata": {
    "title": "RenderX Plugins Demo",
    "subtitle": "A thin-client host application...",
    "overview": {
      "architecture": "monorepo",
      "benefits": ["...", "..."],
      "contents": ["...", "..."],
      "monorepo_doc": "MONOREPO.md"
    },
    "related_resources": [
      {
        "name": "MusicalConductor",
        "description": "orchestration engine...",
        "url": "https://..."
      }
    ],
    "preserve_sections": [
      "Governance Tooling Registry",
      "� Telemetry Governance & Traceability System",
      "..."
    ],
    "getting_started": {
      "prerequisites": ["Node.js 18+", "..."],
      "installation_steps": ["git clone ...", "..."],
      "development_commands": [
        {"command": "npm run dev", "description": "Start server"}
      ]
    },
    "documentation_links": {
      "core": [
        {"title": "...", "path": "..."}
      ],
      "governance": {
        "registry": "docs/governance/tools-registry.json",
        "generated_docs": "npm run generate:governance:registry",
        "validation": "npm run validate:governance:registry"
      }
    },
    "testing_commands": [...],
    "packages": [...],
    "domain_analysis_commands": [...],
    "contributing": {...},
    "license": "..."
  }
}
```

## How It Works

### Generation Process

1. **Load Registry**: Read `DOMAIN_REGISTRY.json`
2. **Extract Preserved Sections**: Parse existing README for sections in `preserve_sections` list
3. **Generate Content**: Build README from `readme_metadata`
4. **Inject Domain Data**: Add live domain counts and metrics
5. **Insert Preserved Sections**: Add back preserved content in order
6. **Write README**: Save to `README.md`

### Section Ordering

1. Title & Subtitle (from metadata)
2. Overview (from metadata)
3. Related Resources (from metadata)
4. 📊 Domain Registry Overview (generated from domain data + analysis)
5. Preserved Sections (in order from `preserve_sections`)
6. Data-Driven Sections (Getting Started, Documentation, etc.)
7. Auto-Generation Footer

## Usage

### Manual Generation

```bash
npm run generate:readme
```

### Automatic (Build Integration)

```bash
npm run build
# ↳ runs: validate:domains → generate:readme → ...
```

## Updating README Content

### To Change Static Content

**Edit DOMAIN_REGISTRY.json**, not the script or README directly.

```json
{
  "readme_metadata": {
    "title": "New Title",  // ← Change title
    "overview": {
      "benefits": [  // ← Add/remove benefits
        "New benefit here"
      ]
    }
  }
}
```

Then regenerate:
```bash
npm run generate:readme
```

### To Add a New Section

1. Add metadata to `readme_metadata` in the registry
2. Update the generator script to use that metadata
3. Regenerate

### To Preserve a Section

Add to `preserve_sections` list:

```json
{
  "readme_metadata": {
    "preserve_sections": [
      "Governance Tooling Registry",
      "My New Rich Section"  // ← Add here
    ]
  }
}
```

The section will be extracted from the existing README and preserved during generation.

## Benefits

✅ **Single Source of Truth** - All content in JSON, not scattered across files
✅ **Version Controlled** - README changes tracked through registry changes
✅ **Data-Driven** - Live metrics from analysis reports
✅ **Preserves Rich Content** - Important documentation sections kept intact
✅ **Easy Updates** - Change JSON, regenerate
✅ **Consistent** - Same structure every time
✅ **Traceable** - Know exactly where each piece of content comes from

## Example Updates

### Change Installation Steps

**Before**:
```json
"installation_steps": [
  "git clone https://github.com/...",
  "cd renderx-plugins-demo",
  "npm install"
]
```

**After**:
```json
"installation_steps": [
  "git clone https://github.com/...",
  "cd renderx-plugins-demo",
  "npm install",
  "npm run setup"  // ← Added
]
```

**Result**: README automatically reflects new setup step on next generation.

### Add a New Resource

```json
"related_resources": [
  {
    "name": "MusicalConductor",
    "description": "...",
    "url": "..."
  },
  {  // ← New resource
    "name": "New Project",
    "description": "new thing",
    "url": "https://..."
  }
]
```

### Update Prerequisites

```json
"prerequisites": [
  "Node.js 18+",  // Updated from 16+
  "npm 9+",
  "Docker 24+"  // ← Added
]
```

## Migration Notes

### From Previous Approach

The previous approach used HTML markers (`<!-- AUTO-GENERATED:START -->`) to insert a single section. The new approach generates the **entire README** from metadata while preserving specific sections.

**Key Difference**:
- **Old**: Insert one section, keep everything else
- **New**: Generate everything, preserve specific sections

### Preserved Sections List

These sections from the original README are preserved as-is:

- Governance Tooling Registry
- � Telemetry Governance & Traceability System (all 5 layers!)
- �🚧 Active Refactoring Zones
- Getting Started (if you want manual control)
- Example Plugins
- Development Workflow
- Artifact Mode
- Host SDK Surface
- Artifact Integrity
- Environment Variables
- Layout and Slots
- Host SDK Migration
- License (if custom)
- Source Layout Refactor

To remove a section from preservation, remove it from `preserve_sections` in the registry.

## Troubleshooting

### Section Not Appearing

**Check**:
1. Is it in `readme_metadata` in the registry?
2. Is the generator script using that field?
3. Is it in `preserve_sections` (if from old README)?

### Section Appearing Twice

**Cause**: Section is both generated AND preserved.

**Fix**: Either:
- Add to `preserve_sections` to use existing content
- Remove from `preserve_sections` to use generated content

### Metrics Not Showing

**Check**:
1. Domain has analysis configuration in registry
2. Analysis has been run (`npm run analyze:all:domains`)
3. Analysis report exists in `.generated/analysis/`

## File Structure

```
renderx-plugins-demo/
├── DOMAIN_REGISTRY.json           # ← SINGLE SOURCE OF TRUTH
│   └── readme_metadata             # ← All README content
├── README.md                       # ← Auto-generated output
├── .generated/
│   └── analysis/**/*.md            # → Live metrics source
└── scripts/
    └── generate-readme.cjs         # → Generator (data-driven)
```

## Future Enhancements

Potential additions to `readme_metadata`:

- [ ] Badges (build status, coverage, license)
- [ ] Screenshots/GIFs paths
- [ ] Table of contents configuration
- [ ] Custom sections with markdown templates
- [ ] Section visibility toggles
- [ ] Multi-language support
- [ ] Dynamic charts/graphs configuration

## Related Documentation

- [DOMAIN_REGISTRY.json](../DOMAIN_REGISTRY.json) - Single source of truth
- [generate-readme.cjs](../scripts/generate-readme.cjs) - Data-driven generator
- [README.md](../README.md) - Generated output

---

**Principle**: README is a VIEW of the domain registry data, not a separate source of truth.
**Last Updated**: Auto-generated on build
**Maintainer**: Platform-Orchestration team
