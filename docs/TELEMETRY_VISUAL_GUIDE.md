# Visual Guide: Telemetry System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RENDERX TELEMETRY SYSTEM                             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ INPUT: Raw Console Log                                                 │ │
│  │ • 2,848 lines of console.log output                                   │ │
│  │ • 28.35 second RenderX session                                        │ │
│  │ • Contains: plugins, topics, sequences, silent periods               │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                         │
│                        ┌───────────────────────┐                            │
│                        │   LogAnalyzer.ts      │                            │
│                        │ • Parse timestamps    │                            │
│                        │ • Deduplicate events  │                            │
│                        │ • Pattern matching    │                            │
│                        │ • Detect gaps > 500ms │                            │
│                        └───────────────────────┘                            │
│                                    ↓                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 2: Raw Analyzer Output                                           │ │
│  │ • 244 unique events extracted                                         │ │
│  │ • 99 plugin mount events                                              │ │
│  │ • 135 topic events                                                    │ │
│  │ • 8 gaps detected (threshold: >500ms)                                 │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                         │
│                   ┌──────────────────────────────┐                          │
│                   │ TimelineDataAdapter.ts       │                          │
│                   │ • Apply semantic mapping     │                          │
│                   │ • Plugin → UI/Create/Data    │                          │
│                   │ • Topic → Render/UI/Init     │                          │
│                   │ • Convert to milliseconds    │                          │
│                   │ • Sort chronologically       │                          │
│                   └──────────────────────────────┘                          │
│                                    ↓                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ STAGE 3: Semantic Timeline Data                                        │ │
│  │ • 244 events with semantic types                                      │ │
│  │ • High-level operation names                                          │ │
│  │ • Color-coded by type                                                 │ │
│  │ • Ready for visualization                                             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                         │
│            ┌─────────────────────────────────────────┐                     │
│            │ OperationFilter + TimelineFlowViz       │                     │
│            │ • User selects filter strategy          │                     │
│            │ • Filtered events subset generated      │                     │
│            │ • Timeline re-rendered in real-time     │                     │
│            └─────────────────────────────────────────┘                     │
│                                    ↓                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ OUTPUT: Interactive Timeline Visualization                             │ │
│  │ ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │ │ 📊 RenderX Session Telemetry (244 events, 28.35s)              │  │ │
│  │ ├──────────────────────────────────────────────────────────────────┤  │ │
│  │ │ [Filter Panel]                                                   │  │ │
│  │ │ Strategy: □ All  □ Category  □ Search  □ Time  ☑ Performance  │  │ │
│  │ │ Presets: [Critical Path] [Plugin Health] [Render Ops] ...      │  │ │
│  │ ├──────────────────────────────────────────────────────────────────┤  │ │
│  │ │ [Timeline Waterfall]                                             │  │ │
│  │ │ 🟨 Header UI Theme Get ━━┫                                      │  │ │
│  │ │ 🟪 Library Load ━━┫                                             │  │ │
│  │ │ 🟩 Canvas React Render ━━━━━┫                                  │  │ │
│  │ │ 🔴 React Block (9.77s) ━━━━━━━━━━━━━━━━━━━━━━━━━━━┫           │  │ │
│  │ │ 🟦 Component Create ━━┫                                         │  │ │
│  │ ├──────────────────────────────────────────────────────────────────┤  │ │
│  │ │ [Heatmap]                                                        │  │ │
│  │ │ ▓▓░░░░░░░░░░░▓▓░░░░░░░▓▓░░░░░░░▓▓░░░░░░░░░░░░░░░▓▓░░░░░░░░ │  │ │
│  │ │ 0  2s  4s  6s  8s 10s 12s 14s 16s 18s 20s 22s 24s 26s 28s      │  │ │
│  │ ├──────────────────────────────────────────────────────────────────┤  │ │
│  │ │ [Event Details]              Showing 23 of 244 events            │  │ │
│  │ │ # │ Time   │ Duration │ Type │ Name                              │  │ │
│  │ │ 1 │ 1ms    │ 1ms      │ 🟩   │ Beat Started                      │  │ │
│  │ │ 2 │ 54ms   │ 50ms     │ 🟦   │ Component Create                  │  │ │
│  │ │ 3 │ 3217ms │ 78ms     │ 🟨   │ Header UI Theme Get               │  │ │
│  │ │ 4 │ 3674ms │ 2630ms   │ 🔴   │ Gap (2.63s)                       │  │ │
│  │ │ ⋮ │ ⋮      │ ⋮        │ ⋮    │ ⋮                                 │  │ │
│  │ └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                         │ │
│  │ [📥 Export Diagnostics]  [⏯️ Play]  [🔍 Details]  [📊 Stats]            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Real Log → Display

