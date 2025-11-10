using Microsoft.Extensions.Logging;

namespace MusicalConductor.Core.Monitoring;

/// <summary>
/// StatisticsManager - Performance metrics and statistics tracking
/// Handles all conductor statistics, performance metrics, and queue analytics
/// </summary>
public class StatisticsManager
{
    public class ConductorStatistics
    {
        public int TotalSequencesExecuted { get; set; }
        public int TotalBeatsExecuted { get; set; }
        public double AverageExecutionTime { get; set; }
        public int TotalSequencesQueued { get; set; }
        public int CurrentQueueLength { get; set; }
        public int MaxQueueLength { get; set; }
        public double AverageQueueWaitTime { get; set; }
        public int ErrorCount { get; set; }
        public double SuccessRate { get; set; }
        public double? LastExecutionTime { get; set; }
        public double SequenceCompletionRate { get; set; }
        public int ChainedSequences { get; set; }
    }

    private readonly ILogger<StatisticsManager> _logger;
    private ConductorStatistics _statistics;

    public StatisticsManager(ILogger<StatisticsManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _statistics = new ConductorStatistics
        {
            TotalSequencesExecuted = 0,
            TotalBeatsExecuted = 0,
            AverageExecutionTime = 0,
            TotalSequencesQueued = 0,
            CurrentQueueLength = 0,
            MaxQueueLength = 0,
            AverageQueueWaitTime = 0,
            ErrorCount = 0,
            SuccessRate = 0,
            LastExecutionTime = null,
            SequenceCompletionRate = 0,
            ChainedSequences = 0
        };
    }

    /// <summary>
    /// Record a sequence execution
    /// </summary>
    public void RecordSequenceExecution(double executionTime)
    {
        _statistics.TotalSequencesExecuted++;

        // Update average execution time using exponential moving average
        const double alpha = 0.1; // Smoothing factor
        _statistics.AverageExecutionTime =
            _statistics.AverageExecutionTime * (1 - alpha) +
            executionTime * alpha;

        // Update success rate
        UpdateSuccessRate();

        _logger.LogDebug(
            "📊 StatisticsManager: Recorded sequence execution ({ExecutionTime:F2}ms)",
            executionTime);
    }

    /// <summary>
    /// Record a beat execution
    /// </summary>
    public void RecordBeatExecution()
    {
        _statistics.TotalBeatsExecuted++;
    }

    /// <summary>
    /// Record an error occurrence
    /// </summary>
    public void RecordError()
    {
        _statistics.ErrorCount++;
        UpdateSuccessRate();

        _logger.LogWarning("📊 StatisticsManager: Recorded error occurrence");
    }

    /// <summary>
    /// Record a sequence being queued
    /// </summary>
    public void RecordSequenceQueued()
    {
        _statistics.TotalSequencesQueued++;
        _statistics.CurrentQueueLength++;
        _statistics.MaxQueueLength = Math.Max(
            _statistics.MaxQueueLength,
            _statistics.CurrentQueueLength);
    }

    /// <summary>
    /// Record a sequence being dequeued
    /// </summary>
    public void RecordSequenceDequeued()
    {
        if (_statistics.CurrentQueueLength > 0)
        {
            _statistics.CurrentQueueLength--;
        }
    }

    /// <summary>
    /// Update queue wait time statistics
    /// </summary>
    public void UpdateQueueWaitTime(double waitTime)
    {
        // Simple moving average calculation
        const double alpha = 0.1; // Smoothing factor
        _statistics.AverageQueueWaitTime =
            _statistics.AverageQueueWaitTime * (1 - alpha) + waitTime * alpha;
    }

    /// <summary>
    /// Update success rate calculation
    /// </summary>
    private void UpdateSuccessRate()
    {
        var totalAttempts = _statistics.TotalSequencesExecuted + _statistics.ErrorCount;
        if (totalAttempts > 0)
        {
            _statistics.SuccessRate =
                ((double)_statistics.TotalSequencesExecuted / totalAttempts) * 100;
        }
        else
        {
            _statistics.SuccessRate = 100; // No attempts yet, assume 100%
        }
    }

