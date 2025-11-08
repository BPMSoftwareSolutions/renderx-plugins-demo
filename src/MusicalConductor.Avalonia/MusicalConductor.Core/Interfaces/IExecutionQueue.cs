namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Status information about the execution queue.
/// </summary>
public class QueueStatus
{
    /// <summary>
    /// Number of items currently in the queue.
    /// </summary>
    public int QueueDepth { get; set; }

    /// <summary>
    /// Number of items currently being processed.
    /// </summary>
    public int ActiveCount { get; set; }

    /// <summary>
    /// Total number of items processed.
    /// </summary>
    public long TotalProcessed { get; set; }

    /// <summary>
    /// Total number of items that failed.
    /// </summary>
    public long TotalFailed { get; set; }

    /// <summary>
    /// Average processing time in milliseconds.
    /// </summary>
    public double AverageProcessingTimeMs { get; set; }

    /// <summary>
    /// Whether the queue is currently processing items.
    /// </summary>
    public bool IsProcessing { get; set; }
}

/// <summary>
/// Represents an item in the execution queue.
/// </summary>
public class ExecutionItem
{
    /// <summary>
    /// Unique identifier for this execution.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Plugin ID that owns the sequence.
    /// </summary>
    public required string PluginId { get; set; }

    /// <summary>
    /// Sequence ID to execute.
    /// </summary>
    public required string SequenceId { get; set; }

    /// <summary>
    /// Context data to pass to the sequence.
    /// </summary>
    public object? Context { get; set; }

    /// <summary>
    /// Execution priority.
    /// </summary>
    public SequencePriority Priority { get; set; } = SequencePriority.NORMAL;

    /// <summary>
    /// Timestamp when the item was enqueued.
    /// </summary>
    public DateTime EnqueuedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when processing started.
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// Timestamp when processing completed.
    /// </summary>
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Priority-based execution queue for sequences.
/// </summary>
public interface IExecutionQueue
{
    /// <summary>
    /// Enqueue an item for execution.
    /// </summary>
    /// <param name="item">Item to enqueue</param>
    void Enqueue(ExecutionItem item);

    /// <summary>
    /// Dequeue the next item to process (highest priority first).
    /// </summary>
    /// <returns>Next item or null if queue is empty</returns>
    ExecutionItem? Dequeue();

    /// <summary>
    /// Get the current status of the queue.
    /// </summary>
    /// <returns>Queue status</returns>
    QueueStatus GetStatus();

    /// <summary>
    /// Get the number of items in the queue.
    /// </summary>
    /// <returns>Queue depth</returns>
    int GetQueueDepth();

    /// <summary>
    /// Clear all items from the queue.
    /// </summary>
    void Clear();

    /// <summary>
    /// Record that an item was processed successfully.
    /// </summary>
    /// <param name="item">Item that was processed</param>
    /// <param name="processingTimeMs">Time taken to process in milliseconds</param>
    void RecordSuccess(ExecutionItem item, double processingTimeMs);

    /// <summary>
    /// Record that an item failed to process.
    /// </summary>
    /// <param name="item">Item that failed</param>
    /// <param name="error">Error message</param>
    void RecordFailure(ExecutionItem item, string error);
}

