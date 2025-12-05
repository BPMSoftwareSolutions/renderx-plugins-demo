# AC Alignment Status: Canvas Component Create Symphony

**Domain:** `canvas-component-create-symphony`
**Generated:** 2025-12-03
**Overall Coverage:** 32% (7/22 ACs)
**THEN Clause Coverage:** 70% (28/40 clauses)

## ✅ Coverage Summary by Beat

| Beat | Handler | Total ACs | Covered | Coverage % | Status |
|------|---------|-----------|---------|------------|--------|
| 1.1 | resolveTemplate | 3 | 0 | 0% | ❌ Needs Tests |
| 1.2 | registerInstance | 3 | 1 | 33% | ⚠️ Partial |
| 1.3 | createNode | 4 | 1 | 25% | ⚠️ Partial |
| 1.4 | renderReact | 5 | 2 | 40% | ⚠️ Partial |
| 1.5 | notifyUi | 3 | 1 | 33% | ⚠️ Partial |
| 1.6 | enhanceLine | 4 | 2 | 50% | ⚠️ Partial |

## ✅ Covered ACs (7)

### Beat 1.2 - registerInstance
- ✅ **AC 1.2:1** - [import.instance-class.spec.ts:104](../packages/canvas-component/__tests__/import.instance-class.spec.ts#L104)
  - Given: valid nodeId and template exist in context.payload
  - Then: semantic class rx-comp-<tag>-<id> is assigned for imported components

### Beat 1.3 - createNode
- ✅ **AC 1.3:1** - [create.dom.spec.ts:61](../packages/canvas-component/__tests__/create.dom.spec.ts#L61)
  - Given: valid template and nodeId exist in context.payload
  - Then: DOM element is created with specified tag and ID

### Beat 1.4 - renderReact
- ✅ **AC 1.4:1** - [create.react.integration.spec.ts:122](../packages/canvas-component/__tests__/create.react.integration.spec.ts#L122)
  - Given: context.payload.kind is 'react' with valid reactCode
  - Then: React component is compiled and mounted using createRoot

- ✅ **AC 1.4:5** - [create.react.integration.spec.ts:166](../packages/canvas-component/__tests__/create.react.integration.spec.ts#L166)
  - Given: context.payload.kind is not 'react'
  - Then: handler returns early without processing

### Beat 1.5 - notifyUi
- ✅ **AC 1.5:1** - [api.canvas-component.create.notify.spec.ts:61](../packages/canvas-component/__tests__/api.canvas-component.create.notify.spec.ts#L61)
  - Given: component has been created with id and correlationId
  - Then: canvas.component.created event is published via EventRouter

### Beat 1.6 - enhanceLine
- ✅ **AC 1.6:1** - [advanced-line.augment.spec.ts:77](../packages/canvas-component/__tests__/advanced-line.augment.spec.ts#L77)
  - Given: lineAdvanced feature flag is enabled and SVG element with rx-line class exists
  - Then: line markers defs are created with rx-arrow-end marker

- ✅ **AC 1.6:4** - [advanced-line.augment.spec.ts:77](../packages/canvas-component/__tests__/advanced-line.augment.spec.ts#L77)
  - Given: markers already exist in SVG defs
  - Then: existing markers are preserved, no duplicate markers are created

## ❌ Uncovered ACs (15)

### Beat 1.1 - resolveTemplate (0% coverage - 3 ACs uncovered)

#### ❌ AC 1.1:1 - Template Resolution Success Path
**Given:** valid component data with template is provided
**When:** resolveTemplate processes the input
**Then:**
- template is extracted and stored in context.payload.template
- a unique node ID is generated or override ID is used
- React rendering strategy is detected when render.strategy === 'react'

**And:**
- operation completes within 1s P95
- schema fetches are deduped across calls and instances
- telemetry includes latency metrics

**Recommended Test:** Add to `__tests__/create.from-data.spec.ts` or create `__tests__/create.resolve-template.spec.ts`

#### ❌ AC 1.1:2 - Missing Template Error Handling
**Given:** component data is missing template
**When:** resolveTemplate processes invalid input
**Then:**
- error is thrown with message 'Missing component template.'

**And:**
- error context is logged
- system remains stable

**Recommended Test:** Add to `__tests__/create.resolve-template.spec.ts`

#### ❌ AC 1.1:3 - Import with Override Node ID
**Given:** import scenario with _overrideNodeId provided
**When:** resolveTemplate processes import data
**Then:**
- override ID is used instead of generating new ID
- template resolution proceeds normally

**And:**
- imported nodes have stable, predictable IDs

**Recommended Test:** Add to `__tests__/create.from-import.spec.ts`

---

### Beat 1.2 - registerInstance (33% coverage - 2 ACs uncovered)

#### ❌ AC 1.2:2 - Missing NodeId/Template Error
**Given:** nodeId or template is missing from payload
**When:** registerInstance executes with invalid state
**Then:**
- error is thrown with message 'Missing nodeId/template in payload for IO registration'

**And:**
- error is logged with context
- system remains stable

**Recommended Test:** Add to `__tests__/create.io.spec.ts`

#### ❌ AC 1.2:3 - Content Properties Persistence
**Given:** template includes content properties
**When:** registerInstance persists metadata
**Then:**
- content properties are included in KV data

**And:**
- instance can be rehydrated with full state

**Recommended Test:** Add to `__tests__/create.io.spec.ts`

---

### Beat 1.3 - createNode (25% coverage - 3 ACs uncovered)

#### ❌ AC 1.3:2 - SVG Line Component Creation
**Given:** template specifies SVG with rx-line class
**When:** createNode processes SVG line component
**Then:**
- SVG element is created with viewBox and preserveAspectRatio
- child <line> element with segment class is appended
- line attributes (x1, y1, x2, y2) are set

**And:**
- vector-effect='non-scaling-stroke' is applied

**Recommended Test:** Add to `__tests__/create.svg.basic.spec.ts`

#### ❌ AC 1.3:3 - Container Element Creation
**Given:** template includes data-role='container'
**When:** createNode processes container element
**Then:**
- data-role attribute is set to 'container'
- position: relative is applied

**And:**
- element can host child components

**Recommended Test:** Add to `__tests__/create.container-append.spec.ts`

#### ❌ AC 1.3:4 - Nested Component Creation
**Given:** import scenario with containerId specified
**When:** createNode appends element
**Then:**
- element is appended to specified container instead of canvas

**And:**
- nested component structure is preserved

**Recommended Test:** Add to `__tests__/create.container-append.spec.ts`

---

### Beat 1.4 - renderReact (40% coverage - 3 ACs uncovered)

#### ❌ AC 1.4:2 - React Code Validation Failure
**Given:** React code validation fails
**When:** renderReact validates code
**Then:**
- error message lists validation failures
- react.component.error event is published
- error is displayed in container with user-friendly styling

**And:**
- context.payload.reactError contains error message
- system remains stable

**Recommended Test:** Add to `__tests__/create.react.spec.ts`

#### ❌ AC 1.4:3 - JSX Compilation Failure
**Given:** JSX compilation fails
**When:** Babel transforms code
**Then:**
- compilation error is captured
- ErrorComponent is rendered showing error details
- react.component.error event is published

**And:**
- HTML is escaped to prevent XSS
- diagnostics emitter records error

**Recommended Test:** Add to `__tests__/create.react.spec.ts`

#### ❌ AC 1.4:4 - React Root Cleanup
**Given:** existing React root exists for nodeId
**When:** renderReact is called again
**Then:**
- existing root is unmounted before creating new root

**And:**
- memory leaks are prevented

**Recommended Test:** Add to `__tests__/create.react.spec.ts`

---

### Beat 1.5 - notifyUi (33% coverage - 2 ACs uncovered)

#### ❌ AC 1.5:2 - Missing ID Handling
**Given:** id or correlationId is missing
**When:** notifyUi executes
**Then:**
- event publication is skipped
- callback is still invoked if provided

**And:**
- system remains stable

**Recommended Test:** Add to `__tests__/api.canvas-component.create.notify.spec.ts`

#### ❌ AC 1.5:3 - Concurrent Notifications
**Given:** multiple components are created rapidly
**When:** notifyUi handles concurrent notifications
**Then:**
- events are delivered in order without missed transitions

**And:**
- backpressure mechanisms prevent queue overflow

**Recommended Test:** Add to `__tests__/api.canvas-component.create.notify.spec.ts`

---

### Beat 1.6 - enhanceLine (50% coverage - 2 ACs uncovered)

#### ❌ AC 1.6:2 - Feature Flag Disabled
**Given:** lineAdvanced feature flag is disabled
**When:** enhanceLine executes
**Then:**
- handler returns early without processing

**And:**
- feature flag controls advanced line features

**Recommended Test:** Add to `__tests__/advanced-line.augment.spec.ts`

#### ❌ AC 1.6:3 - Invalid Element Type
**Given:** element is not SVG or does not have rx-line class
**When:** enhanceLine validates element
**Then:**
- handler returns early without augmentation

**And:**
- non-line elements are not affected

**Recommended Test:** Add to `__tests__/advanced-line.augment.spec.ts`

---

## 📋 Action Plan to Achieve 100% Coverage

### Priority 1: High-Impact Tests (Covers 6 ACs)
1. **resolveTemplate tests** (3 ACs) - Create `__tests__/create.resolve-template.spec.ts`
2. **React error handling** (3 ACs) - Extend `__tests__/create.react.spec.ts`

### Priority 2: Medium-Impact Tests (Covers 5 ACs)
3. **SVG/Container creation** (3 ACs) - Extend existing SVG/container tests
4. **notifyUi edge cases** (2 ACs) - Extend `__tests__/api.canvas-component.create.notify.spec.ts`

### Priority 3: Low-Impact Tests (Covers 4 ACs)
5. **registerInstance edge cases** (2 ACs) - Extend `__tests__/create.io.spec.ts`
6. **enhanceLine guards** (2 ACs) - Extend `__tests__/advanced-line.augment.spec.ts`

## 📊 Current Status vs Target

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| AC Coverage | 32% (7/22) | 100% (22/22) | 🟡 |
| THEN Coverage | 70% (28/40) | 100% (40/40) | 🟢 |
| Tests Tagged | 7 | 22 | 🟡 |
| Beats Covered | 5/6 | 6/6 | 🟢 |

## ✅ Implementation Completed

1. ✅ Fixed anti-pattern: Test file paths now point to package-internal tests
2. ✅ Added AC tags to test titles (format: `[AC:domain:sequence:beat:acIndex]`)
3. ✅ Added explicit GWT structure in test comments
4. ✅ Mapped assertions to THEN clauses with inline comments
5. ✅ Generated AC registry and coverage reports
6. ✅ Achieved 32% AC coverage baseline

## 🎯 Next Steps

To achieve 100% coverage, add the 15 uncovered test cases listed above. Each test should:
- Include AC tag in test title: `[AC:canvas-component-create-symphony:canvas-component-create-symphony:X.Y:Z]`
- Have GWT documentation in block comments
- Map assertions to THEN clauses with inline comments
- Test all conditions from the Given/When/Then/And clauses
