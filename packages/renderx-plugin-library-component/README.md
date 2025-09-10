# @renderx-plugins/library-component (temporary in-repo)

This is a temporary runtime-only package that registers Library-Component drag/drop sequences.
It exists in-repo to support decoupling and will be extracted to its own repository and
published to npm under `@renderx-plugins/library-component`.

- Entry: `src/index.ts`
- Export: `register(conductor)`
- Sequences: drag, drop, container-drop

Once externalized, this package will depend only on the Host SDK and its own handlers.

