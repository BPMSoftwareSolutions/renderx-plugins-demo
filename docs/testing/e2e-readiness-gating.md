# E2E: Deterministic App Readiness Gating (Playwright)

## Summary
Flaky E2E runs in CI are caused by tests starting while the SPA is still booting (sequences/plugins mounting, DOM wiring). This proposes a deterministic readiness handshake: the app emits a "ready" signal, and tests explicitly wait for it. No arbitrary sleeps.

## Background
- Current Playwright `webServer` only checks the preview URL is up; it doesn't ensure the SPA has mounted.
- Logs show tests running during plugin mount and event-routing initialization.
- Relying on `networkidle` isn't robust (HMR, sockets) and log scraping is brittle.

## Proposal
Introduce a small in-page readiness contract and a test-side waiter:

App (index.tsx):
- After core boot (initConductor, registers, manifests, EventRouter) and first paint:
  - `window.RenderX.conductor = conductor` (already used by UI wiring)
  - `document.body.dataset.renderxReady = "1"`
  - `window.__RENDERX_READY__ = true`
  - `window.dispatchEvent(new Event('renderx:ready'))`

Tests:
- Use a helper `waitForAppReady(page)` that resolves when any of the above is observed (event, flag, or body attribute). Optional: assert a stable DOM anchor exists (e.g., `#rx-canvas`).
- For stricter needs, add `window.__RENDERX_PLUGINS_READY__` + `'renderx:plugins-ready'` after plugins mount and wait for those in specific suites.

Server orchestration (decided):
- Use an external server in CI, then `page.goto(baseURL)` → `waitForAppReady()`.
- Do not rely on Playwright `webServer` in CI. (You may keep it locally for convenience.)

## ASCII Flows

High-level startup and gating:
```
CI/Local
│
├─ Build → Start preview server (fixed port)
├─ (optional) Wait for /healthz 200
│
└─ Playwright: page.goto('/') → waitForAppReady() → run tests
```

In-page handshake:
```
(async main)
  initConductor()
  registerAllSequences()
  initInteractionManifest()
  initTopicsManifest()
  EventRouter.init()
  startupValidation()
  root.render(<App />)
  queueMicrotask → rAF → {
    window.RenderX.conductor = conductor
    document.body.dataset.renderxReady = '1'
    window.__RENDERX_READY__ = true
    window.dispatchEvent(new Event('renderx:ready'))
  }
```

Strict plugin-ready variant:
```
PluginManager mounts → on success {
  window.__RENDERX_PLUGINS_READY__ = true
  window.dispatchEvent(new Event('renderx:plugins-ready'))
}
```

---

### True gating with external server and in-page ready signal

CI: external server → health gate → tests → in-page ready gate

```
CI Job
│
├─ npm run build
├─ Start preview server (fixed port, strictPort)
├─ Wait for /healthz 200 (or wait-on URL)
│
├─ Run Playwright tests
│   ├─ page.goto(baseURL)
│   └─ waitForAppReady()
│       ├─ await 'renderx:ready' (event)  ──┐
│       ├─ or window.__RENDERX_READY__     │  Any one of these
│       └─ or body[data-renderx-ready="1"]  ┘  unblocks the gate
│
└─ Teardown (kill server)
```

In-page readiness handshake (deterministic, no timeouts)

```
Browser Page (index.tsx)
│
├─ await initConductor()
├─ await registerAllSequences()
├─ await initInteractionManifest()
├─ await initTopicsManifest()
├─ await EventRouter.init()
├─ (optional) startupValidation()
├─ root.render(<App />)
│
└─ queueMicrotask → requestAnimationFrame → signal ready:
      window.RenderX.conductor = conductor
      document.body.dataset.renderxReady = "1"
      window.__RENDERX_READY__ = true
      window.dispatchEvent(new Event('renderx:ready'))
```

Test-side waiter (conceptual)

```
waitForAppReady(page):
  race(
    'renderx:ready' event,
    window.__RENDERX_READY__ === true,
    selector: body[data-renderx-ready="1"]
  )
```

Strict plugin-ready variant (when a suite needs plugins mounted)

```
App / Plugin Manager
│
├─ Mount plugins
├─ On success:
│    window.__RENDERX_PLUGINS_READY__ = true
│    window.dispatchEvent(new Event('renderx:plugins-ready'))
│
└─ (Optional) expose per-plugin flags: window.RenderX.plugins.{name}.mounted = true
```

Test waiter

```
waitForPluginsReady(page):
  race(
    'renderx:plugins-ready' event,
    window.__RENDERX_PLUGINS_READY__ === true
  )
  // optionally assert specific UI anchors/components exist
```

Alternative: external server + Playwright reuseExistingServer

```
CI Job
│
├─ Start preview server (fixed port)
├─ Playwright config: webServer.reuseExistingServer = true
│
└─ Playwright verifies URL is up → runs tests → waitForAppReady() as above
```

Failure/diagnostics flow (guardrails)

```
waitForAppReady(timeout T)
│
├─ if gate not met by T:
│    ├─ dump last N console logs
│    ├─ capture network errors / 404s on bundles
│    └─ include suggestions:
│         - check ready emitter code path
│         - check event name / flag mismatch
│         - increase T only if startup legitimately longer
└─ else: proceed with assertions
```

## Implementation Plan
1) App signal
- src/index.tsx: set `RenderX.conductor` and emit ready signal after first paint (rAF).

