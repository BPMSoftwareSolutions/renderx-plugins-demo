# AC-to-Test Alignment Report

**Domain:** renderx-web-orchestration
**Generated:** 2025-12-01T12:52:49.537Z

---

## AC-to-Test Alignment Summary

**Status:** ❌ Poor (0% coverage)

| Metric | Value |
|--------|-------|
| Total ACs | 115 |
| Average AC Coverage | 0% |
| Covered ACs | 0 |
| Uncovered ACs | 115 |
| Total Tests | 0 |
| Tests with AC Tags | 0 |
| Beats with Mapped Tests | 0/23 |
| THEN Clause Coverage | 0% |

### Coverage Thresholds

- ✅ **Good** (≥70%): High confidence in requirement validation
- ⚠️ **Partial** (40-69%): Some coverage, gaps exist
- ❌ **Poor** (<40%): Insufficient test coverage

## Sequence-Level Coverage

| Sequence | Total ACs | Covered | Coverage % | Status |
|----------|-----------|---------|------------|--------|
| RenderX Web Orchestration | 115 | 0 | 0% | ❌ Poor |

## Beat-Level Coverage

*Showing 20 of 23 beats (sorted by coverage, lowest first)*

| Beat | Sequence | Total ACs | Covered | Coverage % | Tests | Status |
|------|----------|-----------|---------|------------|-------|--------|
| resolve-theme | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| apply-theme | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| init-control-panel | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| init-resolver | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| register-observers | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| notify-ready | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| update-attribute | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| refresh-control-panel | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| show-selection-overlay | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| hide-selection-overlay | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| attach-line-resize | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| ensure-line-overlay | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| notify-ui | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| export-gif | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| export-mp4 | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| ensure-payload | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| compute-ghost-size | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| create-ghost-container | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| render-template-preview | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| apply-template-styles | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |

<details>
<summary>Show all 23 beats</summary>

| Beat | Sequence | Total ACs | Covered | Coverage % | Tests | Status |
|------|----------|-----------|---------|------------|-------|--------|
| compute-cursor-offsets | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| install-drag-image | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |
| establish-recovery-checkpoint | renderx-web-orchestration | 5 | 0 | 0% | 0 | ❌ Poor |

</details>

## Uncovered ACs

115 ACs without test coverage:

- **renderx-web-orchestration:renderx-web-orchestration:1.1:1**
  - Beat: resolve-theme
  - Handler: `header/ui#getCurrentTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.1:2**
  - Beat: resolve-theme
  - Handler: `header/ui#getCurrentTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.1:3**
  - Beat: resolve-theme
  - Handler: `header/ui#getCurrentTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.1:4**
  - Beat: resolve-theme
  - Handler: `header/ui#getCurrentTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.1:5**
  - Beat: resolve-theme
  - Handler: `header/ui#getCurrentTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.2:1**
  - Beat: apply-theme
  - Handler: `header/ui#toggleTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.2:2**
  - Beat: apply-theme
  - Handler: `header/ui#toggleTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.2:3**
  - Beat: apply-theme
  - Handler: `header/ui#toggleTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.2:4**
  - Beat: apply-theme
  - Handler: `header/ui#toggleTheme`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.2:5**
  - Beat: apply-theme
  - Handler: `header/ui#toggleTheme`
  - Sequence: renderx-web-orchestration

<details>
<summary>Show all 115 uncovered ACs</summary>

