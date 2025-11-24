# Avalonia Musical Conductor Logging Analysis Report

**Platform:** Avalonia.NET (C#)

**Generated:** 2025-11-10 10:47:49

**Total Logging Statements:** 126

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [ASCII Visualization](#ascii-visualization)
3. [Statistics by Category](#statistics-by-category)
4. [Statistics by Severity](#statistics-by-severity)
5. [Statistics by Log Type](#statistics-by-log-type)
6. [Structured Logging Analysis](#structured-logging-analysis)
7. [Top Logging Files](#top-logging-files)
8. [Detailed Log Inventory](#detailed-log-inventory)
9. [Recommendations](#recommendations)
10. [Web Variant Comparison](#web-variant-comparison)

## Executive Summary

### Overview

The Avalonia Musical Conductor contains **126** logging statements across **14** files.

### Severity Breakdown

- **Critical:** 0 (0.0%)
- **Error:** 28 (22.2%)
- **Warning:** 9 (7.1%)
- **Information:** 80 (63.5%)
- **Debug:** 9 (7.1%)
- **Trace:** 0 (0.0%)

### Top Categories

- **Conductor:** 29 (23.0%)
- **Logging:** 24 (19.0%)
- **EventBus:** 15 (11.9%)
- **Engine:** 14 (11.1%)
- **PluginManagement:** 13 (10.3%)

### Structured Logging

- **Statements using structured logging:** 67 (53.2%)
- **Statements using string interpolation:** 59 (46.8%)

## ASCII Visualization

### Logging Distribution by Category

```
Conductor                 │██████████████████████████████████████████████████ 29
Logging                   │█████████████████████████████████████████ 24
EventBus                  │█████████████████████████ 15
Engine                    │████████████████████████ 14
PluginManagement          │██████████████████████ 13
Sample                    │████████████████████ 12
SequenceExecution         │██████████████████ 11
ExecutionQueue            │████████ 5
Other                     │█████ 3
```

### Logging Distribution by Severity

```
🔥 Critical    │ 0
🔴 Error       │█████████████████ 28
🟡 Warning     │█████ 9
🔵 Information │██████████████████████████████████████████████████ 80
🟢 Debug       │█████ 9
⚪ Trace       │ 0
```

### File Logging Heat Map (Top 20)

```
ConductorClient.cs                    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 15
JintEngineHost.cs                     │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 14
ConductorLogger.cs                    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 13
PluginManager.cs                      │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 13
MainWindow.xaml.cs                    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 12
SequenceExecutor.cs                   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 11
EventLogger.cs                        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 11
Conductor.cs                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 9
JintEventBusAdapter.cs                │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 8
EventBus.cs                           │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 7
ConductorClient.cs                    │▓▓▓▓▓▓▓▓▓▓▓▓▓ 5
ExecutionQueue.cs                     │▓▓▓▓▓▓▓▓▓▓▓▓▓ 5
StatisticsManager.cs                  │▓▓▓▓▓ 2
PerformanceTracker.cs                 │▓▓ 1
```

### Logging Method Distribution

```
LogInformation                 │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 78
LogError                       │░░░░░░░░░░░░░░ 28
LogDebug                       │░░░░ 9
LogWarning                     │░░░░ 9
Log                            │░ 2
```

### Structured vs Non-Structured Logging

```
✅ Structured {param}   │██████████████████████████████████████████████████ 67
⚠️  Non-structured       │████████████████████████████████████████████ 59
```

## Statistics by Category

| Category | Count | Percentage |
|----------|-------|------------|
| Conductor | 29 | 23.0% |
| Logging | 24 | 19.0% |
| EventBus | 15 | 11.9% |
| Engine | 14 | 11.1% |
| PluginManagement | 13 | 10.3% |
| Sample | 12 | 9.5% |
| SequenceExecution | 11 | 8.7% |
| ExecutionQueue | 5 | 4.0% |
| Other | 3 | 2.4% |

## Statistics by Severity

| Severity | Count | Percentage |
|----------|-------|------------|
| Critical | 0 | 0.0% |
| Error | 28 | 22.2% |
| Warning | 9 | 7.1% |
| Information | 80 | 63.5% |
| Debug | 9 | 7.1% |
| Trace | 0 | 0.0% |

## Statistics by Log Type

| Log Method | Count | Percentage |
|------------|-------|------------|
| `LogInformation` | 78 | 61.9% |
| `LogError` | 28 | 22.2% |
| `LogDebug` | 9 | 7.1% |
| `LogWarning` | 9 | 7.1% |
| `Log` | 2 | 1.6% |

## Top Logging Files

| File | Count | Percentage |
|------|-------|------------|
| `src\MusicalConductor.Avalonia\Client\ConductorClient.cs` | 15 | 11.9% |
| `src\MusicalConductor.Avalonia\Engine\JintEngineHost.cs` | 14 | 11.1% |
| `src\MusicalConductor.Avalonia\Logging\ConductorLogger.cs` | 13 | 10.3% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\PluginManager.cs` | 13 | 10.3% |
| `src\MusicalConductor.Avalonia\Sample\MainWindow.xaml.cs` | 12 | 9.5% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\SequenceExecutor.cs` | 11 | 8.7% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\EventLogger.cs` | 11 | 8.7% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\Conductor.cs` | 9 | 7.1% |
| `src\MusicalConductor.Avalonia\Engine\JintEventBusAdapter.cs` | 8 | 6.3% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\EventBus.cs` | 7 | 5.6% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\ConductorClient.cs` | 5 | 4.0% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\ExecutionQueue.cs` | 5 | 4.0% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\StatisticsManager.cs` | 2 | 1.6% |
| `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\PerformanceTracker.cs` | 1 | 0.8% |

## Structured Logging Analysis

### Overview

Microsoft's ILogger supports **structured logging** using `{ParameterName}` syntax, which provides better performance and queryability compared to string interpolation.

- **Structured:** 67 (53.2%)
- **Non-structured:** 59 (46.8%)

✅ **Good practice:** Majority of logging uses structured logging.

### Structured Logging by Category

| Category | Structured | Non-Structured | % Structured |
|----------|------------|----------------|-------------|
| Conductor | 17 | 12 | 58.6% |
| Engine | 4 | 10 | 28.6% |
| EventBus | 11 | 4 | 73.3% |
| ExecutionQueue | 3 | 2 | 60.0% |
| Logging | 15 | 9 | 62.5% |
| Other | 0 | 3 | 0.0% |
| PluginManagement | 7 | 6 | 53.8% |
| Sample | 5 | 7 | 41.7% |
| SequenceExecution | 5 | 6 | 45.5% |

## Detailed Log Inventory

### Conductor (29 statements)

#### `src\MusicalConductor.Avalonia\Client\ConductorClient.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 23 | Information | `LogInformation` | ❌ | "🎼 ConductorClient initialized (native .NET mode... |
| 30 | Information | `LogInformation` | ✅ | "▶️ Playing sequence: {PluginId}/{SequenceId}", pl... |
| 45 | Information | `LogInformation` | ✅ | "✅ Sequence started with request ID: {RequestId}",... |
| 50 | Error | `LogError` | ✅ | ex, "❌ Failed to play sequence {SequenceId}", sequ... |
| 64 | Information | `LogInformation` | ✅ | "🔕 Unsubscribing from event: {EventName}", eventNa... |
| 75 | Information | `LogInformation` | ✅ | "✅ Unsubscribed from event: {EventName}", eventNam... |
| 79 | Error | `LogError` | ✅ | ex, "❌ Failed to unsubscribe from event {EventName... |
| 95 | Information | `LogInformation` | ❌ | "📊 Getting conductor status"... |
| 102 | Error | `LogError` | ❌ | ex, "❌ Failed to get conductor status"... |
| 111 | Information | `LogInformation` | ❌ | "📈 Getting conductor statistics"... |
| 118 | Error | `LogError` | ❌ | ex, "❌ Failed to get conductor statistics"... |
| 127 | Information | `LogInformation` | ❌ | "🔌 CIA plugin registration not needed in native .N... |
| 135 | Information | `LogInformation` | ✅ | "🔔 Subscribing to event: {EventName}", eventName... |
| 144 | Information | `LogInformation` | ✅ | "✅ Subscribed to event: {EventName}", eventName... |
| 150 | Error | `LogError` | ✅ | ex, "❌ Failed to subscribe to event {EventName}", ... |

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\Conductor.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 61 | Information | `LogInformation` | ❌ | "🎼 MusicalConductor: Initialized with core compone... |
| 62 | Information | `LogInformation` | ❌ | ""... |
| 64 | Information | `LogInformation` | ❌ | ""... |
| 67 | Information | `LogInformation` | ❌ | " MusicalConductor: Singleton instance reset"... |
| 69 | Information | `LogInformation` | ❌ | "executionContext, beat, error"... |
| 72 | Information | `LogInformation` | ❌ | " MusicalConductor: All monitoring data reset"... |
| 88 | Error | `LogError` | ✅ | "Sequence not found: {SequenceId}", sequenceId... |
| 181 | Information | `LogInformation` | ✅ | "🎼 Conductor: Now executing \"{SequenceName}\"", s... |
| 199 | Error | `LogError` | ✅ | ex, "Error executing sequence: {SequenceId}", sequ... |

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\ConductorClient.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 81 | Information | `LogInformation` | ✅ | "Playing sequence: {SequenceId} from plugin: {Plug... |
| 130 | Information | `LogInformation` | ✅ | "Registering plugin: {PluginId}", plugin.GetMetada... |
| 139 | Information | `LogInformation` | ✅ | "Unregistering plugin: {PluginId}", pluginId... |
| 156 | Information | `LogInformation` | ✅ | "Registering sequence: {SequenceId}", sequence.Id... |
| 165 | Information | `LogInformation` | ✅ | "Unregistering sequence: {SequenceId}", sequenceId... |

### Engine (14 statements)

#### `src\MusicalConductor.Avalonia\Engine\JintEngineHost.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 62 | Information | `LogInformation` | ❌ | "🌐 Initializing browser API stubs for Jint engine"... |
| 71 | Information | `LogInformation` | ❌ | "✅ Browser stubs initialized"... |
| 117 | Information | `Log` | ✅ | level, "{Message}", message... |
| 127 | Information | `Log` | ✅ | level, "{Icon} [JS] {Message}", icon, message... |
| 158 | Information | `LogInformation` | ❌ | "📦 Loading MusicalConductor bundle into Jint engin... |
| 176 | Information | `LogInformation` | ❌ | "✅ MusicalConductor bundle loaded successfully"... |
| 180 | Error | `LogError` | ❌ | ex, "❌ Failed to load MusicalConductor bundle"... |
| 194 | Information | `LogInformation` | ✅ | "📦 Loading MusicalConductor bundle from MC_BUNDLE_... |
| 202 | Information | `LogInformation` | ✅ | "📦 Loading MusicalConductor bundle from options.Cu... |
| 300 | Debug | `LogDebug` | ❌ | "ConductorLogger not provided, skipping event subs... |
| 311 | Warning | `LogWarning` | ❌ | "⚠️ EventBus not found on MusicalConductor instanc... |
| 323 | Information | `LogInformation` | ❌ | "✅ ConductorLogger subscribed to Musical Conductor... |
| 327 | Error | `LogError` | ❌ | ex, "❌ Failed to subscribe ConductorLogger to Musi... |
| 337 | Information | `LogInformation` | ❌ | "🛑 Jint engine disposed"... |

### EventBus (15 statements)

#### `src\MusicalConductor.Avalonia\Engine\JintEventBusAdapter.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 58 | Error | `LogError` | ✅ | ex, "Error in .NET callback for event {EventName}"... |
| 88 | Debug | `LogDebug` | ✅ | "Subscribed to JavaScript event: {EventName}", eve... |
| 120 | Warning | `LogWarning` | ✅ | ex, "Error unsubscribing from JavaScript event {Ev... |
| 124 | Debug | `LogDebug` | ✅ | "Unsubscribed from JavaScript event: {EventName}",... |
| 143 | Warning | `LogWarning` | ❌ | "EventBus.emit method not found"... |
| 153 | Debug | `LogDebug` | ✅ | "Emitted event from .NET to JavaScript: {EventName... |
| 158 | Error | `LogError` | ✅ | ex, "Error emitting event to JavaScript EventBus: ... |
| 374 | Warning | `LogWarning` | ❌ | ex, "Failed to convert object to JavaScript value,... |

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\EventBus.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 20 | Information | `LogInformation` | ❌ | " EventBus: Cleared all subscribers"... |
| 24 | Information | `LogInformation` | ❌ | " EventBus: Using internal conductor (legacy mode"... |
| 46 | Debug | `LogDebug` | ✅ | "Subscribed to event: {EventName}", eventName... |
| 69 | Debug | `LogDebug` | ✅ | "Unsubscribed from event: {EventName}", eventName... |
| 97 | Debug | `LogDebug` | ✅ | "Unsubscribed from event: {EventName}", eventName... |
| 144 | Error | `LogError` | ✅ | ex, "Error in event callback for {EventName}", eve... |
| 187 | Error | `LogError` | ✅ | ex, "Error in event callback for {EventName}", eve... |

### ExecutionQueue (5 statements)

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\ExecutionQueue.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 24 | Information | `LogInformation` | ❌ | " ExecutionQueue: No sequence currently executing"... |
| 40 | Information | `LogInformation` | ✅ | "🎼 ExecutionQueue: Enqueued \"{SequenceId}\" with ... |
| 58 | Information | `LogInformation` | ✅ | "🎼 ExecutionQueue: Dequeued \"{SequenceId}\"", ite... |
| 116 | Information | `LogInformation` | ❌ | "Execution queue cleared"... |
| 136 | Information | `LogInformation` | ✅ | "🎼 ExecutionQueue: Marked \"{SequenceId}\" as comp... |

### Logging (24 statements)

#### `src\MusicalConductor.Avalonia\Logging\ConductorLogger.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 39 | Debug | `LogDebug` | ❌ | "ConductorLogger is disabled, skipping event subsc... |
| 48 | Information | `LogInformation` | ❌ | "🎼 ConductorLogger: Subscribing to Musical Conduct... |
| 73 | Information | `LogInformation` | ❌ | "✅ ConductorLogger: Event subscriptions complete"... |
| 94 | Information | `LogInformation` | ✅ | $"{indent}🎼 {sequenceName}"... |
| 111 | Information | `LogInformation` | ✅ | $"{indent}🎵 {movementName}"... |
| 129 | Information | `LogInformation` | ✅ | $"{indent}🥁 {beat}: {eventName}"... |
| 153 | Information | `LogInformation` | ✅ | $"{indent}🔧 {pluginId}.{handlerName}"... |
| 201 | Warning | `LogWarning` | ✅ | $"{line} {messageText}"... |
| 204 | Error | `LogError` | ✅ | $"{line} {messageText}"... |
| 209 | Information | `LogInformation` | ✅ | $"{line} {messageText}"... |
| 235 | Information | `LogInformation` | ✅ | $"{indent}🎭 Stage Crew: {pluginId}{handlerSuffix} ... |
| 246 | Information | `LogInformation` | ✅ | $"{opIndent}{connector} {opText}"... |
| 283 | Warning | `LogWarning` | ✅ | "Scope mismatch: expected {Expected}, but not foun... |

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\EventLogger.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 64 | Information | `LogInformation` | ❌ | "🎼 EventLogger: Hierarchical logging disabled"... |
| 83 | Information | `LogInformation` | ❌ | "🎼 EventLogger: Hierarchical beat logging initiali... |
| 93 | Information | `LogInformation` | ❌ | "🎼 EventLogger: Movement hierarchical logging disa... |
| 117 | Information | `LogInformation` | ❌ | "🎼 EventLogger: Hierarchical movement logging init... |
| 163 | Information | `LogInformation` | ✅ | "✅ Beat {Beat} Completed", data.Beat... |
| 209 | Error | `LogError` | ✅ | "❌ Movement failed: {Error}", data.Error... |
| 238 | Error | `LogError` | ✅ | "❌ Error: {ErrorMessage}", error.Message... |
| 261 | Debug | `LogDebug` | ✅ | "🎼 EventLogger: Emitted {EventType}", eventType... |
| 266 | Error | `LogError` | ✅ | error, "🎼 EventLogger: Failed to emit event {Event... |
| 348 | Information | `LogInformation` | ❌ | "🎼 EventLogger: Configuration updated"... |
| 372 | Information | `LogInformation` | ❌ | "🧹 EventLogger: Event subscriptions cleaned up"... |

### Other (3 statements)

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\PerformanceTracker.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 341 | Information | `LogInformation` | ❌ | "🧹 PerformanceTracker: All tracking data reset"... |

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\Monitoring\StatisticsManager.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 87 | Warning | `LogWarning` | ❌ | "📊 StatisticsManager: Recorded error occurrence"... |
| 196 | Information | `LogInformation` | ❌ | "🧹 StatisticsManager: All statistics reset"... |

### PluginManagement (13 statements)

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\PluginManager.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 21 | Information | `LogInformation` | ❌ | " Registering CIA-compliant plugins..."... |
| 24 | Error | `LogError` | ❌ | " Failed to register CIA plugins:, error"... |
| 27 | Information | `LogInformation` | ❌ | " PluginManager: Registering plugins from manifest... |
| 31 | Information | `LogInformation` | ❌ | " Registering fallback sequences..."... |
| 34 | Information | `LogInformation` | ❌ | " Fallback sequences registered"... |
| 37 | Information | `LogInformation` | ❌ | " PluginManager: State reset"... |
| 56 | Warning | `LogWarning` | ✅ | "Plugin already registered: {PluginId}", metadata.... |
| 63 | Information | `LogInformation` | ✅ | "Plugin registered: {PluginId} v{Version}", metada... |
| 74 | Information | `LogInformation` | ✅ | "Plugin initialized: {PluginId}", metadata.Id... |
| 78 | Error | `LogError` | ✅ | ex, "Error initializing plugin: {PluginId}", metad... |
| 98 | Information | `LogInformation` | ✅ | "Plugin unregistered: {PluginId}", pluginId... |
| 111 | Information | `LogInformation` | ✅ | "Plugin cleaned up: {PluginId}", pluginId... |
| 115 | Error | `LogError` | ✅ | ex, "Error cleaning up plugin: {PluginId}", plugin... |

### Sample (12 statements)

#### `src\MusicalConductor.Avalonia\Sample\MainWindow.xaml.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 24 | Information | `LogInformation` | ❌ | \"🎼 Setting up event handlers\"... |
| 29 | Information | `LogInformation` | ✅ | \"▶️ Sequence started: {Data}\", data... |
| 35 | Information | `LogInformation` | ✅ | \"✅ Sequence completed: {Data}\", data... |
| 41 | Error | `LogError` | ✅ | \"❌ Sequence failed: {Data}\", data... |
| 47 | Information | `LogInformation` | ✅ | \"🎵 Beat executed: {Data}\", data... |
| 55 | Information | `LogInformation` | ❌ | \"▶️ Play button clicked\"... |
| 66 | Error | `LogError` | ❌ | ex, \"❌ Failed to play sequence\"... |
| 75 | Information | `LogInformation` | ❌ | \"📊 Get status button clicked\"... |
| 84 | Error | `LogError` | ❌ | ex, \"❌ Failed to get status\"... |
| 93 | Information | `LogInformation` | ❌ | \"📈 Get statistics button clicked\"... |
| 102 | Error | `LogError` | ❌ | ex, \"❌ Failed to get statistics\"... |
| 109 | Information | `LogInformation` | ✅ | \"📝 Status: {Message}\", message... |

### SequenceExecution (11 statements)

#### `src\MusicalConductor.Avalonia\MusicalConductor.Core\SequenceExecutor.cs`

| Line | Severity | Method | Structured | Message Preview |
|------|----------|--------|------------|----------------|
| 81 | Information | `LogInformation` | ✅ | "🥁 SequenceExecutor: Executing beat {BeatNumber} (... |
| 125 | Error | `LogError` | ✅ | ex, "Error executing beat handler: {BeatId}", beat... |
| 158 | Information | `LogInformation` | ✅ | "✅ SequenceExecutor: Beat {BeatNumber} ({BeatId}... |
| 172 | Error | `LogError` | ✅ | ex, "❌ SequenceExecutor: Error executing beat {Bea... |
| 207 | Error | `LogError` | ✅ | ex, "Error executing sequence: {SequenceId}", sequ... |
| 268 | Information | `LogInformation` | ❌ | " BeatExecutor: Beat execution queue cleared"... |
| 271 | Information | `LogInformation` | ❌ | " SequenceExecutor: Execution history cleared"... |
| 275 | Information | `LogInformation` | ❌ | message... |
| 276 | Information | `LogInformation` | ❌ | message... |
| 277 | Warning | `LogWarning` | ❌ | message... |
| 278 | Error | `LogError` | ❌ | ex, message... |

## Recommendations

### 1. Logging Standardization

- **ILogger logging:** 117 statements (92.9%)
- **Console/Debug/Trace:** 9 statements (7.1%)

⚠️ **Recommendation:** Migrate all `Console.*`, `Debug.*`, and `Trace.*` calls to ILogger for consistent logging, better control, and production readiness.

### 2. Structured Logging

⚠️ **Recommendation:** Increase structured logging adoption (currently 53.2%). Use `_logger.LogInformation("Message {Param}", value)` instead of string interpolation for better performance and queryability.

### 3. Severity Distribution

### 4. Category-Specific Recommendations

- **Conductor** has the most logging (29 statements). Verify this level of instrumentation is appropriate.

### 5. Production Considerations

- Configure log levels appropriately for different environments (Debug in dev, Warning+ in prod)
- Use dependency injection for ILogger<T> throughout the codebase
- Consider implementing log scopes for better context tracking
- Ensure structured logging parameters don't contain sensitive data

## Web Variant Comparison

### Platform-Specific Differences

| Aspect | Avalonia (C#) | Web (TypeScript) |
|--------|---------------|------------------|
| Primary API | `ILogger<T>` | `console.*` / `ctx.logger.*` |
| Structured Logging | ✅ Native support | ⚠️ Limited |
| Log Levels | Trace, Debug, Information, Warning, Error, Critical | log, info, warn, error, debug |
| Async Logging | ✅ Yes | ✅ Yes |
| Dependency Injection | ✅ Yes | ⚠️ Manual |
| Production Ready | ✅ Yes | ⚠️ Needs abstraction |

### Parity Considerations

To achieve logging parity between variants:

1. **Message Content:** Ensure equivalent log messages exist in both platforms
2. **Severity Mapping:**
   - `LogInformation` ↔ `console.log` / `logger.info`
   - `LogWarning` ↔ `console.warn` / `logger.warn`
   - `LogError` ↔ `console.error` / `logger.error`
   - `LogDebug` ↔ `console.debug` / `logger.debug`
3. **Context:** Match structured logging parameters with web logging context
4. **Icons/Emojis:** Maintain consistent use of Unicode symbols (🎼, ✅, ❌, etc.)

### Next Steps

1. Run both scanners (web and Avalonia) to generate complete inventories
2. Use the JSON outputs to programmatically compare logging statements
3. Create a mapping document between equivalent log statements
4. Implement missing log statements in either variant
5. Standardize message formats and severity levels

