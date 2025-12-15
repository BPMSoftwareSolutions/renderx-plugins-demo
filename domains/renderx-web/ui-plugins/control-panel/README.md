# @renderx-plugins/control-panel

A React-based control panel UI library for the RenderX plugin ecosystem that provides dynamic property editing, CSS class management, and real-time component configuration capabilities.

## Key Features

- **Dynamic Property Editing**: Schema-driven UI generation for editing component properties in real-time
- **CSS Class Management**: Built-in tools for creating, editing, and applying CSS classes to selected elements
- **Configurable Schema**: Runtime configuration via JSON schema with fallback defaults
- **Plugin Architecture**: Seamless integration with the RenderX plugin system via sequences and event handlers
- **Theme Integration**: CSS artifact generation with theme variable support for consistent styling
- **TypeScript Support**: Full TypeScript definitions for type-safe integration

## Usage

The control panel automatically generates property editing interfaces based on JSON schemas and provides a complete UI for managing element properties, classes, and styling within RenderX-powered applications.

**Topics**: `react`, `ui-library`, `control-panel`, `property-editor`, `css-management`, `plugin-system`, `typescript`, `schema-driven`, `renderx`

## Runtime configuration schema

- Source file: `src/config/control-panel.schema.json`
- Build sync: `scripts/sync-control-panel-config.js` copies the schema into the host's public folder during `pre:manifests`.
- Runtime location (fetched by the UI): `/plugins/control-panel/config/control-panel.schema.json`
- Fallback: If the file is absent, the UI falls back to a small built-in default via `useSchemaResolver`.

### Customize the Control Panel schema

1) Edit `packages/control-panel/src/config/control-panel.schema.json`.
2) Run `npm run pre:manifests` or any build that invokes it (e.g., `npm test`).
3) The schema will be published to `public/plugins/control-panel/config/control-panel.schema.json`.

## CSS artifact used by tests

The package emits `dist/index.css`. A repo test (`__tests__/ui/panels.theme.spec.ts`) asserts panel CSS uses theme variables by reading:
- `node_modules/@renderx-plugins/library/dist/ui/LibraryPanel.css`, and
- `packages/control-panel/dist/index.css` (this package)

Ensure `tsup` runs before tests (it does as part of the repo test setup) so `dist/index.css` exists.
---
This package is designed to be externalized from larger RenderX plugin demo projects and can be used independently in any React application requiring dynamic UI configuration capabilities.
