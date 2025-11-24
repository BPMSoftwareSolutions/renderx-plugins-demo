<!-- AUTO-GENERATED — DO NOT EDIT
Sources: .generated/global-traceability-map.json, .generated/project-knowledge-map.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json
Source-Hashes: .generated/global-traceability-map.json:83006a9ad2627d415bfb644385f98bd3fa6dd351b3c15ff10d1fef88de2e0197, .generated/project-knowledge-map.json:95d7a6a74c12b8f7b21460c608bf29dbaf6e33a2e0b9c4f3fcea101be2ac567c, packages/ographx/.ographx/artifacts/renderx-web/analysis/analysis.json:b56fd3808fa75741fb346a411b90183faddc35c837631916d3f48b5b547db058, packages/ographx/.ographx/artifacts/renderx-web/analysis/catalog-vs-ir-gaps.json:a8943d80df9440d2d84aebc0743938e3de47f2e5c18454aac2aa8efde3a926ef, packages/ographx/.ographx/artifacts/renderx-web/analysis/comprehensive-audit.json:185d7f42a05f3b24495023f2d977b956d6c369ea437d86e48ee0dfdedb4f6b67, packages/ographx/.ographx/artifacts/renderx-web/analysis/external-interactions-audit.json:85c80c7651b2a814f35c204045bd4a0d84208cfc4fcf91d94805bbf0f54646be, packages/ographx/.ographx/artifacts/renderx-web/analysis/proposed-tests.handlers.json:df5c25d7325440975dc99e8aaf5b93e1e15fb8883b4fd58a3529e19936b5b72b, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-components.json:f34864d2b850125a75b7933ed36f3451bf2c8f14fff97c58f4d7ec332dd30c32, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-manifest.json:ad59b2a14593fc4bf3e788cc31114e7e06900277be655499bf759b5bc23677ae, packages/ographx/.ographx/artifacts/renderx-web/catalog/catalog-sequences.json:5d7bbd729b2de8d5f1a321a48e13fe055d9693ea438bd242fe89ef1127a32dff
Doc-Hash: 78a02cfdee8a3b35080202dff9e7a13ed72eb4f6007b76b37720a07da4705f2c
Generated: 2025-11-24T01:11:26.659Z
Regenerate: npm run docs:generate:governed
-->

# Handler → Test Traceability

**Generated**: 2025-11-24T01:11:26.344Z

## Handler Test Mapping

### register
**File**: \packages\canvas\src\index.ts
**Tests**: 3 files

- @renderx-plugins/control-panel package exports
- exports ControlPanel UI component
- exports register() function (no-op allowed)
- exports selection symphony handlers
- register function
- should call conductor.mount with correct sequence definition and handlers
- should mark the sequence as mounted in conductor
- should not call mount if conductor is null or undefined
- should not call mount if conductor.mount is not available
- renderx-plugin-library-component: register()
- mounts the three library-component sequences exactly once with expected pluginIds
- exposes json-sequences via renderx.sequences metadata
- json-sequences catalog is loadable and contains expected sequences

### onDropForTest
**File**: \packages\canvas\src\ui\CanvasDrop.ts
**Tests**: 2 files

- CanvasDrop routes to library.container.drop when dropping onto a container
- canvas drop triggers library-component drop sequence

### enhanceLine
**File**: \packages\canvas-component\src\symphonies\augment\augment.line.stage-crew.ts
**Tests**: 2 files

- Advanced Line augmentation (Phase 1)
- Advanced Line recompute (Phase 2+3)
- maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
- toggles marker-end via --arrowEnd CSS var
- renders quadratic path when --curve=1 with --cx/--cy
- applies rotate transform when --angle is set

### recomputeLineSvg
**File**: \packages\canvas-component\src\symphonies\augment\line.recompute.stage-crew.ts
**Tests**: 5 files

- Advanced Line handlers — moveLineManip
- updates endpoint A and recomputes line geometry
- Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
- Advanced Line recompute (Phase 2+3)
- maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
- toggles marker-end via --arrowEnd CSS var
- renders quadratic path when --curve=1 with --cx/--cy
- applies rotate transform when --angle is set
- Advanced Line — endpoints scale with resize
- proportionally scales --x1/--y1/--x2/--y2 when resizing the element
- Advanced Line — dynamic viewBox autosize
- expands viewBox when endpoints extend beyond element bounds (no rotation)
- adds headroom when rotated so the line is never clipped

### serializeSelectedComponent
**File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### copyToClipboard
**File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### notifyCopyComplete
**File**: \packages\canvas-component\src\symphonies\copy\copy.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### resolveTemplate
**File**: \packages\canvas-component\src\symphonies\create\create.arrangement.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### injectCssFallback
**File**: \packages\canvas-component\src\symphonies\create\create.css.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### injectRawCss
**File**: \packages\canvas-component\src\symphonies\create\create.css.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### getCanvasOrThrow
**File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
**Tests**: 1 files

- canvas-component create.dom.stage-crew handlers
- getCanvasOrThrow - returns canvas element
- getCanvasOrThrow - throws when canvas missing
- createElementWithId - creates element with ID
- applyClasses - applies class list
- applyInlineStyle - sets style properties
- appendTo - appends child to parent

### createElementWithId
**File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
**Tests**: 1 files

- canvas-component create.dom.stage-crew handlers
- getCanvasOrThrow - returns canvas element
- getCanvasOrThrow - throws when canvas missing
- createElementWithId - creates element with ID
- applyClasses - applies class list
- applyInlineStyle - sets style properties
- appendTo - appends child to parent

### applyClasses
**File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
**Tests**: 1 files

- canvas-component create.dom.stage-crew handlers
- getCanvasOrThrow - returns canvas element
- getCanvasOrThrow - throws when canvas missing
- createElementWithId - creates element with ID
- applyClasses - applies class list
- applyInlineStyle - sets style properties
- appendTo - appends child to parent

### applyInlineStyle
**File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
**Tests**: 1 files

- canvas-component create.dom.stage-crew handlers
- getCanvasOrThrow - returns canvas element
- getCanvasOrThrow - throws when canvas missing
- createElementWithId - creates element with ID
- applyClasses - applies class list
- applyInlineStyle - sets style properties
- appendTo - appends child to parent

### appendTo
**File**: \packages\canvas-component\src\symphonies\create\create.dom.stage-crew.ts
**Tests**: 1 files

- canvas-component create.dom.stage-crew handlers
- getCanvasOrThrow - returns canvas element
- getCanvasOrThrow - throws when canvas missing
- createElementWithId - creates element with ID
- applyClasses - applies class list
- applyInlineStyle - sets style properties
- appendTo - appends child to parent

### transformImportToCreatePayload
**File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
**Tests**: 1 files

- transformImportToCreatePayload
- maps import record to create payload with template, position, container and override id
- handles minimal shapes without optional fields

### attachStandardImportInteractions
**File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
**Tests**: 1 files

- attachStandardImportInteractions forwards drag positions
- publishes drag.move with { id, position }
- publishes drag.end with { id, position } mapped from finalPosition when present

### createFromImportRecord
**File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### transformClipboardToCreatePayload
**File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
**Tests**: 1 files

- toCreatePayloadFromData (clipboard shape)
- transformClipboardToCreatePayload
- builds create payload from clipboard-shaped component without preserving id
- maps template/position straight through
- handles renderx-component wrapper structure

### toCreatePayloadFromData
**File**: \packages\canvas-component\src\symphonies\create\create.from-import.ts
**Tests**: 1 files

- toCreatePayloadFromData (clipboard shape)
- transformClipboardToCreatePayload
- builds create payload from clipboard-shaped component without preserving id
- maps template/position straight through
- handles renderx-component wrapper structure

### attachSelection
**File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### attachDrag
**File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### attachSvgNodeClick
**File**: \packages\canvas-component\src\symphonies\create\create.interactions.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### registerInstance
**File**: \packages\canvas-component\src\symphonies\create\create.io.ts
**Tests**: 1 files

- canvas-component create.io
- persists node metadata to KV/cache
- throws when IO is accessed in a pure beat (guard example)

### notifyUi
**File**: \packages\canvas-component\src\symphonies\create\create.notify.ts
**Tests**: 1 files

