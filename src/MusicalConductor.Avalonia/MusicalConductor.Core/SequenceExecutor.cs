using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Monitoring;

namespace MusicalConductor.Core;

/// <summary>
/// Executes sequences and their beats.
/// </summary>
public class SequenceExecutor
{
    private readonly IEventBus _eventBus;
    private readonly IPluginManager _pluginManager;
    private readonly ILogger<SequenceExecutor> _logger;

    public SequenceExecutor(
        IEventBus eventBus,
        IPluginManager pluginManager,
        ILogger<SequenceExecutor> logger)
    {
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
        _pluginManager = pluginManager ?? throw new ArgumentNullException(nameof(pluginManager));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Execute a sequence asynchronously.
    /// </summary>
    public async Task ExecuteAsync(
        string requestId,
        string pluginId,
        ISequence sequence,
        object? context,
        IConductor conductor)
    {
        if (string.IsNullOrEmpty(requestId))
            throw new ArgumentNullException(nameof(requestId));
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));
        if (sequence == null)
            throw new ArgumentNullException(nameof(sequence));
        if (conductor == null)
            throw new ArgumentNullException(nameof(conductor));

        var startTime = DateTime.UtcNow;

        // 🎽 Create payload dictionary for data baton
        var payload = new Dictionary<string, object?>();

