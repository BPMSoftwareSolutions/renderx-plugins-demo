# @renderx-plugins/library-component

Runtime package that registers the Library Component drag/drop sequences for RenderX.

- Entry: `src/index.ts`
- Export: `register(conductor)`
- Sequences: `drag`, `drop`, `container-drop`
- Types: bundled `.d.ts` (tsup dts)
- Peer dependency: `@renderx-plugins/host-sdk`

> Note: This is a pre-release (0.1.0-rc.0). API surface is stable for current host usage, but may have minor breaking changes prior to 1.0.

## Install

```bash
npm install @renderx-plugins/library-component @renderx-plugins/host-sdk
# or
pnpm add @renderx-plugins/library-component @renderx-plugins/host-sdk
# or
yarn add @renderx-plugins/library-component @renderx-plugins/host-sdk
```

## Usage

```ts
import { register as registerLibraryComponent } from '@renderx-plugins/library-component';
// Your application should provide a Musical Conductor instance
import { conductor } from '@renderx-plugins/host-sdk';

registerLibraryComponent(conductor);
```

This call registers the library-component sequences so your app can:
- start a drag with a preview ghost (no setDragImage fallbacks included)
- drop components onto the canvas (root or container drops)

## Events

Handlers publish standard Host SDK events (abbrev.):
- `canvas.component.create.requested` — emitted on drop with component payload

## Requirements
- Node 18+
- RenderX Host SDK `@renderx-plugins/host-sdk` (declared as peer dep)

## License
MIT
