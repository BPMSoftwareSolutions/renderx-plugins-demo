using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core.Conductor;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Events;

/// <summary>
/// Avalonia implementation of the Event Router
/// </summary>
public class AvaloniaEventRouter : IEventRouter
{
    private readonly ILogger<AvaloniaEventRouter> _logger;
    private readonly ConcurrentDictionary<string, List<EventHandler<object>>> _subscribers;
    private readonly ConcurrentDictionary<string, object> _replayCache;
    private readonly HashSet<string> _replayTopics;
    private long _totalEventsPublished;
    private long _totalEventsDelivered;

    public AvaloniaEventRouter(ILogger<AvaloniaEventRouter> logger)
    {
        _logger = logger;
        _subscribers = new ConcurrentDictionary<string, List<EventHandler<object>>>();
        _replayCache = new ConcurrentDictionary<string, object>();
        _replayTopics = new HashSet<string>();
    }

    public async Task InitAsync()
    {
        _logger.LogInformation("Initializing Event Router...");
        
        // TODO: Load topics manifest and configure replay topics
        // This will be implemented in task 1.5
        
        // For now, configure some default replay topics
        _replayTopics.Add("canvas.component.selection.changed");
        _replayTopics.Add("control.panel.selection.updated");
        
        _logger.LogInformation("Event Router initialized successfully");
    }

    public async Task PublishAsync<T>(string topic, T payload, IConductor? conductor = null)
    {
        _logger.LogDebug("Publishing event to topic {Topic}", topic);

        try
        {
            Interlocked.Increment(ref _totalEventsPublished);

            // Store in replay cache if needed
            if (_replayTopics.Contains(topic))
            {
                _replayCache[topic] = payload!;
            }

            // TODO: Handle throttling/debouncing based on topic definition
            // This will be implemented when manifest loading is complete

            // TODO: Route to conductor if interaction mapping exists
            // This will be implemented when interaction manifest is loaded

            // Publish to direct subscribers
            await PublishToSubscribersAsync(topic, payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event to topic {Topic}", topic);
            throw;
        }
    }

    public Unsubscribe Subscribe<T>(string topic, EventHandler<T> handler)
    {
        return Subscribe(topic, async (object payload) =>
        {
            if (payload is T typedPayload)
            {
                await handler(typedPayload);
            }
            else
            {
                _logger.LogWarning("Type mismatch for topic {Topic}. Expected {ExpectedType}, got {ActualType}",
                    topic, typeof(T).Name, payload?.GetType().Name ?? "null");
            }
        });
    }

    public Unsubscribe Subscribe(string topic, EventHandler<object> handler)
    {
        var subscribers = _subscribers.GetOrAdd(topic, _ => new List<EventHandler<object>>());
        
        lock (subscribers)
        {
            subscribers.Add(handler);
        }

        _logger.LogDebug("Subscribed to topic {Topic}. Total subscribers: {Count}", topic, subscribers.Count);

        // Replay cached event if available
        if (_replayTopics.Contains(topic) && _replayCache.TryGetValue(topic, out var cachedPayload))
        {
            Task.Run(async () =>
            {
                try
                {
                    await handler(cachedPayload);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in replay handler for topic {Topic}", topic);
                }
            });
        }

        // Return unsubscribe delegate
        return () =>
        {
            lock (subscribers)
            {
                subscribers.Remove(handler);
            }
            _logger.LogDebug("Unsubscribed from topic {Topic}. Remaining subscribers: {Count}", topic, subscribers.Count);
        };
    }

    public void Reset()
    {
        _logger.LogInformation("Resetting Event Router...");
        
        _subscribers.Clear();
        _replayCache.Clear();
        _totalEventsPublished = 0;
        _totalEventsDelivered = 0;
        
        _logger.LogInformation("Event Router reset complete");
    }

    public EventRouterStats GetStats()
    {
        var subscriberCount = _subscribers.Values.Sum(list => list.Count);
        var topicCount = _subscribers.Count;
        var replayCacheSize = _replayCache.Count;

        return new EventRouterStats
        {
            SubscriberCount = subscriberCount,
            TopicCount = topicCount,
            ReplayCacheSize = replayCacheSize,
            TotalEventsPublished = _totalEventsPublished,
            TotalEventsDelivered = _totalEventsDelivered,
            AverageDeliveryTime = TimeSpan.Zero // TODO: Implement timing
        };
    }

    private async Task PublishToSubscribersAsync<T>(string topic, T payload)
    {
        if (!_subscribers.TryGetValue(topic, out var subscribers))
            return;

        List<EventHandler<object>> subscribersCopy;
        lock (subscribers)
        {
            subscribersCopy = new List<EventHandler<object>>(subscribers);
        }

        var deliveryTasks = subscribersCopy.Select(async handler =>
        {
            try
            {
                await handler(payload!);
                Interlocked.Increment(ref _totalEventsDelivered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in event handler for topic {Topic}", topic);
            }
        });

        await Task.WhenAll(deliveryTasks);
    }
}
