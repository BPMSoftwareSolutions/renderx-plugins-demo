using System;
using Serilog.Core;
using Serilog.Events;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Serilog sink that writes log events to the ConductorLogService for UI display.
/// </summary>
public class ActivityLogSink : ILogEventSink
{
    public void Emit(LogEvent logEvent)
    {
        if (logEvent == null) return;

        var level = logEvent.Level switch
        {
            LogEventLevel.Verbose => LogLevel.Debug,
            LogEventLevel.Debug => LogLevel.Debug,
            LogEventLevel.Information => LogLevel.Info,
            LogEventLevel.Warning => LogLevel.Warning,
            LogEventLevel.Error => LogLevel.Error,
            LogEventLevel.Fatal => LogLevel.Error,
            _ => LogLevel.Info
        };

        var message = logEvent.RenderMessage();
        var source = logEvent.Properties.TryGetValue("SourceContext", out var sourceContext)
            ? sourceContext.ToString().Trim('"')
            : "System";

        // Extract just the class name from the full namespace
        if (source.Contains('.'))
        {
            var parts = source.Split('.');
            source = parts[^1]; // Last part
        }

        ConductorLogService.Instance.AddLog(level, message, source);
    }
}

