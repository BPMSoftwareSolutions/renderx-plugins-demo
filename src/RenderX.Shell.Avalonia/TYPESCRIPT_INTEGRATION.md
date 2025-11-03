# TypeScript-to-.NET Integration Architecture

## Overview

The RenderX Shell Avalonia (.NET) implementation uses a **frontend-backend separation** pattern:

- **Frontend (TypeScript)**: Orchestration, UI rendering, plugin management via RenderX conductor
- **Backend (.NET)**: Services, persistence, telemetry, plugin discovery, configuration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Avalonia Shell (C#/.NET)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebView2 Control (Hosts TypeScript Frontend)        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  RenderX TypeScript Frontend (React)           │  │   │
│  │  │  - Conductor (Orchestration)                   │  │   │
│  │  │  - Event Router (Pub/Sub)                      │  │   │
│  │  │  - Plugin Mounting (Slots)                     │  │   │
│  │  │  - Canvas, Library, Control Panel              │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↕ (IPC/HTTP)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  .NET Backend Services                              │   │
│  │  - Plugin Discovery API                             │   │
│  │  - Telemetry Service                                │   │
│  │  - Configuration Service                            │   │
│  │  - Persistence Layer                                │   │
│  │  - Feature Flags                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Build Process

### 1. TypeScript Build (Pre-build)

The `.csproj` includes a `BuildTypeScriptFrontend` target that:

1. Runs `npm run build:host` from the repo root
2. Compiles TypeScript to static assets in `dist/`
3. Copies assets to `wwwroot/`

```xml
<Target Name="BuildTypeScriptFrontend" BeforeTargets="Build">
  <Exec Command="npm run build:host" WorkingDirectory="$(RenderXRepoRoot)" />
  <Copy SourceFiles="@(BuiltAssets)" DestinationFolder="$(TypeScriptBuildDir)" />
</Target>
```

### 2. Asset Serving

The WebViewHost loads the frontend from:

- **Development**: `http://localhost:5173` (Vite dev server)
- **Production**: `file:///wwwroot/index.html` (embedded assets)

## Integration Points

### Frontend → Backend Communication

The TypeScript frontend communicates with .NET backend via:

1. **HTTP/REST API** (Primary)
   - Plugin discovery
   - Telemetry submission
   - Configuration retrieval
   - Feature flags

2. **WebView2 PostMessage** (Secondary)
   - Real-time events
   - Diagnostics
   - Hot reload notifications

### Backend → Frontend Communication

The .NET backend communicates with TypeScript via:

1. **HTTP Responses** (Synchronous)
   - API responses to frontend requests

2. **WebView2 ExecuteScript** (Asynchronous)
   - Push notifications
   - Configuration updates
   - Plugin availability changes

## Development Workflow

### Option 1: Vite Dev Server (Recommended for Development)

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Avalonia shell
dotnet run --project src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj
```

The shell will detect the running Vite server and load the frontend from `http://localhost:5173`.

### Option 2: Production Build

```bash
# Build TypeScript frontend
npm run build:host

# Build and run Avalonia shell
dotnet build src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj
dotnet run --project src/RenderX.Shell.Avalonia/RenderX.Shell.Avalonia.csproj
```

The shell will load the frontend from embedded `wwwroot/` assets.

## Next Steps

### Phase 2.2: WebView Integration
- Implement WebView2 control in MainWindow
- Add message routing between frontend and backend
- Set up development/production asset loading

### Phase 2.3: Backend API Layer
- Create ASP.NET Core minimal APIs
- Implement plugin discovery endpoint
- Add telemetry collection endpoint

### Phase 2.4: IPC Bridge
- Implement conductor-to-backend bridge
- Add sequence execution handlers
- Wire up event routing

### Phase 2.5: Plugin Discovery
- Scan for plugins in configured directories
- Load plugin manifests
- Expose via API to frontend

### Phase 2.6: Telemetry Backend
- Collect logs from TypeScript frontend
- Implement structured logging
- Integrate with RAG enrichment

### Phase 2.7: Configuration Service
- Expose feature flags via API
- Manage environment configuration
- Support hot reload

### Phase 2.8: Integration Tests
- E2E tests for TypeScript-to-.NET communication
- Plugin loading and execution tests
- Telemetry flow validation

## Key Files

- `RenderX.Shell.Avalonia.csproj` - Build configuration with TypeScript pre-build
- `UI/Views/WebViewHost.axaml` - WebView2 container
- `UI/Views/WebViewHost.axaml.cs` - WebView initialization and IPC
- `wwwroot/` - Compiled TypeScript frontend assets
- `appsettings.json` - Configuration for backend services

## Troubleshooting

### WebView2 Runtime Not Found
Install WebView2 runtime from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### TypeScript Build Fails
Ensure npm dependencies are installed:
```bash
npm install
```

### Frontend Not Loading
Check browser console (F12 in WebView2) for errors. Verify:
- Vite dev server is running (if in dev mode)
- `wwwroot/` has built assets (if in production mode)
- Network requests are reaching backend APIs

## References

- [Avalonia Documentation](https://docs.avaloniaui.net/)
- [WebView2 Documentation](https://learn.microsoft.com/en-us/microsoft-edge/webview2/)
- [RenderX Architecture](../../docs/RenderX%20Plugins%20Demo%20—%20Three-Slot%20Thin%20Shell%20(No%20Fallbacks)%20—%20Full%20Spec.md)

