using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Service for collecting and managing telemetry data
/// </summary>
public interface ITelemetryService
{
    /// <summary>
    /// Record a single telemetry event
    /// </summary>
    /// <param name="request">The telemetry event to record</param>
    /// <returns>Response indicating success and record ID</returns>
    Task<TelemetryResponse> RecordEventAsync(TelemetryEventRequest request);

    /// <summary>
    /// Record multiple telemetry events in a batch
    /// </summary>
    /// <param name="request">Batch request containing multiple events</param>
    /// <returns>Response indicating success</returns>
    Task<TelemetryResponse> RecordBatchAsync(BatchTelemetryRequest request);

    /// <summary>
    /// Get telemetry events for a specific session
    /// </summary>
    /// <param name="sessionId">The session identifier</param>
    /// <param name="limit">Maximum number of events to return</param>
    /// <returns>List of telemetry events</returns>
    Task<List<TelemetryEventRequest>> GetSessionEventsAsync(string sessionId, int limit = 100);

    /// <summary>
    /// Clear old telemetry data
    /// </summary>
    /// <param name="olderThanDays">Delete events older than this many days</param>
    /// <returns>Number of records deleted</returns>
    Task<int> ClearOldEventsAsync(int olderThanDays = 30);
}

