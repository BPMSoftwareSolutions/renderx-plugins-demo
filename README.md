**RenderX Plugins Demo**
A thin-client host application showcasing the RenderX plugin architecture. This demo provides a lightweight shell with manifest-driven panel slots, orchestrated entirely through the **MusicalConductor** engine.

It includes simple example plugins—such as component libraries, control panels, and canvas operations—that demonstrate:

* **CIA/SPA compliance**: Plugins orchestrate exclusively via `conductor.play()` with full SPA validation.
* **Manifest-driven loading**: Panel UIs are lazily resolved from a manifest, mounted via `<PanelSlot>`, and isolated by Suspense + ErrorBoundary.
* **Orchestration patterns**: Plugins register symphonies, movements, and beats with handlers, coordinating workflows through the conductor.
* **AI-powered enhancements (optional)**: Hooks for AI-driven component styling and enhancement.

This demo app is designed as both a **testing sandbox** and a **teaching tool**—making it easy to experiment with plugin development, validate orchestration flows, and showcase RenderX’s multi-sided platform potential.

