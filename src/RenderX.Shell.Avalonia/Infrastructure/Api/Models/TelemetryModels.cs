using System;
using System.Collections.Generic;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Models;

/// <summary>
/// Request model for logging telemetry events from the TypeScript frontend
/// </summary>
public class TelemetryEventRequest
{
    /// <summary>
    /// Event type/name
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Event severity level (Debug, Info, Warning, Error)
    /// </summary>
    public string Level { get; set; } = "Info";

    /// <summary>
    /// Event message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Additional event data/context
    /// </summary>
    public Dictionary<string, object>? Data { get; set; }

    /// <summary>
    /// Timestamp when event occurred (ISO 8601)
    /// </summary>
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("O");

    /// <summary>
    /// Source component that generated the event
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    /// Correlation ID for tracing related events
    /// </summary>
    public string? CorrelationId { get; set; }
}

/// <summary>
/// Response model for telemetry submission
/// </summary>
public class TelemetryResponse
{
    /// <summary>
    /// Whether the telemetry was successfully recorded
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Message describing the result
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// ID assigned to the telemetry record
    /// </summary>
    public string? RecordId { get; set; }
}

/// <summary>
/// Request model for batch telemetry submission
/// </summary>
public class BatchTelemetryRequest
{
    /// <summary>
    /// List of telemetry events to submit
    /// </summary>
    public List<TelemetryEventRequest> Events { get; set; } = new();

    /// <summary>
    /// Session ID for grouping related events
    /// </summary>
    public string? SessionId { get; set; }
}