- canvas-component create.notify notifyUi handler (public API)
- publishes canvas.component.created with id + correlationId when both present (createdNode path)
- falls back to ctx.payload.id when createdNode missing
- invokes legacy onComponentCreated callback if provided

### renderReact
**File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
**Tests**: 2 files

- renderReact handler
- cleanupReactRoot
- skips rendering for non-React components
- warns and returns early if nodeId is missing
- warns and returns early if React code is missing
- renders a simple React component with default export
- uses JSX transformer before evaluating React code
- handles compilation errors gracefully
- handles missing container element
- cleans up existing React root before creating new one
- handles arrow function components
- handles function declarations without export
- cleans up React root when it exists
- handles cleanup for non-existent roots gracefully
- React Component Rendering
- should render React component successfully
- should publish componentMounted event
- should handle React code with props
- should handle compilation errors gracefully
- should cleanup React roots on deletion
- should expose EventRouter to React components
- should allow React components to publish events
- should skip rendering if kind is not react
- should handle missing container gracefully

### cleanupReactRoot
**File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
**Tests**: 2 files

- renderReact handler
- cleanupReactRoot
- skips rendering for non-React components
- warns and returns early if nodeId is missing
- warns and returns early if React code is missing
- renders a simple React component with default export
- uses JSX transformer before evaluating React code
- handles compilation errors gracefully
- handles missing container element
- cleans up existing React root before creating new one
- handles arrow function components
- handles function declarations without export
- cleans up React root when it exists
- handles cleanup for non-existent roots gracefully
- React Component Rendering
- should render React component successfully
- should publish componentMounted event
- should handle React code with props
- should handle compilation errors gracefully
- should cleanup React roots on deletion
- should expose EventRouter to React components
- should allow React components to publish events
- should skip rendering if kind is not react
- should handle missing container gracefully

### exposeEventRouterToReact
**File**: \packages\canvas-component\src\symphonies\create\create.react.stage-crew.ts
**Tests**: 1 files

- React Component Rendering
- should render React component successfully
- should publish componentMounted event
- should handle React code with props
- should handle compilation errors gracefully
- should cleanup React roots on deletion
- should expose EventRouter to React components
- should allow React components to publish events
- should skip rendering if kind is not react
- should handle missing container gracefully

### createNode
**File**: \packages\canvas-component\src\symphonies\create\create.stage-crew.ts
**Tests**: 1 files

- canvas-component public API beats
- notifyUi (selection) routes to control panel selection.show via conductor.play
- routeSelectionRequest forwards to canvas.component.select with _routed flag
- updateAttribute applies update via rule engine and stores payload
- createNode creates element under #rx-canvas and populates createdNode payload

### computeInstanceClass
**File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### computeCssVarBlock
**File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### computeInlineStyle
**File**: \packages\canvas-component\src\symphonies\create\create.style.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### validateReactCode
**File**: \packages\canvas-component\src\symphonies\create\react-code-validator.ts
**Tests**: 1 files

- React Code Validator
- Valid React Code
- Invalid React Code - Syntax Errors
- Invalid React Code - Empty/Invalid Input
- Warnings
- validateReactCodeOrThrow
- should validate simple React component
- should validate JSX component
- should validate component with hooks
- should validate component with template literals
- should detect unmatched closing braces
- should detect unmatched opening braces
- should detect unclosed template literals
- should detect unclosed single-quoted strings
- should detect unclosed double-quoted strings
- should detect unmatched parentheses
- should detect typo in React.createElement
- should detect unclosed JSX tags as invalid
- should reject empty string
- should reject null
- should reject undefined
- should warn about mixed React.createElement and JSX
- should throw on invalid code
- should not throw on valid code

### validateReactCodeOrThrow
**File**: \packages\canvas-component\src\symphonies\create\react-code-validator.ts
**Tests**: 1 files

- React Code Validator
- Valid React Code
- Invalid React Code - Syntax Errors
- Invalid React Code - Empty/Invalid Input
- Warnings
- validateReactCodeOrThrow
- should validate simple React component
- should validate JSX component
- should validate component with hooks
- should validate component with template literals
- should detect unmatched closing braces
- should detect unmatched opening braces
- should detect unclosed template literals
- should detect unclosed single-quoted strings
- should detect unclosed double-quoted strings
- should detect unmatched parentheses
- should detect typo in React.createElement
- should detect unclosed JSX tags as invalid
- should reject empty string
- should reject null
- should reject undefined
- should warn about mixed React.createElement and JSX
- should throw on invalid code
- should not throw on valid code

### publishDeleted
**File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### deleteComponent
**File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### routeDeleteRequest
**File**: \packages\canvas-component\src\symphonies\delete\delete.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### hideAllOverlays
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### deselectComponent
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### publishDeselectionChanged
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### publishSelectionsCleared
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### clearAllSelections
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### routeDeselectionRequest
**File**: \packages\canvas-component\src\symphonies\deselect\deselect.stage-crew.ts
**Tests**: 1 files

- canvas-component deselect.stage-crew handlers
- hideAllOverlays - hides overlays if present
- hideAllOverlays - safe when overlays are missing
- deselectComponent - executes without throwing
- deselectComponent - no-op when id missing
- publishDeselectionChanged - safe invocation with id
- publishDeselectionChanged - safe invocation without id
- publishSelectionsCleared - executes without throwing
- clearAllSelections - executes without throwing
- routeDeselectionRequest - executes with id
- routeDeselectionRequest - executes without id

### updatePosition
**File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
**Tests**: 1 files

- canvas-component drag.stage-crew handlers
- updatePosition - moves element based on delta
- updatePosition - throws on missing id
- startDrag - initializes drag state
- startDrag - warns on missing id
- endDrag - finalizes drag
- endDrag - warns on missing id
- forwardToControlPanel - returns true

### startDrag
**File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
**Tests**: 1 files

- canvas-component drag.stage-crew handlers
- updatePosition - moves element based on delta
- updatePosition - throws on missing id
- startDrag - initializes drag state
- startDrag - warns on missing id
- endDrag - finalizes drag
- endDrag - warns on missing id
- forwardToControlPanel - returns true

### endDrag
**File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
**Tests**: 1 files

- canvas-component drag.stage-crew handlers
- updatePosition - moves element based on delta
- updatePosition - throws on missing id
- startDrag - initializes drag state
- startDrag - warns on missing id
- endDrag - finalizes drag
- endDrag - warns on missing id
- forwardToControlPanel - returns true

### forwardToControlPanel
**File**: \packages\canvas-component\src\symphonies\drag\drag.stage-crew.ts
**Tests**: 1 files

- canvas-component drag.stage-crew handlers
- updatePosition - moves element based on delta
- updatePosition - throws on missing id
- startDrag - initializes drag state
- startDrag - warns on missing id
- endDrag - finalizes drag
- endDrag - warns on missing id
- forwardToControlPanel - returns true

### collectCssClasses
**File**: \packages\canvas-component\src\symphonies\export\export.css.stage-crew.ts
**Tests**: 7 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- CSS collection fix for classRefs vs classes mismatch (migrated)
- collects CSS from components with template.classRefs (current export format)
- still supports legacy components with classes property
- Debug CSS collection in export (migrated)
- debugs why cssClasses is not empty in export when classRefs provided
- canvas-component export integration (basic)
- should complete full export flow successfully
- should handle missing components gracefully
- canvas-component export integration (DOM errors)
- should handle DOM errors gracefully
- canvas-component export integration (structure)
- should produce valid UI file structure
- Export includes JSON component CSS end-to-end (migrated)
- exports CSS classes from registry in the UI file

### discoverComponentsFromDom
**File**: \packages\canvas-component\src\symphonies\export\export.discover.stage-crew.ts
**Tests**: 1 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly

### downloadUiFile
**File**: \packages\canvas-component\src\symphonies\export\export.download.stage-crew.ts
**Tests**: 1 files

- canvas-component export integration (basic)
- should complete full export flow successfully
- should handle missing components gracefully

### exportSvgToGif
**File**: \packages\canvas-component\src\symphonies\export\export.gif.stage-crew.ts
**Tests**: 2 files

