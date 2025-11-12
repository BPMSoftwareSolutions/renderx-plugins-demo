using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using Avalonia.Threading;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Centralized logging service that captures all conductor log messages from startup.
/// Provides a thread-safe, observable collection of log entries for UI display.
/// </summary>
public class ConductorLogService
{
    private static readonly Lazy<ConductorLogService> _instance = new(() => new ConductorLogService());
    public static ConductorLogService Instance => _instance.Value;

    private readonly ObservableCollection<LogEntry> _logs;
    private readonly object _lockObject = new();
    private const int MaxLogEntries = 1000;

    public ObservableCollection<LogEntry> Logs => _logs;

    private ConductorLogService()
    {
        _logs = new ObservableCollection<LogEntry>();
        
        // Capture Debug output from startup
        Debug.WriteLine($"[{DateTime.Now:HH:mm:ss.fff}] ConductorLogService initialized");
    }

    /// <summary>
    /// Logs an informational message.
    /// </summary>
    public void LogInfo(string message, string? source = null)
    {
        AddLog(LogLevel.Info, message, source);
    }

    /// <summary>
    /// Logs a warning message.
    /// </summary>
    public void LogWarning(string message, string? source = null)
    {
        AddLog(LogLevel.Warning, message, source);
    }

    /// <summary>
    /// Logs an error message.
    /// </summary>
    public void LogError(string message, string? source = null)
    {
        AddLog(LogLevel.Error, message, source);
    }

    /// <summary>
    /// Logs a debug message.
    /// </summary>
    public void LogDebug(string message, string? source = null)
    {
        AddLog(LogLevel.Debug, message, source);
    }

    /// <summary>
    /// Logs an exception.
    /// </summary>
    public void LogException(Exception ex, string? source = null)
    {
        var message = $"{ex.GetType().Name}: {ex.Message}";
        if (ex.InnerException != null)
        {
            message += $" -> {ex.InnerException.Message}";
        }
        AddLog(LogLevel.Error, message, source ?? "Exception");
    }

    /// <summary>
    /// Core logging method. Public to allow Serilog sink to write to it.
    /// </summary>
    public void AddLog(LogLevel level, string message, string? source)
    {
        lock (_lockObject)
        {
            var entry = new LogEntry
            {
                Timestamp = DateTime.Now,
                Level = level,
                Message = message,
                Source = source ?? "App"
            };

            // Add to UI collection
            Dispatcher.UIThread.Post(() =>
            {
                _logs.Insert(0, entry);

                // Keep collection size manageable
                while (_logs.Count > MaxLogEntries)
                {
                    _logs.RemoveAt(_logs.Count - 1);
                }
            });

            // Also write to debug output
            Debug.WriteLine($"[{entry.Timestamp:HH:mm:ss.fff}] [{level}] {source}: {message}");
        }
    }

    /// <summary>
    /// Clears all log entries.
    /// </summary>
    public void Clear()
    {
        lock (_lockObject)
        {
            Dispatcher.UIThread.Post(() => _logs.Clear());
        }
    }
}

/// <summary>
/// Represents a single log entry.
/// </summary>
public class LogEntry
{
    public DateTime Timestamp { get; set; }
    public LogLevel Level { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;

    public override string ToString()
    {
        return $"[{Timestamp:HH:mm:ss.fff}] [{Level}] {Source}: {Message}";
    }
}

/// <summary>
/// Log level enumeration.
/// </summary>
public enum LogLevel
{
    Debug,
    Info,
    Warning,
    Error
}

