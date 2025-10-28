# @renderx-plugins/manifest-tools

Shared builders and types for RenderX plugin manifests.  
Extracted from the [renderx-plugins-demo](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo) project for standalone use in thin client hosts and plugin pipelines.

## Features

- **Pure ESM utilities** for building and validating manifest JSONs.
- **Build interaction manifests** from plugin route catalogs and component-level overrides.
- **Build topics manifests** from topic catalogs, supporting payload schemas, visibility, and correlation keys.
- **Type definitions** for manifest shapes (InteractionManifest, TopicsManifest, LayoutManifest).

## Usage

Install via npm:

```sh
npm install @renderx-plugins/manifest-tools
```

Import and use in Node scripts or build pipelines:

```js
import { buildInteractionManifest, buildTopicsManifest } from '@renderx-plugins/manifest-tools';

// Example: Build interaction manifest
const manifest = buildInteractionManifest(pluginCatalogs, componentOverrides);

// Example: Build topics manifest
const topics = buildTopicsManifest(topicCatalogs);
```

## API

### `buildInteractionManifest(catalogs, componentOverrideMaps)`

- Merges route catalogs and component overrides into a single manifest.
- Returns `{ version, routes }`.

### `buildTopicsManifest(catalogs)`

- Aggregates topic definitions from catalogs.
- Returns `{ version, topics }`.

### Types

- `InteractionManifest`
- `TopicsManifest`
- `LayoutManifest`

## Typical Workflow

1. **Aggregate plugin route catalogs** and component overrides.
2. **Generate interaction-manifest.json** for host orchestration.
3. **Generate topics-manifest.json** for event routing and validation.
4. **Integrate with RenderX thin client** or plugin build scripts.

## Example Integration

See [scripts/generate-interaction-manifest.js](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/blob/main/scripts/generate-interaction-manifest.js) for usage in a build pipeline.

## Publishing & Consumption

- Published as an ESM npm package.
- Used by thin hosts to build and validate plugin manifests.
- Supports artifact integrity workflows (see RenderX docs for details).

## License

MIT