```
User uploads: my-console.log (raw text file)
       ↓
TelemetryPage.handleFileUpload()
       ↓
LogAnalyzer.loadAndParseFile()
  ├─ Detect file type (raw log or JSON)
  ├─ Parse timestamps from lines
  ├─ Extract plugin/topic/sequence patterns
  ├─ Deduplicate by timestamp (Set)
  ├─ Calculate gaps (>500ms threshold)
  └─ Return: AnalyzerOutput (244 events)
       ↓
analyzerToTimelineData()
  ├─ Apply plugin semantic mapping
  │  └─ "Manager" → "Component Create" (type: create)
  ├─ Apply topic semantic mapping
  │  └─ "app:ui:theme:get" → "Header UI Theme Get" (type: ui)
  ├─ Apply gap categorization
  │  └─ 9.77s gap → "React Block" (type: blocked)
  └─ Return: TimelineData (244 semantic events)
       ↓
TimelineFlowVisualization renders
  ├─ All 244 events shown in waterfall
  ├─ Heatmap shows event density by 500ms bucket
  └─ Event list shows sortable details
       ↓
User sees timeline exactly like sample data!
```

---

## Semantic Transformation Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                 RAW EVENT → SEMANTIC EVENT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PLUGINS (99 raw mount events)                                  │
│  Manager                    →  Component Create (🟦 create)    │
│  ControlPanel              →  Control Panel UI Init (🟨 ui)    │
│  DynamicTheme              →  Theme Manager (🟨 ui)             │
│  HeaderComponent           →  Header UI Render (🟨 ui)          │
│  LayoutManager             →  Layout Manager Init (🟦 create)   │
│  SequenceCoordinator       →  Sequence Coordinator (🟪 data)    │
│                                                                 │
│ TOPICS (135 raw events)                                         │
│  musical-conductor:beat:started   →  Beat Started (🟩 render)  │
│  beat-completed                   →  Beat Completed (🟩 render)│
│  movement-started                 →  Movement Started (🟩 r.)  │
│  app:ui:theme:get                 →  Header UI Theme Get (ui)  │
│  app:ui:theme:toggle              →  Header UI Theme Toggle(ui)│
│  library:components:load          →  Library Load (🟪 data)    │
│  canvas:component:render-react    →  Canvas React Render (rend)│
│  canvas:component:create          →  Canvas Component Create (c)│
│                                                                 │
│ GAPS (auto-detected)                                            │
│  Gap > 500ms && < 5000ms          →  Gap (🔴 gap)              │
│  Gap >= 5000ms                    →  React Block (🔴 blocked)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Timeline Color Codes

```
┌──────────────────────────────────────────────────────────────┐
│ Semantic Type  │ Color       │ Events │ Meaning             │
├──────────────────────────────────────────────────────────────┤
│ 🟦 init        │ #6366f1     │  ~5    │ System initialization
│ 🟨 ui          │ #f59e0b     │ ~45    │ UI rendering & theme
│ 🟪 data        │ #8b5cf6     │ ~30    │ Data loading/library
│ 🟩 render      │ #10b981     │~105    │ React render timing
│ 🟦 create      │ #06b6d4     │ ~50    │ Component creation
│ 🔴 gap         │ #dc2626     │  7     │ Performance gap (2-5s)
│ 🔴 blocked     │ #ef4444     │  1     │ Major blocking (>5s)
│ ⚫ plugin      │ #a855f7     │  -     │ Raw (fallback)
│ ⭕ topic       │ #14b8a6     │  -     │ Raw (fallback)
└──────────────────────────────────────────────────────────────┘
```

---

## Filtering Flow

```
┌──────────────────────────────────────────────────┐
│ User Selects Filter Strategy                     │
└─────────────────┬────────────────────────────────┘
                  ↓
    ┌─────────────────────────────────┐
    │ OperationFilterPanel             │
    │ • Shows all strategies           │
    │ • Displays smart presets         │
    │ • Renders strategy-specific UI   │
    └────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ Strategy-Specific Input                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ALL:        (no input)                         │
│                                                 │
│  CATEGORY:   [ui] [data] [render] [create]     │
│              User toggles checkboxes             │
│                                                 │
│  SEARCH:     [______________________]           │
│              "Header" or "^canvas:.*"           │
│                                                 │
│  TIME WINDOW: [0] - [5000]                      │
│              (milliseconds)                      │
│                                                 │
│  PERFORMANCE: [min: 2000ms] [max: 30000ms]     │
│              Dual sliders                       │
│                                                 │
└─────────────────────────────────────────────────┘
             ↓
┌──────────────────────────┐
│ applyEventFilter()       │
│                          │
│ events.filter((e) => {   │
│   // Apply strategy      │
│ })                       │
│                          │
│ Returns: filtered array  │
└──────────────────────────┘
             ↓
┌──────────────────────────────────────────────────┐
│ Filtered Event Count                             │
│ Showing 23 of 244 events (by duration > 2s)     │
└──────────────────────────────────────────────────┘
             ↓
TimelineFlowVisualization re-renders with filtered events
```

