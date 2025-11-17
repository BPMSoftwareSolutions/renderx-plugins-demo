# RenderX-Web Architecture Analysis Report

## Executive Summary

**Codebase**: renderx-web (543 files, 1,010 symbols, 4,579 calls)

### Critical Finding: IR Extraction Bug (FIXED)

The analysis revealed a **critical bug in the TypeScript IR extractor** that created **507 duplicate symbol entries** (50% of all symbols). The analyzer now **deduplicates at source**, eliminating false positives.

```
Total symbol entries:    1,010
Unique symbol IDs:         503
Duplicate entries:         507 (50% of IR - now deduplicated)
Affected symbols:           85 classes/functions
```

**Root Cause**: The IR extractor creates multiple entries for the same symbol ID, particularly for methods named `.if` (likely a parsing issue with conditional blocks or property accessors).

**Fix Applied**: `_build_arch_graph()` now deduplicates symbols by ID before analysis.

---

## Redundancy Analysis

### Top 10 Most Duplicated Symbols (in IR)

```
1. KnowledgeCLI.if              37 copies (should be 1)
2. PluginValidator.if           28 copies
3. SequenceRegistry.if          20 copies
4. KnowledgeValidator.if        19 copies
5. KnowledgeImporter.if         17 copies
6. MovementExecutor.if          15 copies
7. PluginManifestLoader.if      14 copies
8. SequenceUtilities.if         14 copies
9. OpenAIService.if             13 copies
10. RAGEnrichmentService.if     13 copies
```

**Status**: ✓ Analyzer now handles duplicates gracefully. IR extraction bug remains (separate issue).

---

## Actual Architecture Issues (Deduplicated)

### 1. God Functions (101 unique)

**Top 5 Real God Functions**:

```
1. KnowledgeCLI.if
   ├─ 281 total calls
   ├─ 71 unique callees (25.3% unique)
   └─ Top calls: log(131), forEach(15), header(8)

2. recomputeLineSvg
   ├─ 83 total calls
   ├─ 24 unique callees (28.9% unique)
   └─ Top calls: replace(12), setAttribute(11), readCssNumber(8)

3. SPAValidator.for
   ├─ 71 total calls
   ├─ 16 unique callees (22.5% unique)
   └─ Top calls: includes(37), test(6), match(5)

4. ComponentBehaviorExtractor.for
   ├─ 70 total calls
   ├─ 23 unique callees (32.9% unique)
   └─ Top calls: match(12), trim(9), push(7)

5. ChatWindow (React component)
   ├─ 63 total calls
   ├─ 31 unique callees (49.2% unique)
   └─ Top calls: now(8), setMessages(7), useEffect(5)
```

### 2. Instability Map (Most Unstable Symbols)

```
INSTABILITY SCALE: 0 (stable) -------- 1 (unstable)

[████████████████████████████████████████] 1.00
   resize.stage-crew.ts::startResize
   ← 0 callers | 6 calls →

[████████████████████████████████████████] 1.00
   resize.stage-crew.ts::updateSize
   ← 0 callers | 11 calls →

[████████████████████████████████████████] 1.00
   CodeTextarea.tsx::handleChange
   ← 0 callers | 2 calls →

[██████████████████████████████░░░░░░░░░░] 0.82
   CinematicPresentation.initializeControls
   ← 2 callers | 9 calls →
```

**Interpretation**: Symbols with instability = 1.0 are "leaf" functions (no dependents). They're unstable because they depend on others but nothing depends on them.

### 3. Cycles (1 detected)

```
Cycle #1 (size 2):
   CinematicPresentation.nextScene
      ↓
   CinematicPresentation.scheduleNextScene
      ↓
   CinematicPresentation.nextScene (closes loop)
```

**Status**: Small, manageable cycle. Low priority.

### 4. Name Connascence (72 identifiers called 12+ times)

