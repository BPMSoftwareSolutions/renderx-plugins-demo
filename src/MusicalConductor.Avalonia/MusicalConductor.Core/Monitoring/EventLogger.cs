using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Monitoring;

/// <summary>
/// EventLogger - Event emission and hierarchical logging
/// Handles all event emission, beat logging, and hierarchical console output
/// </summary>
public class EventLogger
{
    // Event type constants matching TypeScript MUSICAL_CONDUCTOR_EVENT_TYPES
    public static class EventTypes
    {
        public const string BEAT_STARTED = "beat.started";
        public const string BEAT_COMPLETED = "beat.completed";
        public const string BEAT_FAILED = "beat.failed";
        public const string MOVEMENT_STARTED = "movement.started";
        public const string MOVEMENT_COMPLETED = "movement.completed";
        public const string MOVEMENT_FAILED = "movement.failed";
        public const string SEQUENCE_STARTED = "sequence.started";
        public const string SEQUENCE_COMPLETED = "sequence.completed";
        public const string QUEUE_PROCESSED = "queue.processed";
    }

    public class LoggingConfig
    {
        public bool EnableHierarchicalLogging { get; set; } = true;
        public bool EnableEventEmission { get; set; } = true;
        public LogLevel LogLevel { get; set; } = LogLevel.Information;
    }

    private readonly IEventBus _eventBus;
    private readonly PerformanceTracker _performanceTracker;
    private readonly ILogger<EventLogger> _logger;
    private LoggingConfig _config;
    private bool _beatLoggingInitialized = false;
    private readonly List<ISubscription> _eventSubscriptions = new();

    public EventLogger(
        IEventBus eventBus,
        PerformanceTracker performanceTracker,
        ILogger<EventLogger> logger,
        LoggingConfig? config = null)
    {
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        _performanceTracker = performanceTracker ?? throw new ArgumentNullException(nameof(performanceTracker));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _config = config ?? new LoggingConfig();
    }

    /// <summary>
    /// Setup beat execution logging with hierarchical format
    /// </summary>
    public void SetupBeatExecutionLogging()
    {
        if (_beatLoggingInitialized)
        {
            return;
        }

        if (!_config.EnableHierarchicalLogging)
        {
            _logger.LogInformation("🎼 EventLogger: Hierarchical logging disabled");
            return;
        }

        // Subscribe to beat started events
        var beatStartedSubscription = _eventBus.Subscribe<BeatStartedEventData>(
            EventTypes.BEAT_STARTED,
            data => LogBeatStartedHierarchical(data));

        // Subscribe to beat completed events
        var beatCompletedSubscription = _eventBus.Subscribe<BeatCompletedEventData>(
            EventTypes.BEAT_COMPLETED,
            data => LogBeatCompletedHierarchical(data));

        // Store subscriptions for cleanup
        _eventSubscriptions.Add(beatStartedSubscription);
        _eventSubscriptions.Add(beatCompletedSubscription);
        _beatLoggingInitialized = true;

        _logger.LogInformation("🎼 EventLogger: Hierarchical beat logging initialized");
    }

    /// <summary>
    /// Setup movement execution logging with hierarchical format
    /// </summary>
    public void SetupMovementExecutionLogging()
    {
        if (!_config.EnableHierarchicalLogging)
        {
            _logger.LogInformation("🎼 EventLogger: Movement hierarchical logging disabled");
            return;
        }

        // Subscribe to movement started events
        var movementStartedSubscription = _eventBus.Subscribe<MovementStartedEventData>(
            EventTypes.MOVEMENT_STARTED,
            data => LogMovementStartedHierarchical(data));

        // Subscribe to movement completed events
        var movementCompletedSubscription = _eventBus.Subscribe<MovementCompletedEventData>(
            EventTypes.MOVEMENT_COMPLETED,
            data => LogMovementCompletedHierarchical(data));

        // Subscribe to movement failed events
        var movementFailedSubscription = _eventBus.Subscribe<MovementFailedEventData>(
            EventTypes.MOVEMENT_FAILED,
            data => LogMovementFailedHierarchical(data));

        // Store subscriptions for cleanup
        _eventSubscriptions.Add(movementStartedSubscription);
        _eventSubscriptions.Add(movementCompletedSubscription);
        _eventSubscriptions.Add(movementFailedSubscription);

        _logger.LogInformation("🎼 EventLogger: Hierarchical movement logging initialized");
    }

