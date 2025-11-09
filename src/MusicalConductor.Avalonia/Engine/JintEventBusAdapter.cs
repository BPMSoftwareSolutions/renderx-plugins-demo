using Jint;
using Jint.Native;
using Jint.Native.Function;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using System.Collections.Generic;
using System.Dynamic;

namespace MusicalConductor.Avalonia.Engine;

/// <summary>
/// Adapter that bridges the Jint JavaScript EventBus to the .NET IEventBus interface.
/// This allows .NET code (like ConductorLogger) to subscribe to events emitted by the JavaScript conductor.
/// </summary>
public class JintEventBusAdapter : IEventBus
{
    private readonly Jint.Engine _engine;
    private readonly JsValue _eventBusJs;
    private readonly ILogger<JintEventBusAdapter> _logger;
    private readonly Dictionary<string, List<SubscriptionInfo>> _subscriptions = new();
    private readonly object _lock = new();

    public JintEventBusAdapter(Jint.Engine engine, JsValue eventBusJs, ILogger<JintEventBusAdapter> logger)
    {
        _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        _eventBusJs = eventBusJs ?? throw new ArgumentNullException(nameof(eventBusJs));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        if (_eventBusJs.IsNull() || _eventBusJs.IsUndefined())
        {
            throw new ArgumentException("EventBus JavaScript object is null or undefined", nameof(eventBusJs));
        }
    }

