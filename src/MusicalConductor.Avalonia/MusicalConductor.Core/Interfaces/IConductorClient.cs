namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Event subscription handle for unsubscribing.
/// </summary>
public interface IEventSubscription : IDisposable
{
    /// <summary>
    /// Unsubscribe from the event.
    /// </summary>
    void Unsubscribe();
}

/// <summary>
/// Client API for the MusicalConductor orchestration engine.
/// Provides a simplified interface for UI and application code.
/// </summary>
public interface IConductorClient
{
    /// <summary>
    /// Play a sequence from a plugin.
    /// </summary>
    /// <param name="pluginId">ID of the plugin that owns the sequence</param>
    /// <param name="sequenceId">ID of the sequence to play</param>
    /// <param name="context">Optional context data to pass to the sequence</param>
    /// <param name="priority">Execution priority (default: NORMAL)</param>
    /// <returns>Request ID for tracking the execution</returns>
    string Play(
        string pluginId,
        string sequenceId,
        object? context = null,
        SequencePriority priority = SequencePriority.NORMAL);

    /// <summary>
    /// Subscribe to a conductor event.
    /// </summary>
    /// <typeparam name="T">Type of event data</typeparam>
    /// <param name="eventName">Name of the event (e.g., "sequence:started", "beat:executed")</param>
    /// <param name="callback">Callback to invoke when event is emitted</param>
    /// <returns>Subscription handle for unsubscribing</returns>
    IEventSubscription Subscribe<T>(string eventName, Action<T> callback);

    /// <summary>
    /// Subscribe to a conductor event asynchronously.
    /// </summary>
    /// <typeparam name="T">Type of event data</typeparam>
    /// <param name="eventName">Name of the event</param>
    /// <param name="callback">Async callback to invoke when event is emitted</param>
    /// <returns>Subscription handle for unsubscribing</returns>
    IEventSubscription SubscribeAsync<T>(string eventName, Func<T, Task> callback);

    /// <summary>
    /// Get current conductor statistics.
    /// </summary>
    /// <returns>Statistics object</returns>
    ConductorStatistics GetStatistics();

    /// <summary>
    /// Get current conductor status.
    /// </summary>
    /// <returns>Status object</returns>
    object GetStatus();

    /// <summary>
    /// Get execution queue status.
    /// </summary>
    /// <returns>Queue status</returns>
    QueueStatus GetQueueStatus();

    /// <summary>
    /// Register a plugin with the conductor.
    /// </summary>
    /// <param name="plugin">Plugin to register</param>
    /// <returns>Async task</returns>
    Task RegisterPlugin(IPlugin plugin);

    /// <summary>
    /// Unregister a plugin from the conductor.
    /// </summary>
    /// <param name="pluginId">ID of the plugin to unregister</param>
    /// <returns>Async task</returns>
    Task UnregisterPlugin(string pluginId);

    /// <summary>
    /// Get a registered plugin.
    /// </summary>
    /// <param name="pluginId">ID of the plugin</param>
    /// <returns>Plugin or null if not found</returns>
    IPlugin? GetPlugin(string pluginId);

    /// <summary>
    /// Register a sequence with the conductor.
    /// </summary>
    /// <param name="sequence">Sequence to register</param>
    void RegisterSequence(ISequence sequence);

    /// <summary>
    /// Unregister a sequence from the conductor.
    /// </summary>
    /// <param name="sequenceId">ID of the sequence to unregister</param>
    void UnregisterSequence(string sequenceId);

    /// <summary>
    /// Get a registered sequence.
    /// </summary>
    /// <param name="sequenceId">ID of the sequence</param>
    /// <returns>Sequence or null if not found</returns>
    ISequence? GetSequence(string sequenceId);

    /// <summary>
    /// Get all registered sequences.
    /// </summary>
    /// <returns>Collection of sequences</returns>
    IEnumerable<ISequence> GetAllSequences();

    /// <summary>
    /// Get sequences by category.
    /// </summary>
    /// <param name="category">Category name</param>
    /// <returns>Collection of sequences in the category</returns>
    IEnumerable<ISequence> GetSequencesByCategory(string category);
}

