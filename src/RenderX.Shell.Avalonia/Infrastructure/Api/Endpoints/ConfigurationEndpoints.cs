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
/// Configuration and feature flags API endpoints
/// </summary>
public static class ConfigurationEndpoints
{
    /// <summary>
    /// Register configuration endpoints with the application
    /// </summary>
    public static void MapConfigurationEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/config")
            .WithName("Configuration");

        group.MapGet("/", GetConfiguration)
            .WithName("GetConfiguration");

        group.MapPost("/feature-flags/{flagName}", UpdateFeatureFlag)
            .WithName("UpdateFeatureFlag");

        group.MapGet("/feature-flags/{flagName}", IsFeatureEnabled)
            .WithName("IsFeatureEnabled");

        group.MapGet("/health", GetHealth)
            .WithName("GetHealth");
    }

    private static async Task<IResult> GetConfiguration(
        IConfigurationService configService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Getting configuration");
            var config = await configService.GetConfigurationAsync();
            return Results.Ok(config);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting configuration");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> UpdateFeatureFlag(
        string flagName,
        UpdateFeatureFlagRequest request,
        IConfigurationService configService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Updating feature flag: {FlagName} = {Value}", flagName, request.Value);
            var config = await configService.UpdateFeatureFlagAsync(flagName, request.Value);
            return Results.Ok(config);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating feature flag {FlagName}", flagName);
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> IsFeatureEnabled(
        string flagName,
        IConfigurationService configService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Checking feature flag: {FlagName}", flagName);
            var isEnabled = await configService.IsFeatureEnabledAsync(flagName);
            return Results.Ok(new { FlagName = flagName, IsEnabled = isEnabled });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking feature flag {FlagName}", flagName);
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<IResult> GetHealth(
        IConfigurationService configService,
        ILogger<Program> logger)
    {
        try
        {
            logger.LogInformation("Getting health status");
            var health = await configService.GetHealthAsync();
            
            // Return appropriate status code based on health
            var statusCode = health.Status switch
            {
                "Healthy" => StatusCodes.Status200OK,
                "Degraded" => StatusCodes.Status200OK,
                _ => StatusCodes.Status503ServiceUnavailable
            };

            return Results.Json(health, statusCode: statusCode);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting health status");
            return Results.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}

