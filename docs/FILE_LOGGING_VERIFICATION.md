# File Logging Verification Guide

## Quick Test

Run the application and check for log files:

```powershell
# 1. Build and run the application
dotnet run --project src/RenderX.Shell.Avalonia

# 2. In another terminal, check for new log files
Get-ChildItem .logs -File | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# 3. View the latest log file in real-time (while app is running)
Get-Content .logs\renderx-*.log -Tail 50 -Wait
```

## Expected Log Entries

You should see entries like:

```
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: canvas.component.created
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: canvas.component.selection.changed
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: canvas.component.deleted
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: canvas.component.updated
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: control.panel.update.requested
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: control.panel.classes.updated
[2025-11-09 HH:mm:ss.fff -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: library.component.add.requested
```

## Musical Conductor Telemetry

When sequences execute, you'll see detailed telemetry:

```
[timestamp] [INF] MusicalConductor.Avalonia.Logging.ConductorLogger: 🎼 Sequence started: control-panel-css-create-symphony
[timestamp] [INF] MusicalConductor.Avalonia.Logging.ConductorLogger: 🎼   Movement: Start
[timestamp] [INF] MusicalConductor.Avalonia.Logging.ConductorLogger: 🎼     Beat: Handler:Control:Panel:Css:Create
[timestamp] [INF] RenderX.Plugins.ControlPanel.Handlers.ControlPanelHandlers: 🎨 Creating CSS for component...
[timestamp] [INF] RenderX.Plugins.ControlPanel.Handlers.ControlPanelHandlers: 🎨 CSS created successfully
[timestamp] [INF] MusicalConductor.Avalonia.Logging.ConductorLogger: 🎼 Sequence completed: control-panel-css-create-symphony
```

## Handler Calls

All 72 handler methods from 11 handler classes will log their operations:

**CanvasComponent Handlers (30 sequences):**
- Copy/Paste operations
- Selection changes
- Drag and drop
- Resize and move
- CRUD operations
- Line manipulation
- Import/Export

**ControlPanel Handlers (13 sequences):**
- CSS creation and updates
- Class management
- Field updates
- UI rendering

**Header Handlers (2 sequences):**
- Theme get/toggle

**Library Handlers (1 sequence):**
- Template loading

**LibraryComponent Handlers (3 sequences):**
- Drag and drop from library

## Log File Management

- **Automatic rotation**: New file created daily
- **Retention**: Last 7 days kept automatically
- **Real-time access**: Files can be read while app is running
- **Location**: `.logs/` directory in repository root

## Troubleshooting

If no log files appear:

1. Check `.logs` directory exists
2. Verify Serilog packages are restored: `dotnet restore src/RenderX.Shell.Avalonia`
3. Check console output for any Serilog initialization errors
4. Verify file permissions on `.logs` directory

## Next Steps

After verifying logs work:
1. ✅ Log files contain all Musical Conductor telemetry
2. Use logs for debugging parity issues between desktop and web
3. Implement tests using log output for verification
4. Compare desktop logs with web console logs for complete parity validation
