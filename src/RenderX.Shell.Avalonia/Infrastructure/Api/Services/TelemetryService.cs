using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Implementation of telemetry service
/// </summary>
public class TelemetryService : ITelemetryService
{
    private readonly ILogger<TelemetryService> _logger;
    private readonly List<TelemetryEventRequest> _events = new();
    private readonly object _lockObject = new();

    public TelemetryService(ILogger<TelemetryService> logger)
    {
        _logger = logger;
    }

    public Task<TelemetryResponse> RecordEventAsync(TelemetryEventRequest request)
    {
        _logger.LogInformation(
            "Recording telemetry event: {EventType} from {Source}",
            request.EventType,
            request.Source);

        lock (_lockObject)
        {
            _events.Add(request);
        }

        var response = new TelemetryResponse
        {
            Success = true,
            Message = "Event recorded successfully",
            RecordId = Guid.NewGuid().ToString()
        };

        return Task.FromResult(response);
    }

    public Task<TelemetryResponse> RecordBatchAsync(BatchTelemetryRequest request)
    {
        _logger.LogInformation(
            "Recording batch of {EventCount} telemetry events for session {SessionId}",
            request.Events.Count,
            request.SessionId);

        lock (_lockObject)
        {
            _events.AddRange(request.Events);
        }

        var response = new TelemetryResponse
        {
            Success = true,
            Message = $"Batch of {request.Events.Count} events recorded successfully",
            RecordId = Guid.NewGuid().ToString()
        };

        return Task.FromResult(response);
    }

    public Task<List<TelemetryEventRequest>> GetSessionEventsAsync(string sessionId, int limit = 100)
    {
        _logger.LogInformation("Getting telemetry events for session: {SessionId}", sessionId);

        lock (_lockObject)
        {
            var events = _events
                .Where(e => e.CorrelationId == sessionId)
                .OrderByDescending(e => e.Timestamp)
                .Take(limit)
                .ToList();

            return Task.FromResult(events);
        }
    }

    public Task<int> ClearOldEventsAsync(int olderThanDays = 30)
    {
        _logger.LogInformation("Clearing telemetry events older than {Days} days", olderThanDays);

        var cutoffDate = DateTime.UtcNow.AddDays(-olderThanDays);

        lock (_lockObject)
        {
            var countBefore = _events.Count;
            _events.RemoveAll(e =>
            {
                if (DateTime.TryParse(e.Timestamp, out var eventDate))
                {
                    return eventDate < cutoffDate;
                }
                return false;
            });

            var deletedCount = countBefore - _events.Count;
            _logger.LogInformation("Deleted {DeletedCount} old telemetry events", deletedCount);

            return Task.FromResult(deletedCount);
        }
    }
}

