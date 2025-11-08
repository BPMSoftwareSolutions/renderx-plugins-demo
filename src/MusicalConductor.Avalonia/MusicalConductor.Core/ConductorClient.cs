using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core;

/// <summary>
/// Event subscription implementation.
/// </summary>
internal class EventSubscription<T> : IEventSubscription
{
    private readonly IEventBus _eventBus;
    private readonly string _eventName;
    private readonly EventCallback<T> _callback;
    private bool _disposed;

    public EventSubscription(
        IEventBus eventBus,
        string eventName,
        EventCallback<T> callback)
    {
        _eventBus = eventBus;
        _eventName = eventName;
        _callback = callback;
    }

    public void Unsubscribe()
    {
        if (_disposed)
            return;

        _eventBus.Unsubscribe(_eventName, _callback);
        _disposed = true;
    }

    public void Dispose()
    {
        Unsubscribe();
        GC.SuppressFinalize(this);
    }
}

/// <summary>
/// Client API for the MusicalConductor orchestration engine.
/// </summary>
public class ConductorClient : IConductorClient
{
    private readonly IConductor _conductor;
    private readonly IPluginManager _pluginManager;
    private readonly ISequenceRegistry _sequenceRegistry;
    private readonly IEventBus _eventBus;
    private readonly IExecutionQueue _executionQueue;
    private readonly ILogger<ConductorClient> _logger;

    public ConductorClient(
        IConductor conductor,
        IPluginManager pluginManager,
        ISequenceRegistry sequenceRegistry,
        IEventBus eventBus,
        IExecutionQueue executionQueue,
        ILogger<ConductorClient> logger)
    {
        _conductor = conductor ?? throw new ArgumentNullException(nameof(conductor));
        _pluginManager = pluginManager ?? throw new ArgumentNullException(nameof(pluginManager));
        _sequenceRegistry = sequenceRegistry ?? throw new ArgumentNullException(nameof(sequenceRegistry));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        _executionQueue = executionQueue ?? throw new ArgumentNullException(nameof(executionQueue));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public string Play(
        string pluginId,
        string sequenceId,
        object? context = null,
        SequencePriority priority = SequencePriority.NORMAL)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        _logger.LogInformation("Playing sequence: {SequenceId} from plugin: {PluginId}", sequenceId, pluginId);
        return _conductor.Play(pluginId, sequenceId, context, priority);
    }

    public IEventSubscription Subscribe<T>(string eventName, Action<T> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        EventCallback<T> eventCallback = (EventCallback<T>)(object)callback;
        _eventBus.Subscribe(eventName, eventCallback);
        return new EventSubscription<T>(_eventBus, eventName, eventCallback);
    }

    public IEventSubscription SubscribeAsync<T>(string eventName, Func<T, Task> callback)
    {
        if (string.IsNullOrEmpty(eventName))
            throw new ArgumentNullException(nameof(eventName));
        if (callback == null)
            throw new ArgumentNullException(nameof(callback));

        // Wrap async callback in sync callback
        EventCallback<T> eventCallback = data => callback(data).GetAwaiter().GetResult();
        _eventBus.Subscribe(eventName, eventCallback);
        return new EventSubscription<T>(_eventBus, eventName, eventCallback);
    }

    public ConductorStatistics GetStatistics()
    {
        return _conductor.GetStatistics();
    }

    public object GetStatus()
    {
        return _conductor.GetStatus();
    }

    public QueueStatus GetQueueStatus()
    {
        return _executionQueue.GetStatus();
    }

    public async Task RegisterPlugin(IPlugin plugin)
    {
        if (plugin == null)
            throw new ArgumentNullException(nameof(plugin));

        _logger.LogInformation("Registering plugin: {PluginId}", plugin.GetMetadata().Id);
        await _pluginManager.Register(plugin);
    }

    public async Task UnregisterPlugin(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        _logger.LogInformation("Unregistering plugin: {PluginId}", pluginId);
        await _pluginManager.Unregister(pluginId);
    }

    public IPlugin? GetPlugin(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        return _pluginManager.Get(pluginId);
    }

    public void RegisterSequence(ISequence sequence)
    {
        if (sequence == null)
            throw new ArgumentNullException(nameof(sequence));

        _logger.LogInformation("Registering sequence: {SequenceId}", sequence.Id);
        _sequenceRegistry.Register(sequence);
    }

    public void UnregisterSequence(string sequenceId)
    {
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        _logger.LogInformation("Unregistering sequence: {SequenceId}", sequenceId);
        _sequenceRegistry.Unregister(sequenceId);
    }

    public ISequence? GetSequence(string sequenceId)
    {
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        return _sequenceRegistry.Get(sequenceId);
    }

    public IEnumerable<ISequence> GetAllSequences()
    {
        return _sequenceRegistry.GetAll();
    }

    public IEnumerable<ISequence> GetSequencesByCategory(string category)
    {
        if (string.IsNullOrEmpty(category))
            throw new ArgumentNullException(nameof(category));

        return _sequenceRegistry.GetByCategory(category);
    }
}