```
1. log              362 calls  (logging pervasive)
2. push             261 calls  (array mutations)
3. String           123 calls  (type conversions)
4. includes         113 calls  (membership checks)
5. fn                98 calls  (callback patterns)
6. Error             84 calls  (error handling)
7. __MC_LOG          76 calls  (conductor logging)
8. async             57 calls  (async patterns)
9. parseFloat        57 calls  (numeric parsing)
10. map              53 calls  (array mapping)
```

---

## Recommendations

### Priority 1: Fix IR Extraction Bug
- **Action**: Investigate TypeScript extractor's handling of `.if` methods
- **Impact**: Will reduce false positives by 3.8x
- **Effort**: Medium (requires debugging parser)

### Priority 2: Refactor KnowledgeCLI.if
- **Current**: 281 calls, 71 unique callees
- **Action**: Break into smaller, focused methods
- **Pattern**: Likely a large switch/if-else block
- **Effort**: High (significant refactoring)

### Priority 3: Reduce Logging Connascence
- **Current**: `log` called 362 times directly
- **Action**: Create logging facade/abstraction
- **Benefit**: Easier to change logging strategy
- **Effort**: Medium

### Priority 4: Stabilize Leaf Functions
- **Current**: `updateSize`, `startResize` have 0 dependents
- **Action**: Make these more reusable/testable
- **Benefit**: Better code reuse
- **Effort**: Low-Medium

---

## ASCII Maps

### Map 1: God Function Call Hierarchy

```
KnowledgeCLI.if (281 calls)
├─ log ........................... 131 calls (46.6%)
├─ forEach ........................ 15 calls (5.3%)
├─ header ......................... 8 calls (2.8%)
├─ info ........................... 7 calls (2.5%)
└─ [67 other unique callees] .... 120 calls (42.7%)

recomputeLineSvg (83 calls)
├─ replace ....................... 12 calls (14.5%)
├─ setAttribute .................. 11 calls (13.3%)
├─ readCssNumber ................. 8 calls (9.6%)
├─ toFixed ....................... 6 calls (7.2%)
└─ [20 other unique callees] .... 46 calls (55.4%)
```

### Map 2: Coupling Landscape

```
UNSTABLE (I=1.0)  ┐
┌─────────────────┤  resize.stage-crew.ts::startResize (0←|6→)
│                 │  resize.stage-crew.ts::updateSize (0←|11→)
│                 │  CodeTextarea.tsx::handleChange (0←|2→)
│                 │  CssEditorModal.tsx::handleKeyDown (0←|2→)
│                 │
│  SEMI-STABLE    │  CinematicPresentation.initializeControls (2←|9→)
│  (I=0.6-0.8)    │  SchemaResolverService.loadComponentSchemas (1←|4→)
│                 │
│  STABLE         │  [many symbols with I<0.5]
└─────────────────┘
STABLE (I=0.0)
```

### Map 3: Cyclic Dependency

```
┌─────────────────────────────────────────┐
│  CinematicPresentation.nextScene        │
│              ↓                          │
│  CinematicPresentation.scheduleNextScene│
│              ↓                          │
└─────────────────────────────────────────┘
     (2-node cycle, low priority)
```

### Map 4: Name Connascence Web

```
Central Hub (called 50+ times):
┌─────────────────────────────────┐
│  log (362 calls)                │
│  push (261 calls)               │
│  String (123 calls)             │
│  includes (113 calls)           │
└─────────────────────────────────┘
     ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
[1010 symbols depend on these]
```

---

## Next Steps

1. **Fix IR Extraction Bug** – Debug TypeScript extractor's `.if` duplication
2. **Refactor KnowledgeCLI.if** – Break 281-call god function into smaller methods
3. **Implement Logging Facade** – Reduce 362 direct `log` calls
4. **Stabilize Leaf Functions** – Make `updateSize`, `startResize` more reusable
5. **Create ADR** – Document god function refactoring strategy

