using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Events;

/// <summary>
/// Event handler delegate
/// </summary>
/// <typeparam name="T">Event payload type</typeparam>
/// <param name="payload">Event payload</param>
public delegate Task EventHandler<in T>(T payload);

/// <summary>
/// Unsubscribe delegate
/// </summary>
public delegate void Unsubscribe();

/// <summary>
/// Event router interface for pub/sub messaging with replay cache
/// </summary>
public interface IEventRouter
{
    /// <summary>
    /// Initialize the event router
    /// </summary>
    Task InitAsync();

    /// <summary>
    /// Publish an event to a topic
    /// </summary>
    /// <typeparam name="T">Event payload type</typeparam>
    /// <param name="topic">Topic name</param>
    /// <param name="payload">Event payload</param>
    /// <param name="conductor">Optional conductor for interaction routing</param>
    Task PublishAsync<T>(string topic, T payload, Conductor.IConductor? conductor = null);

    /// <summary>
    /// Subscribe to a topic with a typed handler
    /// </summary>
    /// <typeparam name="T">Expected payload type</typeparam>
    /// <param name="topic">Topic name</param>
    /// <param name="handler">Event handler</param>
    /// <returns>Unsubscribe delegate</returns>
    Unsubscribe Subscribe<T>(string topic, EventHandler<T> handler);

    /// <summary>
    /// Subscribe to a topic with an untyped handler
    /// </summary>
    /// <param name="topic">Topic name</param>
    /// <param name="handler">Event handler</param>
    /// <returns>Unsubscribe delegate</returns>
    Unsubscribe Subscribe(string topic, EventHandler<object> handler);

    /// <summary>
    /// Reset the event router (for testing)
    /// </summary>
    void Reset();

    /// <summary>
    /// Get statistics about the event router
    /// </summary>
    EventRouterStats GetStats();
}

/// <summary>
/// Event router statistics
/// </summary>
public record EventRouterStats
{
    public int SubscriberCount { get; init; }
    public int TopicCount { get; init; }
    public int ReplayCacheSize { get; init; }
    public long TotalEventsPublished { get; init; }
    public long TotalEventsDelivered { get; init; }
    public TimeSpan AverageDeliveryTime { get; init; }
}
