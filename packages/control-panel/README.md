# @renderx-plugins/control-panel

This package hosts the externalized Control Panel UI, sequences, and related handlers.

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