    /// <summary>
    /// Get current statistics
    /// </summary>
    public ConductorStatistics GetStatistics()
    {
        return new ConductorStatistics
        {
            TotalSequencesExecuted = _statistics.TotalSequencesExecuted,
            TotalBeatsExecuted = _statistics.TotalBeatsExecuted,
            AverageExecutionTime = _statistics.AverageExecutionTime,
            TotalSequencesQueued = _statistics.TotalSequencesQueued,
            CurrentQueueLength = _statistics.CurrentQueueLength,
            MaxQueueLength = _statistics.MaxQueueLength,
            AverageQueueWaitTime = _statistics.AverageQueueWaitTime,
            ErrorCount = _statistics.ErrorCount,
            SuccessRate = _statistics.SuccessRate,
            LastExecutionTime = _statistics.LastExecutionTime,
            SequenceCompletionRate = _statistics.SequenceCompletionRate,
            ChainedSequences = _statistics.ChainedSequences
        };
    }

    /// <summary>
    /// Get enhanced statistics with additional metrics
    /// </summary>
    public object GetEnhancedStatistics(int mountedPlugins)
    {
        return new
        {
            Statistics = GetStatistics(),
            MountedPlugins = mountedPlugins
        };
    }

    /// <summary>
    /// Reset all statistics
    /// </summary>
    public void Reset()
    {
        _statistics = new ConductorStatistics
        {
            TotalSequencesExecuted = 0,
            TotalBeatsExecuted = 0,
            AverageExecutionTime = 0,
            TotalSequencesQueued = 0,
            CurrentQueueLength = 0,
            MaxQueueLength = 0,
            AverageQueueWaitTime = 0,
            ErrorCount = 0,
            SuccessRate = 0,
            LastExecutionTime = null,
            SequenceCompletionRate = 0,
            ChainedSequences = 0
        };

        _logger.LogInformation("🧹 StatisticsManager: All statistics reset");
    }

    /// <summary>
    /// Get performance summary
    /// </summary>
    public object GetPerformanceSummary()
    {
        var totalAttempts = _statistics.TotalSequencesExecuted + _statistics.ErrorCount;
        var errorRate = totalAttempts > 0
            ? ((double)_statistics.ErrorCount / totalAttempts) * 100
            : 0;

        return new
        {
            ExecutionEfficiency = _statistics.SuccessRate,
            QueueEfficiency = _statistics.AverageQueueWaitTime > 0
                ? Math.Max(0, 100 - _statistics.AverageQueueWaitTime / 1000)
                : 100,
            ErrorRate = errorRate,
            Throughput = _statistics.AverageExecutionTime > 0
                ? 1000 / _statistics.AverageExecutionTime  // sequences per second
                : 0
        };
    }

    /// <summary>
    /// Get queue analytics
    /// </summary>
    public object GetQueueAnalytics()
    {
        return new
        {
            CurrentLoad = _statistics.CurrentQueueLength,
            MaxLoadReached = _statistics.MaxQueueLength,
            AverageWaitTime = _statistics.AverageQueueWaitTime,
            TotalProcessed = _statistics.TotalSequencesExecuted
        };
    }

    /// <summary>
    /// Log current statistics
    /// </summary>
    public void LogStatistics()
    {
        _logger.LogInformation(
            "📊 Conductor Statistics: Sequences={TotalSequences} | Beats={TotalBeats} | AvgTime={AvgTime:F2}ms | Success={SuccessRate:F1}% | Errors={Errors}",
            _statistics.TotalSequencesExecuted,
            _statistics.TotalBeatsExecuted,
            _statistics.AverageExecutionTime,
            _statistics.SuccessRate,
            _statistics.ErrorCount);
    }

    /// <summary>
    /// Get debug information
    /// </summary>
    public object GetDebugInfo()
    {
        return new
        {
            Statistics = _statistics,
            PerformanceSummary = GetPerformanceSummary(),
            QueueAnalytics = GetQueueAnalytics()
        };
    }
}