- exportSvgToGif isolated
- success minimal export triggers download without error
- sets error when 2D context unavailable
- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### queryAllComponents
**File**: \packages\canvas-component\src\symphonies\export\export.io.ts
**Tests**: 7 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- canvas-component export integration (basic)
- should complete full export flow successfully
- should handle missing components gracefully
- canvas-component export integration (DOM errors)
- should handle DOM errors gracefully
- canvas-component export integration (DOM scan fallback)
- should fallback to DOM scanning when KV store is empty but components exist in DOM
- canvas-component export integration (structure)
- should produce valid UI file structure
- canvas-component export.io
- queryAllComponents
- collectCssClasses (moved to stage-crew)
- downloadUiFile (moved to stage-crew)
- should query all components from KV store
- should collect CSS class definitions from components
- should handle missing CSS registry gracefully
- should deduplicate CSS classes across components
- should create and trigger download of UI file
- should handle missing uiFileContent
- should handle browser environment check
- Export includes JSON component CSS end-to-end (migrated)
- exports CSS classes from registry in the UI file

### createMP4Encoder
**File**: \packages\canvas-component\src\symphonies\export\export.mp4-encoder.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### exportSvgToMp4
**File**: \packages\canvas-component\src\symphonies\export\export.mp4.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### buildUiFileContent
**File**: \packages\canvas-component\src\symphonies\export\export.pure.ts
**Tests**: 8 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- canvas-component export integration (basic)
- should complete full export flow successfully
- should handle missing components gracefully
- canvas-component export integration (DOM errors)
- should handle DOM errors gracefully
- canvas-component export integration (DOM scan fallback)
- should fallback to DOM scanning when KV store is empty but components exist in DOM
- canvas-component export integration (structure)
- should produce valid UI file structure
- Export includes JSON component CSS end-to-end (migrated)
- exports CSS classes from registry in the UI file
- canvas-component export.pure
- buildUiFileContent
- should build complete UI file content with CSS classes section
- should handle missing layout data gracefully
- should handle missing components gracefully
- should include canvas metadata
- should handle missing canvas metadata
- should preserve component creation timestamps
- should map component types to template tags correctly
- should generate valid ISO timestamp
- React Component Export/Import
- should export React component with code and props
- should import React component with code and props preserved
- should preserve React code through export/import cycle

### collectLayoutData
**File**: \packages\canvas-component\src\symphonies\export\export.stage-crew.ts
**Tests**: 7 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- canvas-component export integration (basic)
- should complete full export flow successfully
- should handle missing components gracefully
- canvas-component export integration (DOM errors)
- should handle DOM errors gracefully
- canvas-component export integration (DOM scan fallback)
- should fallback to DOM scanning when KV store is empty but components exist in DOM
- canvas-component export integration (structure)
- should produce valid UI file structure
- Export includes JSON component CSS end-to-end (migrated)
- exports CSS classes from registry in the UI file
- canvas-component export.stage-crew
- collectLayoutData
- should collect layout data from DOM elements
- should handle missing DOM elements gracefully
- should handle missing canvas container
- should parse CSS transform values
- should collect canvas metadata
- should handle elements with getBoundingClientRect

### injectCssClasses
**File**: \packages\canvas-component\src\symphonies\import\import.css.stage-crew.ts
**Tests**: 5 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- import flow injects instance class on DOM elements
- adds rx-comp-<tag>-<id> class for imported components
- canvas-component import integration (migrated)
- imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV
- canvas-component import: nested structures
- imports container inside container
- imports grandchild component in nested container
- import variant toggle applies via rule engine
- applies rx-button--<variant> from content.variant even if classRefs lacked it

### openUiFile
**File**: \packages\canvas-component\src\symphonies\import\import.file.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### registerInstances
**File**: \packages\canvas-component\src\symphonies\import\import.io.ts
**Tests**: 1 files

- canvas-component import integration (migrated)
- imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV

### createComponentsSequentially
**File**: \packages\canvas-component\src\symphonies\import\import.nodes.stage-crew.ts
**Tests**: 3 files

- import flow injects instance class on DOM elements
- adds rx-comp-<tag>-<id> class for imported components
- canvas-component import: nested structures
- imports container inside container
- imports grandchild component in nested container
- canvas-component import: selection forwarding
- clicking imported node plays canvas.component.select

### applyHierarchyAndOrder
**File**: \packages\canvas-component\src\symphonies\import\import.nodes.stage-crew.ts
**Tests**: 6 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- import flow injects instance class on DOM elements
- adds rx-comp-<tag>-<id> class for imported components
- canvas-component import integration (migrated)
- imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV
- canvas-component import: nested structures
- imports container inside container
- imports grandchild component in nested container
- canvas-component import: selection forwarding
- clicking imported node plays canvas.component.select
- import variant toggle applies via rule engine
- applies rx-button--<variant> from content.variant even if classRefs lacked it

### parseUiFile
**File**: \packages\canvas-component\src\symphonies\import\import.parse.pure.ts
**Tests**: 8 files

- canvas-component export/import content preservation (migrated)
- should export and import button content correctly
- import.parse adds default base classes
- adds rx-comp and rx-<type> when missing from classRefs
- import flow injects instance class on DOM elements
- adds rx-comp-<tag>-<id> class for imported components
- canvas-component import integration (migrated)
- imports UI file: injects css, creates DOM hierarchy, applies layout, registers KV
- canvas-component import: nested structures
- imports container inside container
- imports grandchild component in nested container
- canvas-component import: selection forwarding
- clicking imported node plays canvas.component.select
- import variant toggle applies via rule engine
- applies rx-button--<variant> from content.variant even if classRefs lacked it
- React Component Export/Import
- should export React component with code and props
- should import React component with code and props preserved
- should preserve React code through export/import cycle

### startLineManip
**File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### moveLineManip
**File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
**Tests**: 2 files

- Advanced Line handlers — moveLineManip
- updates endpoint A and recomputes line geometry
- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### endLineManip
**File**: \packages\canvas-component\src\symphonies\line-advanced\line.manip.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### readFromClipboard
**File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
**Tests**: 1 files

- canvas-component paste.stage-crew handlers
- readFromClipboard - parses clipboard into clipboardData
- deserializeComponentData - uses provided clipboardText
- calculatePastePosition - offsets by +20,+20
- createPastedComponent - transforms and plays create sequence
- notifyPasteComplete - no-op success

### deserializeComponentData
**File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
**Tests**: 1 files

- canvas-component paste.stage-crew handlers
- readFromClipboard - parses clipboard into clipboardData
- deserializeComponentData - uses provided clipboardText
- calculatePastePosition - offsets by +20,+20
- createPastedComponent - transforms and plays create sequence
- notifyPasteComplete - no-op success

### calculatePastePosition
**File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
**Tests**: 1 files

- canvas-component paste.stage-crew handlers
- readFromClipboard - parses clipboard into clipboardData
- deserializeComponentData - uses provided clipboardText
- calculatePastePosition - offsets by +20,+20
- createPastedComponent - transforms and plays create sequence
- notifyPasteComplete - no-op success

### createPastedComponent
**File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
**Tests**: 2 files

- paste interactions attach and publish drag events
- attaches onDragMove to payload passed into canvas.component.create and publishes {id, position}
- canvas-component paste.stage-crew handlers
- readFromClipboard - parses clipboard into clipboardData
- deserializeComponentData - uses provided clipboardText
- calculatePastePosition - offsets by +20,+20
- createPastedComponent - transforms and plays create sequence
- notifyPasteComplete - no-op success

### notifyPasteComplete
**File**: \packages\canvas-component\src\symphonies\paste\paste.stage-crew.ts
**Tests**: 1 files

- canvas-component paste.stage-crew handlers
- readFromClipboard - parses clipboard into clipboardData
- deserializeComponentData - uses provided clipboardText
- calculatePastePosition - offsets by +20,+20
- createPastedComponent - transforms and plays create sequence
- notifyPasteComplete - no-op success

### startResize
**File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.stage-crew handlers
- startResize - captures line base metrics (non-line harmless)
- updateSize - applies size deltas and updates payload
- updateSize - throws on missing id
- endResize - executes without error

### updateSize
**File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.stage-crew handlers
- startResize - captures line base metrics (non-line harmless)
- updateSize - applies size deltas and updates payload
- updateSize - throws on missing id
- endResize - executes without error

