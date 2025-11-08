namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Event callback delegate.
/// </summary>
public delegate void EventCallback<T>(T data);

/// <summary>
/// Represents a subscription that can be disposed to unsubscribe.
/// </summary>
public interface ISubscription : IDisposable
{
    /// <summary>
    /// Gets the event name this subscription is for.
    /// </summary>
    string EventName { get; }

    /// <summary>
    /// Gets the callback function.
    /// </summary>
    Delegate Callback { get; }
}

/// <summary>
/// Thread-safe event bus for pub/sub communication.
/// </summary>
public interface IEventBus
{
    /// <summary>
    /// Subscribe to an event.
    /// </summary>
    /// <typeparam name=\"T\">Type of event data</typeparam>
    /// <param name=\"eventName\">Name of the event</param>
    /// <param name=\"callback\">Callback to invoke when event is emitted</param>
    /// <returns>Subscription that can be disposed to unsubscribe</returns>
    ISubscription Subscribe<T>(string eventName, EventCallback<T> callback);

    /// <summary>
    /// Unsubscribe from an event.
    /// </summary>
    /// <typeparam name=\"T\">Type of event data</typeparam>
    /// <param name=\"eventName\">Name of the event</param>
    /// <param name=\"callback\">Callback to remove</param>
    void Unsubscribe<T>(string eventName, EventCallback<T> callback);

    /// <summary>
    /// Emit an event synchronously.
    /// </summary>
    /// <typeparam name=\"T\">Type of event data</typeparam>
    /// <param name=\"eventName\">Name of the event</param>
    /// <param name=\"data\">Event data</param>
    Task Emit<T>(string eventName, T data);

    /// <summary>
    /// Emit an event asynchronously.
    /// </summary>
    /// <typeparam name=\"T\">Type of event data</typeparam>
    /// <param name=\"eventName\">Name of the event</param>
    /// <param name=\"data\">Event data</param>
    Task EmitAsync<T>(string eventName, T data);

    /// <summary>
    /// Get the number of subscribers for an event.
    /// </summary>
    /// <param name=\"eventName\">Name of the event</param>
    /// <returns>Number of subscribers</returns>
    int GetSubscriberCount(string eventName);

    /// <summary>
    /// Get all event names with subscribers.
    /// </summary>
    /// <returns>Collection of event names</returns>
    IEnumerable<string> GetSubscribedEvents();
}

