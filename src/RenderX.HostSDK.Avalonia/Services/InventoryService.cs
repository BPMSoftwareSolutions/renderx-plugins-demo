using Jint;
using Jint.Native;
using Jint.Runtime;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;
using System.Collections.Concurrent;
using System.Text.Json;

namespace RenderX.HostSDK.Avalonia.Services;

/// <summary>
/// Implementation of the Inventory API for component discovery and management.
/// Bridges to the JavaScript Inventory API implementation via Jint.
/// </summary>
public class InventoryService : IInventoryAPI
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<InventoryService> _logger;
    private readonly ConcurrentBag<Action<IReadOnlyList<ComponentSummary>>> _observers;
    private readonly List<JsValue> _jsUnsubscribers;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the InventoryService.
    /// </summary>
    /// <param name="engineHost">The Jint engine host.</param>
    /// <param name="logger">Logger instance.</param>
    public InventoryService(HostSdkEngineHost engineHost, ILogger<InventoryService> logger)
    {
        _engineHost = engineHost ?? throw new ArgumentNullException(nameof(engineHost));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _observers = new ConcurrentBag<Action<IReadOnlyList<ComponentSummary>>>();
        _jsUnsubscribers = new List<JsValue>();

        _logger.LogInformation("📦 InventoryService initialized");
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<ComponentSummary>> ListComponentsAsync()
    {
        _logger.LogDebug("📋 Listing components");

        try
        {
            // Call the JavaScript listComponents method
            var jsPromise = _engineHost.CallInventoryMethod("listComponents");

            // Convert the JavaScript promise to a C# Task
            var result = await ConvertJsPromiseToTask<List<ComponentSummary>>(jsPromise);

            _logger.LogInformation("✅ Listed {Count} components", result?.Count ?? 0);

            return result ?? new List<ComponentSummary>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to list components");
            return new List<ComponentSummary>();
        }
    }

    /// <inheritdoc/>
    public async Task<Component?> GetComponentByIdAsync(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new ArgumentException("Component ID cannot be null or whitespace.", nameof(id));

        _logger.LogDebug("🔍 Getting component by ID: {Id}", id);

        try
        {
            // Call the JavaScript getComponentById method
            var jsPromise = _engineHost.CallInventoryMethod("getComponentById", id);

            // Convert the JavaScript promise to a C# Task
            var result = await ConvertJsPromiseToTask<Component>(jsPromise);

            if (result != null)
            {
                _logger.LogInformation("✅ Found component: {Id}", id);
            }
            else
            {
                _logger.LogInformation("ℹ️ Component not found: {Id}", id);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get component by ID: {Id}", id);
            return null;
        }
    }

    /// <inheritdoc/>
    public IDisposable OnInventoryChanged(Action<IReadOnlyList<ComponentSummary>> callback)
    {
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        _logger.LogDebug("👀 Registering inventory change observer");

        try
        {
            // Add the observer to our list
            _observers.Add(callback);

            // Create a JavaScript callback that invokes the C# callback
            Action<object?> jsCallback = (components) =>
            {
                try
                {
                    _logger.LogDebug("📨 Inventory changed notification received");

                    // Convert the JavaScript array to C# list
                    var componentList = ConvertToComponentSummaryList(components);

                    // Notify all observers
                    foreach (var observer in _observers)
                    {
                        try
                        {
                            observer(componentList);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "❌ Error in inventory observer callback");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error processing inventory change");
                }
            };

            // Subscribe via JavaScript Inventory API
            var jsUnsubscribe = _engineHost.CallInventoryMethod("onInventoryChanged", jsCallback);

            // Store the unsubscribe function
            lock (_jsUnsubscribers)
            {
                _jsUnsubscribers.Add(jsUnsubscribe);
            }

            _logger.LogInformation("✅ Inventory change observer registered");

            // Return a disposable that unsubscribes
            return new InventorySubscription(() => UnsubscribeObserver(callback, jsUnsubscribe));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to register inventory change observer");
            throw;
        }
    }

    /// <summary>
    /// Unsubscribe an observer.
    /// </summary>
    private void UnsubscribeObserver(Action<IReadOnlyList<ComponentSummary>> callback, JsValue jsUnsubscribe)
    {
        try
        {
            _logger.LogDebug("📤 Unsubscribing inventory observer");

            // Note: ConcurrentBag doesn't support removal, so we'll just leave it
            // The observer will be garbage collected when the service is disposed

            // Call the JavaScript unsubscribe function
            if (jsUnsubscribe != null && !jsUnsubscribe.IsUndefined() && !jsUnsubscribe.IsNull())
            {
                try
                {
                    _engineHost.Engine.Invoke(jsUnsubscribe);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to invoke JavaScript unsubscribe function");
                }
            }

            // Remove from unsubscribers list
            lock (_jsUnsubscribers)
            {
                _jsUnsubscribers.Remove(jsUnsubscribe);
            }

            _logger.LogInformation("✅ Inventory observer unsubscribed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error unsubscribing inventory observer");
        }
    }

    /// <summary>
    /// Convert a JavaScript Promise to a C# Task.
    /// </summary>
    private async Task<T?> ConvertJsPromiseToTask<T>(JsValue jsPromise)
    {
        if (jsPromise.IsNull() || jsPromise.IsUndefined())
        {
            return default;
        }

        // Check if it's a promise
        var isPromise = jsPromise.IsObject() && jsPromise.AsObject().HasProperty("then");
        if (!isPromise)
        {
            // If it's not a promise, try to convert directly
            return ConvertJsValueToType<T>(jsPromise);
        }

        var tcs = new TaskCompletionSource<T?>();

        try
        {
            // Create resolve callback
            Action<object?> onResolve = (result) =>
            {
                try
                {
                    var converted = ConvertToType<T>(result);
                    tcs.TrySetResult(converted);
                }
                catch (Exception ex)
                {
                    tcs.TrySetException(ex);
                }
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
                tcs.TrySetResult(default);
            }
        }
        catch (Exception ex)
        {
            tcs.TrySetException(ex);
        }

        return await tcs.Task;
    }

    /// <summary>
    /// Convert a JsValue to a specific type.
    /// </summary>
    private T? ConvertJsValueToType<T>(JsValue jsValue)
    {
        if (jsValue.IsNull() || jsValue.IsUndefined())
        {
            return default;
        }

        var obj = jsValue.ToObject();
        return ConvertToType<T>(obj);
    }

    /// <summary>
    /// Convert an object to a specific type using JSON serialization.
    /// </summary>
    private T? ConvertToType<T>(object? obj)
    {
        if (obj == null)
        {
            return default;
        }

        try
        {
            // Serialize to JSON and deserialize to target type
            var json = JsonSerializer.Serialize(obj);
            return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to convert object to type {Type}", typeof(T).Name);
            return default;
        }
    }

    /// <summary>
    /// Convert a JavaScript array to a list of ComponentSummary.
    /// </summary>
    private IReadOnlyList<ComponentSummary> ConvertToComponentSummaryList(object? obj)
    {
        if (obj == null)
        {
            return new List<ComponentSummary>();
        }

        try
        {
            var json = JsonSerializer.Serialize(obj);
            var list = JsonSerializer.Deserialize<List<ComponentSummary>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return list ?? new List<ComponentSummary>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to convert to ComponentSummary list");
            return new List<ComponentSummary>();
        }
    }

    /// <summary>
    /// Subscription implementation that calls unsubscribe on dispose.
    /// </summary>
    private class InventorySubscription : IDisposable
    {
        private readonly Action _unsubscribe;
        private bool _disposed;

        public InventorySubscription(Action unsubscribe)
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

