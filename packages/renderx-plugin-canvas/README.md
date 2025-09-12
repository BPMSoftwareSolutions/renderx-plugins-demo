# @renderx-plugins/canvas

Experimental extraction of the Canvas plugin from the `renderx-plugins-demo` monorepo. This package will become the standalone `@renderx-plugins/canvas` publishable artifact. While it lives here it is namespaced `@renderx-plugins/canvas-local` and marked private.

## Status
- Development / staging
- Version: `0.0.0-private`
- API surface intentionally tiny (only `CanvasPage` + `register()` proxy)

## Exports
```ts
import { CanvasPage, register } from '@renderx-plugins/canvas';
```
Currently the local workspace build simply re-exports from the original plugin source under `plugins/canvas/`.

## `register()`
`register()` is async and currently a no‑op placeholder. It is provided to keep a consistent shape with other plugins and to support future sequence mounting without a breaking change.

## Usage (local monorepo)
```ts
import { CanvasPage, register } from '@renderx-plugins/canvas-local';
await register();
```

## Build
The build uses `tsup` to output ESM only:
```json
"build": "tsup src/index.ts --format esm --out-dir dist --clean"
```
Artifacts land in `dist/`.

## Testing
```bash
npm -w @renderx-plugins/canvas-local run test
```
Runs `vitest` with `vitest.config.ts` from this package (inherits root config if present).

## Local Development Flow
1. Edit source in `plugins/canvas` (authoritative for now) or migrate code directly into `packages/renderx-plugin-canvas/src` once decoupled.
2. Run root build: `npm run build:packages` (invokes this package's build).
3. Consume via the demo app or tests.

## Migration Plan (high level)
- [ ] Move actual implementation files from `plugins/canvas/` into this package `src/`.
- [ ] Replace re-export with internal relative imports.
- [ ] Add proper public API hash generation & validation step.
- [ ] Remove `-local` suffix and set `private: false` prior to publishing.
- [ ] Publish with a semver tag (likely `0.1.0`).

## Publishing (future)
When ready to publish:
1. Rename in `package.json` to `@renderx-plugins/canvas`.
2. Set `private: false`.
3. Ensure build + tests + public API check pass.
4. `npm publish --access public`.

## License
Follows the root project license (TBD if extracted).