### endResize
**File**: \packages\canvas-component\src\symphonies\resize\resize.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.stage-crew handlers
- startResize - captures line base metrics (non-line harmless)
- updateSize - applies size deltas and updates payload
- updateSize - throws on missing id
- endResize - executes without error

### startLineResize
**File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.line.stage-crew handlers
- startLineResize - calls optional callback harmlessly
- updateLine - updates endpoints/length
- updateLine - throws when id missing
- endLineResize - invokes optional callback

### updateLine
**File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.line.stage-crew handlers
- startLineResize - calls optional callback harmlessly
- updateLine - updates endpoints/length
- updateLine - throws when id missing
- endLineResize - invokes optional callback

### endLineResize
**File**: \packages\canvas-component\src\symphonies\resize-line\resize.line.stage-crew.ts
**Tests**: 1 files

- canvas-component resize.line.stage-crew handlers
- startLineResize - calls optional callback harmlessly
- updateLine - updates endpoints/length
- updateLine - throws when id missing
- endLineResize - invokes optional callback

### ensureOverlayCss
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.css.stage-crew.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### ensureOverlay
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
**Tests**: 2 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling
- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### getCanvasRect
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### applyOverlayRectForEl
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.dom.stage-crew.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### createOverlayStructure
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.helpers.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### resolveEndpoints
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.helpers.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### ensureAdvancedLineOverlayFor
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-advanced.stage-crew.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### attachAdvancedLineManipHandlers
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-advanced.stage-crew.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### ensureLineOverlayFor
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-resize.stage-crew.ts
**Tests**: 1 files

- line overlay + resize handlers
- ensureLineOverlayFor creates overlay with endpoints positioned from CSS vars
- attachLineResizeHandlers publishes start/move/end via EventRouter when conductor is provided
- attachLineResizeHandlers falls back to CSS var updates when conductor is absent

### attachLineResizeHandlers
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.line-resize.stage-crew.ts
**Tests**: 1 files

- line overlay + resize handlers
- ensureLineOverlayFor creates overlay with endpoints positioned from CSS vars
- attachLineResizeHandlers publishes start/move/end via EventRouter when conductor is provided
- attachLineResizeHandlers falls back to CSS var updates when conductor is absent

### attachResizeHandlers
**File**: \packages\canvas-component\src\symphonies\select\select.overlay.resize.stage-crew.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### routeSelectionRequest
**File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
**Tests**: 2 files

- canvas-component public API beats
- notifyUi (selection) routes to control panel selection.show via conductor.play
- routeSelectionRequest forwards to canvas.component.select with _routed flag
- updateAttribute applies update via rule engine and stores payload
- createNode creates element under #rx-canvas and populates createdNode payload
- canvas-component select.stage-crew handlers
- routeSelectionRequest - executes without throwing
- routeSelectionRequest - ignores missing id
- hideSelectionOverlay - hides overlay
- hideSelectionOverlay - safe when already hidden
- publishSelectionChanged - safe invocation with id
- publishSelectionChanged - safe invocation without id

### showSelectionOverlay
**File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
**Tests**: 10 files

- Container child overlay positioning issues (migrated)
- positions overlay over child when child is clicked (absolute to canvas)
- documents current overlay behavior for debugging
- canvas-component drag: overlay visibility (migrated)
- line component overlay is data-driven and uses standard resize when configured
- uses box overlay when no data-overlay=line is set (ignores class heuristics)
- resizes a line component via standard SE handle when enabled & handles provided
- ignores data-overlay=line and still uses standard overlay
- canvas-component resize (DOM-only)
- resizes the element via SE handle drag
- emits a single resize.move for repeated mousemove at same geometry
- selection overlay remains aligned with component after resize (conductor)
- resize overlay driven by template tools config
- shows only handles listed in data-resize-handles
- enforces min width/height constraints from data attributes during resize
- disables resizing entirely when data-resize-enabled is false
- canvas-component resize via conductor.play
- canvas-component resize: plugin routing (migrated)
- selection overlay positions correctly for children inside container
- computes overlay rect from canvas origin when element is container-relative
- selection overlay CSS ensures box-sizing border-box for accurate alignment

### hideSelectionOverlay
**File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
**Tests**: 1 files

- canvas-component select.stage-crew handlers
- routeSelectionRequest - executes without throwing
- routeSelectionRequest - ignores missing id
- hideSelectionOverlay - hides overlay
- hideSelectionOverlay - safe when already hidden
- publishSelectionChanged - safe invocation with id
- publishSelectionChanged - safe invocation without id

### publishSelectionChanged
**File**: \packages\canvas-component\src\symphonies\select\select.stage-crew.ts
**Tests**: 1 files

- canvas-component select.stage-crew handlers
- routeSelectionRequest - executes without throwing
- routeSelectionRequest - ignores missing id
- hideSelectionOverlay - hides overlay
- hideSelectionOverlay - safe when already hidden
- publishSelectionChanged - safe invocation with id
- publishSelectionChanged - safe invocation without id

### showSvgNodeOverlay
**File**: \packages\canvas-component\src\symphonies\select\select.svg-node.stage-crew.ts
**Tests**: 1 files

- SVG sub-node selection overlay (TDD)

### updateAttribute
**File**: \packages\canvas-component\src\symphonies\update\update.stage-crew.ts
**Tests**: 2 files

- canvas-component public API beats
- notifyUi (selection) routes to control panel selection.show via conductor.play
- routeSelectionRequest forwards to canvas.component.select with _routed flag
- updateAttribute applies update via rule engine and stores payload
- createNode creates element under #rx-canvas and populates createdNode payload
- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### refreshControlPanel
**File**: \packages\canvas-component\src\symphonies\update\update.stage-crew.ts
**Tests**: 1 files

- SVG node update functionality
- updates rect fill attribute correctly
- updates circle radius attribute correctly
- removes attribute when value is null or empty
- rejects non-whitelisted attributes
- handles invalid paths gracefully
- handles refresh control panel function
- handles missing element ID in refresh gracefully

### updateSvgNodeAttribute
**File**: \packages\canvas-component\src\symphonies\update\update.svg-node.stage-crew.ts
**Tests**: 1 files

- SVG node update functionality
- updates rect fill attribute correctly
- updates circle radius attribute correctly
- removes attribute when value is null or empty
- rejects non-whitelisted attributes
- handles invalid paths gracefully
- handles refresh control panel function
- handles missing element ID in refresh gracefully

### setClipboardText
**File**: \packages\canvas-component\src\symphonies\_clipboard.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### getClipboardText
**File**: \packages\canvas-component\src\symphonies\_clipboard.ts
**Tests**: 1 files

