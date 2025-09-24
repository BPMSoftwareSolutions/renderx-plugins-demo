# ADR-0036 — Topics manifest derived solely from plugin-served sequences

- Status: Accepted
- Date: 2025-09-24
- Related: Issue #238 — Remove internal json-topics; generate topics-manifest only from plugin-served sequences

## Context
Historically, the host kept topic catalogs under `catalog/json-components/json-topics/*` (and occasionally `json-topics/*`) and merged them with derived topics. This coupled the thin host to plugin topic definitions and created drift risks.

We already consume plugin-served sequences (synced into `public/json-sequences/`) and have logic to derive topic keys and interaction routes from those sequences.

## Decision
- Remove internal json-topics catalogs from this repo.
- Generate `topics-manifest.json` exclusively from plugin-served sequences discovered under `public/json-sequences/` (see `scripts/derive-external-topics.js`).
- Update `scripts/generate-topics-manifest.js` to stop reading local topic catalogs and build the manifest solely from the derived external catalog.

## Consequences
- Topic additions/changes now happen in plugin packages by adding/updating sequence JSON and exporting them from the plugin’s `json-sequences/index.json`.
- The host becomes thinner and enforces a clean boundary: topics are data-driven from plugins.
- ESLint topic checks and runtime validation rely on the generated manifest; any missing topic indicates the plugin did not export the corresponding sequence.

## Implementation notes
- Deleted `catalog/json-components/json-topics/*`.
- `scripts/generate-topics-manifest.js`: removed merge with local catalogs; now calls `generateExternalTopicsCatalog()` and builds the manifest from that result only.
- Documentation updated (`docs/adding-a-topic.md`) to reflect that topics are derived; no manual manifest entries in the host.

## Alternatives considered
- Keep local catalogs as fallback behind a flag. Rejected to avoid split sources of truth; the default (and only) path should be plugin-served sequences.

## How to add a new topic now
1) In the plugin, add a sequence JSON with a stable `id` following the naming rules (kebab → dot, orchestration sequences end with `.requested`).
2) Export it from the plugin’s `json-sequences/index.json`.
3) Run `npm run pre:manifests` in the host to regenerate manifests.

## Links
- Issue: https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/238
- Derivation: `scripts/derive-external-topics.js`
- Manifest generation: `scripts/generate-topics-manifest.js`

