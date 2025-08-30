## Using the Host SDK (@renderx/host-sdk)

This guide shows how plugins should interact with the host through the stable SDK instead of importing host internals from src/**.

### Install/resolve
- In this repo, the SDK is provided as a local workspace package.
- In external plugin repos, add a dev dependency to @renderx/host-sdk matching the host version.

### Import examples
```ts
import { useConductor, EventRouter, resolveInteraction } from "@renderx/host-sdk";
```

For feature flags:
```ts
import { isFlagEnabled, getFlagMeta } from "@renderx/host-sdk";
```

### Do
- Publish events and let sequences route via EventRouter:
```ts
await EventRouter.publish("canvas.component.drag.move", { id, position }, conductor);
```
- Resolve interactions via resolveInteraction and call conductor.play():
```ts
const r = resolveInteraction("control.panel.update");
await conductor.play(r.pluginId, r.sequenceId, payload);
```
- Use useConductor() in UI to get the singleton conductor instance.

### Don’t
- Don’t import from src/** inside plugins/** (enforced by ESLint).
- Don’t bypass sequencing. Always go through conductor.play() or EventRouter.publish().
- Don’t manipulate DOM/CSS in UI; do it in stage‑crew handlers.

### PanelSlot module specifiers
Plugin UIs can be referenced by:
- Path: "/plugins/…" (transition period)
- Package name: "@org/plugin"
- URL: "https://cdn.example.com/plugin.mjs" (browser; Node/test falls back gracefully)

### Troubleshooting
- ESLint error: "Plugins must not import host internals" → switch to SDK imports.
- Node/test error when importing https URLs in PanelSlot is expected; tests assert graceful fallback.