- canvas-component handlers handlers
- serializeSelectedComponent - returns clipboardData when element present
- serializeSelectedComponent - empty result when no selection
- copyToClipboard - writes to fallback clipboard memory
- notifyCopyComplete - does not throw
- resolveTemplate - populates ctx.payload fields
- resolveTemplate - throws on missing template
- injectCssFallback - injects style element once and appends css
- injectRawCss - delegates to stageCrew then fallback if error
- createFromImportRecord - invokes conductor play with transformed payload
- attachSelection - calls onSelected on click
- attachDrag - happy path (start/move/end callbacks)
- attachDrag - ignores non-left button and no callbacks fired
- attachSvgNodeClick - happy path publishes selection with derived path
- attachSvgNodeClick - clicking root svg does nothing
- computeInstanceClass - strips rx-node- prefix
- computeInstanceClass - no prefix preserved as-is
- computeCssVarBlock - renders vars with -- prefix
- computeCssVarBlock - empty returns blank string
- computeInlineStyle - merges template/style and position/dimensions
- computeInlineStyle - handles non-numeric dimensions and missing position
- notifyUi - happy path
- notifyUi - edge case/error handling
- Name - happy path
- publishDeleted - publishes canvas.component.deleted when id present
- publishDeleted - no id (missing) does not publish
- deleteComponent - removes element and hides overlays then publishes
- deleteComponent - missing id does nothing
- routeDeleteRequest - plays sequence when id provided
- routeDeleteRequest - missing id does not play
- exportSvgToGif - sets error when not SVG or missing
- createMP4Encoder - returns encoder with callable methods
- exportSvgToMp4 - errors when target missing
- exportSvgToMp4 - basic success with svg element (mocked 2D context)
- openUiFile - non-browser environment sets warning (simulated by temporarily redefining document)
- startLineManip - returns data unchanged
- endLineManip - no-op returns undefined
- moveLineManip - endpoint a updates x1/y1
- moveLineManip - curve handle sets --curve and updates control point
- updateAttribute - applies attribute via rule engine
- updateAttribute - missing id does nothing
- ensureOverlayCss - injects style only once
- ensureOverlay - creates overlay with 8 handles and reuses existing
- ensureOverlay - throws when canvas missing
- getCanvasRect - happy path
- getCanvasRect - edge case/error handling
- applyOverlayRectForEl - happy path
- applyOverlayRectForEl - edge case/error handling
- createOverlayStructure - happy path
- createOverlayStructure - edge case/error handling
- resolveEndpoints - happy path
- resolveEndpoints - edge case/error handling
- ensureAdvancedLineOverlayFor - happy path
- ensureAdvancedLineOverlayFor - edge case/error handling
- attachAdvancedLineManipHandlers - happy path
- attachAdvancedLineManipHandlers - edge case/error handling
- ensureLineOverlayFor - happy path
- ensureLineOverlayFor - edge case/error handling
- attachLineResizeHandlers - happy path
- attachLineResizeHandlers - edge case/error handling
- attachResizeHandlers - happy path
- attachResizeHandlers - edge case/error handling
- updateAttribute - happy path
- updateAttribute - edge case/error handling
- setClipboardText/getClipboardText - round trip stores and retrieves
- setClipboardText - empty string yields empty retrieval
- initConductor - happy path
- initConductor - edge case/error handling
- registerAllSequences - happy path
- registerAllSequences - edge case/error handling
- loadJsonSequenceCatalogs - happy path
- loadJsonSequenceCatalogs - edge case/error handling
- getFlagOverride - happy path
- getFlagOverride - edge case/error handling
- setAllRulesConfig - happy path
- setAllRulesConfig - edge case/error handling
- loadAllRulesFromWindow - happy path
- loadAllRulesFromWindow - edge case/error handling
- getAllRulesConfig - happy path
- getAllRulesConfig - edge case/error handling
- sanitizeHtml - happy path
- sanitizeHtml - edge case/error handling
- transform - happy path
- transform - edge case/error handling

### initConductor
**File**: \packages\canvas-component\src\temp-deps\conductor.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### registerAllSequences
**File**: \packages\canvas-component\src\temp-deps\conductor.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### loadJsonSequenceCatalogs
**File**: \packages\canvas-component\src\temp-deps\conductor.ts
**Tests**: 1 files

- advanced selection/overlay handlers batch
- getCanvasRect returns patched bounding client rect values
- applyOverlayRectForEl uses inline style dimensions when present
- createOverlayStructure creates advanced line overlay with handles a & b
- resolveEndpoints returns endpoints from line segment in viewBox space
- ensureAdvancedLineOverlayFor positions overlay and places handles within overlay bounds
- attachAdvancedLineManipHandlers updates CSS vars and recomputes endpoints on move
- attachResizeHandlers publishes start/move/end events via EventRouter
- initConductor returns conductor and registerAllSequences populates handlers
- loadJsonSequenceCatalogs adds handlers keyed by plugin IDs

### setFlagOverride
**File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
**Tests**: 7 files

- Advanced Line augmentation (Phase 1)
- Advanced Line handlers — moveLineManip
- updates endpoint A and recomputes line geometry
- Advanced Line overlay attaches on selection (flag ON)
- Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
- Advanced Line recompute (Phase 2+3)
- maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
- toggles marker-end via --arrowEnd CSS var
- renders quadratic path when --curve=1 with --cx/--cy
- applies rotate transform when --angle is set
- feature-flags getFlagOverride
- rule-engine config getters/setters
- sanitizeHtml
- returns overridden values and undefined when not set
- setAllRulesConfig then getAllRulesConfig returns same object
- loadAllRulesFromWindow pulls from global RenderX
- removes scripts and dangerous attributes
- allows safe data:image and http/https links
- Feature Flags
- isFlagEnabled
- getFlagMeta
- getAllFlags
- should return false for unknown flags
- should respect test overrides
- should delegate to host when available
- should log usage
- should return undefined for unknown flags
- should return built-in flag meta
- should delegate to host when available
- should return built-in flags
- should delegate to host when available

### clearFlagOverrides
**File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
**Tests**: 7 files

- Advanced Line augmentation (Phase 1)
- Advanced Line handlers — moveLineManip
- updates endpoint A and recomputes line geometry
- Advanced Line overlay attaches on selection (flag ON)
- Advanced Line overlay drag — cumulative delta causes runaway (expected failing)
- Advanced Line recompute (Phase 2+3)
- maps CSS vars to line x1/y1/x2/y2 in viewBox coordinates
- toggles marker-end via --arrowEnd CSS var
- renders quadratic path when --curve=1 with --cx/--cy
- applies rotate transform when --angle is set
- feature-flags getFlagOverride
- rule-engine config getters/setters
- sanitizeHtml
- returns overridden values and undefined when not set
- setAllRulesConfig then getAllRulesConfig returns same object
- loadAllRulesFromWindow pulls from global RenderX
- removes scripts and dangerous attributes
- allows safe data:image and http/https links
- Feature Flags
- isFlagEnabled
- getFlagMeta
- getAllFlags
- should return false for unknown flags
- should respect test overrides
- should delegate to host when available
- should log usage
- should return undefined for unknown flags
- should return built-in flag meta
- should delegate to host when available
- should return built-in flags
- should delegate to host when available

### getFlagOverride
**File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
**Tests**: 1 files

- feature-flags getFlagOverride
- rule-engine config getters/setters
- sanitizeHtml
- returns overridden values and undefined when not set
- setAllRulesConfig then getAllRulesConfig returns same object
- loadAllRulesFromWindow pulls from global RenderX
- removes scripts and dangerous attributes
- allows safe data:image and http/https links

### isFlagEnabled
**File**: \packages\canvas-component\src\temp-deps\feature-flags.ts
**Tests**: 1 files

- Feature Flags
- isFlagEnabled
- getFlagMeta
- getAllFlags
- should return false for unknown flags
- should respect test overrides
- should delegate to host when available
- should log usage
- should return undefined for unknown flags
- should return built-in flag meta
- should delegate to host when available
- should return built-in flags
- should delegate to host when available

### setSelectionObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 3 files

- Control Panel bidirectional attribute editing
- forwards content changes to Canvas component
- forwards styling changes to Canvas component
- forwards layout changes to Canvas component
- Canvas component updates DOM when receiving attribute changes
- updates trigger Control Panel refresh for bidirectional sync
- Control Panel ↔ Canvas Component Integration
- demonstrates full bidirectional attribute editing flow
- handles multiple rapid attribute changes
- gracefully handles invalid attribute updates
- observer.store idempotency
- setters are idempotent and clearAll resets observers

### getSelectionObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### setClassesObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### getClassesObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### setCssRegistryObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### getCssRegistryObserver
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### clearAllObservers
**File**: \packages\canvas-component\src\temp-deps\observer.store.ts
**Tests**: 1 files

- observer.store idempotency
- setters are idempotent and clearAll resets observers

### setAllRulesConfig
**File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
**Tests**: 1 files

- canvas-component rule-engine config handlers (public API)
- exports exist (sanity) and setAllRulesConfig followed by getAllRulesConfig returns the same config object
- loadAllRulesFromWindow picks up window-provided configuration
- getAllRulesConfig lazily loads from window when no cached config is set yet

### loadAllRulesFromWindow
**File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
**Tests**: 1 files

- canvas-component rule-engine config handlers (public API)
- exports exist (sanity) and setAllRulesConfig followed by getAllRulesConfig returns the same config object
- loadAllRulesFromWindow picks up window-provided configuration
- getAllRulesConfig lazily loads from window when no cached config is set yet

### getAllRulesConfig
**File**: \packages\canvas-component\src\temp-deps\rule-engine.ts
**Tests**: 1 files

