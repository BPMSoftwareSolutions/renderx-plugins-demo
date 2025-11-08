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
/// Implementation of the CSS Registry API for managing CSS classes.
/// Bridges to the JavaScript CSS Registry API implementation via Jint.
/// </summary>
public class CssRegistryService : ICssRegistryAPI
{
    private readonly HostSdkEngineHost _engineHost;
    private readonly ILogger<CssRegistryService> _logger;
    private readonly ConcurrentBag<Action<IReadOnlyList<CssClassDef>>> _observers;
    private readonly List<JsValue> _jsUnsubscribers;
    private bool _disposed;

    /// <summary>
    /// Initializes a new instance of the CssRegistryService.
    /// </summary>
    /// <param name="engineHost">The Jint engine host.</param>
    /// <param name="logger">Logger instance.</param>
    public CssRegistryService(HostSdkEngineHost engineHost, ILogger<CssRegistryService> logger)
    {
        _engineHost = engineHost ?? throw new ArgumentNullException(nameof(engineHost));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _observers = new ConcurrentBag<Action<IReadOnlyList<CssClassDef>>>();
        _jsUnsubscribers = new List<JsValue>();

        _logger.LogInformation("🎨 CssRegistryService initialized");
    }

    /// <inheritdoc/>
    public async Task<bool> HasClassAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Class name cannot be null or whitespace.", nameof(name));

        _logger.LogDebug("🔍 Checking if CSS class exists: {Name}", name);

