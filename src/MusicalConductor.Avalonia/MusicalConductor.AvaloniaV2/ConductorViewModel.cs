using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.AvaloniaV2;

public abstract class ConductorViewModel : INotifyPropertyChanged
{
    protected readonly IConductorClient _conductorClient;
    protected readonly IAvaloniaEventDispatcher _eventDispatcher;
    private readonly List<IEventSubscription> _subscriptions = new();

    public event PropertyChangedEventHandler? PropertyChanged;

    protected ConductorViewModel(IConductorClient conductorClient, IAvaloniaEventDispatcher eventDispatcher)
    {
        _conductorClient = conductorClient ?? throw new ArgumentNullException(nameof(conductorClient));
        _eventDispatcher = eventDispatcher ?? throw new ArgumentNullException(nameof(eventDispatcher));
    }

    protected IEventSubscription SubscribeToEvent<T>(string eventName, Action<T> callback)
    {
        if (string.IsNullOrEmpty(eventName)) throw new ArgumentNullException(nameof(eventName));
        if (callback == null) throw new ArgumentNullException(nameof(callback));

        var subscription = _conductorClient.Subscribe<T>(eventName, data => _eventDispatcher.Dispatch(() => callback(data)));
        _subscriptions.Add(subscription);
        return subscription;
    }

    protected void UnsubscribeAll()
    {
        foreach (var subscription in _subscriptions) subscription?.Dispose();
        _subscriptions.Clear();
    }

    protected void OnPropertyChanged(string propertyName) => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

    protected string PlaySequence(string pluginId, string sequenceId, object? context = null, SequencePriority priority = SequencePriority.NORMAL)
        => _conductorClient.Play(pluginId, sequenceId, context, priority);

    protected ConductorStatistics GetStatistics() => _conductorClient.GetStatistics();
    protected QueueStatus GetQueueStatus() => _conductorClient.GetQueueStatus();

    public virtual void Cleanup() => UnsubscribeAll();
}

public interface INotifyPropertyChanged
{
    event PropertyChangedEventHandler? PropertyChanged;
}

public delegate void PropertyChangedEventHandler(object? sender, PropertyChangedEventArgs e);

public class PropertyChangedEventArgs : EventArgs
{
    public string PropertyName { get; }
    public PropertyChangedEventArgs(string propertyName) => PropertyName = propertyName;
}