    /// <summary>
    /// Log beat started event with hierarchical format
    /// </summary>
    private void LogBeatStartedHierarchical(BeatStartedEventData data)
    {
        // Use PerformanceTracker to track beat timing
        _performanceTracker.StartBeatTiming(data.SequenceName, data.Beat);

        // Get movement information
        var movementName = GetMovementNameForBeat(data.SequenceName, data.Beat);

        // Log hierarchical beat start
        _logger.LogInformation(
            "🎵 Beat {Beat} Started: {Title} ({Event})",
            data.Beat,
            data.Title ?? data.Event,
            data.Event);

        _logger.LogDebug(
            "  🎼 Sequence: {SequenceName} | 🎵 Movement: {MovementName} | 📊 Beat: {Beat} | 🎯 Event: {Event}",
            data.SequenceName,
            movementName,
            data.Beat,
            data.Event);
    }

    /// <summary>
    /// Log beat completed event with hierarchical format
    /// </summary>
    private void LogBeatCompletedHierarchical(BeatCompletedEventData data)
    {
        // Use PerformanceTracker to end beat timing
        var duration = _performanceTracker.EndBeatTiming(data.SequenceName, data.Beat);

        if (duration.HasValue)
        {
            _logger.LogInformation(
                "✅ Beat {Beat} Completed in {Duration:F2}ms",
                data.Beat,
                duration.Value);
        }
        else
        {
            _logger.LogInformation("✅ Beat {Beat} Completed", data.Beat);
        }
    }

    /// <summary>
    /// Log movement started event with hierarchical format
    /// </summary>
    private void LogMovementStartedHierarchical(MovementStartedEventData data)
    {
        _logger.LogInformation(
            "🎵 Movement Started: {MovementName} ({BeatsCount} beats)",
            data.MovementName,
            data.BeatsCount);

        _logger.LogDebug(
            "  🎼 Sequence: {SequenceName} | 🆔 Request ID: {RequestId} | 🥁 Beats Count: {BeatsCount}",
            data.SequenceName,
            data.RequestId,
            data.BeatsCount);
    }

    /// <summary>
    /// Log movement completed event with hierarchical format
    /// </summary>
    private void LogMovementCompletedHierarchical(MovementCompletedEventData data)
    {
        if (data.Duration.HasValue)
        {
            _logger.LogInformation(
                "✅ Movement completed in {Duration:F2}ms | 🥁 Beats executed: {BeatsExecuted}",
                data.Duration.Value,
                data.BeatsExecuted);
        }
        else
        {
            _logger.LogInformation(
                "✅ Movement completed | 🥁 Beats executed: {BeatsExecuted}",
                data.BeatsExecuted);
        }
    }

    /// <summary>
    /// Log movement failed event with hierarchical format
    /// </summary>
    private void LogMovementFailedHierarchical(MovementFailedEventData data)
    {
        _logger.LogError("❌ Movement failed: {Error}", data.Error);
    }

    /// <summary>
    /// Get movement name for a specific beat in a sequence
    /// </summary>
    private string GetMovementNameForBeat(string sequenceName, int beatNumber)
    {
        // Placeholder - would typically look up from sequence registry
        return $"Movement {(int)Math.Ceiling(beatNumber / 4.0)}";
    }

    /// <summary>
    /// Handle beat execution error with proper logging
    /// </summary>
    public void HandleBeatError(string sequenceName, int beat, Exception error)
    {
        // Emit beat error event
        EmitEvent(EventTypes.BEAT_FAILED, new BeatFailedEventData
        {
            SequenceName = sequenceName,
            Beat = beat,
            Error = error.Message,
            Success = false
        });

        // Log error in hierarchical format if enabled
        if (_config.EnableHierarchicalLogging)
        {
            _logger.LogError("❌ Error: {ErrorMessage}", error.Message);

            // Clean up timing data for failed beat
            _performanceTracker.CleanupFailedBeat(sequenceName, beat);
        }
    }

    /// <summary>
    /// Emit an event through the event bus
    /// </summary>
    public void EmitEvent<T>(string eventType, T data)
    {
        if (!_config.EnableEventEmission)
        {
            return;
        }

        try
        {
            _eventBus.Emit(eventType, data);

            if (_config.LogLevel <= LogLevel.Debug)
            {
                _logger.LogDebug("🎼 EventLogger: Emitted {EventType}", eventType);
            }
        }
        catch (Exception error)
        {
            _logger.LogError(error, "🎼 EventLogger: Failed to emit event {EventType}", eventType);
        }
    }

