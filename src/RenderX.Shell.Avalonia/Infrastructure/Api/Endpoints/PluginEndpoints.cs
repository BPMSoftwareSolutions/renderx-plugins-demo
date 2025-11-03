using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Services;
using System;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Endpoints;

/// <summary>
/// Plugin discovery API endpoints
/// </summary>
public static class PluginEndpoints
{
    /// <summary>
    /// Register plugin endpoints with the application
    /// </summary>
    public static void MapPluginEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/plugins")
            .WithName("Plugins");

        group.MapGet("/", DiscoverPlugins)
            .WithName("DiscoverPlugins");

        group.MapGet("/{pluginId}", GetPlugin)
            .WithName("GetPlugin");

        group.MapPost("/{pluginId}/enable", EnablePlugin)
            .WithName("EnablePlugin");

        group.MapPost("/{pluginId}/disable", DisablePlugin)
            .WithName("DisablePlugin");
    }

    private static async Task<IResult> DiscoverPlugins(
        IPluginDiscoveryService pluginService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Discovering plugins...");
            var result = await pluginService.DiscoverPluginsAsync();
            logger.LogInformation("Discovered {PluginCount} plugins", result.TotalCount);
            return Results.Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error discovering plugins");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetPlugin(
        string pluginId,
        IPluginDiscoveryService pluginService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Getting plugin: {PluginId}", pluginId);
            var plugin = await pluginService.GetPluginAsync(pluginId);

            if (plugin == null)
            {
                logger.LogWarning("Plugin not found: {PluginId}", pluginId);
                return Results.NotFound();
            }

            return Results.Ok(plugin);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting plugin {PluginId}", pluginId);
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> EnablePlugin(
        string pluginId,
        IPluginDiscoveryService pluginService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Enabling plugin: {PluginId}", pluginId);
            var plugin = await pluginService.SetPluginEnabledAsync(pluginId, true);

            if (plugin == null)
            {
                return Results.NotFound();
            }

            return Results.Ok(plugin);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error enabling plugin {PluginId}", pluginId);
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> DisablePlugin(
        string pluginId,
        IPluginDiscoveryService pluginService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Disabling plugin: {PluginId}", pluginId);
            var plugin = await pluginService.SetPluginEnabledAsync(pluginId, false);

            if (plugin == null)
            {
                return Results.NotFound();
            }

            return Results.Ok(plugin);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error disabling plugin {PluginId}", pluginId);
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}
