using Jint.Native;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Engine;
using MusicalConductor.Avalonia.Interfaces;

namespace MusicalConductor.Avalonia.Client;

/// <summary>
/// Client wrapper around the Jint-hosted MusicalConductor engine.
/// Implements IConductorClient to provide a .NET-friendly API.
/// </summary>
public class ConductorClient : IConductorClient
{
    private readonly JintEngineHost _engine;
    private readonly ILogger<ConductorClient> _logger;
    private readonly Dictionary<string, List<Action<object?>>> _subscriptions;

    public ConductorClient(JintEngineHost engine, ILogger<ConductorClient> logger)
    {
        _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _subscriptions = new Dictionary<string, List<Action<object?>>>();

        _logger.LogInformation("🎼 ConductorClient initialized");
    }

    public string Play(string pluginId, string sequenceId, object? context = null, string? priority = null)
    {
        try
        {
            _logger.LogInformation("▶️ Playing sequence: {PluginId}/{SequenceId}", pluginId, sequenceId);

            var args = new List<JsValue>
            {
                _engine.FromObject(pluginId),
                _engine.FromObject(sequenceId)
            };

            if (context != null)
            {
                args.Add(_engine.FromObject(context));
            }

            if (!string.IsNullOrEmpty(priority))
            {
                args.Add(_engine.FromObject(priority));
            }

            var result = _engine.CallMethod("play", args.ToArray());
            var requestId = result.ToString();

            _logger.LogInformation("✅ Sequence started with request ID: {RequestId}", requestId);
            return requestId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to play sequence {SequenceId}", sequenceId);
            throw;
        }
    }

    public Action Unsubscribe(string eventName, Action<object?> callback)
    {
        return () => Off(eventName, callback);
    }

    public void Off(string eventName, Action<object?> callback)
    {
        try
        {
            _logger.LogInformation("🔕 Unsubscribing from event: {EventName}", eventName);

            if (_subscriptions.TryGetValue(eventName, out var callbacks))
            {
                callbacks.Remove(callback);
                if (callbacks.Count == 0)
                {
                    _subscriptions.Remove(eventName);
                }
            }

            _logger.LogInformation("✅ Unsubscribed from event: {EventName}", eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to unsubscribe from event {EventName}", eventName);
            throw;
        }
    }

    public Action On(string eventName, Action<object?> callback, object? context = null)
    {
        return Subscribe(eventName, callback, context);
    }



    public object? GetStatus()
    {
        try
        {
            _logger.LogInformation("📊 Getting conductor status");

            var result = _engine.CallMethod("getStatus");
            return result.ToObject();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get conductor status");
            throw;
        }
    }

    public object? GetStatistics()
    {
        try
        {
            _logger.LogInformation("📈 Getting conductor statistics");

            var result = _engine.CallMethod("getStatistics");
            return result.ToObject();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get conductor statistics");
            throw;
        }
    }

    public async Task RegisterCIAPlugins()
    {
        try
        {
            _logger.LogInformation("🔌 Registering CIA-compliant plugins");

            var _ = _engine.CallMethod("registerCIAPlugins");
            _logger.LogInformation("✅ CIA plugins registered");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to register CIA plugins");
            throw;
        }
    }

    private Action Subscribe(string eventName, Action<object?> callback, object? context = null)
    {
        try
        {
            _logger.LogInformation("🔔 Subscribing to event: {EventName}", eventName);

            if (!_subscriptions.ContainsKey(eventName))
            {
                _subscriptions[eventName] = new List<Action<object?>>();
            }

            _subscriptions[eventName].Add(callback);

            _logger.LogInformation("✅ Subscribed to event: {EventName}", eventName);

            return () => Off(eventName, callback);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to subscribe to event {EventName}", eventName);
            throw;
        }
    }
}

