using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core;

/// <summary>
/// Thread-safe event bus implementation.
/// </summary>
public class EventBus : IEventBus
{
    private readonly Dictionary<string, List<Delegate>> _subscribers = new();
    private readonly ReaderWriterLockSlim _lock = new();
    private readonly ILogger<EventBus> _logger;

    public EventBus(ILogger<EventBus> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public ISubscription Subscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        _lock.EnterWriteLock();
        try
        {
            if (!_subscribers.ContainsKey(eventName))
            {
                _subscribers[eventName] = new List<Delegate>();
            }

            _subscribers[eventName].Add(callback);
            _logger.LogDebug("Subscribed to event: {EventName}", eventName);

            return new Subscription(this, eventName, callback);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public void Unsubscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        _lock.EnterWriteLock();
        try
        {
            if (_subscribers.ContainsKey(eventName))
            {
                _subscribers[eventName].Remove(callback);
                _logger.LogDebug("Unsubscribed from event: {EventName}", eventName);

                if (_subscribers[eventName].Count == 0)
                {
                    _subscribers.Remove(eventName);
                }
            }
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    // Non-generic unsubscribe to support disposal when T is not known
    public void Unsubscribe(string eventName, Delegate callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        _lock.EnterWriteLock();
        try
        {
            if (_subscribers.ContainsKey(eventName))
            {
                _subscribers[eventName].Remove(callback);
                _logger.LogDebug("Unsubscribed from event: {EventName}", eventName);

                if (_subscribers[eventName].Count == 0)
                {
                    _subscribers.Remove(eventName);
                }
            }
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public async Task Emit<T>(string eventName, T data)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));

        List<Delegate>? callbacks = null;

        _lock.EnterReadLock();
        try
        {
            if (_subscribers.ContainsKey(eventName))
            {
                callbacks = new List<Delegate>(_subscribers[eventName]);
            }
        }
        finally
        {
            _lock.ExitReadLock();
        }

        if (callbacks != null)
        {
            foreach (var callback in callbacks)
            {
                try
                {
                    if (callback is EventCallback<T> typedCallback)
                    {
                        typedCallback(data);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in event callback for {EventName}", eventName);
                }
            }
        }

        await Task.CompletedTask;
    }

    public async Task EmitAsync<T>(string eventName, T data)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));

        List<Delegate>? callbacks = null;

        _lock.EnterReadLock();
        try
        {
            if (_subscribers.ContainsKey(eventName))
            {
                callbacks = new List<Delegate>(_subscribers[eventName]);
            }
        }
        finally
        {
            _lock.ExitReadLock();
        }

        if (callbacks != null)
        {
            var tasks = new List<Task>();

            foreach (var callback in callbacks)
            {
                try
                {
                    if (callback is EventCallback<T> typedCallback)
                    {
                        typedCallback(data);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in event callback for {EventName}", eventName);
                }
            }

            await Task.WhenAll(tasks);
        }
    }

    public int GetSubscriberCount(string eventName)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));

        _lock.EnterReadLock();
        try
        {
            return _subscribers.ContainsKey(eventName) ? _subscribers[eventName].Count : 0;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public IEnumerable<string> GetSubscribedEvents()
    {
        _lock.EnterReadLock();
        try
        {
            return _subscribers.Keys.ToList();
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    private class Subscription : ISubscription
    {
        private readonly EventBus _eventBus;
        private readonly string _eventName;
        private readonly Delegate _callback;
        private bool _disposed;

        public string EventName => _eventName;
        public Delegate Callback => _callback;

        public Subscription(EventBus eventBus, string eventName, Delegate callback)
        {
            _eventBus = eventBus;
            _eventName = eventName;
            _callback = callback;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _eventBus.Unsubscribe(_eventName, _callback);
                _disposed = true;
            }
        }
    }
}

