namespace MusicalConductor.Avalonia.Interfaces;

/// <summary>
/// Client-facing interface for MusicalConductor orchestration engine.
/// Provides methods to play sequences, subscribe to events, and query status.
/// </summary>
public interface IConductorClient
{
    /// <summary>
    /// Play a sequence with the given context and priority.
    /// </summary>
    /// <param name="pluginId">The plugin ID that owns the sequence</param>
    /// <param name="sequenceId">The sequence ID to play</param>
    /// <param name="context">Optional context data to pass to handlers</param>
    /// <param name="priority">Optional priority level (default: NORMAL)</param>
    /// <returns>Request ID for tracking</returns>
    string Play(string pluginId, string sequenceId, object? context = null, string? priority = null);



    /// <summary>
    /// Alias for Subscribe (on/off naming convention).
    /// </summary>
    Action On(string eventName, Action<object?> callback, object? context = null);



    /// <summary>
    /// Get current conductor status including statistics and mounted plugins.
    /// </summary>
    /// <returns>Status object with statistics, event bus info, sequences, and plugins</returns>
    object? GetStatus();

    /// <summary>
    /// Get conductor statistics.
    /// </summary>
    /// <returns>Statistics object with execution counts and metrics</returns>
    object? GetStatistics();

    /// <summary>
    /// Register CIA-compliant plugins.
    /// </summary>
    /// <returns>Task that completes when plugins are registered</returns>
    Task RegisterCIAPlugins();
}

