# ADR-0021 — Layout Manifest and Dynamic Slot Configuration

**Status:** Accepted  
**Date:** 2025-08-29  
**Related Issue:** [#61 - Make slot panels fully data-driven: layout manifest + dynamic slot configuration](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/61)

## Context

The application layout was previously hardcoded in App.tsx with fixed slot names and CSS grid properties:

1. **Hardcoded Slot Names**: PanelSlot component used union types `"library" | "canvas" | "controlPanel"`, making it impossible to add new slots without code changes
2. **Inflexible Layout**: Grid layout (`320px 1fr 360px`) was hardcoded in App.tsx, preventing responsive behavior or layout customization
3. **No Layout Manifest**: Unlike interactions and topics, layout configuration had no JSON-driven manifest system
4. **Maintenance Burden**: Adding new slots or changing layout required TypeScript changes, ESLint rule updates, and multiple file modifications

This approach conflicted with the platform's manifest-driven architecture used for plugins, interactions, and topics.

## Decision

We have decided to implement a layout manifest system that makes slot panels fully data-driven:

### Core Components

1. **Layout Manifest Schema** (`public/layout-manifest.json`):
   - Grid-based layout definition with columns, rows, and areas
   - Responsive overrides for different viewport sizes
   - Slot constraints (minWidth, maxWidth, className)
   - Follows existing manifest patterns (version, fetch-based browser availability)

2. **LayoutEngine Component** (`src/layout/LayoutEngine.tsx`):
   - Loads layout-manifest.json dynamically
   - Renders CSS Grid container with manifest-defined properties
   - Applies responsive overrides using matchMedia
   - Handles fallback to legacy layout when manifest fails

3. **Dynamic Slot Names** (`src/components/PanelSlot.tsx`):
   - Changed from hardcoded union type to `string`
   - Maintains existing plugin-manifest.json integration
   - Graceful error handling for unknown slot names

4. **Feature-Flagged Rollout** (`src/App.tsx`):
   - Controlled by `ui.layout-manifest` feature flag
   - Backward compatible fallback to legacy 3-column layout
   - Zero breaking changes when flag disabled

### Generation Script

Following the established pattern of `scripts/generate-interaction-manifest.js` and `scripts/generate-topics-manifest.js`:

- **Source**: `json-layout/*.json` catalogs
- **Output**: `layout-manifest.json` (repo root) and `public/layout-manifest.json` (browser)
- **Integration**: Added to `pre:manifests` script chain
- **Extensibility**: Supports multiple layout catalogs with merge precedence

### ESLint Rules

Five new rules enforce the manifest-driven pattern and prevent regression:

1. `no-hardcoded-slot-names`: Prevents hardcoded slot union types
2. `no-hardcoded-layout-styles`: Prevents inline grid styles outside `src/layout/**`
3. `require-slot-manifest-registration`: Requires slot literals to exist in manifest
4. `no-layout-logic-in-components`: Prevents layout computation outside `src/layout/**`
5. `require-manifest-validation`: Requires `validateLayoutManifest()` call in LayoutEngine

## Implementation

### Layout Manifest Schema

```json
{
  "version": "1.0.0",
  "layout": {
    "kind": "grid",
    "columns": ["320px", "1fr", "360px"],
    "rows": ["1fr"],
    "areas": [["library", "canvas", "controlPanel"]],
    "responsive": [
      {
        "media": "(max-width: 900px)",
        "columns": ["1fr"],
        "areas": [["library"], ["canvas"], ["controlPanel"]]
      }
    ]
  },
  "slots": [
    { "name": "library", "constraints": { "minWidth": 280 } },
    { "name": "canvas", "constraints": { "minWidth": 480 } },
    { "name": "controlPanel", "constraints": { "minWidth": 320 } }
  ]
}
```

### File Changes

- **Modified**: `src/App.tsx`, `src/components/PanelSlot.tsx`, `eslint.config.js`, `data/feature-flags.json`, `package.json`
- **Added**: `src/layout/LayoutEngine.tsx`, `src/layout/layoutManifest.ts`, `public/layout-manifest.json`, `scripts/generate-layout-manifest.js`, `json-layout/default.json`
- **Added**: 5 ESLint rules in `eslint-rules/`
- **Added**: 9 comprehensive tests in `__tests__/layout/` and `__tests__/eslint-rules/`

## Consequences

### Benefits

1. **Manifest-Driven Architecture**: Layout joins interactions and topics as a JSON-configurable system
2. **Dynamic Slot Configuration**: New slots can be added via JSON without code changes
3. **Responsive Layout Support**: Media queries and viewport-specific overrides built-in
4. **Backward Compatibility**: Feature-flagged rollout with zero breaking changes
5. **ESLint Enforcement**: Prevents regression to hardcoded patterns
6. **Comprehensive Testing**: 9 new tests covering all scenarios including fallback behavior

### Trade-offs

1. **Complexity**: Additional abstraction layer over direct React components
2. **Runtime Overhead**: Manifest loading and validation on each render
3. **Learning Curve**: Developers must understand manifest schema and LayoutEngine

### Migration Path

1. **Phase 1** (Current): Feature flag `off`, all tests passing, backward compatible
2. **Phase 2**: Enable feature flag `on` for testing and validation
3. **Phase 3**: Remove legacy fallback code after successful rollout

## Alternatives Considered

1. **Columns-First Schema**: Simpler for 3-column case but less expressive for complex layouts
2. **CSS-in-JS Solution**: Rejected to maintain consistency with existing CSS Grid approach
3. **Component-Level Configuration**: Rejected in favor of centralized manifest approach
4. **Direct Manifest Editing**: Rejected in favor of generation script for consistency

## Follow-ups

1. Add layout manifest validation schema (JSON Schema)
2. Extend responsive capabilities (breakpoint names, container queries)
3. Add layout preview/debugging tools for development
4. Consider layout themes/presets for different use cases
5. Integrate with design system tokens for consistent spacing/sizing

## Testing

- **Unit Tests**: 4 layout component tests (manifest loading, responsive, fallback, string slots)
- **ESLint Tests**: 5 rule enforcement tests
- **Integration**: All 230 existing tests continue to pass
- **Coverage**: Manifest parsing, dynamic rendering, responsive behavior, error handling
