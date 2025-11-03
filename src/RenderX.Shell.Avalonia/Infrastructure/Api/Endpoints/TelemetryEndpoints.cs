using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using RenderX.Shell.Avalonia.Infrastructure.Api.Services;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Endpoints;

/// <summary>
/// Telemetry API endpoints for collecting frontend events
/// </summary>
public static class TelemetryEndpoints
{
    /// <summary>
    /// Register telemetry endpoints with the application
    /// </summary>
    public static void MapTelemetryEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/telemetry")
            .WithName("Telemetry");

        group.MapPost("/event", RecordEvent)
            .WithName("RecordEvent");

        group.MapPost("/batch", RecordBatch)
            .WithName("RecordBatch");

        group.MapGet("/session/{sessionId}", GetSessionEvents)
            .WithName("GetSessionEvents");

        group.MapPost("/clear", ClearOldEvents)
            .WithName("ClearOldEvents");
    }

    private static async Task<IResult> RecordEvent(
        TelemetryEventRequest request,
        ITelemetryService telemetryService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Recording telemetry event: {EventType}", request.EventType);
            var response = await telemetryService.RecordEventAsync(request);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error recording telemetry event");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> RecordBatch(
        BatchTelemetryRequest request,
        ITelemetryService telemetryService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Recording batch of {EventCount} telemetry events", request.Events.Count);
            var response = await telemetryService.RecordBatchAsync(request);
            return Results.Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error recording batch telemetry");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetSessionEvents(
        string sessionId,
        ITelemetryService telemetryService,
        ILogger<Program> logger,
        int limit = 100)
    {
        try
        {
            logger.LogInformation("Getting telemetry events for session: {SessionId}", sessionId);
            var events = await telemetryService.GetSessionEventsAsync(sessionId, limit);
            return Results.Ok(events);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting session events");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> ClearOldEvents(
        ITelemetryService telemetryService,
        ILogger<Program> logger,
        int olderThanDays = 30)
    {
        try
        {
            logger.LogInformation("Clearing telemetry events older than {Days} days", olderThanDays);
            var deletedCount = await telemetryService.ClearOldEventsAsync(olderThanDays);
            return Results.Ok(new { DeletedCount = deletedCount });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error clearing old telemetry events");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}
