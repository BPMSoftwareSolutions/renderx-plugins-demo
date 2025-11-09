using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Interfaces;
using MusicalConductor.Avalonia.Interfaces;
using System;

namespace RenderX.HostSDK.Avalonia.Logging;

/// <summary>
/// Conductor-aware logger that routes plugin logs through the Musical Conductor event bus.
/// Mirrors the web version's ctx.logger behavior where logs are emitted as "musical-conductor:log" events
/// and captured by ConductorLogger with emoji icons (🧩 for plugin logs).
/// </summary>
public class ConductorAwareLogger : ILogger
{
    private readonly ILogger _innerLogger;
    private readonly IEventRouter _eventRouter;
    private readonly IConductorClient _conductor;
    private readonly string _pluginId;
    private readonly string? _handlerName;

    /// <summary>
    /// Create a conductor-aware logger for a plugin
    /// </summary>
    /// <param name="innerLogger">Underlying ILogger for fallback</param>
    /// <param name="eventRouter">Event router for emitting log events</param>
    /// <param name="conductor">Conductor client for context</param>
    /// <param name="pluginId">Plugin identifier (e.g., "canvas-component")</param>
    /// <param name="handlerName">Optional handler name (e.g., "create")</param>
    public ConductorAwareLogger(
        ILogger innerLogger,
        IEventRouter eventRouter,
        IConductorClient conductor,
        string pluginId,
        string? handlerName = null)
    {
        _innerLogger = innerLogger ?? throw new ArgumentNullException(nameof(innerLogger));
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _pluginId = pluginId ?? throw new ArgumentNullException(nameof(pluginId));
        _handlerName = handlerName;
    }

    /// <summary>
    /// Log a message through the Musical Conductor event bus
    /// </summary>
    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var message = formatter(state, exception);
        if (string.IsNullOrEmpty(message) && exception == null)
        {
            return;
        }

        // Emit log event through Musical Conductor event bus
        // This will be captured by ConductorLogger and formatted with emoji icons
        try
        {
            var level = logLevel switch
            {
                LogLevel.Trace => "log",
                LogLevel.Debug => "log",
                LogLevel.Information => "info",
                LogLevel.Warning => "warn",
                LogLevel.Error => "error",
                LogLevel.Critical => "error",
                _ => "log"
            };

            var logEvent = new
            {
                level = level,
                message = new[] { message },
                requestId = (string?)null, // Will be populated by conductor context if available
                pluginId = _pluginId,
                handlerName = _handlerName
            };

            // Emit through event router (async fire-and-forget)
            _ = _eventRouter.PublishAsync("musical-conductor:log", logEvent, _conductor);
        }
        catch
        {
            // Fallback to inner logger if event emission fails
            _innerLogger.Log(logLevel, eventId, state, exception, formatter);
        }
    }

    /// <summary>
    /// Check if logging is enabled for the given log level
    /// </summary>
    public bool IsEnabled(LogLevel logLevel)
    {
        return _innerLogger.IsEnabled(logLevel);
    }

    /// <summary>
    /// Begin a logical operation scope (delegates to inner logger)
    /// </summary>
    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return _innerLogger.BeginScope(state);
    }
}

/// <summary>
/// Factory for creating ConductorAwareLogger instances
/// </summary>
public class ConductorAwareLoggerFactory
{
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventRouter _eventRouter;
    private readonly IConductorClient _conductor;

    public ConductorAwareLoggerFactory(
        ILoggerFactory loggerFactory,
        IEventRouter eventRouter,
        IConductorClient conductor)
    {
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventRouter = eventRouter ?? throw new ArgumentNullException(nameof(eventRouter));
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
    }

    /// <summary>
    /// Create a conductor-aware logger for a plugin
    /// </summary>
    /// <typeparam name="T">Plugin type (used for inner logger category)</typeparam>
    /// <param name="pluginId">Plugin identifier</param>
    /// <param name="handlerName">Optional handler name</param>
    /// <returns>Conductor-aware logger instance</returns>
    public ILogger<T> CreateLogger<T>(string pluginId, string? handlerName = null)
    {
        var innerLogger = _loggerFactory.CreateLogger<T>();
        return new ConductorAwareLoggerWrapper<T>(innerLogger, _eventRouter, _conductor, pluginId, handlerName);
    }
}

/// <summary>
/// Generic wrapper for ConductorAwareLogger to support ILogger&lt;T&gt;
/// </summary>
public class ConductorAwareLoggerWrapper<T> : ILogger<T>
{
    private readonly ConductorAwareLogger _logger;

    public ConductorAwareLoggerWrapper(
        ILogger innerLogger,
        IEventRouter eventRouter,
        IConductorClient conductor,
        string pluginId,
        string? handlerName = null)
    {
        _logger = new ConductorAwareLogger(innerLogger, eventRouter, conductor, pluginId, handlerName);
    }

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        _logger.Log(logLevel, eventId, state, exception, formatter);
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return _logger.IsEnabled(logLevel);
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return _logger.BeginScope(state);
    }
}

