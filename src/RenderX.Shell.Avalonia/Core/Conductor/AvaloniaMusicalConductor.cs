using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Conductor;

/// <summary>
/// Avalonia implementation of the Musical Conductor
/// </summary>
public class AvaloniaMusicalConductor : IConductor
{
    private readonly ILogger<AvaloniaMusicalConductor> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, ISequenceHandler>> _sequences;
    private readonly Subject<SequenceEvent> _sequenceEvents;
    private readonly SemaphoreSlim _initializationSemaphore;
    private bool _isInitialized;

    public AvaloniaMusicalConductor(ILogger<AvaloniaMusicalConductor> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _sequences = new ConcurrentDictionary<string, ConcurrentDictionary<string, ISequenceHandler>>();
        _sequenceEvents = new Subject<SequenceEvent>();
        _initializationSemaphore = new SemaphoreSlim(1, 1);
    }

    public IObservable<SequenceEvent> SequenceEvents => _sequenceEvents;

    public async Task<TResult?> PlayAsync<TResult>(
        string pluginId, 
        string sequenceId, 
        object? data = null, 
        Priority priority = Priority.Normal, 
        CancellationToken cancellationToken = default)
    {
        var result = await PlayAsync(pluginId, sequenceId, data, priority, cancellationToken);
        return result is TResult typedResult ? typedResult : default;
    }

    public async Task<object?> PlayAsync(
        string pluginId, 
        string sequenceId, 
        object? data = null, 
        Priority priority = Priority.Normal, 
        CancellationToken cancellationToken = default)
    {
        var correlationId = Guid.NewGuid().ToString();
        var startTime = DateTime.UtcNow;

        try
        {
            _logger.LogDebug("Playing sequence {PluginId}.{SequenceId} with priority {Priority}", 
                pluginId, sequenceId, priority);

            // Emit started event
            _sequenceEvents.OnNext(new SequenceEvent
            {
                PluginId = pluginId,
                SequenceId = sequenceId,
                Data = data,
                Priority = priority,
                CorrelationId = correlationId,
                EventType = SequenceEventType.Started
            });

            // Find the handler
            if (!_sequences.TryGetValue(pluginId, out var pluginSequences) ||
                !pluginSequences.TryGetValue(sequenceId, out var handler))
            {
                throw new InvalidOperationException($"Sequence {pluginId}.{sequenceId} not found");
            }

            // Create context
            var context = new SequenceContext(_serviceProvider, this, correlationId, cancellationToken);

            // Execute the handler
            var result = await handler.HandleAsync(data, context);

            var duration = DateTime.UtcNow - startTime;

            // Emit completed event
            _sequenceEvents.OnNext(new SequenceEvent
            {
                PluginId = pluginId,
                SequenceId = sequenceId,
                Data = data,
                Priority = priority,
                CorrelationId = correlationId,
                EventType = SequenceEventType.Completed,
                Duration = duration
            });

            _logger.LogDebug("Completed sequence {PluginId}.{SequenceId} in {Duration}ms", 
                pluginId, sequenceId, duration.TotalMilliseconds);

            return result;
        }
        catch (OperationCanceledException)
        {
            _sequenceEvents.OnNext(new SequenceEvent
            {
                PluginId = pluginId,
                SequenceId = sequenceId,
                Data = data,
                Priority = priority,
                CorrelationId = correlationId,
                EventType = SequenceEventType.Cancelled,
                Duration = DateTime.UtcNow - startTime
            });
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute sequence {PluginId}.{SequenceId}", pluginId, sequenceId);

            _sequenceEvents.OnNext(new SequenceEvent
            {
                PluginId = pluginId,
                SequenceId = sequenceId,
                Data = data,
                Priority = priority,
                CorrelationId = correlationId,
                EventType = SequenceEventType.Failed,
                Error = ex.Message,
                Duration = DateTime.UtcNow - startTime
            });
            throw;
        }
    }

    public void RegisterSequence(string pluginId, ISequenceHandler handler)
    {
        var pluginSequences = _sequences.GetOrAdd(pluginId, _ => new ConcurrentDictionary<string, ISequenceHandler>());
        pluginSequences[handler.SequenceId] = handler;
        
        _logger.LogDebug("Registered sequence {PluginId}.{SequenceId}", pluginId, handler.SequenceId);
    }

    public void UnregisterPlugin(string pluginId)
    {
        if (_sequences.TryRemove(pluginId, out var pluginSequences))
        {
            _logger.LogDebug("Unregistered plugin {PluginId} with {Count} sequences", 
                pluginId, pluginSequences.Count);
        }
    }

    public IEnumerable<string> GetRegisteredPluginIds()
    {
        return _sequences.Keys.ToList();
    }

    public IEnumerable<string> GetRegisteredSequenceIds(string pluginId)
    {
        return _sequences.TryGetValue(pluginId, out var pluginSequences) 
            ? pluginSequences.Keys.ToList() 
            : Enumerable.Empty<string>();
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await _initializationSemaphore.WaitAsync(cancellationToken);
        try
        {
            if (_isInitialized)
                return;

            _logger.LogInformation("Initializing Musical Conductor...");

            // TODO: Load and register plugins from manifest
            // This will be implemented in task 1.4

            _isInitialized = true;
            _logger.LogInformation("Musical Conductor initialized successfully");
        }
        finally
        {
            _initializationSemaphore.Release();
        }
    }

    public async Task ShutdownAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Shutting down Musical Conductor...");
        
        _sequences.Clear();
        _sequenceEvents.OnCompleted();
        
        _logger.LogInformation("Musical Conductor shutdown complete");
    }
}

/// <summary>
/// Implementation of sequence context
/// </summary>
internal class SequenceContext : ISequenceContext
{
    public IConductor Conductor { get; }
    public IServiceProvider Services { get; }
    public string CorrelationId { get; }
    public CancellationToken CancellationToken { get; }
    public IDictionary<string, object> Properties { get; }

    public SequenceContext(IServiceProvider services, IConductor conductor, string correlationId, CancellationToken cancellationToken)
    {
        Services = services;
        Conductor = conductor;
        CorrelationId = correlationId;
        CancellationToken = cancellationToken;
        Properties = new Dictionary<string, object>();
    }
}
