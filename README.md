# @renderx-plugins/components

JSON component definitions for RenderX-based hosts. This package publishes a catalog of components (as JSON) that thin hosts can serve and plugins can consume without coupling.

## What is this?

- A versioned set of JSON component files (button.json, image.json, etc.)
- An index.json listing all component files (contract used by hosts)
- A package.json `renderx.components` declaration so hosts can auto-discover the assets

## Install

```bash
npm install @renderx-plugins/components
```

## How hosts consume these components

1) Discovery and copy (dev/build):
   - Hosts scan `node_modules` for packages with `renderx.components`
   - Hosts copy the declared folders to `/public/json-components`
2) Runtime (browser):
   - Host fetches `/json-components/index.json`
   - Then fetches each file listed there

## Package contract

- `index.json` must enumerate all component files:
```json
{
  "version": "1.0.0",
  "components": ["button.json","input.json","image.json"]
}
```

- Each component JSON includes stable metadata (keep additive; breaking changes require a major bump):
```json
{
  "id": "button",
  "metadata": { "name": "Button" },
  "template": { "type": "html", "markup": "<button>Click</button>" }
}
```

- `package.json` must declare the component folders so hosts can discover them:
```json
{
  "name": "@renderx-plugins/components",
  "version": "0.1.0",
  "renderx": { "components": ["json-components"] }
}
```

## Repository layout

- `json-components/` — component files (one `<type>.json` per component)
- `json-components/index.json` — list of component files (single source of truth)
- `tests/` — unit tests and schema checks (Vitest recommended)

## Versioning policy

- Patch: fixes to existing component JSON (no schema/ID changes)
- Minor: add new components or additive fields
- Major: remove/rename components, change IDs, or breaking schema changes

## Validation & testing

- Include JSON Schema and tests to validate each component file
- Ensure `index.json` lists every component file and has no stale entries

## Publishing

```bash
npm version <patch|minor|major>
npm publish --access public
```

## Why a separate package?

- Decouples the thin host from component data
- Enforces clean boundaries and consistency across hosts
- Enables reuse and independent versioning of component catalogs

## License

MIT
