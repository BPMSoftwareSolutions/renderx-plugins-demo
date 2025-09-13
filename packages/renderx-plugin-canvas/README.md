# @renderx-plugins/canvas

Core visual workspace surface for RenderX. The Canvas plugin supplies the host‑embeddable React page (`CanvasPage`) that: (1) exposes a drop surface for library components/containers, (2) renders a lightweight header with zoom + mode toggles + import/export affordances, and (3) reserves an isolated DOM mount (`#rx-canvas`) where Stage‑Crew (the orchestration/runtime layer) paints actual component instances. UI chrome stays intentionally “dumb” – all authoritative state flows through the host conductor + event / interaction routing.

## Why It Exists
Design / interaction tooling tends to blend structural UI (panels, headers, grids) with runtime mutation logic. We separate them: this plugin owns only the visual shell & user gestures (drag, drop, zoom, mode switches, export buttons). Mutation, persistence, selection resolution, export pipelines, and performance heuristics live in specialized handler / symphony plugins (e.g. `@renderx-plugins/canvas-component`). This keeps the Canvas surface stable and cheap to re-render while letting interaction logic evolve independently.

## Key Capabilities
| Capability | Summary | Implementation Notes |
| ---------- | ------- | -------------------- |
| Drop Surface | Accepts components & containers via HTML5 drag/drop | Normalizes drop coordinates; forwards to library drop interactions (topic: `library.*.drop.requested`). |
| Mode Switching | Select / Move / Draw placeholders | Local React state only; hooks for future behavior wiring. |
| Zoom Controls | +/- controls 25–200% | Pure UI state today; future: broadcast zoom to stage crew. |
| Export Triggers | Generic export + GIF / MP4 (when element selected) | Resolves interactions: `canvas.component.export*` sequences. |
| Import Trigger | Launches import flow | Publishes topic `canvas.component.import.requested`. |
| Selection Awareness | Enables export buttons only when something is selected | Subscribes to `canvas.component.selection.changed` via `EventRouter`. |
| Grid & Visual Hints | Background micro‑grid + drop indicator | Pure CSS; no layout coupling. |
| StageCrew Mount | Dedicated `<div id="rx-canvas"/>` | Runtime injects managed DOM nodes; Canvas never queries them. |

## Architectural Principles
1. Event / Interaction Boundary: Canvas never mutates domain state directly; it publishes topics or plays resolved interaction sequences.
2. Stateless Shell: Persistent model state (components, selection) is external; Canvas reacts to events (e.g. selection changed).
3. Performance Hygiene: Drag/drop delegates high‑frequency work to handler plugins that implement coalescing; Canvas only initiates.
4. Testability: Core user gestures are funneled into small functions (e.g. `onDropForTest`) enabling deterministic unit tests.
5. Forward Compatibility: A minimal async `register()` hook allows future initialization (feature flags, preloading) without a breaking API change.

## High-Level Flow (Drop → Render)
1. User drags a library item over `CanvasPage`.
2. `onDropForTest` extracts the serialized component + computes normalized coordinates (container‑aware).
3. Publishes `library.component.drop.requested` (or container variant) with callbacks for drag lifecycle + selection.
4. Library / component orchestration sequence materializes the component and instructs Stage‑Crew to render into `#rx-canvas`.
5. Separate selection / drag handlers emit events the Canvas header listens to for enabling exports.

## Public Surface
```ts
import { CanvasPage, register } from '@renderx-plugins/canvas';
```
`CanvasPage` – React component (no props required) that assumes a `ConductorProvider` (or equivalent) higher in the tree supplying `useConductor()`.

`register()` – async, currently no‑op, reserved for deferred initialization (preloading fonts, feature flag hydration, etc.). Safe to call multiple times.

## Integration Example
```tsx
import React from 'react';
import { CanvasPage, register } from '@renderx-plugins/canvas';

export function AppShell() {
	React.useEffect(() => { register(); }, []);
	return <CanvasPage />;
}
```

## Feature Roadmap (Indicative)
- Live zoom propagation to runtime render layer.
- Keyboard shortcuts for mode switching & zoom.
- Inline marquee selection overlay (delegated to interaction plugin but visually hosted here).
- Configurable grid density + snap toggles.
- Lazy hydration of export buttons based on capability discovery.

## Separation From `@renderx-plugins/canvas-component`
`canvas` = visual shell & user affordances.
`canvas-component` = high-frequency interaction handlers (drag, resize, select, export pipelines, performance gating).

This split ensures: smaller bundle for host embedding, clearer performance boundaries, and independent versioning of heavy logic.

## Contributing (Local Monorepo)
Source of truth currently resides in `plugins/canvas/ui/*`. During extraction each file will migrate into this package's `src/` directory and the re-export indirection will be removed.

Recommended loop:
1. Modify a UI element under `plugins/canvas/ui`.
2. Run `npm run dev` (or `npm run build:packages`).
3. Exercise drag/drop & exports in the host demo.
4. Add/adjust corresponding interaction tests under root test suites.

## Testing Notes
The component favors event publication over internal state, so unit tests assert on emitted topics / interaction invocations rather than DOM mutation. Use `onDropForTest` to simulate pointer operations without constructing full DragEvent objects.

## License
Follows root project license (TBD upon extraction).

---
Minimal surface, strong boundaries, future‑proof initialization – the Canvas plugin is the stable anchor for richer interaction layers above it.
