namespace RenderX.HostSDK.Avalonia.Interfaces;

/// <summary>
/// Event router for topic-based pub/sub messaging.
/// Provides subscription, publishing, and reset capabilities.
/// </summary>
public interface IEventRouter
{
    /// <summary>
    /// Subscribe to a topic with a handler callback.
    /// </summary>
    /// <param name="topic">The topic name to subscribe to.</param>
    /// <param name="handler">The callback to invoke when the topic is published.</param>
    /// <returns>A disposable that unsubscribes when disposed.</returns>
    IDisposable Subscribe(string topic, Action<object?> handler);

    /// <summary>
    /// Publish a message to a topic asynchronously.
    /// </summary>
    /// <param name="topic">The topic name to publish to.</param>
    /// <param name="payload">The payload data to send.</param>
    /// <param name="conductor">Optional conductor client for routing.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task PublishAsync(string topic, object? payload, object? conductor = null);

    /// <summary>
    /// Reset the event router, clearing all subscriptions and state.
    /// </summary>
    void Reset();
}

