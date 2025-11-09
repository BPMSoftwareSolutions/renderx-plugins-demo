# RenderX Log Files

This directory contains application log files with all Musical Conductor telemetry.

## Log File Location

Log files are created with the naming pattern:
```
renderx-YYYYMMDD-HHmmss.log
renderx-YYYYMMDD.log (rolling daily logs)
```

## Configuration

Logging is configured in:
- **Program.cs**: Sets up Serilog with file and console output
- **appsettings.json**: Configures log levels and formatting

## Log Format

Each log entry includes:
```
[YYYY-MM-DD HH:mm:ss.fff zzz] [LEVEL] SourceContext: Message
```

Example:
```
[2025-11-09 14:30:45.123 -05:00] [INF] RenderX.Plugins.ControlPanel.Handlers.ControlPanelHandlers: 🎨 CSS created successfully
[2025-11-09 14:30:45.456 -05:00] [INF] RenderX.HostSDK.Avalonia.Services.EventRouterService: ✅ Subscribed to topic: control.panel.css.created
```

## Log Levels

- **Information**: Standard operational messages (plugin registration, handler execution, event routing)
- **Debug**: Detailed diagnostic information
- **Warning**: Non-critical issues
- **Error**: Failures and exceptions

## Retention

- Rolling interval: Daily
- Retained files: Last 7 days
- Flush to disk: Every 1 second

## What's Logged

All Musical Conductor activity including:
- Plugin initialization and registration
- Sequence execution (all 49 sequences)
- Handler method calls with parameters
- Event bus topics and subscriptions
- CSS management operations
- Canvas component interactions
- Theme changes
- Library operations

## Accessing Logs

1. **During development**: Logs appear in console and file simultaneously
2. **After running**: Check this directory for timestamped log files
3. **For diagnostics**: Use the Diagnostic Sequence Player to parse and visualize log files

## Notes

- Logs are shared (can be read while application is running)
- Log files are **NOT** included in git (see `.gitignore`)
- Each application start creates a new timestamped log file