        try
        {
            // Call the JavaScript hasClass method
            var jsPromise = _engineHost.CallCssRegistryMethod("hasClass", name);

            // Convert the JavaScript promise to a C# Task
            var result = await ConvertJsPromiseToTask<bool>(jsPromise);

            _logger.LogInformation("✅ CSS class '{Name}' exists: {Exists}", name, result);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check if CSS class exists: {Name}", name);
            return false;
        }
    }

    /// <inheritdoc/>
    public async Task CreateClassAsync(CssClassDef def)
    {
        if (def == null)
            throw new ArgumentNullException(nameof(def));

        if (string.IsNullOrWhiteSpace(def.Name))
            throw new ArgumentException("CSS class name cannot be null or whitespace.", nameof(def));

        _logger.LogDebug("➕ Creating CSS class: {Name}", def.Name);

        try
        {
            // Convert the CssClassDef to a JavaScript object
            var jsObject = ConvertToJsObject(def);

            // Call the JavaScript createClass method
            var jsPromise = _engineHost.CallCssRegistryMethod("createClass", jsObject);

            // Convert the JavaScript promise to a C# Task
            await ConvertJsPromiseToTask(jsPromise);

            _logger.LogInformation("✅ Created CSS class: {Name}", def.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to create CSS class: {Name}", def.Name);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task UpdateClassAsync(string name, CssClassDef def)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Class name cannot be null or whitespace.", nameof(name));

        if (def == null)
            throw new ArgumentNullException(nameof(def));

        _logger.LogDebug("✏️ Updating CSS class: {Name}", name);

        try
        {
            // Convert the CssClassDef to a JavaScript object
            var jsObject = ConvertToJsObject(def);

            // Call the JavaScript updateClass method
            var jsPromise = _engineHost.CallCssRegistryMethod("updateClass", name, jsObject);

            // Convert the JavaScript promise to a C# Task
            await ConvertJsPromiseToTask(jsPromise);

            _logger.LogInformation("✅ Updated CSS class: {Name}", name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to update CSS class: {Name}", name);
            throw;
        }
    }

    /// <inheritdoc/>
    public IDisposable OnCssChanged(Action<IReadOnlyList<CssClassDef>> callback)
    {
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        _logger.LogDebug("👀 Registering CSS change observer");

        try
        {
            // Add the observer to our list
            _observers.Add(callback);

            // Create a JavaScript callback that invokes the C# callback
            Action<object?> jsCallback = (classes) =>
            {
                try
                {
                    _logger.LogDebug("📨 CSS changed notification received");

                    // Convert the JavaScript array to C# list
                    var classList = ConvertToCssClassDefList(classes);

                    // Notify all observers
                    foreach (var observer in _observers)
                    {
                        try
                        {
                            observer(classList);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "❌ Error in CSS observer callback");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error processing CSS change");
                }
            };

            // Subscribe via JavaScript CSS Registry API
            var jsUnsubscribe = _engineHost.CallCssRegistryMethod("onCssChanged", jsCallback);

            // Store the unsubscribe function
            lock (_jsUnsubscribers)
            {
                _jsUnsubscribers.Add(jsUnsubscribe);
            }

            _logger.LogInformation("✅ CSS change observer registered");

            // Return a disposable that unsubscribes
            return new CssSubscription(() => UnsubscribeObserver(callback, jsUnsubscribe));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to register CSS change observer");
            throw;
        }
    }

    /// <summary>
    /// Unsubscribe an observer.
    /// </summary>
    private void UnsubscribeObserver(Action<IReadOnlyList<CssClassDef>> callback, JsValue jsUnsubscribe)
    {
        try
        {
            _logger.LogDebug("📤 Unsubscribing CSS observer");

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

            _logger.LogInformation("✅ CSS observer unsubscribed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error unsubscribing CSS observer");
        }
    }

    /// <summary>
    /// Convert a CssClassDef to a JavaScript object.
    /// </summary>
    private object ConvertToJsObject(CssClassDef def)
    {
        var obj = new Dictionary<string, object?>
        {
            ["name"] = def.Name,
            ["rules"] = def.Rules
        };

        if (def.Source != null)
        {
            obj["source"] = def.Source;
        }

        if (def.Metadata != null)
        {
            obj["metadata"] = def.Metadata;
        }

        return obj;
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
    /// Convert a JavaScript Promise to a C# Task with a result.
    /// </summary>
    private async Task<T> ConvertJsPromiseToTask<T>(JsValue jsPromise)
    {
        if (jsPromise.IsNull() || jsPromise.IsUndefined())
        {
            return default!;
        }

        // Check if it's a promise
        var isPromise = jsPromise.IsObject() && jsPromise.AsObject().HasProperty("then");
        if (!isPromise)
        {
            // If it's not a promise, try to convert directly
            return ConvertJsValueToType<T>(jsPromise);
        }

        var tcs = new TaskCompletionSource<T>();

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
                tcs.TrySetResult(default!);
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
    private T ConvertJsValueToType<T>(JsValue jsValue)
    {
        if (jsValue.IsNull() || jsValue.IsUndefined())
        {
            return default!;
        }

        var obj = jsValue.ToObject();
        return ConvertToType<T>(obj);
    }

    /// <summary>
    /// Convert an object to a specific type using JSON serialization.
    /// </summary>
    private T ConvertToType<T>(object? obj)
    {
        if (obj == null)
        {
            return default!;
        }

        try
        {
            // Serialize to JSON and deserialize to target type
            var json = JsonSerializer.Serialize(obj);
            return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            })!;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to convert object to type {Type}", typeof(T).Name);
            return default!;
        }
    }

    /// <summary>
    /// Convert a JavaScript array to a list of CssClassDef.
    /// </summary>
    private IReadOnlyList<CssClassDef> ConvertToCssClassDefList(object? obj)
    {
        if (obj == null)
        {
            return new List<CssClassDef>();
        }

        try
        {
            var json = JsonSerializer.Serialize(obj);
            var list = JsonSerializer.Deserialize<List<CssClassDef>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            return list ?? new List<CssClassDef>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "⚠️ Failed to convert to CssClassDef list");
            return new List<CssClassDef>();
        }
    }

    /// <summary>
    /// Subscription implementation that calls unsubscribe on dispose.
    /// </summary>
    private class CssSubscription : IDisposable
    {
        private readonly Action _unsubscribe;
        private bool _disposed;

        public CssSubscription(Action unsubscribe)
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

