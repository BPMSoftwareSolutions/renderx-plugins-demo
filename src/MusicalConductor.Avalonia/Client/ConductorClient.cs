using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;

namespace MusicalConductor.Avalonia.Client;

/// <summary>
/// Client wrapper around the native .NET Conductor.
/// Implements IConductorClient to provide a .NET-friendly API.
/// </summary>
public class ConductorClient : Interfaces.IConductorClient
{
    private readonly IConductor _conductor;
    private readonly ILogger<ConductorClient> _logger;
    private readonly Dictionary<string, List<Action<object?>>> _subscriptions;

    public ConductorClient(IConductor conductor, ILogger<ConductorClient> logger)
    {
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _subscriptions = new Dictionary<string, List<Action<object?>>>();

        _logger.LogInformation("🎼 ConductorClient initialized (native .NET mode)");
    }

    public string Play(string pluginId, string sequenceId, object? context = null, string? priority = null)
    {
        try
        {
            _logger.LogInformation("▶️ Playing sequence: {PluginId}/{SequenceId}", pluginId, sequenceId);

            // Parse priority string to enum
            var sequencePriority = SequencePriority.NORMAL;
            if (!string.IsNullOrEmpty(priority))
            {
                if (Enum.TryParse<SequencePriority>(priority, true, out var parsed))
                {
                    sequencePriority = parsed;
                }
            }

            // Call native .NET Conductor directly
            var requestId = _conductor.Play(pluginId, sequenceId, context, sequencePriority);

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

            var status = _conductor.GetStatus();
            return status;
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

            var statistics = _conductor.GetStatistics();
            return statistics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to get conductor statistics");
            throw;
        }
    }

    public async Task RegisterCIAPlugins()
    {
        // Native .NET conductor doesn't need CIA plugin registration
        // Plugins are registered directly via PluginManager
        _logger.LogInformation("🔌 CIA plugin registration not needed in native .NET mode");
        await Task.CompletedTask;
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

