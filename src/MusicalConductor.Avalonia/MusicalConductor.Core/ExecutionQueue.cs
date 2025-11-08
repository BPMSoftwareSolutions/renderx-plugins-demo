using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core;

/// <summary>
/// Priority-based execution queue implementation.
/// </summary>
public class ExecutionQueue : IExecutionQueue
{
    private readonly PriorityQueue<ExecutionItem, int> _queue = new();
    private readonly ReaderWriterLockSlim _lock = new();
    private readonly ILogger<ExecutionQueue> _logger;
    private long _totalProcessed;
    private long _totalFailed;
    private double _totalProcessingTimeMs;
    private int _activeCount;

    public ExecutionQueue(ILogger<ExecutionQueue> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public void Enqueue(ExecutionItem item)
    {
        if (item == null)
            throw new ArgumentNullException(nameof(item));

        _lock.EnterWriteLock();
        try
        {
            // Convert priority to queue priority (higher enum value = higher priority)
            int queuePriority = (int)item.Priority;
            _queue.Enqueue(item, -queuePriority); // Negate for max-heap behavior
            _logger.LogDebug("Enqueued execution item: {ItemId} with priority {Priority}", item.Id, item.Priority);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public ExecutionItem? Dequeue()
    {
        _lock.EnterWriteLock();
        try
        {
            if (_queue.TryDequeue(out var item, out _))
            {
                item.StartedAt = DateTime.UtcNow;
                _activeCount++;
                _logger.LogDebug("Dequeued execution item: {ItemId}", item.Id);
                return item;
            }

            return null;
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public QueueStatus GetStatus()
    {
        _lock.EnterReadLock();
        try
        {
            var averageTime = _totalProcessed > 0 ? _totalProcessingTimeMs / _totalProcessed : 0;

            return new QueueStatus
            {
                QueueDepth = _queue.Count,
                ActiveCount = _activeCount,
                TotalProcessed = _totalProcessed,
                TotalFailed = _totalFailed,
                AverageProcessingTimeMs = averageTime,
                IsProcessing = _activeCount > 0 || _queue.Count > 0
            };
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public int GetQueueDepth()
    {
        _lock.EnterReadLock();
        try
        {
            return _queue.Count;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public void Clear()
    {
        _lock.EnterWriteLock();
        try
        {
            while (_queue.TryDequeue(out _, out _))
            {
                // Clear all items
            }

            _logger.LogInformation("Execution queue cleared");
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public void RecordSuccess(ExecutionItem item, double processingTimeMs)
    {
        if (item == null)
            throw new ArgumentNullException(nameof(item));

        _lock.EnterWriteLock();
        try
        {
            item.CompletedAt = DateTime.UtcNow;
            _totalProcessed++;
            _totalProcessingTimeMs += processingTimeMs;
            _activeCount = Math.Max(0, _activeCount - 1);

            _logger.LogDebug(
                "Recorded success for item {ItemId}: {ProcessingTimeMs}ms",
                item.Id,
                processingTimeMs);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    public void RecordFailure(ExecutionItem item, string error)
    {
        if (item == null)
            throw new ArgumentNullException(nameof(item));

        _lock.EnterWriteLock();
        try
        {
            item.CompletedAt = DateTime.UtcNow;
            _totalFailed++;
            _activeCount = Math.Max(0, _activeCount - 1);

            _logger.LogWarning(
                "Recorded failure for item {ItemId}: {Error}",
                item.Id,
                error);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }
}