---

## Smart Preset Examples

### Preset: Critical Path (Gaps > 2s)
```
Strategy: Performance
Min Duration: 2000ms
Result: 7 gaps + 1 blocked = 8 events shown

Event 1: Gap (2.58s)
Event 2: Gap (2.54s)
Event 3: Gap (2.00s)
Event 4: ⚠️ React Block (9.77s)  ← Most critical
Event 5: Gap (2.84s)
Event 6: Gap (2.38s)
Event 7: Gap (2.35s)
Event 8: Gap (2.37s)

Timeline shows only performance issues
```

### Preset: Render Operations
```
Strategy: Category
Event Types: [render]
Result: 105 render events shown

Event 1: Beat Started
Event 2: Beat Completed
Event 3: Movement Started
Event 4: Movement Completed
Event 5: Canvas React Render
...
Event 105: Canvas Notify UI

Timeline shows only rendering/beat events
```

### Preset: Plugin Health
```
Strategy: Category
Event Types: [create, plugin]
Result: 99 plugin mount events shown

All plugin lifecycle visible at a glance
```

---

## Three-Stage Export Structure

```
📄 telemetry-diagnostics-1762869682895.json
│
├─ stage1_rawLog
│  ├─ totalLines: 2848
│  ├─ durationMs: 28353
│  ├─ pluginMounts
│  │  └─ byPlugin
│  │     ├─ Manager: [99 mounts with timestamps]
│  │     ├─ ControlPanel: [...]
│  │     └─ DynamicTheme: [...]
│  ├─ sequences
│  │  └─ SymphonyInitialization: [...]
│  ├─ topics
│  │  ├─ beat-started: [102 events]
│  │  ├─ app:ui:theme:get: [...]
│  │  └─ ...
│  └─ gaps (gap detection results)
│
├─ stage2_analyzerJson (aggregated stats)
│  ├─ file: "console-log"
│  ├─ pluginMounts
│  ├─ sequences
│  ├─ topics
│  └─ performance
│
└─ stage3_timelineData (visualization ready)
   ├─ events (244 semantic events)
   │  ├─ { time: 1, type: "render", name: "Beat Started" }
   │  ├─ { time: 54, type: "create", name: "Component Create" }
   │  └─ ...
   ├─ totalDuration: 28353
   ├─ sessionStart: "2025-11-10T21:56:16.932Z"
   └─ sessionEnd: "2025-11-10T21:56:45.285Z"
```

---

## Performance Breakdown

```
Timeline: 28,353 milliseconds (28.35 seconds)
═══════════════════════════════════════════════

        Active Operations              Performance Gaps
        (1.52 seconds - 5.4%)         (26.83 seconds - 94.6%)
        ═════════════════════         ═════════════════════════════════════════
        │                             │    │                   │      │
0   ┌───┴───┐ ┌────┬──────┬──┬──┬─┬ ┌┴────┴──────────────┬────┴──────┴──┬───┐ 28353
    │ Init  │ │ UI │ Data │R │C│G│ │   React Block      │  Gaps      │Gap│
    │ 54ms  │ │ 60│ 80  │46│5│2│ │ │    (9.77s)         │  (14.96s)  │..│
    └───────┘ └────┴──────┴──┴──┴─┘ └────────────────────┴────────────┴───┘

Key Findings:
• 94.6% idle = System waiting for resources
• Largest gap: 9.77s React reconciliation  ← CRITICAL
• 7 other gaps > 2 seconds each
• Only 1.52s of actual work in 28.35s session
```

---

## User Journey

```
START: "I want to analyze my RenderX session"
  ↓
Open Diagnostics Panel
  ↓
Click "📊 Telemetry" tab
  ↓
Click file upload or drag-drop console.log
  ↓
[LogAnalyzer converts raw log to events]
  ↓
[TimelineDataAdapter applies semantic mapping]
  ↓
[Timeline renders with semantic events]
  ↓
See: 244 events, 94.6% idle time, 9.77s React block
  ↓
Click "Critical Path" preset
  ↓
See: Only 8 performance gaps highlighted
  ↓
Click "React Block (9.77s)" event
  ↓
See: Detailed event info, timestamps, context
  ↓
Click "Export Diagnostics"
  ↓
Download: 3-stage conversion pipeline JSON
  ↓
END: Full performance analysis complete!
```

---

**Status:** ✅ Complete System Delivered  
**Build:** ✅ 0 errors, ready to deploy  
**Documentation:** ✅ 5 comprehensive guides  
**Testing:** ✅ Real data validation passed
