using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using RenderX.Shell.Avalonia.Infrastructure.Bridge;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Endpoints
{
    /// <summary>
    /// Sequence and bridge endpoints for invoking frontend conductor and publishing events.
    /// </summary>
    public static class SequenceEndpoints
    {
        public static void MapSequenceEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var group = endpoints.MapGroup("/api/sequences").WithName("Sequences");

            group.MapPost("/execute", ExecuteSequence).WithName("ExecuteSequence");
            group.MapPost("/publish", PublishToFrontend).WithName("PublishToFrontend");
        }

        private static async Task<IResult> ExecuteSequence(
            SequenceExecuteRequest request,
            IWebViewBridgeService bridge,
            ILogger<Program> logger)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PluginId) || string.IsNullOrWhiteSpace(request.SequenceId))
                {
                    return Results.BadRequest(new BridgeResponse { Success = false, Error = "pluginId and sequenceId are required" });
                }

                await bridge.ExecuteSequenceAsync(request.PluginId, request.SequenceId, request.Payload);
                return Results.Ok(new BridgeResponse { Success = true });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error executing sequence {PluginId}.{SequenceId}", request.PluginId, request.SequenceId);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        private static async Task<IResult> PublishToFrontend(
            PublishRequest request,
            IWebViewBridgeService bridge,
            ILogger<Program> logger)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Topic))
                {
                    return Results.BadRequest(new BridgeResponse { Success = false, Error = "topic is required" });
                }

                await bridge.PublishToEventRouterAsync(request.Topic, request.Payload);
                return Results.Ok(new BridgeResponse { Success = true });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error publishing to frontend EventRouter for topic {Topic}", request.Topic);
                return Results.StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}

