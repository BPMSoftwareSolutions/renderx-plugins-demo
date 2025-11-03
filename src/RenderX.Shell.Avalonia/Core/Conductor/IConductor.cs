using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Conductor;

/// <summary>
/// Priority levels for sequence execution
/// </summary>
public enum Priority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3
}

/// <summary>
/// Represents a sequence execution event
/// </summary>
public record SequenceEvent
{
    public string PluginId { get; init; } = string.Empty;
    public string SequenceId { get; init; } = string.Empty;
    public object? Data { get; init; }
    public Priority Priority { get; init; }
    public string CorrelationId { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public SequenceEventType EventType { get; init; }
    public string? Error { get; init; }
    public TimeSpan? Duration { get; init; }
}

/// <summary>
/// Types of sequence events
/// </summary>
public enum SequenceEventType
{
    Started,
    Completed,
    Failed,
    Cancelled
}

/// <summary>
/// Interface for sequence handlers
/// </summary>
public interface ISequenceHandler
{
    string SequenceId { get; }
    Task<object?> HandleAsync(object? data, ISequenceContext context);
}

/// <summary>
/// Context provided to sequence handlers during execution
/// </summary>
public interface ISequenceContext
{
    IConductor Conductor { get; }
    IServiceProvider Services { get; }
    string CorrelationId { get; }
    CancellationToken CancellationToken { get; }
    IDictionary<string, object> Properties { get; }
}

/// <summary>
/// Main conductor interface for orchestrating plugin sequences
/// </summary>
public interface IConductor
{
    /// <summary>
    /// Play a sequence asynchronously
    /// </summary>
    /// <typeparam name="TResult">Expected result type</typeparam>
    /// <param name="pluginId">Plugin identifier</param>
    /// <param name="sequenceId">Sequence identifier</param>
    /// <param name="data">Data to pass to the sequence</param>
    /// <param name="priority">Execution priority</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Sequence execution result</returns>
    Task<TResult?> PlayAsync<TResult>(
        string pluginId, 
        string sequenceId, 
        object? data = null, 
        Priority priority = Priority.Normal,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Play a sequence without expecting a specific result type
    /// </summary>
    Task<object?> PlayAsync(
        string pluginId, 
        string sequenceId, 
        object? data = null, 
        Priority priority = Priority.Normal,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Register a sequence handler for a plugin
    /// </summary>
    /// <param name="pluginId">Plugin identifier</param>
    /// <param name="handler">Sequence handler</param>
    void RegisterSequence(string pluginId, ISequenceHandler handler);

    /// <summary>
    /// Unregister all sequences for a plugin
    /// </summary>
    /// <param name="pluginId">Plugin identifier</param>
    void UnregisterPlugin(string pluginId);

    /// <summary>
    /// Get all registered plugin IDs
    /// </summary>
    IEnumerable<string> GetRegisteredPluginIds();

    /// <summary>
    /// Get all registered sequence IDs for a plugin
    /// </summary>
    IEnumerable<string> GetRegisteredSequenceIds(string pluginId);

    /// <summary>
    /// Observable stream of sequence events
    /// </summary>
    IObservable<SequenceEvent> SequenceEvents { get; }

    /// <summary>
    /// Initialize the conductor and register plugins
    /// </summary>
    Task InitializeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Shutdown the conductor gracefully
    /// </summary>
    Task ShutdownAsync(CancellationToken cancellationToken = default);
}
