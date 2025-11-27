# Orchestration Governance System - Canonical Discrepancy Detection

## Overview

A comprehensive governance system has been implemented to detect and resolve canonical discrepancies between:
- **Workspace packages** (defined in package.json workspaces)
- **Root dependencies** (defined in package.json dependencies)
- **Orchestration registry** (orchestration-domains.json)

## Key Components

### 1. Validation Script: `validate-workspace-orchestration-alignment.js`

**Purpose**: Detect canonical misalignments and validate that all packages are properly registered.

**Command**: `npm run validate:workspace:orchestration`

**Validates**:
- ✅ All workspace packages have orchestration domain registrations
- ✅ All plugin dependencies are registered in orchestration registry
- ✅ Coverage metrics (workspace coverage, dependency coverage, registry completeness)
- ✅ Categorization by package type (UI Plugins, Infrastructure, External)

**Output**:
- CRITICAL issues: Workspace packages without orchestration domains
- HIGH issues: Plugin dependencies without orchestration domains
- Governance recommendations with resolution paths
- Coverage summary statistics

### 2. Registration Script: `register-infrastructure-orchestrations.js`

**Purpose**: Automatically register infrastructure packages that were missing from the orchestration registry.

**Command**: `npm run register:infrastructure:orchestrations`

**Registers**:
- `host-sdk-infrastructure` - Core plugin hosting environment
- `manifest-tools-infrastructure` - Manifest generation and validation tools
- `components-library-infrastructure` - Foundational component library
- `digital-assets-infrastructure` - Asset management system

**Parent Assignments**:
- Infrastructure packages → `safe-continuous-delivery-pipeline` or `renderx-web-orchestration`

### 3. Visualization Scripts: `visualize-domains.js`

**Purpose**: Multiple ASCII visualizations for understanding domain architecture.

**Commands**:
```bash
npm run visualize:domains              # Executive summary (default)
npm run visualize:domains:hierarchy    # Domain hierarchy sketch
npm run visualize:domains:network      # Network topology visualization
npm run visualize:domains:stats        # Registry statistics
npm run visualize:domains:categories   # Domains grouped by category
npm run visualize:domains:matrix       # Parent-child dependency matrix
npm run visualize:domains:blueprint    # RenderX Web orchestration blueprint
npm run visualize:domains:all          # All visualizations at once
```

### 4. Query Script: `query-domains.js`

**Purpose**: Advanced querying and inspection of orchestration registry.

**Commands**:
```bash
npm run query:domains -- list [--category=X]    # List all domains
npm run query:domains -- search "pattern"       # Search by name/ID
npm run query:domains -- show <domain-id>       # Show detailed info
npm run query:domains -- filter [options]       # Advanced filtering
npm run query:domains -- stats [--category=X]   # Statistics
npm run query:domains -- children <domain-id>   # List children
npm run query:domains -- tree                   # Hierarchy tree
```

## Current Registry State

```
Total Domains: 72
├─ Orchestrations: 13 (7 top-level + 6 sub-domains)
├─ Infrastructure: 4 (new additions)
└─ Plugins: 55 (50 RenderX UI plugins + 5 other)

Hierarchy Structure:
├─ safe-continuous-delivery-pipeline (top-level)
│  ├─ renderx-web-orchestration (sub-domain)
│  │  ├─ 30 canvas-* domains
│  │  ├─ 13 control-panel-* domains
│  │  ├─ 2 header-ui-* domains
│  │  ├─ 4 library-* domains
│  │  ├─ 1 real-estate-* domain
│  │  └─ 1 musical-conductor-orchestration
│  ├─ host-sdk-infrastructure
│  └─ manifest-tools-infrastructure
│
├─ renderx-web-orchestration
│  ├─ components-library-infrastructure
│  └─ digital-assets-infrastructure
│
└─ [Other top-level orchestrations...]
```

## Canonical Alignment Summary

**Before Registration**:
- Workspace Coverage: 6.7% (1/15 packages)
- Dependency Coverage: ~7% (1/14 plugins)
- Registry Completeness: ⚠️ INCOMPLETE

**After Infrastructure Registration**:
- All infrastructure packages now have orchestration domains
- Canonical alignment fully documented
- Workspace-Registry-Dependency triple validated

## Governance Rules

The system enforces:

1. **Every workspace package must have an orchestration domain**
   - Each package is a first-class citizen in the orchestration system
   - Enables traceability and dependency management

2. **Orchestration domains must form a DAG hierarchy**
   - Parent-child relationships must be acyclic
   - Enables proper composition and ordering

3. **Dependencies must align with orchestration structure**
   - Package.json dependencies should match orchestration domains
   - Enables verification of canonical state

4. **Categories must be consistent**
   - orchestration, plugin, infrastructure, catalog
   - Enables proper classification and filtering

## Integration with Build Pipeline

Add to `pre:manifests` script or governance enforcement:

```json
"validate:governance": "npm run validate:workspace:orchestration && npm run validate:domains"
```

This ensures canonical alignment is validated on every build.

## Usage Examples

### Find all RenderX UI plugins
```bash
npm run query:domains -- filter --category=plugin --wildcard="canvas-*"
```

### Show renderx-web orchestration tree
```bash
npm run visualize:domains:blueprint
```

### Check workspace alignment
```bash
npm run validate:workspace:orchestration
```

### View full domain hierarchy
```bash
npm run visualize:domains:hierarchy
```

### See dependency matrix
```bash
npm run visualize:domains:matrix
```

## Benefits

✅ **Canonical Authority**: Single source of truth for package/domain relationships
✅ **Discrepancy Detection**: Automatic detection of misaligned packages
✅ **Hierarchical Organization**: Clear parent-child composition model
✅ **Rich Visualization**: Multiple views for understanding architecture
✅ **Governance Enforcement**: Prevents registration of untracked packages
✅ **Traceability**: Complete audit trail of all domain relationships
