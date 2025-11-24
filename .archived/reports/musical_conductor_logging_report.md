# Musical Conductor Logging Analysis Report

**Generated:** 2025-11-10 08:29:53

**Total Logging Statements:** 409

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [ASCII Visualization](#ascii-visualization)
3. [Statistics by Category](#statistics-by-category)
4. [Statistics by Severity](#statistics-by-severity)
5. [Statistics by Log Type](#statistics-by-log-type)
6. [Top Logging Files](#top-logging-files)
7. [Detailed Log Inventory](#detailed-log-inventory)
8. [Recommendations](#recommendations)

## Executive Summary

### Overview

The Musical Conductor package contains **409** logging statements across **38** files.

### Severity Breakdown

- **ERROR:** 39 (9.5%)
- **WARN:** 30 (7.3%)
- **INFO:** 340 (83.1%)
- **DEBUG:** 0 (0.0%)

### Top Categories

- **Other:** 284 (69.4%)
- **Logging:** 31 (7.6%)
- **PluginLoader:** 21 (5.1%)
- **PluginManager:** 19 (4.6%)
- **PluginSystem:** 15 (3.7%)

## ASCII Visualization

### Logging Distribution by Category

```
Other                     │██████████████████████████████████████████████████ 284
Logging                   │█████ 31
PluginLoader              │███ 21
PluginManager             │███ 19
PluginSystem              │██ 15
Validation                │█ 6
MusicalConductor          │█ 6
SequenceManagement        │█ 6
Monitoring                │█ 6
EventBus                  │ 5
ExecutionQueue            │ 3
ResourceManagement        │ 3
Strictmode                │ 3
BeatExecution             │ 1
```

### Logging Distribution by Severity

```
🔴 ERROR  │█████ 39
🟡 WARN   │████ 30
🔵 INFO   │██████████████████████████████████████████████████ 340
⚪ DEBUG  │ 0
```

### File Logging Heat Map (Top 20)

```
packages\musical-conductor\too   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 133
packages\musical-conductor\too   │▓▓▓▓▓▓▓▓▓▓ 36
packages\musical-conductor\too   │▓▓▓▓▓▓▓ 26
packages\musical-conductor\too   │▓▓▓▓▓▓▓ 25
packages\musical-conductor\mod   │▓▓▓▓▓▓ 21
packages\musical-conductor\mod   │▓▓▓▓▓ 19
packages\musical-conductor\mod   │▓▓▓▓▓ 18
packages\musical-conductor\too   │▓▓▓▓ 14
packages\musical-conductor\mod   │▓▓▓ 13
packages\musical-conductor\mod   │▓▓▓ 12
packages\musical-conductor\too   │▓▓▓ 11
packages\musical-conductor\mod   │▓▓ 8
packages\musical-conductor\too   │▓▓ 7
packages\musical-conductor\mod   │▓ 6
packages\musical-conductor\mod   │▓ 6
packages\musical-conductor\mod   │▓ 6
packages\musical-conductor\mod   │▓ 5
packages\musical-conductor\mod   │▓ 5
packages\musical-conductor\too   │▓ 4
packages\musical-conductor\too   │▓ 4
```

### Logging Type Distribution

```
console.log                    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 324
console.error                  │░░░ 26
console.warn                   │░░ 23
logger.info                    │░ 13
logger.error                   │░ 13
logger.warn                    │ 7
event_logger_instance.setupBeatExecutionLogging │ 1
event_logger_instance.setupMovementExecutionLogging │ 1
event_logger_instance.handleBeatError │ 1
```

## Statistics by Category

| Category | Count | Percentage |
|----------|-------|------------|
| Other | 284 | 69.4% |
| Logging | 31 | 7.6% |
| PluginLoader | 21 | 5.1% |
| PluginManager | 19 | 4.6% |
| PluginSystem | 15 | 3.7% |
| Validation | 6 | 1.5% |
| MusicalConductor | 6 | 1.5% |
| SequenceManagement | 6 | 1.5% |
| Monitoring | 6 | 1.5% |
| EventBus | 5 | 1.2% |
| ExecutionQueue | 3 | 0.7% |
| ResourceManagement | 3 | 0.7% |
| Strictmode | 3 | 0.7% |
| BeatExecution | 1 | 0.2% |

## Statistics by Severity

| Severity | Count | Percentage |
|----------|-------|------------|
| ERROR | 39 | 9.5% |
| WARN | 30 | 7.3% |
| INFO | 340 | 83.1% |
| DEBUG | 0 | 0.0% |

## Statistics by Log Type

| Log Type | Count | Percentage |
|----------|-------|------------|
| console.log | 324 | 79.2% |
| console.error | 26 | 6.4% |
| console.warn | 23 | 5.6% |
| logger.info | 13 | 3.2% |
| logger.error | 13 | 3.2% |
| logger.warn | 7 | 1.7% |
| event_logger_instance.setupBeatExecutionLogging | 1 | 0.2% |
| event_logger_instance.setupMovementExecutionLogging | 1 | 0.2% |
| event_logger_instance.handleBeatError | 1 | 0.2% |

## Top Logging Files

| File | Count | Percentage |
|------|-------|------------|
| `packages\musical-conductor\tools\cli\knowledge-cli.ts` | 133 | 32.5% |
| `packages\musical-conductor\tools\cli\demo.ts` | 36 | 8.8% |
| `packages\musical-conductor\tools\cli\queue-demo.ts` | 26 | 6.4% |
| `packages\musical-conductor\tools\cli\shortcut-demo.ts` | 25 | 6.1% |
| `packages\musical-conductor\modules\communication\sequences\plugins\PluginLoader.ts` | 21 | 5.1% |
| `packages\musical-conductor\modules\communication\sequences\plugins\PluginManager.ts` | 19 | 4.6% |
| `packages\musical-conductor\modules\communication\sequences\core\ConductorCore.ts` | 18 | 4.4% |
| `packages\musical-conductor\tools\cli\shortcuts\ShortcutManager.ts` | 14 | 3.4% |
| `packages\musical-conductor\modules\communication\sequences\plugins\PluginManifestLoader.ts` | 13 | 3.2% |
| `packages\musical-conductor\modules\communication\sequences\monitoring\ConductorLogger.ts` | 12 | 2.9% |
| `packages\musical-conductor\tools\cli\utils\CLILogger.ts` | 11 | 2.7% |
| `packages\musical-conductor\modules\communication\sequences\monitoring\EventLogger.ts` | 8 | 2.0% |
| `packages\musical-conductor\tools\cli\exporters\KnowledgeExporter.ts` | 7 | 1.7% |
| `packages\musical-conductor\modules\communication\SPAValidator.ts` | 6 | 1.5% |
| `packages\musical-conductor\modules\communication\sequences\index.ts` | 6 | 1.5% |
| `packages\musical-conductor\modules\communication\sequences\MusicalConductor.ts` | 6 | 1.5% |
| `packages\musical-conductor\modules\communication\EventBus.ts` | 5 | 1.2% |
| `packages\musical-conductor\modules\communication\sequences\api\ConductorAPI.ts` | 5 | 1.2% |
| `packages\musical-conductor\tools\cli\importers\KnowledgeImporter.ts` | 4 | 1.0% |
| `packages\musical-conductor\tools\cli\queue\KnowledgeTransferQueue.ts` | 4 | 1.0% |

## Detailed Log Inventory

### BeatExecution (1 statements)

#### `packages\musical-conductor\modules\communication\sequences\execution\BeatExecutor.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 388 | INFO | `console.log` | "🧹 BeatExecutor: Beat execution queue cleared"... |

### EventBus (5 statements)

#### `packages\musical-conductor\modules\communication\EventBus.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 222 | INFO | `console.log` | `📡 EventBus: Cleared all subscribers for "${eventName}"`... |
| 234 | INFO | `console.log` | "📡 EventBus: Cleared all subscribers"... |
| 285 | INFO | `console.log` | `📡 EventBus: Debug mode ${enabled ? "enabled" : "disabled"}`... |
| 329 | INFO | `console.log` | "🎼 EventBus: Using internal conductor (legacy mode... |
| 504 | INFO | `console.log` | `🎼 EventBus: Queueing ${eventName} for signal: ${signal}`... |

### ExecutionQueue (3 statements)

#### `packages\musical-conductor\modules\communication\sequences\execution\ExecutionQueue.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 57 | INFO | `console.log` | `🎼 ExecutionQueue: Dequeued "${request.sequenceName}"`... |
| 123 | INFO | `console.log` | `🎼 ExecutionQueue: Now executing "${request.sequenceName}"`... |
| 125 | INFO | `console.log` | `🎼 ExecutionQueue: No sequence currently executing`... |

### Logging (31 statements)

#### `packages\musical-conductor\modules\communication\sequences\monitoring\ConductorLogger.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 105 | WARN | `console.warn` | line, ...evt.message... |
| 108 | ERROR | `console.error` | line, ...evt.message... |
| 113 | INFO | `console.log` | line, ...evt.message... |
| 129 | INFO | `console.log` | `${indent}${scope.label}`... |
| 171 | INFO | `console.log` | `${indent}🎭 Stage Crew: ${pluginPrefix}${handlerName} (${cor... |
| 181 | INFO | `console.log` | `${opIndent}${connector} Add class "${op.value}" to ${op.sel... |
| 184 | INFO | `console.log` | `${opIndent}${connector} Remove class "${op.value}" from ${o... |
| 187 | INFO | `console.log` | `${opIndent}${connector} Set ${op.key}="${op.value}" on ${op... |
| 190 | INFO | `console.log` | `${opIndent}${connector} Set style ${op.key}="${op.value}" o... |
| 195 | INFO | `console.log` | `${opIndent}${connector} Create <${op.tag}>${classes}${attrs... |
| 198 | INFO | `console.log` | `${opIndent}${connector} Remove ${op.selector}`... |
| 201 | INFO | `console.log` | `${opIndent}${connector} Unknown operation: ${JSON.stringify... |

#### `packages\musical-conductor\modules\communication\sequences\monitoring\EventLogger.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 51 | INFO | `console.log` | "🎼 EventLogger: Hierarchical logging disabled"... |
| 76 | INFO | `console.log` | "🎼 EventLogger: Hierarchical beat logging initialized"... |
| 84 | INFO | `console.log` | "🎼 EventLogger: Movement hierarchical logging disabled"... |
| 116 | INFO | `console.log` | "🎼 EventLogger: Hierarchical movement logging initialized"... |
| 186 | INFO | `console.log` | `%c✅ Completed`, "color: #28A745; font-weight: bold;"... |
| 317 | INFO | `console.log` | `🎼 EventLogger: Emitted ${eventType}`, data... |
| 411 | INFO | `console.log` | "🎼 EventLogger: Configuration updated:", this.config... |
| 430 | INFO | `console.log` | "🧹 EventLogger: Event subscriptions cleaned up"... |

#### `packages\musical-conductor\tools\cli\utils\CLILogger.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 34 | INFO | `console.log` | this.colorize(message, "cyan"... |
| 38 | INFO | `console.log` | this.colorize(message, "green"... |
| 42 | WARN | `console.warn` | this.colorize(message, "yellow"... |
| 46 | ERROR | `console.error` | this.colorize(message, "red"... |
| 51 | INFO | `console.log` | this.colorize(`[DEBUG] ${message}`, "dim"... |
| 56 | INFO | `console.log` | message, ...args... |
| 72 | INFO | `console.log` | this.colorize("─".repeat(50... |
| 76 | INFO | `console.log` | ""... |
| 77 | INFO | `console.log` | this.colorize(`🎼 ${title}`, "bright"... |
| 78 | INFO | `console.log` | this.colorize("═".repeat(title.length + 3... |
| 97 | INFO | `console.log` | ""... |

### Monitoring (6 statements)

#### `packages\musical-conductor\modules\communication\sequences\monitoring\DuplicationDetector.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 147 | WARN | `console.warn` | "🔍 DuplicationDetector: Failed to generate hash, using fallb... |
| 217 | INFO | `console.log` | "🔍 DuplicationDetector: Configuration updated:", this.config... |
| 260 | INFO | `console.log` | "🧹 DuplicationDetector: All detection data reset"... |

#### `packages\musical-conductor\modules\communication\sequences\monitoring\PerformanceTracker.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 450 | INFO | `console.log` | "🧹 PerformanceTracker: All tracking data reset"... |

#### `packages\musical-conductor\modules\communication\sequences\monitoring\StatisticsManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 65 | WARN | `console.warn` | "📊 StatisticsManager: Recorded error occurrence"... |
| 155 | INFO | `console.log` | "🧹 StatisticsManager: All statistics reset"... |

### MusicalConductor (6 statements)

#### `packages\musical-conductor\modules\communication\sequences\MusicalConductor.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 182 | INFO | `event_logger_instance.setupBeatExecutionLogging` | ... |
| 183 | INFO | `event_logger_instance.setupMovementExecutionLogging` | ... |
| 250 | INFO | `console.log` | "🎼 MusicalConductor: Initialized with core components"... |
| 285 | INFO | `console.log` | "🔄 MusicalConductor: Singleton instance reset"... |
| 299 | INFO | `event_logger_instance.handleBeatError` | executionContext, beat, error... |
| 638 | INFO | `console.log` | "🎼 MusicalConductor: All monitoring data reset"... |

### Other (284 statements)

#### `packages\musical-conductor\modules\communication\DomainEventSystem.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 44 | INFO | `console.log` | `🎼 Domain Event: ${eventName}`, domainEvent... |

#### `packages\musical-conductor\modules\communication\index.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 90 | INFO | `console.log` | "🔄 Communication system state reset"... |
| 111 | INFO | `console.log` | "🎼 Initializing RenderX Evolution Communication System..."... |
| 124 | INFO | `console.log` | "✅ Communication System initialized successfully"... |

#### `packages\musical-conductor\modules\communication\sequences\api\ConductorAPI.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 191 | INFO | `console.log` | "🎼 ConductorAPI: Statistics reset"... |
| 203 | WARN | `console.warn` | "🎽 ConductorAPI: No active sequence to update data baton"... |
| 218 | ERROR | `console.error` | "🎽 ConductorAPI: Failed to update data baton:", error... |
| 243 | WARN | `console.warn` | "🎽 ConductorAPI: No active sequence to clear data baton"... |
| 254 | ERROR | `console.error` | "🎽 ConductorAPI: Failed to clear data baton:", error... |

#### `packages\musical-conductor\modules\communication\sequences\core\ConductorCore.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 86 | INFO | `console.log` | "🎼 ConductorCore: Initialized successfully"... |
| 94 | INFO | `console.log` | "🎼 Beat execution logging already initialized, skipping..."... |
| 98 | INFO | `console.log` | "🎼 ConductorCore: Setting up beat execution logging..."... |
| 125 | ERROR | `console.error` | "🎼 Beat execution error:", data... |
| 138 | INFO | `console.log` | "✅ Beat execution logging initialized"... |
| 147 | INFO | `console.log` | `🎼 ┌─ Beat ${beatNumber} Started`... |
| 148 | INFO | `console.log` | `🎼 │  Sequence: ${sequenceName}`... |
| 149 | INFO | `console.log` | `🎼 │  Movement: ${movementName}`... |
| 150 | INFO | `console.log` | `🎼 │  Event: ${eventType}`... |
| 151 | INFO | `console.log` | `🎼 │  Timing: ${timing}`... |
| 155 | INFO | `console.log` | `🎽 │  Data Baton:`, data.payload... |
| 165 | INFO | `console.log` | `🎼 └─ Beat ${beatNumber} Completed`... |
| 166 | INFO | `console.log` | `🎼    Duration: ${duration}ms`... |
| 167 | INFO | `console.log` | `🎼    Sequence: ${sequenceName}`... |
| 168 | INFO | `console.log` | `🎼    Movement: ${movementName}`... |
| 184 | INFO | `console.log` | "🎼 ConductorCore: Cleaning up..."... |
| 191 | WARN | `console.warn` | "🎼 Error during event unsubscription:", error... |
| 198 | INFO | `console.log` | "✅ ConductorCore: Cleanup completed"... |

#### `packages\musical-conductor\modules\communication\sequences\core\EventSubscriptionManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 155 | ERROR | `console.error` | `🎼 Subscriber: ${subscriberId}`... |

#### `packages\musical-conductor\modules\communication\sequences\index.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 79 | INFO | `console.log` | "🎼 Registering all musical sequences with conductor..."... |
| 88 | INFO | `console.log` | `✅ Registered sequence: ${sequence.name}`... |
| 91 | ERROR | `console.error` | `❌ Failed to register sequence: ${sequence.name}`, error... |
| 101 | INFO | `console.log` | `📊 Sequence categories: ${Array.from(categories... |
| 192 | INFO | `console.log` | "🎼 Initializing Musical Sequences System..."... |
| 215 | INFO | `console.log` | `📊 Total sequences registered: ${registeredSequences}`... |

#### `packages\musical-conductor\node_modules\type-fest\source\promisable.d.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 16 | INFO | `console.log` | entry... |

#### `packages\musical-conductor\tools\cli\demo.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 191 | INFO | `console.log` | "🚀 Demo: Starting knowledge export..."... |
| 198 | INFO | `console.log` | `✅ Demo: Knowledge exported to: ${outputPath}`... |
| 205 | INFO | `console.log` | "📥 Demo: Starting knowledge import..."... |
| 209 | ERROR | `console.error` | `❌ Knowledge file not found: ${filePath}`... |
| 219 | INFO | `console.log` | "🔍 Demo: Validating knowledge file..."... |
| 220 | INFO | `console.log` | "✅ Demo: Knowledge file is valid"... |
| 229 | INFO | `console.log` | "📚 Demo: Importing best practices:"... |
| 232 | INFO | `console.log` | `  ${index + 1}. ${practice}`... |
| 236 | INFO | `console.log` | "💡 Demo: Importing optimization insights:"... |
| 239 | INFO | `console.log` | `  ${index + 1}. ${insight.insight} (${insight.type}... |
| 243 | INFO | `console.log` | "✅ Demo: Knowledge imported successfully"... |
| 274 | INFO | `console.log` | JSON.stringify(status, null, 2... |
| 276 | INFO | `console.log` | "\n🎼 MusicalConductor Knowledge Status (Demo... |
| 277 | INFO | `console.log` | "============================================="... |
| 279 | INFO | `console.log` | `\n🎯 Conductor Status:`... |
| 280 | INFO | `console.log` | `  - Active: ${status.conductor.active ? "✅" : "❌"}`... |
| 281 | INFO | `console.log` | `  - Sequences: ${status.conductor.sequences}`... |
| 282 | INFO | `console.log` | `  - Plugins: ${status.conductor.plugins}`... |
| 283 | INFO | `console.log` | `  - Queue Length: ${status.conductor.queueLength}`... |
| 285 | INFO | `console.log` | `\n📊 Performance Metrics:`... |
| 289 | INFO | `console.log` | `  - Average Time: ${status.performance.averageTime}ms`... |
| 290 | INFO | `console.log` | `  - Success Rate: ${status.performance.successRate}%`... |
| 292 | INFO | `console.log` | `\n📡 Event System:`... |
| 293 | INFO | `console.log` | `  - Subscriptions: ${status.events.subscriptions}`... |
| 294 | INFO | `console.log` | `  - Events Emitted: ${status.events.emitted}`... |
| 296 | INFO | `console.log` | ""... |
| 301 | INFO | `console.log` | "🔍 Demo: Validating knowledge file..."... |
| 305 | ERROR | `console.error` | `❌ Knowledge file not found: ${filePath}`... |
| 330 | INFO | `console.log` | "✅ Demo: Knowledge file is valid"... |
| 331 | INFO | `console.log` | `📋 Agent: ${knowledge.metadata.agentId}`... |
| 337 | INFO | `console.log` | `📦 Type: ${knowledge.metadata.exportType}`... |
| 338 | INFO | `console.log` | `🎼 Version: ${knowledge.metadata.musicalConductorVersion}`... |
| 340 | INFO | `console.log` | "❌ Demo: Validation failed"... |
| 341 | INFO | `console.log` | `  - ${error}`... |
| 345 | INFO | `console.log` | "⚠️ Demo: Warnings:"... |
| 346 | INFO | `console.log` | `  - ${warning}`... |

#### `packages\musical-conductor\tools\cli\exporters\KnowledgeExporter.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 143 | WARN | `console.warn` | "⚠️ Could not get full system status:", error... |
| 154 | WARN | `console.warn` | "⚠️ Could not get event bus statistics:", error... |
| 187 | WARN | `console.warn` | "⚠️ Could not export complete system state:", error... |
| 224 | WARN | `console.warn` | "⚠️ Could not export complete plugin knowledge:", error... |
| 268 | WARN | `console.warn` | "⚠️ Could not export complete event knowledge:", error... |
| 298 | WARN | `console.warn` | "⚠️ Could not export complete resource knowledge:", error... |
| 351 | WARN | `console.warn` | "⚠️ Could not export performance insights:", error... |

#### `packages\musical-conductor\tools\cli\importers\KnowledgeImporter.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 403 | INFO | `console.log` | "📚 Imported Best Practices:"... |
| 406 | INFO | `console.log` | `  ${index + 1}. ${practice}`... |
| 417 | INFO | `console.log` | "💡 Imported Optimization Insights:"... |
| 420 | INFO | `console.log` | `  ${index + 1}. ${insight.insight} (${insight.type}... |

#### `packages\musical-conductor\tools\cli\knowledge-cli.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 265 | INFO | `logger.info` | "🚀 Starting knowledge export..."... |
| 284 | ERROR | `logger.error` | "❌ Export failed:", error... |
| 291 | INFO | `logger.info` | "📥 Starting knowledge import..."... |
| 303 | ERROR | `logger.error` | "❌ Validation failed:", validation.errors... |
| 305 | WARN | `logger.warn` | "⚠️ Warnings:", validation.warnings... |
| 317 | INFO | `logger.info` | "🔍 Import preview:", preview... |
| 331 | INFO | `logger.info` | `📊 Import summary: ${this.getImportSummary(result... |
| 333 | ERROR | `logger.error` | "❌ Import failed:", error... |
| 340 | INFO | `logger.info` | "🔄 Starting knowledge merge..."... |
| 357 | ERROR | `logger.error` | "❌ Merge failed:", error... |
| 364 | INFO | `logger.info` | "🔍 Validating knowledge file..."... |
| 376 | ERROR | `logger.error` | "❌ Validation failed:", validation.errors... |
| 380 | WARN | `logger.warn` | "⚠️ Warnings:", validation.warnings... |
| 385 | INFO | `logger.info` | `📄 Validation report saved to: ${options.report}`... |
| 388 | ERROR | `logger.error` | "❌ Validation failed:", error... |
| 398 | INFO | `console.log` | JSON.stringify(status, null, 2... |
| 403 | ERROR | `logger.error` | "❌ Failed to get status:", error... |
| 410 | INFO | `logger.info` | "🔍 Comparing knowledge..."... |
| 426 | INFO | `console.log` | JSON.stringify(diff, null, 2... |
| 431 | ERROR | `logger.error` | "❌ Diff failed:", error... |
| 447 | WARN | `logger.warn` | `❌ Shortcut '${keyword}' not found`... |
| 452 | INFO | `logger.info` | "\n💡 Did you mean one of these?"... |
| 454 | INFO | `console.log` | `   - ${s.keyword}: ${s.description}`... |
| 458 | INFO | `logger.info` | "\n🔍 Use --search flag to search for shortcuts"... |
| 468 | ERROR | `logger.error` | "❌ Shortcut command failed:", error... |
| 503 | INFO | `console.log` | `\n${index + 1}. 🔗 ${shortcut.keyword}`... |
| 504 | INFO | `console.log` | `   ${shortcut.description}`... |
| 505 | INFO | `console.log` | `   📚 ${shortcut.resources.length} resources`... |
| 507 | INFO | `console.log` | `   🏷️  Aliases: ${shortcut.aliases.join(", "... |
| 524 | INFO | `console.log` | `\n📁 ${category.toUpperCase(... |
| 530 | INFO | `console.log` | `      Aliases: ${shortcut.aliases.join(", "... |
| 551 | INFO | `logger.info` | "📥 Import shortcuts functionality - coming soon!"... |
| 561 | INFO | `console.log` | `📊 Total shortcuts: ${shortcuts.length}`... |
| 562 | INFO | `console.log` | `📁 Categories: ${categories.length}`... |
| 564 | INFO | `console.log` | "\n📋 Quick Commands:"... |
| 578 | INFO | `console.log` | "\n🔥 Popular shortcuts:"... |
| 588 | INFO | `console.log` | `   🔗 ${keyword} - ${shortcut.description}`... |
| 593 | ERROR | `logger.error` | "❌ Shortcuts command failed:", error... |
| 615 | INFO | `console.log` | `❌ Failed to mark transfer ${transferId} as consumed`... |
| 639 | INFO | `console.log` | `❌ Failed to mark transfer ${transferId} as sent`... |
| 663 | INFO | `console.log` | `❌ Failed to mark transfer ${transferId} as received`... |
| 688 | INFO | `console.log` | `❌ Failed to mark transfer ${transferId} as failed`... |
| 699 | INFO | `console.log` | "🎼 Knowledge Transfer Creation Guide"... |
| 700 | INFO | `console.log` | "═══════════════════════════════════════"... |
| 701 | INFO | `console.log` | "\n📋 Steps to create a knowledge transfer:"... |
| 702 | INFO | `console.log` | "\n1. Create your knowledge file (JSON format... |
| 703 | INFO | `console.log` | "   cat > my-knowledge.json << 'EOF'"... |
| 704 | INFO | `console.log` | "   {"... |
| 705 | INFO | `console.log` | '     "knowledgeTransfer": {'... |
| 706 | INFO | `console.log` | '       "version": "1.0.0",'... |
| 707 | INFO | `console.log` | '       "fromAgent": "your-agent-id",'... |
| 708 | INFO | `console.log` | '       "toAgent": "target-agent-id",'... |
| 709 | INFO | `console.log` | '       "priority": "high"'... |
| 710 | INFO | `console.log` | "     },"... |
| 711 | INFO | `console.log` | '     "content": { /* your knowledge here */ }'... |
| 712 | INFO | `console.log` | "   }"... |
| 713 | INFO | `console.log` | "   EOF"... |
| 714 | INFO | `console.log` | "\n2. Create the transfer:"... |
| 715 | INFO | `console.log` | '   node -r ts-node/register -e "'... |
| 719 | INFO | `console.log` | "   const queue = new KnowledgeTransferQueue(... |
| 720 | INFO | `console.log` | "   const transferId = queue.createTransfer("... |
| 721 | INFO | `console.log` | "     'from-agent', 'to-agent', 'my-knowledge.json',"... |
| 725 | INFO | `console.log` | "... |
| 726 | INFO | `console.log` | "   console.log('Transfer created:', transferId... |
| 727 | INFO | `console.log` | "   queue.markAsSent(transferId, 'from-agent'... |
| 728 | INFO | `console.log` | '   "'... |
| 729 | INFO | `console.log` | "\n3. Verify creation:"... |
| 730 | INFO | `console.log` | "   npm run queue -- --status"... |
| 736 | INFO | `console.log` | `📊 Total transfers: ${status.totalTransfers}`... |
| 737 | INFO | `console.log` | `⏳ Pending: ${status.pendingTransfers}`... |
| 738 | INFO | `console.log` | `🔄 Active: ${status.activeTransfers}`... |
| 739 | INFO | `console.log` | `✅ Completed: ${status.completedTransfers}`... |
| 740 | INFO | `console.log` | `❌ Failed: ${status.failedTransfers}`... |
| 741 | INFO | `console.log` | `⏰ Expired: ${status.expiredTransfers}`... |
| 744 | INFO | `console.log` | `\n👥 Active Agents (${agents.length}... |
| 763 | INFO | `console.log` | "📭 No transfers found"... |
| 771 | INFO | `console.log` | `\n${index + 1}. ${stateIcon} ${transfer.transferId}`... |
| 772 | INFO | `console.log` | `   📝 ${transfer.metadata.title}`... |
| 773 | INFO | `console.log` | `   👤 ${transfer.fromAgentId} → ${transfer.toAgentId}`... |
| 774 | INFO | `console.log` | `   ⏰ ${timeAgo}`... |
| 775 | INFO | `console.log` | `   🏷️  ${transfer.metadata.knowledgeType.join(", "... |
| 779 | INFO | `console.log` | `\n... and ${transfers.length - 10} more transfers`... |
| 793 | INFO | `console.log` | `📊 Status: ${onlineStatus}`... |
| 794 | INFO | `console.log` | `📥 Pending receives: ${agentStatus.pendingReceives}`... |
| 795 | INFO | `console.log` | `🔄 Pending consumes: ${agentStatus.pendingConsumes}`... |
| 796 | INFO | `console.log` | `📈 Total transfers: ${agentStatus.totalTransfers}`... |
| 800 | INFO | `console.log` | `\n📋 Recent Transfers (${transfers.length}... |
| 813 | INFO | `console.log` | `   📝 ${transfer.metadata.title}`... |
| 814 | INFO | `console.log` | `   👤 ${role === "sender" ? "→" : "←"} ${otherAgent}`... |
| 820 | INFO | `console.log` | "\n📭 No transfers found for this agent"... |
| 831 | INFO | `console.log` | "\n📋 Quick Commands:"... |
| 845 | INFO | `console.log` | "\n🔄 Transfer States:"... |
| 846 | INFO | `console.log` | "   pending → sent → received → consumed ✅"... |
| 847 | INFO | `console.log` | "   Any state can go to → failed ❌ or expired ⏰"... |
| 850 | ERROR | `logger.error` | "❌ Queue command failed:", error... |
| 908 | INFO | `console.log` | `\n🎯 Next Steps for Agent:`... |
| 909 | INFO | `console.log` | `══════════════════════════`... |
| 921 | INFO | `console.log` | `\n${index + 1}. 📤 ${transfer.metadata.title}`... |
| 922 | INFO | `console.log` | `   📝 ${transfer.metadata.description}`... |
| 923 | INFO | `console.log` | `   🏷️  ${transfer.metadata.knowledgeType.join(", "... |
| 924 | INFO | `console.log` | `   ⏰ Expires in: ${hoursRemaining}h`... |
| 925 | INFO | `console.log` | `   📁 Knowledge file: ${transfer.knowledgeFile}`... |
| 928 | INFO | `console.log` | `      npm run queue -- --received ${transfer.transferId}`... |
| 938 | INFO | `console.log` | `\n${index + 1}. 📥 ${transfer.metadata.title}`... |
| 939 | INFO | `console.log` | `   📁 Knowledge file: ${transfer.knowledgeFile}`... |
| 942 | INFO | `console.log` | `      npm run queue -- --consumed ${transfer.transferId}`... |
| 947 | INFO | `console.log` | `\n💡 Quick Commands:`... |
| 1096 | INFO | `logger.info` | `📦 Creating backup: ${backupPath}`... |
| 1111 | INFO | `console.log` | "\n🎼 MusicalConductor Knowledge Status"... |
| 1112 | INFO | `console.log` | "====================================="... |
| 1115 | INFO | `console.log` | `\n🎯 Conductor Status:`... |
| 1116 | INFO | `console.log` | `  - Active: ${status.conductor.active ? "✅" : "❌"}`... |
| 1117 | INFO | `console.log` | `  - Sequences: ${status.conductor.sequences \|\| 0}`... |
| 1118 | INFO | `console.log` | `  - Plugins: ${status.conductor.plugins \|\| 0}`... |
| 1119 | INFO | `console.log` | `  - Queue Length: ${status.conductor.queueLength \|\| 0}`... |
| 1123 | INFO | `console.log` | `\n📊 Performance Metrics:`... |
| 1127 | INFO | `console.log` | `  - Average Time: ${status.performance.averageTime \|\| 0}ms`... |
| 1128 | INFO | `console.log` | `  - Success Rate: ${status.performance.successRate \|\| 0}%`... |
| 1132 | INFO | `console.log` | `\n📡 Event System:`... |
| 1133 | INFO | `console.log` | `  - Subscriptions: ${status.events.subscriptions \|\| 0}`... |
| 1134 | INFO | `console.log` | `  - Events Emitted: ${status.events.emitted \|\| 0}`... |
| 1137 | INFO | `console.log` | ""... |
| 1141 | INFO | `console.log` | "\n🔍 Knowledge Comparison"... |
| 1142 | INFO | `console.log` | "======================="... |
| 1145 | INFO | `console.log` | `\n📋 Metadata Changes:`... |
| 1147 | INFO | `console.log` | `  ${key}: ${JSON.stringify(value... |
| 1152 | INFO | `console.log` | `\n➕ Added (${diff.added.length}... |
| 1154 | INFO | `console.log` | `  + ${item.type}: ${item.name \|\| item.id}`... |
| 1159 | INFO | `console.log` | `\n➖ Removed (${diff.removed.length}... |
| 1161 | INFO | `console.log` | `  - ${item.type}: ${item.name \|\| item.id}`... |
| 1166 | INFO | `console.log` | `\n🔄 Modified (${diff.modified.length}... |
| 1168 | INFO | `console.log` | `  ~ ${item.type}: ${item.name \|\| item.id}`... |
| 1172 | INFO | `console.log` | ""... |

#### `packages\musical-conductor\tools\cli\queue-demo.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 28 | INFO | `console.log` | "📤 Agent A wants to share plugin knowledge with Agent B..."... |
| 61 | INFO | `console.log` | "\n📊 Current Queue Status:"... |
| 65 | INFO | `console.log` | "\n📤 Agent A sends the plugin knowledge..."... |
| 69 | INFO | `console.log` | "📥 Agent B receives the plugin knowledge..."... |
| 73 | INFO | `console.log` | "\n👤 Agent B's current transfers:"... |
| 77 | INFO | `console.log` | "\n🔄 Agent B processes and imports the knowledge..."... |
| 85 | INFO | `console.log` | "\n📤 Agent C sends testing knowledge..."... |
| 89 | INFO | `console.log` | "\n📊 Final Queue Status:"... |
| 93 | INFO | `console.log` | "\n📋 All Transfers:"... |
| 99 | INFO | `console.log` | "\n💡 Key Benefits:"... |
| 100 | INFO | `console.log` | "   • Tracks sent/received/consumed states"... |
| 101 | INFO | `console.log` | "   • Prevents lost transfers"... |
| 102 | INFO | `console.log` | "   • Enables agent coordination"... |
| 103 | INFO | `console.log` | "   • Provides transfer history"... |
| 104 | INFO | `console.log` | "   • Supports priority and expiration"... |
| 109 | INFO | `console.log` | `   📊 Total: ${status.totalTransfers}`... |
| 110 | INFO | `console.log` | `   ⏳ Pending: ${status.pendingTransfers}`... |
| 111 | INFO | `console.log` | `   🔄 Active: ${status.activeTransfers}`... |
| 112 | INFO | `console.log` | `   ✅ Completed: ${status.completedTransfers}`... |
| 113 | INFO | `console.log` | `   ❌ Failed: ${status.failedTransfers}`... |
| 124 | INFO | `console.log` | `   📥 Pending receives: ${status.pendingReceives}`... |
| 125 | INFO | `console.log` | `   🔄 Pending consumes: ${status.pendingConsumes}`... |
| 163 | INFO | `console.log` | `   ${index + 1}. ${stateIcon} ${transfer.metadata.title}`... |
| 164 | INFO | `console.log` | `      👤 ${transfer.fromAgentId} → ${transfer.toAgentId}`... |
| 165 | INFO | `console.log` | `      🏷️  ${transfer.metadata.knowledgeType.join(", "... |
| 166 | INFO | `console.log` | `      ⏰ ${this.getTimeAgo(transfer.metadata.updatedAt... |

#### `packages\musical-conductor\tools\cli\queue\KnowledgeTransferQueue.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 169 | INFO | `logger.info` | `📤 Transfer ${transferId} marked as sent by ${agentId}`... |
| 395 | WARN | `logger.warn` | `⏰ Cleaned up ${expiredCount} expired transfers`... |
| 409 | WARN | `logger.warn` | "⚠️ Failed to load transfer queue, starting fresh"... |
| 430 | ERROR | `logger.error` | "❌ Failed to save transfer queue:", error... |

#### `packages\musical-conductor\tools\cli\shortcut-demo.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 57 | INFO | `console.log` | `❌ Shortcut '${keyword}' not found`... |
| 62 | INFO | `console.log` | "\n💡 Did you mean one of these?"... |
| 64 | INFO | `console.log` | `   - ${s.keyword}: ${s.description}`... |
| 68 | INFO | `console.log` | "\n🔍 Use --search flag to search for shortcuts"... |
| 78 | ERROR | `console.error` | "❌ Shortcut command failed:", error... |
| 87 | INFO | `console.log` | "\n🎼 Available Categories"... |
| 88 | INFO | `console.log` | "======================"... |
| 104 | INFO | `console.log` | `❌ No shortcuts found in category: ${options.category}`... |
| 111 | INFO | `console.log` | "=".repeat(50... |
| 113 | INFO | `console.log` | `\n${index + 1}. 🔗 ${shortcut.keyword}`... |
| 114 | INFO | `console.log` | `   ${shortcut.description}`... |
| 115 | INFO | `console.log` | `   📚 ${shortcut.resources.length} resources`... |
| 117 | INFO | `console.log` | `   🏷️  Aliases: ${shortcut.aliases.join(", "... |
| 125 | INFO | `console.log` | `\n🎼 All Shortcuts (${shortcuts.length}... |
| 126 | INFO | `console.log` | "=".repeat(30... |
| 135 | INFO | `console.log` | `\n📁 ${category.toUpperCase(... |
| 141 | INFO | `console.log` | `      Aliases: ${shortcut.aliases.join(", "... |
| 155 | INFO | `console.log` | "\n🎼 Knowledge Shortcuts Summary"... |
| 156 | INFO | `console.log` | "=============================="... |
| 157 | INFO | `console.log` | `📊 Total shortcuts: ${shortcuts.length}`... |
| 158 | INFO | `console.log` | `📁 Categories: ${categories.length}`... |
| 160 | INFO | `console.log` | "\n📋 Quick Commands:"... |
| 174 | INFO | `console.log` | "\n🔥 Popular shortcuts:"... |
| 186 | INFO | `console.log` | `   🔗 ${keyword} - ${shortcut.description}`... |
| 191 | ERROR | `console.error` | "❌ Shortcuts command failed:", error... |

#### `packages\musical-conductor\tools\cli\shortcuts\ShortcutManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 66 | WARN | `logger.warn` | "⚠️ Failed to load shortcuts database, using defaults"... |
| 82 | ERROR | `logger.error` | "❌ Failed to save shortcuts database:", error... |
| 524 | INFO | `console.log` | `📝 ${shortcut.description}`... |
| 527 | INFO | `console.log` | `🔗 Aliases: ${shortcut.aliases.join(", "... |
| 531 | INFO | `console.log` | `\n📚 Resources (${shortcut.resources.length}... |
| 545 | INFO | `console.log` | `     ${resource.description}`... |
| 551 | INFO | `console.log` | `     📁 ${displayPath}`... |
| 555 | INFO | `console.log` | `     🌐 ${resource.url}`... |
| 559 | INFO | `console.log` | `     🏷️  ${resource.tags.join(", "... |
| 567 | INFO | `console.log` | ""... |
| 586 | WARN | `logger.warn` | `❌ No shortcuts found for: "${query}"`... |
| 601 | INFO | `console.log` | `   ${shortcut.description}`... |
| 602 | INFO | `console.log` | `   📚 ${shortcut.resources.length} resources available`... |
| 608 | INFO | `console.log` | ""... |

### PluginLoader (21 statements)

#### `packages\musical-conductor\modules\communication\sequences\plugins\PluginLoader.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 19 | INFO | `console.log` | `📦 Loading plugin from cache: ${pluginPath}`... |
| 36 | INFO | `console.log` | `🔄 [node] Importing plugin via file URL: ${fileUrl}`... |
| 111 | INFO | `console.log` | `🔄 Attempting to load plugin: ${pluginPath}`... |
| 114 | INFO | `console.log` | `✅ Successfully loaded plugin: ${pluginPath}`... |
| 124 | INFO | `console.log` | `🔄 Attempting to load bundled plugin: ${bundledPath}`... |
| 131 | INFO | `console.log` | `✅ Successfully loaded bundled plugin: ${bundledPath}`... |
| 141 | INFO | `console.log` | `🔄 Attempting to load bundled plugin: ${bundledPath}`... |
| 148 | INFO | `console.log` | `✅ Successfully loaded bundled plugin: ${bundledPath}`... |
| 157 | INFO | `console.log` | `🔄 Attempting to load plugin: ${pluginPath}`... |
| 164 | INFO | `console.log` | `✅ Successfully loaded plugin: ${pluginPath}`... |
| 195 | INFO | `console.log` | `🔍 Plugin directory: ${pluginDir}`... |
| 196 | INFO | `console.log` | `🔍 Plugin name: ${pluginName}`... |
| 210 | INFO | `console.log` | `🔄 Trying resolution strategy: ${strategy}`... |
| 259 | INFO | `console.log` | `🧠 PluginLoader: Loading plugin from: ${pluginPath}`... |
| 281 | INFO | `console.log` | `🔄 Using default export for plugin: ${pluginPath}`... |
| 285 | INFO | `console.log` | `✅ Successfully loaded and validated plugin: ${pluginPath}`... |
| 288 | ERROR | `console.error` | `❌ Failed to load plugin from ${pluginPath}:`, error... |
| 299 | INFO | `console.log` | `🔄 Preloading ${pluginPaths.length} plugins...`... |
| 305 | ERROR | `console.error` | `❌ Failed to preload plugin ${path}:`, error... |
| 334 | INFO | `console.log` | "🧹 PluginLoader: Module cache cleared"... |
| 359 | INFO | `console.log` | `🗑️ Removed plugin from cache: ${pluginPath}`... |

### PluginManager (19 statements)

#### `packages\musical-conductor\modules\communication\sequences\plugins\PluginManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 76 | INFO | `console.log` | `🧠 PluginManager: Attempting to mount plugin: ${id}`... |
| 103 | INFO | `console.log` | `🧠 Plugin already mounted: ${id} — augmenting with additiona... |
| 427 | INFO | `console.log` | `✅ Plugin mounted successfully: ${id}`... |
| 428 | INFO | `console.log` | `🎼 Sequence registered: ${sequence.name}`... |
| 437 | ERROR | `console.error` | `❌ Failed to mount plugin ${id}:`, error... |
| 463 | WARN | `console.warn` | `🧠 PluginManager: Failed to unmount ${pluginId}:`, err... |
| 475 | WARN | `console.warn` | `🧠 Plugin not found for unmounting: ${pluginId}`... |
| 488 | INFO | `console.log` | `✅ Plugin unmounted successfully: ${pluginId}`... |
| 491 | ERROR | `console.error` | `❌ Failed to unmount plugin ${pluginId}:`, error... |
| 510 | INFO | `console.log` | "🧠 Registering CIA-compliant plugins..."... |
| 545 | ERROR | `console.error` | "❌ Failed to register CIA plugins:", error... |
| 556 | INFO | `console.log` | "🎼 PluginManager: Registering plugins from manifest..."... |
| 568 | INFO | `console.log` | `⚠️ Plugin already mounted, skipping: ${plugin.name}`... |
| 604 | INFO | `console.log` | `✅ Auto-mounted plugin: ${plugin.name}`... |
| 611 | INFO | `console.log` | `⏭️ Skipping non-auto-mount plugin: ${plugin.name}`... |
| 614 | ERROR | `console.error` | `❌ Error processing plugin ${plugin.name}:`, error... |
| 623 | INFO | `console.log` | "🔄 Registering fallback sequences..."... |
| 654 | INFO | `console.log` | "✅ Fallback sequences registered"... |
| 744 | INFO | `console.log` | "🧹 PluginManager: State reset"... |

### PluginSystem (15 statements)

#### `packages\musical-conductor\modules\communication\sequences\plugins\PluginInterfaceFacade.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 136 | WARN | `console.warn` | `🧠 No handlers found for sequence: ${sequenceName}`... |
| 221 | WARN | `console.warn` | "🎼 Failed to extract plugin code for validation:", error... |

#### `packages\musical-conductor\modules\communication\sequences\plugins\PluginManifestLoader.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 40 | INFO | `console.log` | `📦 Loading manifest from cache: ${manifestPath}`... |
| 45 | INFO | `console.log` | `🔄 Loading plugin manifest: ${manifestPath}`... |
| 97 | INFO | `console.log` | `✅ Successfully loaded manifest: ${manifestPath}`... |
| 104 | ERROR | `console.error` | `❌ Failed to load manifest from ${manifestPath}:`, error... |
| 108 | INFO | `console.log` | "🔄 Using fallback manifest"... |
| 126 | WARN | `console.warn` | "⚠️ Manifest missing version, using default"... |
| 142 | ERROR | `console.error` | `❌ Invalid plugin entry at index ${index}:`, error... |
| 148 | WARN | `console.warn` | "⚠️ No valid plugins found in manifest"... |
| 239 | INFO | `console.log` | `✅ Successfully loaded manifest from: ${path}`... |
| 242 | WARN | `console.warn` | `⚠️ Failed to load manifest from ${path}, trying next...`... |
| 246 | WARN | `console.warn` | "⚠️ All manifest sources failed, using fallback"... |
| 260 | ERROR | `console.error` | "❌ Failed to parse manifest JSON:", error... |
| 336 | INFO | `console.log` | "🧹 PluginManifestLoader: Cache cleared"... |

### ResourceManagement (3 statements)

#### `packages\musical-conductor\modules\communication\sequences\resources\ResourceConflictManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 205 | INFO | `console.log` | "🎼 ResourceConflictManager: Clearing all resource ownership"... |

#### `packages\musical-conductor\modules\communication\sequences\resources\ResourceManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 306 | INFO | `console.log` | "🧹 ResourceManager: All resource ownership reset"... |

#### `packages\musical-conductor\modules\communication\sequences\resources\ResourceOwnershipTracker.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 281 | INFO | `console.log` | "🧹 ResourceOwnershipTracker: All tracking data reset"... |

### SequenceManagement (6 statements)

#### `packages\musical-conductor\modules\communication\sequences\core\SequenceRegistry.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 197 | INFO | `console.log` | `🎼 SequenceRegistry: Cleared ${sequences.length} sequences`... |

#### `packages\musical-conductor\modules\communication\sequences\execution\SequenceExecutor.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 247 | INFO | `console.log` | "🧹 SequenceExecutor: Execution history cleared"... |

#### `packages\musical-conductor\modules\communication\sequences\orchestration\SequenceOrchestrator.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 301 | ERROR | `console.error` | `❌ Sequence name: "${sequenceName}"`... |
| 306 | ERROR | `console.error` | `❌ Available sequences:`, this.sequenceRegistry.getNames(... |
| 333 | WARN | `console.warn` | `🎼 SequenceOrchestrator: ${deduplicationResult.reason}`... |

#### `packages\musical-conductor\modules\communication\sequences\validation\SequenceValidator.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 291 | INFO | `console.log` | "🧹 SequenceValidator: Validation state reset"... |

### Strictmode (3 statements)

#### `packages\musical-conductor\modules\communication\sequences\strictmode\StrictModeManager.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 256 | INFO | `console.log` | `🎼 StrictModeManager: Added StrictMode pattern: ${pattern}`... |
| 265 | INFO | `console.log` | `🎼 StrictModeManager: Removed StrictMode pattern: ${pattern}... |
| 281 | INFO | `console.log` | "🎼 StrictModeManager: Cleared execution history"... |

### Validation (6 statements)

#### `packages\musical-conductor\modules\communication\SPAValidator.ts`

| Line | Severity | Type | Message Preview |
|------|----------|------|----------------|
| 83 | INFO | `console.log` | "🎼 SPA Validator: Runtime checks initialized"... |
| 550 | ERROR | `console.error` | `   Plugin: ${violation.pluginId}`... |
| 551 | ERROR | `console.error` | `   Time: ${violation.timestamp.toISOString(... |
| 554 | ERROR | `console.error` | `   Location: ${violation.fileUrl}:${violation.lineNumber}${... |
| 557 | ERROR | `console.error` | `   Code: ${violation.codeSnippet.trim(... |
| 727 | INFO | `console.log` | "🎼 SPA Validator: Runtime checks disabled"... |

## Recommendations

### 1. Logging Standardization

- **Console logging:** 373 statements (91.2%)
- **Logger API:** 36 statements (8.8%)

⚠️ **Recommendation:** Migrate from `console.*` to a structured logger API (e.g., `ctx.logger.*`) for better control, filtering, and production deployment.

### 2. Severity Distribution

⚠️ **Observation:** High volume of INFO-level logging may impact performance in production. Consider adding log level controls or reducing verbose logging.

### 3. Category-Specific Recommendations

- **Other** has the most logging (284 statements). Consider if this level of instrumentation is necessary for production.

### 4. Alignment with Desktop Variant

To achieve parity with the Avalonia desktop variant:

1. Map each web logging statement to its C# equivalent
2. Ensure log levels match (INFO ↔ LogLevel.Information, etc.)
3. Verify message content and context are equivalent
4. Check that structured logging patterns are consistent

### 5. Performance Considerations

- Avoid logging in hot paths (e.g., per-frame or per-beat execution)
- Use conditional logging based on environment (dev vs. prod)
- Consider lazy evaluation of log messages to avoid unnecessary string concatenation

