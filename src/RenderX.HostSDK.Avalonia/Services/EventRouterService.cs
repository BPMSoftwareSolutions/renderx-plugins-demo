using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using System.Collections.Concurrent;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Implementation of the EventRouter for topic-based pub/sub messaging.
/// Bridges to the JavaScript EventRouter implementation via Jint.
/// </summary>
public class EventRouterService : IEventRouter
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<EventRouterService> _logger;
    private readonly ConcurrentDictionary<string, List<Action<object?>>> _subscribers;
    private readonly ConcurrentDictionary<string, List<JsValue>> _jsUnsubscribers;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the EventRouterService.
    /// </summary>
    /// <param name="engineHost">The Jint engine host.</param>
    /// <param name="logger">Logger instance.</param>
    public EventRouterService(HostSdkEngineHost engineHost, ILogger<EventRouterService> logger)
    {
        _engineHost = engineHost ?? throw new ArgumentNullException(nameof(engineHost));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _subscribers = new ConcurrentDictionary<string, List<Action<object?>>>();
        _jsUnsubscribers = new ConcurrentDictionary<string, List<JsValue>>();

        _logger.LogInformation("🎯 EventRouterService initialized");
    }

    /// <inheritdoc/>
    public IDisposable Subscribe(string topic, Action<object?> handler)
    {
        if (string.IsNullOrWhiteSpace(topic))
            throw new ArgumentException("Topic cannot be null or whitespace.", nameof(topic));

        if (handler == null)
            throw new ArgumentNullException(nameof(handler));

        _logger.LogDebug("📥 Subscribing to topic: {Topic}", topic);

        try
        {
            // Store the C# handler
            var handlerList = _subscribers.GetOrAdd(topic, _ => new List<Action<object?>>());
            lock (handlerList)
            {
                handlerList.Add(handler);
            }

            // Create a JavaScript callback that invokes the C# handler
            Action<object?> jsCallback = (payload) =>
            {
                try
                {
                    _logger.LogDebug("📨 Received event on topic: {Topic}", topic);
                    handler(payload);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error in event handler for topic: {Topic}", topic);
                }
            };

            // Subscribe via JavaScript EventRouter
            var jsUnsubscribe = _engineHost.CallEventRouterMethod("subscribe", topic, jsCallback);

            // Store the unsubscribe function
            var unsubList = _jsUnsubscribers.GetOrAdd(topic, _ => new List<JsValue>());
            lock (unsubList)
            {
                unsubList.Add(jsUnsubscribe);
            }

            _logger.LogInformation("✅ Subscribed to topic: {Topic}", topic);

            // Return a disposable that unsubscribes
            return new Subscription(() => Unsubscribe(topic, handler, jsUnsubscribe));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to subscribe to topic: {Topic}", topic);
            throw;
        }
    }

    /// <summary>
    /// Unsubscribe a handler from a topic.
    /// </summary>
    private void Unsubscribe(string topic, Action<object?> handler, JsValue jsUnsubscribe)
    {
        try
        {
            _logger.LogDebug("📤 Unsubscribing from topic: {Topic}", topic);

            // Remove the C# handler
            if (_subscribers.TryGetValue(topic, out var handlerList))
            {
                lock (handlerList)
                {
                    handlerList.Remove(handler);
                    if (handlerList.Count == 0)
                    {
                        _subscribers.TryRemove(topic, out _);
                    }
                }
            }

            // Call the JavaScript unsubscribe function
            if (jsUnsubscribe != null && !jsUnsubscribe.IsUndefined() && !jsUnsubscribe.IsNull())
            {
                try
                {
                    _engineHost.Engine.Invoke(jsUnsubscribe);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to invoke JavaScript unsubscribe function for topic {Topic}", topic);
                }
            }

            // Remove from unsubscribers list
            if (_jsUnsubscribers.TryGetValue(topic, out var unsubList))
            {
                lock (unsubList)
                {
                    unsubList.Remove(jsUnsubscribe);
                    if (unsubList.Count == 0)
                    {
                        _jsUnsubscribers.TryRemove(topic, out _);
                    }
                }
            }

            _logger.LogInformation("✅ Unsubscribed from topic: {Topic}", topic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error unsubscribing from topic: {Topic}", topic);
        }
    }

    /// <inheritdoc/>
    public async Task PublishAsync(string topic, object? payload, object? conductor = null)
    {
        if (string.IsNullOrWhiteSpace(topic))
            throw new ArgumentException("Topic cannot be null or whitespace.", nameof(topic));

        _logger.LogDebug("📤 Publishing to topic: {Topic}", topic);

        try
        {
            // Call the JavaScript publish method
            var jsPromise = _engineHost.CallEventRouterMethod("publish", topic, payload, conductor);

            // Convert the JavaScript promise to a C# Task
            await ConvertJsPromiseToTask(jsPromise);

            _logger.LogInformation("✅ Published to topic: {Topic}", topic);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to publish to topic: {Topic}", topic);
            throw;
        }
    }

    /// <inheritdoc/>
    public void Reset()
    {
        _logger.LogInformation("🔄 Resetting EventRouter");

        try
        {
            // Unsubscribe all JavaScript subscriptions
            foreach (var kvp in _jsUnsubscribers)
            {
                foreach (var jsUnsubscribe in kvp.Value)
                {
                    try
                    {
                        if (jsUnsubscribe != null && !jsUnsubscribe.IsUndefined() && !jsUnsubscribe.IsNull())
                        {
                            _engineHost.Engine.Invoke(jsUnsubscribe);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "⚠️ Error calling unsubscribe for topic: {Topic}", kvp.Key);
                    }
                }
            }

            // Clear all subscriptions
            _subscribers.Clear();
            _jsUnsubscribers.Clear();

            _logger.LogInformation("✅ EventRouter reset complete");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error resetting EventRouter");
            throw;
        }
    }

    /// <summary>
    /// Convert a JavaScript Promise to a C# Task.
    /// </summary>
    private async Task ConvertJsPromiseToTask(JsValue jsPromise)
    {
        if (jsPromise.IsNull() || jsPromise.IsUndefined())
        {
            return;
        }

        // Check if it's a promise
        var isPromise = jsPromise.IsObject() && jsPromise.AsObject().HasProperty("then");
        if (!isPromise)
        {
            return;
        }

        var tcs = new TaskCompletionSource<object?>();

        try
        {
            // Create resolve callback
            Action<object?> onResolve = (result) =>
            {
                tcs.TrySetResult(result);
            };

            // Create reject callback
            Action<object?> onReject = (error) =>
            {
                var errorMessage = error?.ToString() ?? "Unknown error";
                tcs.TrySetException(new InvalidOperationException(errorMessage));
            };

            // Call promise.then(onResolve, onReject)
            var thenMethod = jsPromise.AsObject().Get("then");
            if (!thenMethod.IsUndefined() && !thenMethod.IsNull())
            {
                try
                {
                    _engineHost.Engine.Invoke(thenMethod, jsPromise, new object[] { onResolve, onReject });
                }
                catch (Exception ex)
                {
                    tcs.TrySetException(ex);
                }
            }
            else
            {
                tcs.TrySetResult(null);
            }
        }
        catch (Exception ex)
        {
            tcs.TrySetException(ex);
        }

        await tcs.Task;
    }

    /// <summary>
    /// Subscription implementation that calls unsubscribe on dispose.
    /// </summary>
    private class Subscription : IDisposable
    {
        private readonly Action _unsubscribe;
        private bool _disposed;

        public Subscription(Action unsubscribe)
        {
            _unsubscribe = unsubscribe ?? throw new ArgumentNullException(nameof(unsubscribe));
        }

        public void Dispose()
        {
            if (_disposed) return;
            _unsubscribe();
            _disposed = true;
        }
    }
}