- canvas-component rule-engine config handlers (public API)
- exports exist (sanity) and setAllRulesConfig followed by getAllRulesConfig returns the same config object
- loadAllRulesFromWindow picks up window-provided configuration
- getAllRulesConfig lazily loads from window when no cached config is set yet

### sanitizeHtml
**File**: \packages\canvas-component\src\temp-deps\sanitizeHtml.ts
**Tests**: 1 files

- feature-flags getFlagOverride
- rule-engine config getters/setters
- sanitizeHtml
- returns overridden values and undefined when not set
- setAllRulesConfig then getAllRulesConfig returns same object
- loadAllRulesFromWindow pulls from global RenderX
- removes scripts and dangerous attributes
- allows safe data:image and http/https links

### addClass
**File**: \packages\control-panel\src\symphonies\classes\classes.stage-crew.ts
**Tests**: 2 files

- control-panel: classes add/remove + notifyUi
- addClass adds class and populates payload
- removeClass removes class and populates payload
- notifyUi publishes control.panel.classes.updated when payload present
- control-panel handlers handlers
- addClass - happy path
- addClass - edge case/error handling
- removeClass - happy path
- removeClass - edge case/error handling
- if - happy path
- if - edge case/error handling
- catch - happy path
- catch - edge case/error handling
- deleteCssClass - happy path
- deleteCssClass - edge case/error handling
- getCssClass - happy path
- getCssClass - edge case/error handling
- listCssClasses - happy path
- listCssClasses - edge case/error handling
- applyCssClassToElement - happy path
- applyCssClassToElement - edge case/error handling
- removeCssClassFromElement - happy path
- removeCssClassFromElement - edge case/error handling
- deriveSelectionModel - happy path
- deriveSelectionModel - edge case/error handling
- initMovement - happy path
- initMovement - edge case/error handling
- initResolver - happy path
- initResolver - edge case/error handling
- loadSchemas - happy path
- loadSchemas - edge case/error handling
- registerObservers - happy path
- registerObservers - edge case/error handling
- notifyReady - happy path
- notifyReady - edge case/error handling
- generateFields - happy path
- generateFields - edge case/error handling
- generateSections - happy path
- generateSections - edge case/error handling
- renderView - happy path
- renderView - edge case/error handling
- prepareField - happy path
- prepareField - edge case/error handling
- dispatchField - happy path
- dispatchField - edge case/error handling
- setDirty - happy path
- setDirty - edge case/error handling
- awaitRefresh - happy path
- awaitRefresh - edge case/error handling
- validateField - happy path
- validateField - edge case/error handling
- mergeErrors - happy path
- mergeErrors - edge case/error handling
- updateView - happy path
- updateView - edge case/error handling
- toggleSection - happy path
- toggleSection - edge case/error handling
- updateFromElement - happy path
- updateFromElement - edge case/error handling
- registerFieldRenderer - happy path
- registerFieldRenderer - edge case/error handling
- getFieldRenderer - happy path
- getFieldRenderer - edge case/error handling
- EmptyState - happy path
- EmptyState - edge case/error handling
- LoadingState - happy path
- LoadingState - edge case/error handling
- PanelHeader - happy path
- PanelHeader - edge case/error handling
- useControlPanelActions - happy path
- useControlPanelActions - edge case/error handling
- useControlPanelSequences - happy path
- useControlPanelSequences - edge case/error handling
- useControlPanelState - happy path
- useControlPanelState - edge case/error handling
- useSchemaResolver - happy path
- useSchemaResolver - edge case/error handling
- controlPanelReducer - happy path
- controlPanelReducer - edge case/error handling
- extractElementContent - happy path
- extractElementContent - edge case/error handling
- getNestedValue - happy path
- getNestedValue - edge case/error handling
- setNestedValue - happy path
- setNestedValue - edge case/error handling
- formatLabel - happy path
- formatLabel - edge case/error handling
- generatePlaceholder - happy path
- generatePlaceholder - edge case/error handling

### removeClass
**File**: \packages\control-panel\src\symphonies\classes\classes.stage-crew.ts
**Tests**: 1 files

- control-panel: classes add/remove + notifyUi
- addClass adds class and populates payload
- removeClass removes class and populates payload
- notifyUi publishes control.panel.classes.updated when payload present

### createCssClass
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- CSS registry idempotency
- createCssClass is idempotent: second create with same content is a success no-op
- updateCssClass upserts when missing and no-ops when content unchanged

### updateCssClass
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- CSS registry idempotency
- createCssClass is idempotent: second create with same content is a success no-op
- updateCssClass upserts when missing and no-ops when content unchanged

### getCssClass
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- control-panel css-management retrieval/apply handlers (public API)
- getCssClass returns built-in class definition (rx-button)
- getCssClass sets error when class missing
- listCssClasses returns built-in classes collection
- applyCssClassToElement adds class to DOM element and sets payload success
- applyCssClassToElement sets error when element missing
- removeCssClassFromElement removes existing class from DOM element
- removeCssClassFromElement sets error when element missing

### listCssClasses
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- control-panel css-management retrieval/apply handlers (public API)
- getCssClass returns built-in class definition (rx-button)
- getCssClass sets error when class missing
- listCssClasses returns built-in classes collection
- applyCssClassToElement adds class to DOM element and sets payload success
- applyCssClassToElement sets error when element missing
- removeCssClassFromElement removes existing class from DOM element
- removeCssClassFromElement sets error when element missing

### applyCssClassToElement
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- control-panel css-management retrieval/apply handlers (public API)
- getCssClass returns built-in class definition (rx-button)
- getCssClass sets error when class missing
- listCssClasses returns built-in classes collection
- applyCssClassToElement adds class to DOM element and sets payload success
- applyCssClassToElement sets error when element missing
- removeCssClassFromElement removes existing class from DOM element
- removeCssClassFromElement sets error when element missing

### removeCssClassFromElement
**File**: \packages\control-panel\src\symphonies\css-management\css-management.stage-crew.ts
**Tests**: 1 files

- control-panel css-management retrieval/apply handlers (public API)
- getCssClass returns built-in class definition (rx-button)
- getCssClass sets error when class missing
- listCssClasses returns built-in classes collection
- applyCssClassToElement adds class to DOM element and sets payload success
- applyCssClassToElement sets error when element missing
- removeCssClassFromElement removes existing class from DOM element
- removeCssClassFromElement sets error when element missing

### deriveSelectionModel
**File**: \packages\control-panel\src\symphonies\selection\selection.stage-crew.ts
**Tests**: 1 files

- control-panel selection deriveSelectionModel handler (public API)
- returns null selectionModel when id missing
- returns null selectionModel when element not found
- derives model for element with rx-button class
- falls back to container type for plain div without rx- classes

### initConfig
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- Core Environment Config
- initConfig
- setConfigValue
- removeConfigValue
- getAllConfigKeys
- clearConfig
- Integration scenarios
- should initialize empty config when no initial config provided
- should initialize with provided config values
- should filter out undefined values from initial config
- should attach config to window.RenderX.config
- should clear existing config when re-initialized
- should handle empty string values
- should set a new config value
- should update an existing config value
- should work with window.RenderX.config
- should remove an existing config value
- should not throw when removing non-existent key
- should return empty array for empty config
- should return all config keys
- should reflect changes after set and remove
- should clear all config values
- should work on empty config
- should support environment variable pattern
- should support runtime configuration updates
- should work with plugin SDK facade

### initResolver
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 2 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation
- control-panel UI bootstrap handlers (public API)
- initResolver initializes resolver and sets payload flags
- loadSchemas sets schemasLoaded when resolver present (test env shortcut)
- registerObservers marks observersRegistered
- notifyReady sets uiReady and timestamp

### loadSchemas
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel UI bootstrap handlers (public API)
- initResolver initializes resolver and sets payload flags
- loadSchemas sets schemasLoaded when resolver present (test env shortcut)
- registerObservers marks observersRegistered
- notifyReady sets uiReady and timestamp

### registerObservers
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel UI bootstrap handlers (public API)
- initResolver initializes resolver and sets payload flags
- loadSchemas sets schemasLoaded when resolver present (test env shortcut)
- registerObservers marks observersRegistered
- notifyReady sets uiReady and timestamp

