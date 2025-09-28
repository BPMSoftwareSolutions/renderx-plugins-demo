# Strategy: Story-driven Event Router Canvas (.ui)

Objective
- Build a one-page story canvas using containers for contextual boundaries and nested SVGs for each scene.
- Keep schema simple, manifest-driven, and compatible with the plugin canvas importer.

Principles
- Containers = contextual boundaries (one per scene); carry CSS class `rx-container` and optional background.
- Nest all scene visuals as `type: "svg"` children inside their scene container.
- Prefer semantic IDs for containers (e.g., `scene-3`, `scene-4`, `scene-5`, ...).
- Inline small `svgMarkup` snippets to keep files light; reuse labels that tests assert.
- Keep viewBox, translateY, and horizontal animation conventions consistent with scenes.

Layout
- 2 rows x N columns grid; ensure each container has adequate width/height for legibility.
- Reserve bottom row for Destination and any epilogue/legend.

Styling
- Use built-in `rx-container` with dashed boundary to visually convey scope.
- Optionally extend via CSS variables: `--bg`, `--padding` per container for variety.

Testing (enforcement of contextual boundaries)
- Unit test reads .ui JSON and asserts:
  - presence of `rx-container` class and ≥3 containers
  - all `svg` nodes have a non-null `parentId` that is a container id
  - content cues include BUS and PEOPLE/SUBSCRIBER labels
  - expected scene container IDs exist (scene-3/4/5, etc.)

People usage
- Include a small people-at-stop snippet in Subscribers scene; label text includes `PEOPLE` for testability.

Future enhancements
- Add Scene 6/7 containers with mini-overviews (Boundaries, Route Map) if we want full parity with integrated SVGs.
- Introduce `defs`/`symbol` blocks if we add a build step to de-duplicate shared bus geometry.
- Consider a manifest that maps canvas container IDs to scene mapping JSON files for dynamic assembly.