- **renderx-web-orchestration:renderx-web-orchestration:1.3:1**
  - Beat: init-control-panel
  - Handler: `control-panel/ui#initConfig`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.3:2**
  - Beat: init-control-panel
  - Handler: `control-panel/ui#initConfig`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.3:3**
  - Beat: init-control-panel
  - Handler: `control-panel/ui#initConfig`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.3:4**
  - Beat: init-control-panel
  - Handler: `control-panel/ui#initConfig`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.3:5**
  - Beat: init-control-panel
  - Handler: `control-panel/ui#initConfig`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.4:1**
  - Beat: init-resolver
  - Handler: `control-panel/ui#initResolver`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.4:2**
  - Beat: init-resolver
  - Handler: `control-panel/ui#initResolver`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.4:3**
  - Beat: init-resolver
  - Handler: `control-panel/ui#initResolver`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.4:4**
  - Beat: init-resolver
  - Handler: `control-panel/ui#initResolver`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.4:5**
  - Beat: init-resolver
  - Handler: `control-panel/ui#initResolver`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.5:1**
  - Beat: register-observers
  - Handler: `control-panel/ui#registerObservers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.5:2**
  - Beat: register-observers
  - Handler: `control-panel/ui#registerObservers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.5:3**
  - Beat: register-observers
  - Handler: `control-panel/ui#registerObservers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.5:4**
  - Beat: register-observers
  - Handler: `control-panel/ui#registerObservers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.5:5**
  - Beat: register-observers
  - Handler: `control-panel/ui#registerObservers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.6:1**
  - Beat: notify-ready
  - Handler: `control-panel/ui#notifyReady`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.6:2**
  - Beat: notify-ready
  - Handler: `control-panel/ui#notifyReady`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.6:3**
  - Beat: notify-ready
  - Handler: `control-panel/ui#notifyReady`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.6:4**
  - Beat: notify-ready
  - Handler: `control-panel/ui#notifyReady`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:1.6:5**
  - Beat: notify-ready
  - Handler: `control-panel/ui#notifyReady`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.1:1**
  - Beat: update-attribute
  - Handler: `canvas-component/update#updateAttribute`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.1:2**
  - Beat: update-attribute
  - Handler: `canvas-component/update#updateAttribute`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.1:3**
  - Beat: update-attribute
  - Handler: `canvas-component/update#updateAttribute`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.1:4**
  - Beat: update-attribute
  - Handler: `canvas-component/update#updateAttribute`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.1:5**
  - Beat: update-attribute
  - Handler: `canvas-component/update#updateAttribute`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.2:1**
  - Beat: refresh-control-panel
  - Handler: `canvas-component/update#refreshControlPanel`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.2:2**
  - Beat: refresh-control-panel
  - Handler: `canvas-component/update#refreshControlPanel`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.2:3**
  - Beat: refresh-control-panel
  - Handler: `canvas-component/update#refreshControlPanel`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.2:4**
  - Beat: refresh-control-panel
  - Handler: `canvas-component/update#refreshControlPanel`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:2.2:5**
  - Beat: refresh-control-panel
  - Handler: `canvas-component/update#refreshControlPanel`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.1:1**
  - Beat: show-selection-overlay
  - Handler: `canvas-component/select#showSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.1:2**
  - Beat: show-selection-overlay
  - Handler: `canvas-component/select#showSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.1:3**
  - Beat: show-selection-overlay
  - Handler: `canvas-component/select#showSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.1:4**
  - Beat: show-selection-overlay
  - Handler: `canvas-component/select#showSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.1:5**
  - Beat: show-selection-overlay
  - Handler: `canvas-component/select#showSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.2:1**
  - Beat: hide-selection-overlay
  - Handler: `canvas-component/select#hideSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.2:2**
  - Beat: hide-selection-overlay
  - Handler: `canvas-component/select#hideSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.2:3**
  - Beat: hide-selection-overlay
  - Handler: `canvas-component/select#hideSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.2:4**
  - Beat: hide-selection-overlay
  - Handler: `canvas-component/select#hideSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.2:5**
  - Beat: hide-selection-overlay
  - Handler: `canvas-component/select#hideSelectionOverlay`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.3:1**
  - Beat: attach-line-resize
  - Handler: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.3:2**
  - Beat: attach-line-resize
  - Handler: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.3:3**
  - Beat: attach-line-resize
  - Handler: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.3:4**
  - Beat: attach-line-resize
  - Handler: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.3:5**
  - Beat: attach-line-resize
  - Handler: `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.4:1**
  - Beat: ensure-line-overlay
  - Handler: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.4:2**
  - Beat: ensure-line-overlay
  - Handler: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.4:3**
  - Beat: ensure-line-overlay
  - Handler: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.4:4**
  - Beat: ensure-line-overlay
  - Handler: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.4:5**
  - Beat: ensure-line-overlay
  - Handler: `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.5:1**
  - Beat: notify-ui
  - Handler: `canvas-component/select#notifyUi`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.5:2**
  - Beat: notify-ui
  - Handler: `canvas-component/select#notifyUi`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.5:3**
  - Beat: notify-ui
  - Handler: `canvas-component/select#notifyUi`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.5:4**
  - Beat: notify-ui
  - Handler: `canvas-component/select#notifyUi`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:3.5:5**
  - Beat: notify-ui
  - Handler: `canvas-component/select#notifyUi`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.1:1**
  - Beat: export-gif
  - Handler: `canvas-component/export.export.gif#exportSvgToGif`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.1:2**
  - Beat: export-gif
  - Handler: `canvas-component/export.export.gif#exportSvgToGif`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.1:3**
  - Beat: export-gif
  - Handler: `canvas-component/export.export.gif#exportSvgToGif`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.1:4**
  - Beat: export-gif
  - Handler: `canvas-component/export.export.gif#exportSvgToGif`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.1:5**
  - Beat: export-gif
  - Handler: `canvas-component/export.export.gif#exportSvgToGif`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.2:1**
  - Beat: export-mp4
  - Handler: `canvas-component/export.export.mp4#exportSvgToMp4`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.2:2**
  - Beat: export-mp4
  - Handler: `canvas-component/export.export.mp4#exportSvgToMp4`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.2:3**
  - Beat: export-mp4
  - Handler: `canvas-component/export.export.mp4#exportSvgToMp4`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.2:4**
  - Beat: export-mp4
  - Handler: `canvas-component/export.export.mp4#exportSvgToMp4`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:4.2:5**
  - Beat: export-mp4
  - Handler: `canvas-component/export.export.mp4#exportSvgToMp4`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.1:1**
  - Beat: ensure-payload
  - Handler: `library-component/drag.preview#ensurePayload`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.1:2**
  - Beat: ensure-payload
  - Handler: `library-component/drag.preview#ensurePayload`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.1:3**
  - Beat: ensure-payload
  - Handler: `library-component/drag.preview#ensurePayload`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.1:4**
  - Beat: ensure-payload
  - Handler: `library-component/drag.preview#ensurePayload`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.1:5**
  - Beat: ensure-payload
  - Handler: `library-component/drag.preview#ensurePayload`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.2:1**
  - Beat: compute-ghost-size
  - Handler: `library-component/drag.preview#computeGhostSize`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.2:2**
  - Beat: compute-ghost-size
  - Handler: `library-component/drag.preview#computeGhostSize`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.2:3**
  - Beat: compute-ghost-size
  - Handler: `library-component/drag.preview#computeGhostSize`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.2:4**
  - Beat: compute-ghost-size
  - Handler: `library-component/drag.preview#computeGhostSize`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.2:5**
  - Beat: compute-ghost-size
  - Handler: `library-component/drag.preview#computeGhostSize`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.3:1**
  - Beat: create-ghost-container
  - Handler: `library-component/drag.preview#createGhostContainer`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.3:2**
  - Beat: create-ghost-container
  - Handler: `library-component/drag.preview#createGhostContainer`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.3:3**
  - Beat: create-ghost-container
  - Handler: `library-component/drag.preview#createGhostContainer`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.3:4**
  - Beat: create-ghost-container
  - Handler: `library-component/drag.preview#createGhostContainer`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.3:5**
  - Beat: create-ghost-container
  - Handler: `library-component/drag.preview#createGhostContainer`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.4:1**
  - Beat: render-template-preview
  - Handler: `library-component/drag.preview#renderTemplatePreview`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.4:2**
  - Beat: render-template-preview
  - Handler: `library-component/drag.preview#renderTemplatePreview`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.4:3**
  - Beat: render-template-preview
  - Handler: `library-component/drag.preview#renderTemplatePreview`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.4:4**
  - Beat: render-template-preview
  - Handler: `library-component/drag.preview#renderTemplatePreview`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.4:5**
  - Beat: render-template-preview
  - Handler: `library-component/drag.preview#renderTemplatePreview`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.5:1**
  - Beat: apply-template-styles
  - Handler: `library-component/drag.preview#applyTemplateStyles`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.5:2**
  - Beat: apply-template-styles
  - Handler: `library-component/drag.preview#applyTemplateStyles`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.5:3**
  - Beat: apply-template-styles
  - Handler: `library-component/drag.preview#applyTemplateStyles`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.5:4**
  - Beat: apply-template-styles
  - Handler: `library-component/drag.preview#applyTemplateStyles`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.5:5**
  - Beat: apply-template-styles
  - Handler: `library-component/drag.preview#applyTemplateStyles`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.6:1**
  - Beat: compute-cursor-offsets
  - Handler: `library-component/drag.preview#computeCursorOffsets`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.6:2**
  - Beat: compute-cursor-offsets
  - Handler: `library-component/drag.preview#computeCursorOffsets`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.6:3**
  - Beat: compute-cursor-offsets
  - Handler: `library-component/drag.preview#computeCursorOffsets`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.6:4**
  - Beat: compute-cursor-offsets
  - Handler: `library-component/drag.preview#computeCursorOffsets`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.6:5**
  - Beat: compute-cursor-offsets
  - Handler: `library-component/drag.preview#computeCursorOffsets`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.7:1**
  - Beat: install-drag-image
  - Handler: `library-component/drag.preview#installDragImage`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.7:2**
  - Beat: install-drag-image
  - Handler: `library-component/drag.preview#installDragImage`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.7:3**
  - Beat: install-drag-image
  - Handler: `library-component/drag.preview#installDragImage`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.7:4**
  - Beat: install-drag-image
  - Handler: `library-component/drag.preview#installDragImage`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:5.7:5**
  - Beat: install-drag-image
  - Handler: `library-component/drag.preview#installDragImage`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:6.1:1**
  - Beat: establish-recovery-checkpoint
  - Handler: `self-healing/baseline#establish`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:6.1:2**
  - Beat: establish-recovery-checkpoint
  - Handler: `self-healing/baseline#establish`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:6.1:3**
  - Beat: establish-recovery-checkpoint
  - Handler: `self-healing/baseline#establish`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:6.1:4**
  - Beat: establish-recovery-checkpoint
  - Handler: `self-healing/baseline#establish`
  - Sequence: renderx-web-orchestration

- **renderx-web-orchestration:renderx-web-orchestration:6.1:5**
  - Beat: establish-recovery-checkpoint
  - Handler: `self-healing/baseline#establish`
  - Sequence: renderx-web-orchestration

</details>

---

## Resources

- [Test Tagging Guide](../../TEST_TAGGING_GUIDE.md)
- [AC Registry](./../../../.generated/acs/renderx-web-orchestration.registry.json)
- [GitHub Issue #420](https://github.com/BPMSoftwareSolutions/renderx-plugins-demo/issues/420)

