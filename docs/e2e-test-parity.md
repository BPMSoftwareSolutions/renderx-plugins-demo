# E2E Test Parity: Web vs Desktop

This document tracks the parity between E2E tests for the web (Cypress) and desktop (Avalonia/FlaUI) versions of RenderX.

## Test Coverage Summary

| Test Category | Web (Cypress) | Desktop (FlaUI) | Status |
|--------------|---------------|-----------------|--------|
| Startup/Plugin Loading | ✅ `00-startup-plugins-loaded.cy.ts` | ✅ `StartupPluginsLoadedE2ETests.cs` | ✅ Complete |
| Configuration Service | ✅ `config-service.cy.ts` | ✅ `ConfigServiceE2ETests.cs` | ✅ Complete |
| Library → Canvas Drop | ✅ `library-drop.cy.ts` | ✅ `LibraryDropE2ETests.cs` | ✅ Complete |
| Component Resize | ✅ `component-resize.cy.ts` | ✅ `ComponentResizeE2ETests.cs` | ✅ Complete |
| Generic Plugin Runner | ✅ `generic-plugin-runner.cy.ts` | ✅ `GenericPluginRunnerE2ETests.cs` | ✅ Complete |
| Theme Toggle | ✅ `theme-toggle.cy.ts` | ✅ `ThemeToggleE2ETests.cs` | ✅ Complete |

**Total Tests:** 6 web tests, 6 desktop tests ✅

## Test Details

### 1. Startup/Plugin Loading

**Web:** `cypress/e2e/00-startup-plugins-loaded.cy.ts`
- Captures console logs during startup
- Verifies all manifest plugins show loading evidence
- Checks for registration, catalog loading, and sequence mounting
- Writes artifacts to `.logs/` directory

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/StartupPluginsLoadedE2ETests.cs`
- Fetches plugin manifest from `/plugins/plugin-manifest.json`
- Retrieves telemetry events from `/api/telemetry/events`
- Verifies each plugin ID has loading evidence in logs
- Checks for mount/resolve errors
- Writes JSON artifacts to `.logs/` directory

### 2. Configuration Service

**Web:** `cypress/e2e/config-service.cy.ts`
- 16 test cases covering configuration API
- Tests `window.RenderX.config.get()` and `has()` methods
- Verifies security (no API keys in DOM/console)
- Tests environment variable integration

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/ConfigServiceE2ETests.cs`
- 12 test cases covering configuration HTTP API
- Tests `/api/config/get` and `/api/config/has` endpoints
- Verifies security (no API keys in telemetry logs)
- Tests environment variable integration
- Validates health endpoint availability

### 3. Library → Canvas Drop

**Web:** `cypress/e2e/library-drop.cy.ts`
- Comprehensive 404-line test
- Tests drag-and-drop using DataTransfer API
- Verifies component creation, selection overlay, control panel
- Tests layout properties (X, Y, Width, Height)

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/LibraryDropE2ETests.cs`
- Tests drag-and-drop using FlaUI mouse automation
- Verifies component creation via telemetry events
- Checks Control Panel slot content
- Validates layout properties display
- Verifies no mount/resolve errors

### 4. Component Resize

**Web:** `cypress/e2e/component-resize.cy.ts`
- Drags button from Library to Canvas
- Resizes component using selection overlay handles
- Verifies width increases after resize

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/ComponentResizeE2ETests.cs`
- Drags button from Library to Canvas using FlaUI
- Selects component and attempts resize via handle
- Measures initial and final dimensions
- Verifies resize sequences are mounted
- Checks selection overlay display

### 5. Generic Plugin Runner

**Web:** `cypress/e2e/generic-plugin-runner.cy.ts`
- Runs test scenarios from `/test/manifest.json`
- Uses TestHarness API for capability checking
- Executes scenario steps and asserts
- Generates snapshot and log artifacts

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/GenericPluginRunnerE2ETests.cs`
- Fetches test manifest from `/test/manifest.json`
- Validates test API version compatibility
- Executes scenario steps and asserts via HTTP API
- Captures and stores test logs
- Writes JSON artifacts

### 6. Theme Toggle

**Web:** `cypress/e2e/theme-toggle.cy.ts`
- Tests theme toggle button
- Verifies `data-theme` attribute on `<html>` element
- Tests localStorage persistence
- Validates multiple toggles

**Desktop:** `src/RenderX.Shell.Avalonia.E2ETests/ThemeToggleE2ETests.cs`
- Tests theme toggle via `/api/sequences/execute` endpoint
- Verifies telemetry events (sequence.started, sequence.completed)
- Uses HTTP client for API testing
- Validates theme change behavior

## Technology Stack Comparison

| Aspect | Web | Desktop |
|--------|-----|---------|
| **Test Framework** | Cypress (JavaScript) | xUnit (C#) |
| **UI Automation** | Cypress commands | FlaUI (UIA3) |
| **API Testing** | `cy.request()` | `HttpClient` |
| **Mouse/Keyboard** | Cypress events | FlaUI Mouse/Keyboard |
| **Assertions** | Chai assertions | xUnit assertions |
| **Artifacts** | `.logs/` directory | `.logs/` directory |

## Implementation Notes

### Desktop Test Architecture

All desktop E2E tests follow a consistent pattern:

1. **IAsyncLifetime** - Implements xUnit lifecycle hooks
   - `InitializeAsync()` - Launches application, waits for health endpoint
   - `DisposeAsync()` - Closes application and disposes automation

2. **Helper Methods**
   - `ResolveAppExePath()` - Finds the built executable
   - `WaitForHealthAsync()` - Polls health endpoint until ready
   - `GetAsync<T>()` - HTTP GET with JSON deserialization
   - `WaitForElementAsync()` - Polls for UI element availability

3. **Test Methods**
   - Marked with `[Fact]` attribute
   - Use FlaUI for UI automation
   - Use HttpClient for API testing
   - Write artifacts to `.logs/` directory

### Key Differences

1. **Startup Time**
   - Web: Fast (browser-based)
   - Desktop: Slower (native app launch)

2. **UI Automation**
   - Web: Direct DOM access via Cypress
   - Desktop: UI Automation API via FlaUI

3. **API Access**
   - Web: Same-origin requests
   - Desktop: HTTP requests to localhost:5000

4. **Artifact Storage**
   - Both: `.logs/` directory
   - Web: Cypress screenshots/videos
   - Desktop: JSON telemetry dumps

## Running the Tests

### Web (Cypress)

```bash
npm run test:e2e
```

### Desktop (xUnit)

```bash
cd src/RenderX.Shell.Avalonia.E2ETests
dotnet test
```

## Future Enhancements

1. **Visual Regression Testing**
   - Web: Cypress screenshot comparison
   - Desktop: FlaUI screenshot comparison

2. **Performance Metrics**
   - Startup time measurement
   - Plugin load time tracking
   - Memory usage monitoring

3. **Cross-Platform Testing**
   - Desktop tests on Windows, macOS, Linux
   - Web tests on multiple browsers

4. **CI/CD Integration**
   - Automated test runs on PR
   - Test result reporting
   - Artifact archival

## Maintenance

- **Web tests location:** `cypress/e2e/`
- **Desktop tests location:** `src/RenderX.Shell.Avalonia.E2ETests/`
- **Test analysis:** `cypress_e2e_analyzer.py` (web only)
- **This document:** Update when adding/removing tests

---

**Last Updated:** 2025-11-09  
**Status:** ✅ Full parity achieved (6/6 tests)