### notifyReady
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel UI bootstrap handlers (public API)
- initResolver initializes resolver and sets payload flags
- loadSchemas sets schemasLoaded when resolver present (test env shortcut)
- registerObservers marks observersRegistered
- notifyReady sets uiReady and timestamp

### generateFields
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### generateSections
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### prepareField
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### dispatchField
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### setDirty
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel state/update/refresh handlers (public API)
- setDirty marks isDirty with timestamp
- awaitRefresh sets refreshAwaited flag
- updateView sets viewUpdated and timestamp
- toggleSection marks sectionToggled with provided id
- toggleSection error path sets sectionToggled false and error
- updateFromElement builds full selectionModel (non-drag) with classes
- updateFromElement drag path uses forwarded position/size and minimal model

### awaitRefresh
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel state/update/refresh handlers (public API)
- setDirty marks isDirty with timestamp
- awaitRefresh sets refreshAwaited flag
- updateView sets viewUpdated and timestamp
- toggleSection marks sectionToggled with provided id
- toggleSection error path sets sectionToggled false and error
- updateFromElement builds full selectionModel (non-drag) with classes
- updateFromElement drag path uses forwarded position/size and minimal model

### validateField
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### mergeErrors
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel field lifecycle handlers (public API)
- generateFields populates fields array with layout/styling fields
- generateSections returns default sections for button component
- prepareField stores field change context in payload
- dispatchField calls conductor.play with mapped sequence when prepared
- validateField returns invalid for bad number value and valid for good value
- mergeErrors marks errorsMerged after validation

### updateView
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel state/update/refresh handlers (public API)
- setDirty marks isDirty with timestamp
- awaitRefresh sets refreshAwaited flag
- updateView sets viewUpdated and timestamp
- toggleSection marks sectionToggled with provided id
- toggleSection error path sets sectionToggled false and error
- updateFromElement builds full selectionModel (non-drag) with classes
- updateFromElement drag path uses forwarded position/size and minimal model

### toggleSection
**File**: \packages\control-panel\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- control-panel state/update/refresh handlers (public API)
- setDirty marks isDirty with timestamp
- awaitRefresh sets refreshAwaited flag
- updateView sets viewUpdated and timestamp
- toggleSection marks sectionToggled with provided id
- toggleSection error path sets sectionToggled false and error
- updateFromElement builds full selectionModel (non-drag) with classes
- updateFromElement drag path uses forwarded position/size and minimal model

### updateFromElement
**File**: \packages\control-panel\src\symphonies\update\update.stage-crew.ts
**Tests**: 1 files

- control-panel state/update/refresh handlers (public API)
- setDirty marks isDirty with timestamp
- awaitRefresh sets refreshAwaited flag
- updateView sets viewUpdated and timestamp
- toggleSection marks sectionToggled with provided id
- toggleSection error path sets sectionToggled false and error
- updateFromElement builds full selectionModel (non-drag) with classes
- updateFromElement drag path uses forwarded position/size and minimal model

### ControlPanel
**File**: \packages\control-panel\src\ui\ControlPanel.tsx
**Tests**: 1 files

- @renderx-plugins/control-panel package exports
- exports ControlPanel UI component
- exports register() function (no-op allowed)
- exports selection symphony handlers

### getCurrentTheme
**File**: \packages\header\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- ui.stage-crew handlers
- getCurrentTheme applies DOM attribute and persists
- getCurrentTheme respects existing DOM attribute first
- toggleTheme flips and persists theme

### toggleTheme
**File**: \packages\header\src\symphonies\ui\ui.stage-crew.ts
**Tests**: 1 files

- ui.stage-crew handlers
- getCurrentTheme applies DOM attribute and persists
- getCurrentTheme respects existing DOM attribute first
- toggleTheme flips and persists theme

### HeaderControls
**File**: \packages\header\src\ui\HeaderControls.tsx
**Tests**: 1 files

- header handlers handlers
- HeaderControls - happy path
- HeaderControls - edge case/error handling
- HeaderThemeToggle - happy path
- HeaderThemeToggle - edge case/error handling
- HeaderTitle - happy path
- HeaderTitle - edge case/error handling

### loadComponents
**File**: \packages\library\src\symphonies\load.symphony.ts
**Tests**: 1 files

- library handlers handlers
- loadComponents - happy path
- loadComponents - edge case/error handling
- for - happy path
- for - edge case/error handling
- RAGEnrichmentService.if - happy path
- RAGEnrichmentService.if - edge case/error handling
- ComponentBehaviorExtractor.for - happy path
- ComponentBehaviorExtractor.for - edge case/error handling
- ComponentBehaviorExtractor.if - happy path
- ComponentBehaviorExtractor.if - edge case/error handling
- ChatMessageComponent - happy path
- ChatMessageComponent - edge case/error handling
- ChatWindow - happy path
- ChatWindow - edge case/error handling
- ConfigStatusUI - happy path
- ConfigStatusUI - edge case/error handling
- CustomComponentList - happy path
- CustomComponentList - edge case/error handling
- CustomComponentUpload - happy path
- CustomComponentUpload - edge case/error handling
- registerCssForComponents - happy path
- registerCssForComponents - edge case/error handling
- LibraryPanel - happy path
- LibraryPanel - edge case/error handling
- LibraryPreview - happy path
- LibraryPreview - edge case/error handling
- computePreviewModel - happy path
- computePreviewModel - edge case/error handling
- startNewChatSession - happy path
- startNewChatSession - edge case/error handling
- exportChatHistory - happy path
- exportChatHistory - edge case/error handling
- importChatHistory - happy path
- importChatHistory - edge case/error handling
- cleanupChatHistory - happy path
- cleanupChatHistory - edge case/error handling
- buildSystemPrompt - happy path
- buildSystemPrompt - edge case/error handling
- getPromptTemplate - happy path
- getPromptTemplate - edge case/error handling

### loadChatHistory
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### saveChatHistory
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### createChatSession
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### addMessagesToCurrentSession
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### getCurrentChatSession
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### deleteChatSession
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### clearAllChatHistory
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### getChatHistoryStats
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### getConversationContext
**File**: \packages\library\src\utils\chat.utils.ts
**Tests**: 1 files

- Chat Utils
- loadChatHistory
- saveChatHistory
- createChatSession
- addMessagesToCurrentSession
- getCurrentChatSession
- deleteChatSession
- clearAllChatHistory
- getChatHistoryStats
- getConversationContext
- should return empty array when no history exists
- should load existing chat history
- should handle corrupted localStorage data
- should handle non-array data
- should save chat history to localStorage
- should limit number of sessions
- should limit messages per session
- should handle localStorage errors
- should create a new chat session with default title
- should create a chat session with messages and generated title
- should truncate long titles
- should create new session if none exists
- should add messages to existing session
- should update session title if still default
- should return null when no sessions exist
- should return the most recent session
- should delete session by ID
- should return false if session not found
- should clear all chat history
- should return stats for empty history
- should calculate stats correctly
- should return empty array when no current session
- should return recent messages excluding errors

### saveCustomComponent
**File**: \packages\library\src\utils\storage.utils.ts
**Tests**: 1 files

- storage.utils
- saveCustomComponent
- loadCustomComponents
- removeCustomComponent
- clearCustomComponents
- getStorageInfo
- should save a valid component successfully
- should reject component without required metadata.type
- should reject component without required metadata.name
- should reject duplicate component types
- should preserve existing category
- should return empty array when no components stored
- should return stored components
- should handle corrupted localStorage data gracefully
- should handle non-array data in localStorage
- should remove existing component
- should return false for non-existent component
- should handle localStorage errors gracefully
- should clear all components
- should handle localStorage errors gracefully
- should return correct storage info for empty storage
- should return correct storage info with components

### loadCustomComponents
**File**: \packages\library\src\utils\storage.utils.ts
**Tests**: 3 files

