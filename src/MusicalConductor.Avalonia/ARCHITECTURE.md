# MusicalConductor Avalonia.NET Integration - Architecture Guide

## Overview

This document describes the architecture of the MusicalConductor Avalonia.NET integration, which embeds the TypeScript MusicalConductor orchestration engine in a .NET/Avalonia desktop application using the Jint JavaScript engine.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Avalonia Desktop App                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MainWindow (XAML/C#)                    │   │
│  │  - Play Sequence Button                              │   │
│  │  - Status Display                                    │   │
│  │  - Event Subscriptions                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         IConductorClient (Interface)                 │   │
│  │  - Play(pluginId, sequenceId, context, priority)    │   │
│  │  - Subscribe(eventName, callback)                   │   │
│  │  - GetStatus() / GetStatistics()                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      ConductorClient (Implementation)                │   │
│  │  - Forwards calls to Jint engine                     │   │
│  │  - Manages subscriptions                             │   │
│  │  - Handles async/await bridging                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        JintEngineHost (Jint Engine)                  │   │
│  │  - Initializes Jint JavaScript engine                │   │
│  │  - Loads conductor bundle                            │   │
│  │  - Provides browser API stubs                        │   │
│  │  - Executes JS code                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    MusicalConductor (JavaScript Bundle)              │   │
│  │  - EventBus (pub/sub)                                │   │
│  │  - Sequence Orchestration                            │   │
│  │  - Plugin Manager                                    │   │
│  │  - Execution Queue                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Browser API Stubs (Jint)                     │   │
│  │  - window object                                     │   │
│  │  - document object                                   │   │
│  │  - console object (→ .NET logger)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. IConductorClient Interface
- **Location:** `Interfaces/IConductorClient.cs`
- **Purpose:** Defines the public API for orchestration
- **Methods:**
  - `Play()` - Execute a sequence
  - `Subscribe()` / `On()` - Listen to events
  - `Unsubscribe()` / `Off()` - Stop listening
  - `GetStatus()` - Query conductor state
  - `GetStatistics()` - Get execution metrics

### 2. ConductorClient Implementation
- **Location:** `Client/ConductorClient.cs`
- **Purpose:** Implements IConductorClient by forwarding calls to Jint engine
- **Responsibilities:**
  - Convert .NET calls to JavaScript calls
  - Manage event subscriptions
  - Handle error cases
  - Provide logging

### 3. JintEngineHost
- **Location:** `Engine/JintEngineHost.cs`
- **Purpose:** Manages the Jint JavaScript engine
- **Responsibilities:**
  - Initialize Jint engine with proper options
  - Load the MusicalConductor JavaScript bundle
  - Provide browser API stubs (window, document, console)
  - Execute JavaScript code
  - Bridge .NET logging to JavaScript console

### 4. Browser API Stubs
- **Location:** `Engine/JintEngineHost.cs` (CreateConsoleObject method)
- **Purpose:** Provide minimal browser APIs for the JS bundle
- **Stubs:**
  - `window` - Global object
  - `document` - DOM stub (minimal)
  - `console` - Logging (routes to .NET ILogger)

### 5. Dependency Injection Extensions
- **Location:** `Extensions/ServiceCollectionExtensions.cs`
- **Purpose:** Register services in the DI container
- **Usage:**
  ```csharp
  services.AddMusicalConductor(options =>
  {
      options.EnableDebugLogging = true;
  });
  ```

## Data Flow

### Playing a Sequence

```
1. UI: Button Click
   ↓
2. MainWindow.PlaySequence_Click()
   ↓
3. IConductorClient.Play(pluginId, sequenceId, context)
   ↓
4. ConductorClient.Play()
   - Convert parameters to JsValue
   - Call JintEngineHost.CallMethod("play", args)
   ↓
5. JintEngineHost.CallMethod()
   - Invoke JavaScript method on conductor instance
   ↓
6. MusicalConductor.play() (JavaScript)
   - Execute sequence
   - Emit events
   ↓
7. Events propagate back to .NET via subscriptions
```

### Event Subscription

```
1. UI: Subscribe to event
   ↓
2. IConductorClient.On(eventName, callback)
   ↓
3. ConductorClient.On()
   - Store callback in _subscriptions dictionary
   - Return unsubscribe function
   ↓
4. When event fires in JavaScript:
   - EventBus emits event
   - .NET callback is invoked
```

## Thread Safety

- **Jint Engine:** Single-threaded (all calls must be on the same thread)
- **Subscriptions:** Thread-safe dictionary for storing callbacks
- **Logging:** Thread-safe via ILogger

## Error Handling

- **Bundle Loading:** Throws if bundle not found or invalid
- **Method Calls:** Throws if method not found on conductor
- **Subscriptions:** Logs errors but doesn't throw
- **Logging:** All errors logged via ILogger

## Performance Characteristics

- **Startup:** ~100-200ms (Jint initialization + bundle loading)
- **Play() Call:** ~0.5-2ms (direct method call)
- **Memory:** ~20-30MB (Jint engine + bundle)
- **Deployment:** +5-10MB (Jint NuGet package)

## Limitations

1. **Single-threaded:** All conductor calls must be on the same thread
2. **No DOM:** Browser DOM APIs are stubbed (minimal implementation)
3. **Performance:** Jint is ~10-50% slower than V8 (acceptable for orchestration)
4. **Debugging:** Limited JavaScript debugging capabilities

## Future Enhancements

1. **ClearScript Support:** Add option to use ClearScript for better performance
2. **Plugin System:** Support for .NET plugins alongside JS plugins
3. **Async/Await:** Better async/await bridging
4. **Debugging:** Improved debugging support
5. **Performance:** Optimize hot paths

## References

- [Jint Documentation](https://github.com/sebastienros/jint)
- [MusicalConductor TypeScript](../../../modules/communication/sequences/MusicalConductor.ts)
- [Avalonia Documentation](https://docs.avaloniaui.net/)