    /// <summary>
    /// Log sequence execution start
    /// </summary>
    public void LogSequenceStart(string sequenceName, string executionId, object data)
    {
        if (_config.LogLevel <= LogLevel.Information)
        {
            _logger.LogInformation(
                "🎼 EventLogger: Starting sequence {SequenceName} ({ExecutionId})",
                sequenceName,
                executionId);
        }

        EmitEvent(EventTypes.SEQUENCE_STARTED, new SequenceStartedEventData
        {
            SequenceName = sequenceName,
            ExecutionId = executionId,
            Data = data,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    /// <summary>
    /// Log sequence execution completion
    /// </summary>
    public void LogSequenceComplete(string sequenceName, string executionId, bool success, double? duration = null)
    {
        var status = success ? "✅ completed" : "❌ failed";
        var durationText = duration.HasValue ? $" in {duration.Value:F2}ms" : "";

        if (_config.LogLevel <= LogLevel.Information)
        {
            _logger.LogInformation(
                "🎼 EventLogger: Sequence {SequenceName} {Status}{DurationText}",
                sequenceName,
                status,
                durationText);
        }

        EmitEvent(EventTypes.SEQUENCE_COMPLETED, new SequenceCompletedEventData
        {
            SequenceName = sequenceName,
            ExecutionId = executionId,
            Success = success,
            Duration = duration,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    /// <summary>
    /// Log queue operations
    /// </summary>
    public void LogQueueOperation(string operation, string sequenceName, int queueLength)
    {
        if (_config.LogLevel <= LogLevel.Debug)
        {
            _logger.LogDebug(
                "🎼 EventLogger: Queue {Operation} - {SequenceName} (queue: {QueueLength})",
                operation,
                sequenceName,
                queueLength);
        }

        EmitEvent(EventTypes.QUEUE_PROCESSED, new QueueProcessedEventData
        {
            Operation = operation,
            SequenceName = sequenceName,
            QueueLength = queueLength,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
    }

    /// <summary>
    /// Update logging configuration
    /// </summary>
    public void UpdateConfig(LoggingConfig newConfig)
    {
        _config = newConfig;
        _logger.LogInformation("🎼 EventLogger: Configuration updated");
    }

    /// <summary>
    /// Get current configuration
    /// </summary>
    public LoggingConfig GetConfig()
    {
        return _config;
    }

    /// <summary>
    /// Cleanup event subscriptions
    /// </summary>
    public void Cleanup()
    {
        if (_eventSubscriptions.Count > 0)
        {
            foreach (var subscription in _eventSubscriptions)
            {
                subscription.Dispose();
            }
            _eventSubscriptions.Clear();
            _beatLoggingInitialized = false;
            _logger.LogInformation("🧹 EventLogger: Event subscriptions cleaned up");
        }
    }

    /// <summary>
    /// Get debug information
    /// </summary>
    public object GetDebugInfo()
    {
        return new
        {
            Config = _config,
            BeatLoggingInitialized = _beatLoggingInitialized,
            ActiveSubscriptions = _eventSubscriptions.Count
        };
    }
}

// Event data classes
public class BeatStartedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public int Beat { get; set; }
    public string Event { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? SequenceType { get; set; }
    public string? Timing { get; set; }
    public string? Dynamics { get; set; }
}

public class BeatCompletedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public int Beat { get; set; }
}

public class BeatFailedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public int Beat { get; set; }
    public string Error { get; set; } = string.Empty;
    public bool Success { get; set; }
}

public class MovementStartedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public string MovementName { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public int BeatsCount { get; set; }
}

public class MovementCompletedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public string MovementName { get; set; } = string.Empty;
    public double? Duration { get; set; }
    public int BeatsExecuted { get; set; }
}

public class MovementFailedEventData
{
    public string Error { get; set; } = string.Empty;
}

public class SequenceStartedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public string ExecutionId { get; set; } = string.Empty;
    public object? Data { get; set; }
    public long Timestamp { get; set; }
}

public class SequenceCompletedEventData
{
    public string SequenceName { get; set; } = string.Empty;
    public string ExecutionId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public double? Duration { get; set; }
    public long Timestamp { get; set; }
}

public class QueueProcessedEventData
{
    public string Operation { get; set; } = string.Empty;
    public string SequenceName { get; set; } = string.Empty;
    public int QueueLength { get; set; }
    public long Timestamp { get; set; }
}
