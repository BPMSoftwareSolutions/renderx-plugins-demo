using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace MusicalConductor.Core.Monitoring;

/// <summary>
/// PerformanceTracker - Performance timing and beat execution tracking
/// Handles beat timing, execution duration tracking, and performance monitoring
/// </summary>
public class PerformanceTracker
{
    public class BeatTiming
    {
        public string SequenceName { get; set; } = string.Empty;
        public int Beat { get; set; }
        public long StartTime { get; set; }
        public long? EndTime { get; set; }
        public double? Duration { get; set; }
    }

    public class SequenceTiming
    {
        public string SequenceName { get; set; } = string.Empty;
        public long StartTime { get; set; }
        public long? EndTime { get; set; }
        public double? Duration { get; set; }
        public int BeatCount { get; set; }
    }

    public class MovementTiming
    {
        public string SequenceName { get; set; } = string.Empty;
        public string MovementName { get; set; } = string.Empty;
        public string RequestId { get; set; } = string.Empty;
        public long StartTime { get; set; }
        public long? EndTime { get; set; }
        public double? Duration { get; set; }
        public int BeatsCount { get; set; }
    }

    private readonly Dictionary<string, long> _beatStartTimes = new();
    private readonly Dictionary<string, SequenceTiming> _sequenceTimings = new();
    private readonly Dictionary<string, long> _movementStartTimes = new();
    private readonly List<BeatTiming> _completedBeats = new();
    private readonly List<MovementTiming> _completedMovements = new();
    private readonly ILogger<PerformanceTracker> _logger;
    private readonly Stopwatch _stopwatch = Stopwatch.StartNew();
    private int _maxHistorySize = 1000;

    public PerformanceTracker(ILogger<PerformanceTracker> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Start tracking a beat execution
    /// </summary>
    public string StartBeatTiming(string sequenceName, int beat)
    {
        var beatKey = $"{sequenceName}-{beat}";
        var startTime = _stopwatch.ElapsedMilliseconds;
        _beatStartTimes[beatKey] = startTime;

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Started timing beat {Beat} for {SequenceName}",
            beat,
            sequenceName);

        if (_logger.IsEnabled(LogLevel.Trace))
        {
            _logger.LogTrace("⏱️ PerformanceTracker: Beat timing details - BeatKey: {BeatKey}, StartTime: {StartTime}ms, TotalBeats: {TotalBeats}", beatKey, startTime, _beatStartTimes.Count);
        }

        return beatKey;
    }

    /// <summary>
    /// End tracking a beat execution
    /// </summary>
    public double? EndBeatTiming(string sequenceName, int beat)
    {
        var beatKey = $"{sequenceName}-{beat}";
        
        if (!_beatStartTimes.TryGetValue(beatKey, out var startTime))
        {
            _logger.LogWarning(
                "⏱️ PerformanceTracker: No start time found for beat {Beat} in {SequenceName}",
                beat,
                sequenceName);
            return null;
        }

        var endTime = _stopwatch.ElapsedMilliseconds;
        var duration = (double)(endTime - startTime);

        // Record the completed beat
        var beatTiming = new BeatTiming
        {
            SequenceName = sequenceName,
            Beat = beat,
            StartTime = startTime,
            EndTime = endTime,
            Duration = duration
        };

        _completedBeats.Add(beatTiming);
        _beatStartTimes.Remove(beatKey);

        // Maintain history size limit
        if (_completedBeats.Count > _maxHistorySize)
        {
            _completedBeats.RemoveRange(0, _maxHistorySize / 2);
        }

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Beat {Beat} completed in {Duration:F2}ms",
            beat,
            duration);