2) Test helper
- e2e/support/appReady.ts: `waitForAppReady(page, { timeout=10000 })`
  - race: event 'renderx:ready' | flag | body[data-renderx-ready="1"]
  - on timeout: dump last N console logs for diagnostics.

3) Apply gate
- Add `test.beforeEach` in e2e suites to call `page.goto(baseURL)` and `waitForAppReady(page)`.
- Suites needing plugins: add `waitForPluginsReady(page)`.

4) Server orchestration (CI)
- Start preview server manually on a fixed port with `strictPort`.
- Wait for `/healthz` (or base URL) before running Playwright.
- Remove or ignore Playwright `webServer` in CI; tests just `page.goto(baseURL)`.

## Phased implementation checklist

Phase 0 — Preparation (external server decided)

- [ ] Lock a fixed preview port and enable `strictPort` (vite preview or custom server).
- [ ] (Optional) Add `/healthz` endpoint or select a URL for `wait-on` readiness in CI.
- [ ] Ensure Playwright `baseURL` matches the chosen port for CI and local.

Exit criteria: Fixed port + strictPort in place; baseURL aligned.

Phase 1 — App readiness signal

- [ ] In `src/index.tsx`, set `window.RenderX.conductor = conductor` after initialization.
- [ ] After first paint (queueMicrotask → requestAnimationFrame), emit signals:
  - [ ] `document.body.dataset.renderxReady = "1"`
  - [ ] `window.__RENDERX_READY__ = true`
  - [ ] `window.dispatchEvent(new Event('renderx:ready'))`
- [ ] (Optional) Add concise console log e.g., `console.info('[ready] renderx:ready emitted')` for diagnostics.

Exit criteria: Manual verification in browser (or Playwright dev) shows flag/attribute and event firing.

Phase 2 — Test helpers

- [ ] Create `e2e/support/appReady.ts` with `waitForAppReady(page, { timeout = 10000 })`.
- [ ] Implement readiness race on event, flag, and body attribute; do not rely on sleeps.
- [ ] On timeout, capture last N console logs and pertinent network errors to aid triage.
- [ ] (Optional) Add `waitForPluginsReady(page)` using `'renderx:plugins-ready'` or `window.__RENDERX_PLUGINS_READY__`.

Exit criteria: Helper imported by a sample spec; local dry run confirms expected behavior.

Phase 3 — Canary suite gating

- [ ] Pick a representative suite (e.g., control-panel CSS/guardrail) and add gating:
  - [ ] `test.beforeEach`: `page.goto(baseURL)` then `await waitForAppReady(page)`.
- [ ] Run locally to validate; then run a focused CI job (or task) to confirm stability.

Exit criteria: Canary suite passes consistently (e.g., 3–5 local runs; 1–2 CI runs) with zero startup-race flakes.

Phase 4 — Gate all E2E suites

- [ ] Centralize gating via shared fixtures or a test hook so all E2E suites call `waitForAppReady`.
- [ ] Update suites that need stricter readiness to also call `waitForPluginsReady`.
- [ ] Remove any leftover ad-hoc sleeps/timeouts added as band-aids.

Exit criteria: All E2E green locally and on CI; zero startup-race flakes across 10 consecutive CI runs.

Phase 5 — CI server orchestration hardening

- [ ] If using external server:
  - [ ] Add CI steps: build → start preview (background) → wait for `/healthz` (or base URL) → run tests → teardown server.
- [ ] If using Playwright `webServer` with reuse:
  - [ ] Set `reuseExistingServer: true` for CI and start preview before tests.
- [ ] Ensure deterministic teardown of background processes in CI.

Exit criteria: CI consistently starts/stops the server with deterministic readiness gating.

Phase 6 — Diagnostics and guardrails

- [ ] Ensure helpers include failure diagnostics (console/network capture) on timeout.
- [ ] (Optional) Add a lint/test rule to discourage explicit `setTimeout` waits in E2E.
- [ ] Document common failure causes and suggested checks in the helper or docs.

Exit criteria: Failures provide actionable diagnostics without guesswork.

Phase 7 — Documentation and cleanup

- [ ] Update this doc with final event names, file paths, and any deviations.
- [ ] Cross-link from CONTRIBUTING.md or TESTING.md if present.
- [ ] Close the tracking issue once stability goals are met.

Exit criteria: Docs up to date; issue closed after stability target proven.

## Acceptance Criteria
- 0 flakes due to startup race across 10 consecutive CI runs.
- All e2e suites call `waitForAppReady` before interacting with UI.
- Locally (dev) and CI (preview) flows both pass without increasing arbitrary timeouts.

## Risks & Mitigations
- Event/flag might fire too early: mitigate by emitting after rAF (post-paint) and keeping multiple signals (event + flag + attribute).
- Future refactors: keep ready signal names and semantics centralized; document in code and this doc.
- Some tests may require stricter readiness (plugins): provide dedicated `plugins-ready` signal.

## Rollout
- PR 1: Add ready signals + helper; gate a canary suite.
- PR 2: Gate all e2e suites; adjust any test assumptions.
- PR 3: Optionally move to external server with `reuseExistingServer` in CI for stability.

## Notes
- Do not rely on `networkidle` or `setTimeout` for readiness.
- Prefer deterministic app→test handshake; logs are for diagnostics only.
