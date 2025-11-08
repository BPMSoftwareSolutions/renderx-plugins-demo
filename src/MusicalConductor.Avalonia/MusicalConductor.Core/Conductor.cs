using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;

namespace MusicalConductor.Core;

/// <summary>
/// Core orchestration engine.
/// </summary>
public class Conductor : IConductor
{
    private readonly IEventBus _eventBus;
    private readonly ISequenceRegistry _sequenceRegistry;
    private readonly IPluginManager _pluginManager;
    private readonly IExecutionQueue _executionQueue;
    private readonly SequenceExecutor _sequenceExecutor;
    private readonly ILogger<Conductor> _logger;
    private readonly ConductorStatistics _statistics = new();
    private readonly ReaderWriterLockSlim _lock = new();
    private int _activeSequences;

    public IEventBus EventBus => _eventBus;
    public ISequenceRegistry SequenceRegistry => _sequenceRegistry;

    public Conductor(
        IEventBus eventBus,
        ISequenceRegistry sequenceRegistry,
        IPluginManager pluginManager,
        IExecutionQueue executionQueue,
        SequenceExecutor sequenceExecutor,
        ILogger<Conductor> logger)
    {
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        _sequenceRegistry = sequenceRegistry ?? throw new ArgumentNullException(nameof(sequenceRegistry));
        _pluginManager = pluginManager ?? throw new ArgumentNullException(nameof(pluginManager));
        _executionQueue = executionQueue ?? throw new ArgumentNullException(nameof(executionQueue));
        _sequenceExecutor = sequenceExecutor ?? throw new ArgumentNullException(nameof(sequenceExecutor));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public string Play(string pluginId, string sequenceId, object? context = null, SequencePriority priority = SequencePriority.NORMAL)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));
        if (string.IsNullOrEmpty(sequenceId))
            throw new ArgumentNullException(nameof(sequenceId));

        var requestId = Guid.NewGuid().ToString();
        var sequence = _sequenceRegistry.Get(sequenceId);

        if (sequence == null)
        {
            _logger.LogError("Sequence not found: {SequenceId}", sequenceId);
            _statistics.FailedExecutions++;
            return requestId;
        }

        _lock.EnterWriteLock();
        try
        {
            _statistics.TotalExecutions++;
            _activeSequences++;
            _statistics.ActiveSequences = _activeSequences;
        }
        finally
        {
            _lock.ExitWriteLock();
        }

        // Create execution item and enqueue
        var executionItem = new ExecutionItem
        {
            Id = requestId,
            PluginId = pluginId,
            SequenceId = sequenceId,
            Context = context,
            Priority = priority
        };

        _executionQueue.Enqueue(executionItem);

        // Execute sequence asynchronously
        _ = ExecuteSequenceAsync(requestId, pluginId, sequence, context);

        return requestId;
    }

    public ConductorStatistics GetStatistics()
    {
        _lock.EnterReadLock();
        try
        {
            return new ConductorStatistics
            {
                TotalExecutions = _statistics.TotalExecutions,
                SuccessfulExecutions = _statistics.SuccessfulExecutions,
                FailedExecutions = _statistics.FailedExecutions,
                ActiveSequences = _statistics.ActiveSequences,
                TotalBeats = _statistics.TotalBeats,
                AverageExecutionTimeMs = _statistics.AverageExecutionTimeMs
            };
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public object? GetStatus()
    {
        var stats = GetStatistics();
        var plugins = _pluginManager.GetAll().Select(p => new
        {
            id = p.GetMetadata().Id,
            name = p.GetMetadata().Name,
            version = p.GetMetadata().Version
        });

        var sequences = _sequenceRegistry.GetAll().Select(s => new
        {
            id = s.Id,
            name = s.Name,
            category = s.Category
        });

        return new
        {
            statistics = stats,
            plugins = plugins.ToList(),
            sequences = sequences.ToList(),
            timestamp = DateTime.UtcNow
        };
    }

    private async Task ExecuteSequenceAsync(string requestId, string pluginId, ISequence sequence, object? context)
    {
        var startTime = DateTime.UtcNow;

        try
        {
            // Use SequenceExecutor to execute the sequence
            await _sequenceExecutor.ExecuteAsync(requestId, pluginId, sequence, context, this);

            _statistics.SuccessfulExecutions++;
            _statistics.TotalBeats += sequence.GetAllBeats().Count();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing sequence: {SequenceId}", sequence.Id);
            _statistics.FailedExecutions++;
        }
        finally
        {
            var processingTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

            // Record in execution queue
            var executionItem = new ExecutionItem
            {
                Id = requestId,
                PluginId = pluginId,
                SequenceId = sequence.Id,
                Context = context
            };

            if (_statistics.SuccessfulExecutions > 0)
            {
                _executionQueue.RecordSuccess(executionItem, processingTime);
            }
            else
            {
                _executionQueue.RecordFailure(executionItem, "Sequence execution failed");
            }

            _lock.EnterWriteLock();
            try
            {
                _activeSequences--;
                _statistics.ActiveSequences = _activeSequences;
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }
    }
}

