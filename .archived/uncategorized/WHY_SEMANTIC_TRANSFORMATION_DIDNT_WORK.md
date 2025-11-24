# Why Real Log Doesn't Display Like Sample Data - EXPLAINED

## The Problem

You're looking at an **old exported JSON file** (`telemetry-diagnostics-1762869682895.json`) that was created **before semantic transformation was implemented**.

When you exported it, the code was:
- ❌ No PLUGIN_TYPE_MAP
- ❌ No TOPIC_TYPE_MAP  
- ❌ Events got `type: 'plugin'` and `type: 'topic'` hardcoded

Now the code HAS:
- ✅ PLUGIN_TYPE_MAP (6 plugins → semantic types)
- ✅ TOPIC_TYPE_MAP (20+ topics → semantic types)
- ✅ Automatic transformation during upload

## The Root Cause

The exported JSON contains events like:
```json
{
  "name": "Topic: beat-started",
  "type": "topic",        // ← OLD (raw)
  "color": "#14b8a6"
}
```

But your CODE (TimelineDataAdapter.ts) now transforms this to:
```json
{
  "name": "Beat Started",
  "type": "render",        // ← NEW (semantic)
  "color": "#10b981"
}
```

The **semantic transformation code is ready**, but the exported file predates it.

## The Solution

### **Don't re-export the old file!**

Instead, **upload the original log file fresh** through the UI:

### Step-by-Step:

1. **Open Diagnostics** (Ctrl+Shift+D in VS Code)

2. **Click "📊 Telemetry" tab**

3. **Click "Choose File" button**

4. **Navigate to:** `.logs/web-variant-localhost-1762811808902.log`

5. **Wait** for conversion (~2-3 seconds)

6. **Timeline will appear with SEMANTIC TYPES automatically!**
   - Events will have types: `ui`, `render`, `data`, `create`, `gap`, `blocked`
   - Names will be human-readable: `"Beat Started"`, `"Header UI Theme Get"`, etc.
   - Colors will match the semantic types

7. (**Optional**) **Click "📥 Export Diagnostics"** to save the new JSON with semantic transformation applied

## Why This Works

When you upload the file through the UI:

```
web-variant-localhost-1762811808902.log
     ↓ LogAnalyzer.parseRawLogFile()
AnalyzerOutput {
  pluginMounts: { ... },
  topics: { ... },
  ...
}
     ↓ analyzerToTimelineData()  ← APPLIES SEMANTIC MAPPING HERE!
TimelineData {
  events: [
    { name: "Beat Started", type: "render", ... },   ← Semantic!
    { name: "Header UI Theme Get", type: "ui", ... }, ← Semantic!
    ...
  ]
}
     ↓ Rendered in Timeline
     ✨ Looks exactly like sample data!
```

## What Will Change

| Current (Old Export) | After Fresh Upload |
|---|---|
| 135 events type=`"topic"` | 135 events with semantic types: `"ui"`, `"render"`, `"data"`, `"create"` |
| 99 events type=`"plugin"` | 99 events with semantic types: `"ui"`, `"create"`, `"data"` |
| 8 events type=`"gap"` / `"blocked"` | 8 events with semantic types: `"gap"` / `"blocked"` |
| Generic names: `"Topic: beat-started"` | Meaningful names: `"Beat Started"` |
| Generic color: `#14b8a6` | Semantic colors: `#10b981` for render, `#f59e0b` for ui, etc. |

## Why You Didn't Need Filtering

You asked: *"What filtering strategy converts real log to sample data?"*

**Answer:** No filtering strategy needed! The transformation is **automatic during upload**. Once you re-import the file, it will already display with semantic types, exactly matching the sample data style.

## Next Steps

1. Delete or ignore the old exported JSON
2. Upload `.logs/web-variant-localhost-1762811808902.log` through the UI
3. You'll see the transformation automatically applied
4. The timeline will look identical to sample data
5. Export if you want to save the new version

**That's it!** 🎉
