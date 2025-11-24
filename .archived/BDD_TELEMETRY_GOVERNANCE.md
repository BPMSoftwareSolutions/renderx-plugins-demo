# BDD Telemetry Governance

"Every Business BDD test must emit a telemetry shape." This elevates executable specifications into **observable** specifications.

## Required Signal Fields

- feature (string)
- event (string)
- beats (number of internal steps)
- status (ok | warn | error)
- correlationId (UUID tying sequence)
- Optional: durationMs, sequenceSignature, batonDiffCount, payload

## Why
1. BDD becomes executable observability: specs assert outcomes *and* self-observation.
2. Tests form a bi-directional conversation: system must "speak" via telemetry.
3. Telemetry is part of feature definition: absence is non-compliant.

## Usage
Use `emitFeature(feature, event, run)` or manual `startFeature/beat/endFeature` to instrument steps. Install matcher and assert:

```ts
expect(record).toHaveTelemetry({ feature: 'login', event: 'login:completed' });
```

## Governance Enforcement (Initial)
`scripts/enforce-bdd-telemetry.js` runs heuristic checks; will evolve to per-spec telemetry persistence and strict validation.