- library.handlers
- loadComponents uses Host SDK inventory when available and assigns payload components
- loadComponents merges custom components with inventory components
- loadComponents works with only custom components when no inventory
- loadComponents handles empty custom components
- notifyUi calls onComponentsLoaded from ctx.payload (not from data parameter)
- library.handlers - Two-Beat Sequence Integration
- REAL SCENARIO: callback flows from loadComponents beat to notifyUi beat via ctx.payload
- REAL SCENARIO: callback is preserved in ctx.payload after loadComponents
- storage.utils
- saveCustomComponent
- loadCustomComponents
- removeCustomComponent
- clearCustomComponents
- getStorageInfo
- should save a valid component successfully
- should reject component without required metadata.type
- should reject component without required metadata.name
- should reject duplicate component types
- should preserve existing category
- should return empty array when no components stored
- should return stored components
- should handle corrupted localStorage data gracefully
- should handle non-array data in localStorage
- should remove existing component
- should return false for non-existent component
- should handle localStorage errors gracefully
- should clear all components
- should handle localStorage errors gracefully
- should return correct storage info for empty storage
- should return correct storage info with components

### removeCustomComponent
**File**: \packages\library\src\utils\storage.utils.ts
**Tests**: 1 files

- storage.utils
- saveCustomComponent
- loadCustomComponents
- removeCustomComponent
- clearCustomComponents
- getStorageInfo
- should save a valid component successfully
- should reject component without required metadata.type
- should reject component without required metadata.name
- should reject duplicate component types
- should preserve existing category
- should return empty array when no components stored
- should return stored components
- should handle corrupted localStorage data gracefully
- should handle non-array data in localStorage
- should remove existing component
- should return false for non-existent component
- should handle localStorage errors gracefully
- should clear all components
- should handle localStorage errors gracefully
- should return correct storage info for empty storage
- should return correct storage info with components

### clearCustomComponents
**File**: \packages\library\src\utils\storage.utils.ts
**Tests**: 1 files

- storage.utils
- saveCustomComponent
- loadCustomComponents
- removeCustomComponent
- clearCustomComponents
- getStorageInfo
- should save a valid component successfully
- should reject component without required metadata.type
- should reject component without required metadata.name
- should reject duplicate component types
- should preserve existing category
- should return empty array when no components stored
- should return stored components
- should handle corrupted localStorage data gracefully
- should handle non-array data in localStorage
- should remove existing component
- should return false for non-existent component
- should handle localStorage errors gracefully
- should clear all components
- should handle localStorage errors gracefully
- should return correct storage info for empty storage
- should return correct storage info with components

### getStorageInfo
**File**: \packages\library\src\utils\storage.utils.ts
**Tests**: 1 files

- storage.utils
- saveCustomComponent
- loadCustomComponents
- removeCustomComponent
- clearCustomComponents
- getStorageInfo
- should save a valid component successfully
- should reject component without required metadata.type
- should reject component without required metadata.name
- should reject duplicate component types
- should preserve existing category
- should return empty array when no components stored
- should return stored components
- should handle corrupted localStorage data gracefully
- should handle non-array data in localStorage
- should remove existing component
- should return false for non-existent component
- should handle localStorage errors gracefully
- should clear all components
- should handle localStorage errors gracefully
- should return correct storage info for empty storage
- should return correct storage info with components

### validateComponentJson
**File**: \packages\library\src\utils\validation.utils.ts
**Tests**: 1 files

- validation.utils
- validateComponentJson
- normalizeComponent
- validateAndParseJson
- validateFile
- should validate a correct component
- should reject non-object input
- should reject null input
- should reject array input
- should require metadata object
- should require metadata.type
- should require metadata.name
- should validate metadata.type format
- should accept valid metadata.type format
- should require ui object
- should require ui to have content
- should accept ui with template object
- should accept ui with template string (Handlebars)
- should reject ui with invalid template type
- should accept ui with styles
- should accept real JSON component format with integration and interactions
- should warn about unknown properties
- should warn about non-custom category
- should validate optional fields when present
- should normalize a component with all fields
- should set default category and description
- should parse and validate valid JSON
- should reject invalid JSON
- should reject valid JSON with invalid component
- should validate a correct JSON file
- should reject non-JSON file extension
- should reject files that are too large
- should warn about unexpected MIME type
- should accept text MIME type

### normalizeComponent
**File**: \packages\library\src\utils\validation.utils.ts
**Tests**: 1 files

- validation.utils
- validateComponentJson
- normalizeComponent
- validateAndParseJson
- validateFile
- should validate a correct component
- should reject non-object input
- should reject null input
- should reject array input
- should require metadata object
- should require metadata.type
- should require metadata.name
- should validate metadata.type format
- should accept valid metadata.type format
- should require ui object
- should require ui to have content
- should accept ui with template object
- should accept ui with template string (Handlebars)
- should reject ui with invalid template type
- should accept ui with styles
- should accept real JSON component format with integration and interactions
- should warn about unknown properties
- should warn about non-custom category
- should validate optional fields when present
- should normalize a component with all fields
- should set default category and description
- should parse and validate valid JSON
- should reject invalid JSON
- should reject valid JSON with invalid component
- should validate a correct JSON file
- should reject non-JSON file extension
- should reject files that are too large
- should warn about unexpected MIME type
- should accept text MIME type

### validateAndParseJson
**File**: \packages\library\src\utils\validation.utils.ts
**Tests**: 1 files

- validation.utils
- validateComponentJson
- normalizeComponent
- validateAndParseJson
- validateFile
- should validate a correct component
- should reject non-object input
- should reject null input
- should reject array input
- should require metadata object
- should require metadata.type
- should require metadata.name
- should validate metadata.type format
- should accept valid metadata.type format
- should require ui object
- should require ui to have content
- should accept ui with template object
- should accept ui with template string (Handlebars)
- should reject ui with invalid template type
- should accept ui with styles
- should accept real JSON component format with integration and interactions
- should warn about unknown properties
- should warn about non-custom category
- should validate optional fields when present
- should normalize a component with all fields
- should set default category and description
- should parse and validate valid JSON
- should reject invalid JSON
- should reject valid JSON with invalid component
- should validate a correct JSON file
- should reject non-JSON file extension
- should reject files that are too large
- should warn about unexpected MIME type
- should accept text MIME type

### validateFile
**File**: \packages\library\src\utils\validation.utils.ts
**Tests**: 1 files

- validation.utils
- validateComponentJson
- normalizeComponent
- validateAndParseJson
- validateFile
- should validate a correct component
- should reject non-object input
- should reject null input
- should reject array input
- should require metadata object
- should require metadata.type
- should require metadata.name
- should validate metadata.type format
- should accept valid metadata.type format
- should require ui object
- should require ui to have content
- should accept ui with template object
- should accept ui with template string (Handlebars)
- should reject ui with invalid template type
- should accept ui with styles
- should accept real JSON component format with integration and interactions
- should warn about unknown properties
- should warn about non-custom category
- should validate optional fields when present
- should normalize a component with all fields
- should set default category and description
- should parse and validate valid JSON
- should reject invalid JSON
- should reject valid JSON with invalid component
- should validate a correct JSON file
- should reject non-JSON file extension
- should reject files that are too large
- should warn about unexpected MIME type
- should accept text MIME type

### ensurePayload
**File**: \packages\library-component\src\symphonies\drag\drag.preview.stage-crew.ts
**Tests**: 1 files

- library-component handlers handlers
- ensurePayload - happy path
- ensurePayload - edge case/error handling
- computeGhostSize - happy path
- computeGhostSize - edge case/error handling
- createGhostContainer - happy path
- createGhostContainer - edge case/error handling
- renderTemplatePreview - happy path
- renderTemplatePreview - edge case/error handling
- applyTemplateStyles - happy path
- applyTemplateStyles - edge case/error handling
- computeCursorOffsets - happy path
- computeCursorOffsets - edge case/error handling
- installDragImage - happy path
- installDragImage - edge case/error handling
- onDragStart - happy path
- onDragStart - edge case/error handling
- publishCreateRequested - happy path
- publishCreateRequested - edge case/error handling

### fetchPropertyData
**File**: \packages\real-estate-analyzer\src\index.ts
**Tests**: 1 files

- real-estate-analyzer handlers handlers
- fetchPropertyData - happy path
- fetchPropertyData - edge case/error handling
- analyze - happy path
- analyze - edge case/error handling
- format - happy path
- format - edge case/error handling
- ZillowService.if - happy path
- ZillowService.if - edge case/error handling
- OpportunityAnalyzer - happy path
- OpportunityAnalyzer - edge case/error handling

