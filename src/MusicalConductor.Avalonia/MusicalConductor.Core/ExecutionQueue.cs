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
        _logger.LogInformation("🎼 ExecutionQueue: Initialized");
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
            _logger.LogInformation("🎼 ExecutionQueue: Enqueued \"{SequenceId}\" with priority {Priority} (Queue size: {QueueSize})",
                item.SequenceId, item.Priority, _queue.Count);

            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("🎼 ExecutionQueue: Enqueue details - ItemId: {ItemId}, SequenceId: {SequenceId}, Priority: {Priority}, QueueSize: {QueueSize}, TotalQueued: {TotalQueued}", item.Id, item.SequenceId, item.Priority, _queue.Count, _totalProcessed + _activeCount);
            }
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
                _logger.LogInformation("🎼 ExecutionQueue: Dequeued \"{SequenceId}\"", item.SequenceId);

                if (_logger.IsEnabled(LogLevel.Debug))
                {
                    _logger.LogDebug("🎼 ExecutionQueue: Dequeue details - ItemId: {ItemId}, SequenceId: {SequenceId}, RemainingQueueSize: {RemainingQueueSize}, ActiveCount: {ActiveCount}", item.Id, item.SequenceId, _queue.Count, _activeCount);
                }

                return item;
            }

            if (_logger.IsEnabled(LogLevel.Debug))
            {
                _logger.LogDebug("🎼 ExecutionQueue: Dequeue attempted but queue is empty");
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

            var status = new QueueStatus
            {
                QueueDepth = _queue.Count,
                ActiveCount = _activeCount,
                TotalProcessed = _totalProcessed,
                TotalFailed = _totalFailed,
                AverageProcessingTimeMs = averageTime,
                IsProcessing = _activeCount > 0 || _queue.Count > 0
            };

            if (_logger.IsEnabled(LogLevel.Trace))
            {
                _logger.LogTrace("🎼 ExecutionQueue: Status details - QueueDepth: {QueueDepth}, ActiveCount: {ActiveCount}, TotalProcessed: {TotalProcessed}, TotalFailed: {TotalFailed}, AverageTime: {AverageTime:F2}ms", status.QueueDepth, status.ActiveCount, status.TotalProcessed, status.TotalFailed, status.AverageProcessingTimeMs);
            }

            return status;
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
            int clearedCount = 0;
            while (_queue.TryDequeue(out _, out _))
            {
                clearedCount++;
            }

            _logger.LogInformation("🎼 ExecutionQueue: Cleared {ClearedCount} items from queue", clearedCount);
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
            _logger.LogInformation("🎼 ExecutionQueue: Marked \"{SequenceId}\" as completed (Total completed: {TotalCompleted})",
                item.SequenceId, _totalProcessed);

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
                "❌ ExecutionQueue: Recorded failure for item {ItemId}: {Error} (Total failed: {TotalFailed})",
                item.Id,
                error,
                _totalFailed);

            // Log state transition
            _logger.LogInformation("⚠️ ExecutionQueue: Execution state transitioned to FAILED - {SequenceId}", item.SequenceId);
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }
}

