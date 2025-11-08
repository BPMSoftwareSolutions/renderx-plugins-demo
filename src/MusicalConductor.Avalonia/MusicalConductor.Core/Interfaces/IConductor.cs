namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Statistics about conductor execution.
/// </summary>
public class ConductorStatistics
{
    /// <summary>
    /// Total number of sequences executed.
    /// </summary>
    public int TotalExecutions { get; set; }

    /// <summary>
    /// Number of successful executions.
    /// </summary>
    public int SuccessfulExecutions { get; set; }

    /// <summary>
    /// Number of failed executions.
    /// </summary>
    public int FailedExecutions { get; set; }

    /// <summary>
    /// Number of currently executing sequences.
    /// </summary>
    public int ActiveSequences { get; set; }

    /// <summary>
    /// Total number of beats executed.
    /// </summary>
    public int TotalBeats { get; set; }

    /// <summary>
    /// Average execution time in milliseconds.
    /// </summary>
    public double AverageExecutionTimeMs { get; set; }
}

/// <summary>
/// Handler context passed to beat handlers.
/// </summary>
public interface IHandlerContext
{
    /// <summary>
    /// Plugin ID that owns the sequence.
    /// </summary>
    string PluginId { get; }

    /// <summary>
    /// Sequence ID being executed.
    /// </summary>
    string SequenceId { get; }

    /// <summary>
    /// Correlation ID for tracking related operations.
    /// </summary>
    string CorrelationId { get; }

    /// <summary>
    /// Context data passed to play().
    /// </summary>
    object? Data { get; }

    /// <summary>
    /// Logger for the handler.
    /// </summary>
    ILogger Logger { get; }

    /// <summary>
    /// Reference to the conductor for nested plays.
    /// </summary>
    IConductor Conductor { get; }
}

/// <summary>
/// Core orchestration engine.
/// </summary>
public interface IConductor
{
    /// <summary>
    /// Play a sequence.
    /// </summary>
    /// <param name=\"pluginId\">Plugin that owns the sequence</param>
    /// <param name=\"sequenceId\">Sequence to play</param>
    /// <param name=\"context\">Optional context data</param>
    /// <param name=\"priority\">Execution priority</param>
    /// <returns>Request ID for tracking</returns>
    string Play(string pluginId, string sequenceId, object? context = null, SequencePriority priority = SequencePriority.NORMAL);

    /// <summary>
    /// Get current conductor statistics.
    /// </summary>
    /// <returns>Statistics object</returns>
    ConductorStatistics GetStatistics();

    /// <summary>
    /// Get conductor status including sequences and plugins.
    /// </summary>
    /// <returns>Status object</returns>
    object? GetStatus();

    /// <summary>
    /// Get the event bus.
    /// </summary>
    IEventBus EventBus { get; }

    /// <summary>
    /// Get the sequence registry.
    /// </summary>
    ISequenceRegistry SequenceRegistry { get; }
}

/// <summary>
/// Logger interface for handlers.
/// </summary>
public interface ILogger
{
    /// <summary>
    /// Log a message.
    /// </summary>
    void Log(string message);

    /// <summary>
    /// Log an info message.
    /// </summary>
    void Info(string message);

    /// <summary>
    /// Log a warning message.
    /// </summary>
    void Warn(string message);

    /// <summary>
    /// Log an error message.
    /// </summary>
    void Error(string message, Exception? ex = null);
}