    public ISubscription Subscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        lock (_lock)
        {
            // Create a JavaScript callback that will invoke the .NET callback
            var jsCallback = new Action<object>((data) =>
            {
                try
                {
                    // Convert JavaScript data to .NET dynamic object
                    var dynamicData = ConvertJsValueToDynamic(data);
                    
                    // Invoke the .NET callback with the dynamic data
                    // Since we're using dynamic, we can pass it as T
                    callback((T)(object)dynamicData);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in .NET callback for event {EventName}", eventName);
                }
            });

            // Subscribe to the JavaScript EventBus
            var subscribeMethod = _eventBusJs.AsObject().Get("subscribe");
            if (subscribeMethod.IsNull() || subscribeMethod.IsUndefined())
            {
                throw new InvalidOperationException("EventBus.subscribe method not found");
            }

            // Call eventBus.subscribe(eventName, callback)
            var jsCallbackValue = JsValue.FromObject(_engine, jsCallback);
            _engine.Invoke(subscribeMethod, _eventBusJs, new[] { JsValue.FromObject(_engine, eventName), jsCallbackValue });

            // Store subscription info for tracking
            if (!_subscriptions.ContainsKey(eventName))
            {
                _subscriptions[eventName] = new List<SubscriptionInfo>();
            }

            var subscriptionInfo = new SubscriptionInfo
            {
                EventName = eventName,
                Callback = callback,
                JsCallback = jsCallback
            };

            _subscriptions[eventName].Add(subscriptionInfo);

            _logger.LogDebug("Subscribed to JavaScript event: {EventName}", eventName);

            return new JintSubscription(this, eventName, callback);
        }
    }

    public void Unsubscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        lock (_lock)
        {
            if (_subscriptions.TryGetValue(eventName, out var subs))
            {
                var sub = subs.FirstOrDefault(s => s.Callback.Equals(callback));
                if (sub != null)
                {
                    // Unsubscribe from JavaScript EventBus
                    try
                    {
                        var unsubscribeMethod = _eventBusJs.AsObject().Get("unsubscribe");
                        if (!unsubscribeMethod.IsNull() && !unsubscribeMethod.IsUndefined())
                        {
                            var jsCallbackValue = JsValue.FromObject(_engine, sub.JsCallback);
                            _engine.Invoke(unsubscribeMethod, _eventBusJs, new[] { JsValue.FromObject(_engine, eventName), jsCallbackValue });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error unsubscribing from JavaScript event {EventName}", eventName);
                    }

                    subs.Remove(sub);
                    _logger.LogDebug("Unsubscribed from JavaScript event: {EventName}", eventName);

                    if (subs.Count == 0)
                    {
                        _subscriptions.Remove(eventName);
                    }
                }
            }
        }
    }

    public Task Emit<T>(string eventName, T data)
    {
        try
        {
            // Get the emit method from the JavaScript EventBus
            var emitMethod = _eventBusJs.AsObject().Get("emit");
            if (emitMethod.IsNull() || emitMethod.IsUndefined())
            {
                _logger.LogWarning("EventBus.emit method not found");
                return Task.CompletedTask;
            }

            // Convert .NET data to JavaScript object
            var jsData = ConvertDynamicToJsValue(data);

            // Call eventBus.emit(eventName, data)
            _engine.Invoke(emitMethod, _eventBusJs, new[] { JsValue.FromObject(_engine, eventName), jsData });

            _logger.LogDebug("Emitted event from .NET to JavaScript: {EventName}", eventName);
            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error emitting event to JavaScript EventBus: {EventName}", eventName);
            return Task.CompletedTask;
        }
    }

    public Task EmitAsync<T>(string eventName, T data)
    {
        // For now, just call Emit synchronously
        // In the future, this could be enhanced to handle async operations
        return Emit(eventName, data);
    }

    public int GetSubscriberCount(string eventName)
    {
        lock (_lock)
        {
            return _subscriptions.TryGetValue(eventName, out var subs) ? subs.Count : 0;
        }
    }

    public IEnumerable<string> GetSubscribedEvents()
    {
        lock (_lock)
        {
            return _subscriptions.Keys.ToList();
        }
    }

    /// <summary>
    /// Convert a JavaScript value to a .NET dynamic object
    /// </summary>
    private dynamic ConvertJsValueToDynamic(object jsData)
    {
        if (jsData == null)
        {
            return new ExpandoObject();
        }

        // If it's already a JsValue, convert it
        if (jsData is JsValue jsValue)
        {
            return ConvertJsValueToDynamicInternal(jsValue);
        }

        // If it's a primitive .NET type, return as-is
        if (jsData is string || jsData is int || jsData is double || jsData is bool)
        {
            var expando = new ExpandoObject() as IDictionary<string, object>;
            expando["value"] = jsData;
            return expando;
        }

        // Try to convert using reflection
        try
        {
            var expando = new ExpandoObject() as IDictionary<string, object>;
            var properties = jsData.GetType().GetProperties();
            foreach (var prop in properties)
            {
                var value = prop.GetValue(jsData);
                expando[prop.Name] = value;
            }
            return expando;
        }
        catch
        {
            return new ExpandoObject();
        }
    }

    private dynamic ConvertJsValueToDynamicInternal(JsValue jsValue)
    {
        if (jsValue.IsNull() || jsValue.IsUndefined())
        {
            return new ExpandoObject();
        }

        if (jsValue.IsString())
        {
            return jsValue.AsString();
        }

        if (jsValue.IsNumber())
        {
            return jsValue.AsNumber();
        }

        if (jsValue.IsBoolean())
        {
            return jsValue.AsBoolean();
        }

        if (jsValue.IsArray())
        {
            var array = jsValue.AsArray();
            var list = new List<object>();
            for (uint i = 0; i < array.Length; i++)
            {
                list.Add(ConvertJsValueToDynamicInternal(array.Get(i.ToString())));
            }
            return list.ToArray();
        }

        if (jsValue.IsObject())
        {
            var obj = jsValue.AsObject();
            var expando = new ExpandoObject() as IDictionary<string, object>;

            var properties = obj.GetOwnProperties();
            foreach (var prop in properties)
            {
                var key = prop.Key.ToString();
                var value = prop.Value.Value;
                
                if (value != null && !value.IsUndefined() && !value.IsNull())
                {
                    expando[key] = ConvertJsValueToDynamicInternal(value);
                }
            }

            return expando;
        }

        return new ExpandoObject();
    }

    private class SubscriptionInfo
    {
        public string EventName { get; set; } = string.Empty;
        public Delegate Callback { get; set; } = null!;
        public Action<object> JsCallback { get; set; } = null!;
    }

    /// <summary>
    /// Convert a .NET dynamic object to a JavaScript value
    /// </summary>
    private JsValue ConvertDynamicToJsValue<T>(T data)
    {
        if (data == null)
        {
            return JsValue.Null;
        }

        // Handle primitive types
        if (data is string str)
        {
            return JsValue.FromObject(_engine, str);
        }

        if (data is int intVal)
        {
            return JsValue.FromObject(_engine, intVal);
        }

        if (data is double doubleVal)
        {
            return JsValue.FromObject(_engine, doubleVal);
        }

        if (data is bool boolVal)
        {
            return JsValue.FromObject(_engine, boolVal);
        }

        // Handle arrays
        if (data is System.Collections.IEnumerable enumerable && !(data is string))
        {
            var jsArray = _engine.Intrinsics.Array.Construct(System.Array.Empty<JsValue>());
            int index = 0;
            foreach (var item in enumerable)
            {
                var jsItem = ConvertDynamicToJsValue(item);
                jsArray.AsObject().Set(index.ToString(), jsItem);
                index++;
            }
            return jsArray;
        }

        // Handle objects (including ExpandoObject and anonymous types)
        try
        {
            var jsObject = _engine.Intrinsics.Object.Construct(System.Array.Empty<JsValue>());
            var objAsDict = data as IDictionary<string, object>;

            if (objAsDict != null)
            {
                // Handle ExpandoObject and IDictionary
                foreach (var kvp in objAsDict)
                {
                    var jsValue = ConvertDynamicToJsValue(kvp.Value);
                    jsObject.AsObject().Set(kvp.Key, jsValue);
                }
            }
            else
            {
                // Handle regular objects via reflection
                var properties = data.GetType().GetProperties();
                foreach (var prop in properties)
                {
                    try
                    {
                        var value = prop.GetValue(data);
                        var jsValue = ConvertDynamicToJsValue(value);
                        jsObject.AsObject().Set(prop.Name, jsValue);
                    }
                    catch
                    {
                        // Skip properties that can't be read
                    }
                }
            }

            return jsObject;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to convert object to JavaScript value, using null");
            return JsValue.Null;
        }
    }

    private class JintSubscription : ISubscription
    {
        private readonly JintEventBusAdapter _adapter;
        private readonly string _eventName;
        private readonly Delegate _callback;
        private bool _disposed;

        public string EventName => _eventName;
        public Delegate Callback => _callback;

        public JintSubscription(JintEventBusAdapter adapter, string eventName, Delegate callback)
        {
            _adapter = adapter;
            _eventName = eventName;
            _callback = callback;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                // Use reflection to call the generic Unsubscribe method
                var unsubscribeMethod = typeof(JintEventBusAdapter).GetMethod("Unsubscribe");
                if (unsubscribeMethod != null)
                {
                    var genericMethod = unsubscribeMethod.MakeGenericMethod(typeof(object));
                    genericMethod.Invoke(_adapter, new object[] { _eventName, _callback });
                }
                _disposed = true;
            }
        }
    }
}

