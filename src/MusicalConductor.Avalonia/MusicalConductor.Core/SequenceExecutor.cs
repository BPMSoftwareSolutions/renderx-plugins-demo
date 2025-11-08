using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

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

        try
        {
            _logger.LogInformation(
                "Starting sequence execution: {SequenceId} (request: {RequestId})",
                sequence.Id,
                requestId);

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

            foreach (var beat in beats)
            {
                try
                {
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
                            // Create handler context
                            var handlerContext = new HandlerContext(
                                pluginId,
                                sequence.Id,
                                requestId,
                                context,
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
                    _logger.LogError(ex, "Error executing beat: {BeatId}", beat.Id);

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
                "Sequence execution completed: {SequenceId} ({SuccessfulBeats}/{TotalBeats} beats, {Duration}ms)",
                sequence.Id,
                successfulBeats,
                beats.Count,
                duration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing sequence: {SequenceId}", sequence.Id);

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
        public Interfaces.ILogger Logger => _logger;
        public IConductor Conductor { get; }

        public HandlerContext(
            string pluginId,
            string sequenceId,
            string correlationId,
            object? data,
            IConductor conductor,
            ILogger<SequenceExecutor> logger)
        {
            PluginId = pluginId;
            SequenceId = sequenceId;
            CorrelationId = correlationId;
            Data = data;
            Conductor = conductor;
            _logger = new LoggerAdapter(logger);
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