        return duration;
    }

    /// <summary>
    /// Clean up timing data for a failed beat
    /// </summary>
    public void CleanupFailedBeat(string sequenceName, int beat)
    {
        var beatKey = $"{sequenceName}-{beat}";
        _beatStartTimes.Remove(beatKey);

        _logger.LogWarning(
            "⏱️ PerformanceTracker: Cleaned up failed beat {Beat} for {SequenceName}",
            beat,
            sequenceName);

        // Log state transition
        _logger.LogInformation("⚠️ PerformanceTracker: Beat state transitioned to FAILED - {SequenceName}:{Beat}", sequenceName, beat);
    }

    /// <summary>
    /// Start tracking a movement execution
    /// </summary>
    public string StartMovementTiming(string sequenceName, string movementName, string requestId)
    {
        var movementKey = $"{sequenceName}-{movementName}-{requestId}";
        var startTime = _stopwatch.ElapsedMilliseconds;
        _movementStartTimes[movementKey] = startTime;

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Started timing movement {MovementName} for {SequenceName}",
            movementName,
            sequenceName);

        return movementKey;
    }

    /// <summary>
    /// End tracking a movement execution
    /// </summary>
    public double? EndMovementTiming(string sequenceName, string movementName, string requestId, int beatsCount)
    {
        var movementKey = $"{sequenceName}-{movementName}-{requestId}";
        
        if (!_movementStartTimes.TryGetValue(movementKey, out var startTime))
        {
            _logger.LogWarning(
                "⏱️ PerformanceTracker: No start time found for movement {MovementName} in {SequenceName}",
                movementName,
                sequenceName);
            return null;
        }

        var endTime = _stopwatch.ElapsedMilliseconds;
        var duration = (double)(endTime - startTime);

        // Record the completed movement
        var movementTiming = new MovementTiming
        {
            SequenceName = sequenceName,
            MovementName = movementName,
            RequestId = requestId,
            StartTime = startTime,
            EndTime = endTime,
            Duration = duration,
            BeatsCount = beatsCount
        };

        _completedMovements.Add(movementTiming);
        _movementStartTimes.Remove(movementKey);

        // Maintain history size limit
        if (_completedMovements.Count > _maxHistorySize)
        {
            _completedMovements.RemoveRange(0, _maxHistorySize / 2);
        }

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Movement {MovementName} completed in {Duration:F2}ms",
            movementName,
            duration);

        return duration;
    }

    /// <summary>
    /// Clean up timing data for a failed movement
    /// </summary>
    public void CleanupFailedMovement(string sequenceName, string movementName, string requestId)
    {
        var movementKey = $"{sequenceName}-{movementName}-{requestId}";
        _movementStartTimes.Remove(movementKey);

        _logger.LogWarning(
            "⏱️ PerformanceTracker: Cleaned up failed movement {MovementName} for {SequenceName}",
            movementName,
            sequenceName);

        // Log state transition
        _logger.LogInformation("⚠️ PerformanceTracker: Movement state transitioned to FAILED - {SequenceName}:{MovementName}", sequenceName, movementName);
    }

    /// <summary>
    /// Start tracking a sequence execution
    /// </summary>
    public void StartSequenceTiming(string sequenceName)
    {
        var startTime = _stopwatch.ElapsedMilliseconds;
        _sequenceTimings[sequenceName] = new SequenceTiming
        {
            SequenceName = sequenceName,
            StartTime = startTime,
            BeatCount = 0
        };

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Started timing sequence {SequenceName}",
            sequenceName);
    }

    /// <summary>
    /// End tracking a sequence execution
    /// </summary>
    public double? EndSequenceTiming(string sequenceName)
    {
        if (!_sequenceTimings.TryGetValue(sequenceName, out var timing))
        {
            _logger.LogWarning(
                "⏱️ PerformanceTracker: No start time found for sequence {SequenceName}",
                sequenceName);
            return null;
        }

        var endTime = _stopwatch.ElapsedMilliseconds;
        timing.EndTime = endTime;
        timing.Duration = (double)(endTime - timing.StartTime);

        _logger.LogDebug(
            "⏱️ PerformanceTracker: Sequence {SequenceName} completed in {Duration:F2}ms",
            sequenceName,
            timing.Duration.Value);

        return timing.Duration;
    }

    /// <summary>
    /// Get beat statistics for a sequence
    /// </summary>
    public object GetBeatStatistics(string sequenceName)
    {
        var beats = _completedBeats.Where(b => b.SequenceName == sequenceName).ToList();
        
        if (beats.Count == 0)
        {
            return new
            {
                SequenceName = sequenceName,
                TotalBeats = 0,
                AverageDuration = 0.0,
                MinDuration = 0.0,
                MaxDuration = 0.0
            };
        }

        var durations = beats.Select(b => b.Duration ?? 0).ToList();
        
        return new
        {
            SequenceName = sequenceName,
            TotalBeats = beats.Count,
            AverageDuration = durations.Average(),
            MinDuration = durations.Min(),
            MaxDuration = durations.Max()
        };
    }

    /// <summary>
    /// Get movement statistics for a sequence
    /// </summary>
    public object GetMovementStatistics(string sequenceName)
    {
        var movements = _completedMovements.Where(m => m.SequenceName == sequenceName).ToList();
        
        if (movements.Count == 0)
        {
            return new
            {
                SequenceName = sequenceName,
                TotalMovements = 0,
                AverageDuration = 0.0,
                AverageBeatsPerMovement = 0.0
            };
        }

        var durations = movements.Select(m => m.Duration ?? 0).ToList();
        
        return new
        {
            SequenceName = sequenceName,
            TotalMovements = movements.Count,
            AverageDuration = durations.Average(),
            AverageBeatsPerMovement = movements.Average(m => m.BeatsCount)
        };
    }

    /// <summary>
    /// Get all completed beat timings
    /// </summary>
    public IReadOnlyList<BeatTiming> GetCompletedBeats()
    {
        return _completedBeats.AsReadOnly();
    }

    /// <summary>
    /// Get all completed movement timings
    /// </summary>
    public IReadOnlyList<MovementTiming> GetCompletedMovements()
    {
        return _completedMovements.AsReadOnly();
    }

    /// <summary>
    /// Reset all tracking data
    /// </summary>
    public void ResetTrackingData()
    {
        _beatStartTimes.Clear();
        _sequenceTimings.Clear();
        _movementStartTimes.Clear();
        _completedBeats.Clear();
        _completedMovements.Clear();

        _logger.LogInformation("🧹 PerformanceTracker: All tracking data reset");
    }

    /// <summary>
    /// Get debug information
    /// </summary>
    public object GetDebugInfo()
    {
        return new
        {
            ActiveBeatTimings = _beatStartTimes.Count,
            ActiveMovementTimings = _movementStartTimes.Count,
            CompletedBeats = _completedBeats.Count,
            CompletedMovements = _completedMovements.Count,
            MaxHistorySize = _maxHistorySize
        };
    }
}