        try
        {
            _logger.LogInformation(
                "🎼 SequenceExecutor: Starting sequence execution: {SequenceId} (RequestId={RequestId}, PluginId={PluginId})",
                sequence.Id,
                requestId,
                pluginId);

            // Emit sequence:started event
            await _eventBus.Emit("sequence:started", new
            {
                requestId,
                pluginId,
                sequenceId = sequence.Id,
                timestamp = DateTime.UtcNow
            });

            // Execute all beats in the sequence
            var beats = sequence.GetAllBeats().ToList();
            var successfulBeats = 0;
            var beatNumber = 0;

            _logger.LogInformation("🎵 SequenceExecutor: Executing sequence \"{SequenceName}\" with {BeatCount} beats",
                sequence.Name, beats.Count);

            foreach (var beat in beats)
            {
                beatNumber++;
                var beatStartTime = DateTime.UtcNow;

                try
                {
                    _logger.LogInformation("🥁 SequenceExecutor: Executing beat {BeatNumber} ({BeatId})",
                        beatNumber, beat.Id);

                    // 🎽 Take snapshot before beat execution
                    var prevSnapshot = DataBaton.Snapshot(payload);

                    // Emit beat:started event
                    await _eventBus.Emit("beat:started", new
                    {
                        requestId,
                        beatId = beat.Id,
                        eventName = beat.Event,
                        timestamp = DateTime.UtcNow
                    });

                    // Execute beat handler if present
                    if (beat.Handler != null)
                    {
                        try
                        {
                            // Create handler context with payload
                            var handlerContext = new HandlerContext(
                                pluginId,
                                sequence.Id,
                                requestId,
                                context,
                                payload,
                                conductor,
                                _logger);

                            // Execute handler
                            if (beat.Handler is Func<IHandlerContext, object?, Task> asyncHandler)
                            {
                                await asyncHandler(handlerContext, beat.Data);
                            }
                            else if (beat.Handler is Action<IHandlerContext, object?> syncHandler)
                            {
                                syncHandler(handlerContext, beat.Data);
                            }

                            successfulBeats++;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error executing beat handler: {BeatId}", beat.Id);

                            await _eventBus.Emit("beat:handler_error", new
                            {
                                requestId,
                                beatId = beat.Id,
                                error = ex.Message,
                                timestamp = DateTime.UtcNow
                            });
                        }
                    }
                    else
                    {
                        successfulBeats++;
                    }

                    // 🎽 Take snapshot after beat execution and log changes
                    var nextSnapshot = DataBaton.Snapshot(payload);
                    DataBaton.Log(
                        _logger,
                        new BatonLogContext
                        {
                            SequenceName = sequence.Name,
                            BeatEvent = beat.Event,
                            BeatNumber = beatNumber,
                            RequestId = requestId,
                            PluginId = pluginId
                        },
                        prevSnapshot,
                        nextSnapshot);

                    var beatDuration = (DateTime.UtcNow - beatStartTime).TotalMilliseconds;

                    _logger.LogInformation("✅ SequenceExecutor: Beat {BeatNumber} ({BeatId}) completed in {Duration}ms",
                        beatNumber, beat.Id, beatDuration);

                    // Emit beat:completed event
                    await _eventBus.Emit("beat:completed", new
                    {
                        requestId,
                        beatId = beat.Id,
                        eventName = beat.Event,
                        timestamp = DateTime.UtcNow
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ SequenceExecutor: Error executing beat {BeatNumber} ({BeatId})", beatNumber, beat.Id);

                    await _eventBus.Emit("beat:failed", new
                    {
                        requestId,
                        beatId = beat.Id,
                        error = ex.Message,
                        timestamp = DateTime.UtcNow
                    });
                }
            }

            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;

            // Emit sequence:completed event
            await _eventBus.Emit("sequence:completed", new
            {
                requestId,
                pluginId,
                sequenceId = sequence.Id,
                beatsExecuted = successfulBeats,
                totalBeats = beats.Count,
                duration,
                timestamp = DateTime.UtcNow
            });

            _logger.LogInformation(
                "✅ SequenceExecutor: Sequence \"{SequenceName}\" completed in {Duration}ms ({SuccessfulBeats}/{TotalBeats} beats)",
                sequence.Name,
                duration,
                successfulBeats,
                beats.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ SequenceExecutor: Error executing sequence: {SequenceId} (RequestId={RequestId}, Reason={Reason})", sequence.Id, requestId, ex.Message);

            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;

            await _eventBus.Emit("sequence:failed", new
            {
                requestId,
                pluginId,
                sequenceId = sequence.Id,
                error = ex.Message,
                duration,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Handler context implementation.
    /// </summary>
    private class HandlerContext : IHandlerContext
    {
        private readonly Interfaces.ILogger _logger;

        public string PluginId { get; }
        public string SequenceId { get; }
        public string CorrelationId { get; }
        public object? Data { get; }
        public Dictionary<string, object?> Payload { get; }
        public Interfaces.ILogger Logger => _logger;
        public IConductor Conductor { get; }

        public HandlerContext(
            string pluginId,
            string sequenceId,
            string correlationId,
            object? data,
            Dictionary<string, object?> payload,
            IConductor conductor,
            ILogger<SequenceExecutor> logger)
        {
            PluginId = pluginId;
            SequenceId = sequenceId;
            CorrelationId = correlationId;
            Data = data;
            Payload = payload;
            Conductor = conductor;
            _logger = new LoggerAdapter(logger);
        }
    }

    /// <summary>
    /// Handle sequence cancellation
    /// </summary>
    public void CancelExecution(string requestId)
    {
        _logger.LogInformation("🛑 SequenceExecutor: Cancelling sequence execution (RequestId={RequestId})", requestId);

        if (_logger.IsEnabled(LogLevel.Debug))
        {
            _logger.LogDebug("🛑 SequenceExecutor: Cancellation details - RequestId: {RequestId}, Timestamp: {Timestamp}", requestId, DateTime.UtcNow);
        }
    }

    /// <summary>
    /// Adapter to convert ILogger<T> to ILogger.
    /// </summary>
    private class LoggerAdapter : Interfaces.ILogger
    {
        private readonly ILogger<SequenceExecutor> _logger;

        public LoggerAdapter(ILogger<SequenceExecutor> logger)
        {
            _logger = logger;
        }

        public void Log(string message) => _logger.LogInformation(message);
        public void Info(string message) => _logger.LogInformation(message);
        public void Warn(string message) => _logger.LogWarning(message);
        public void Error(string message, Exception? ex = null) => _logger.LogError(ex, message);
    }
}

