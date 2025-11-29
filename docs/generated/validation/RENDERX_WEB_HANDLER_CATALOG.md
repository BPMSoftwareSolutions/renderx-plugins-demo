# RenderX-Web Handler Catalog (Discovery)

Generated: 2025-11-29

This catalog lists named exports discovered under `packages/*/src/symphonies/**` to inform `handler.name` values using the convention `package/module#function`.

## canvas-component
- `select/select.stage-crew.ts`
  - `canvas-component/select#showSelectionOverlay`
  - `canvas-component/select#hideSelectionOverlay`
  - `canvas-component/select#notifyUi`
- `select/select.overlay.line-advanced.stage-crew.ts`
  - `canvas-component/select.overlay.line-advanced#ensureAdvancedLineOverlayFor`
  - `canvas-component/select.overlay.line-advanced#attachAdvancedLineManipHandlers`
- `select/select.overlay.line-resize.stage-crew.ts`
  - `canvas-component/select.overlay.line-resize#ensureLineOverlayFor`
  - `canvas-component/select.overlay.line-resize#attachLineResizeHandlers`
- `select/select.overlay.dom.stage-crew.ts`
  - `canvas-component/select.overlay.dom#getCanvasOrThrow`
  - `canvas-component/select.overlay.dom#ensureOverlay`
  - `canvas-component/select.overlay.dom#getCanvasRect`
  - `canvas-component/select.overlay.dom#applyOverlayRectForEl`
- `select/select.overlay.css.stage-crew.ts`
  - `canvas-component/select.overlay.css#ensureOverlayCss`
- `select/select.overlay.helpers.ts`
  - `canvas-component/select.overlay.helpers#createOverlayStructure`
  - `canvas-component/select.overlay.helpers#resolveEndpoints`
- `update/update.stage-crew.ts`
  - `canvas-component/update#updateAttribute`
  - `canvas-component/update#refreshControlPanel`
- `update/update.svg-node.stage-crew.ts`
  - `canvas-component/update.svg-node#refreshControlPanel`
- `line-advanced/line.manip.stage-crew.ts`
  - `canvas-component/line-advanced#line.manip.startLineManip`
  - `canvas-component/line-advanced#line.manip.moveLineManip`
  - `canvas-component/line-advanced#line.manip.endLineManip`
- `export/export.mp4.stage-crew.ts`
  - `canvas-component/export#exportSvgToMp4`
- `export/export.gif.stage-crew.ts`
  - `canvas-component/export#exportSvgToGif`
- `export/export.css.stage-crew.ts`
  - `canvas-component/export#collectCssClasses`
- `export/export.discover.stage-crew.ts`
  - `canvas-component/export#discoverComponentsFromDom`
- `import/import.nodes.stage-crew.ts`
  - `canvas-component/import.nodes#applyHierarchyAndOrder`
- `import/import.css.stage-crew.ts`
  - `canvas-component/import.css#injectCssClasses`
- `create/create.css.stage-crew.ts`
  - `canvas-component/create.css#injectCssFallback`
  - `canvas-component/create.css#injectRawCss`
- `create/create.dom.stage-crew.ts`
  - `canvas-component/create.dom#getCanvasOrThrow`
  - `canvas-component/create.dom#createElementWithId`
  - `canvas-component/create.dom#applyClasses`
  - `canvas-component/create.dom#applyInlineStyle`
  - `canvas-component/create.dom#appendTo`
- `create/create.interactions.stage-crew.ts`
  - `canvas-component/create.interactions#attachSelection`
  - `canvas-component/create.interactions#attachDrag`
  - `canvas-component/create.interactions#attachSvgNodeClick`
- `create/create.style.stage-crew.ts`
  - `canvas-component/create.style#computeInstanceClass`
  - `canvas-component/create.style#computeCssVarBlock`
  - `canvas-component/create.style#computeInlineStyle`
- `augment/augment.line.stage-crew.ts`
  - `canvas-component/augment#enhanceLine`
- `augment/line.recompute.stage-crew.ts`
  - `canvas-component/augment#line.recompute.recomputeLineSvg`
- `_clipboard.ts`
  - `canvas-component/_clipboard#setClipboardText`
  - `canvas-component/_clipboard#getClipboardText`

## control-panel
- `update/update.stage-crew.ts`
  - `control-panel/update#updateFromElement`
- `selection/selection.stage-crew.ts`
  - `control-panel/selection#deriveSelectionModel`
- `ui/ui.stage-crew.ts`
  - `control-panel/ui#initConfig`
  - `control-panel/ui#initResolver`
  - `control-panel/ui#registerObservers`
  - `control-panel/ui#notifyReady`
  - `control-panel/ui#generateFields`
  - `control-panel/ui#generateSections`
  - `control-panel/ui#renderView`
  - `control-panel/ui#prepareField`
  - `control-panel/ui#dispatchField`
  - `control-panel/ui#setDirty`
  - `control-panel/ui#awaitRefresh`
  - `control-panel/ui#validateField`
  - `control-panel/ui#mergeErrors`
  - `control-panel/ui#updateView`
  - `control-panel/ui#toggleSection`
- `css-management/css-management.stage-crew.ts`
  - `control-panel/css-management#createCssClass`
  - `control-panel/css-management#updateCssClass`
  - `control-panel/css-management#deleteCssClass`
  - `control-panel/css-management#getCssClass`
  - `control-panel/css-management#listCssClasses`
  - `control-panel/css-management#applyCssClassToElement`
  - `control-panel/css-management#removeCssClassFromElement`

## header
- `ui/ui.stage-crew.ts`
  - `header/ui#getCurrentTheme`
  - `header/ui#toggleTheme`

## library-component
- `drag/drag.preview.stage-crew.ts`
  - `library-component/drag.preview#ensurePayload`
  - `library-component/drag.preview#computeGhostSize`
  - `library-component/drag.preview#createGhostContainer`
  - `library-component/drag.preview#renderTemplatePreview`
  - `library-component/drag.preview#applyTemplateStyles`
  - `library-component/drag.preview#computeCursorOffsets`
  - `library-component/drag.preview#installDragImage`

## musical-conductor
- `validate-plugin/validate-plugin.stage-crew.ts`
  - `musical-conductor/validate-plugin#verifyExports` (and related validation steps)

## library
- `load.symphony.ts`
  - Exports handlers for runtime sequences (inspect as needed)

Notes:
- This catalog focuses on clear named exports discovered in code search; additional handlers may exist.
- Use these names directly in `handler.name` within `renderx-web-orchestration.json` beats.
