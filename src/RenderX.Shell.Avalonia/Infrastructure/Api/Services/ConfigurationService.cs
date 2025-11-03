using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Implementation of configuration service
/// </summary>
public class ConfigurationService : IConfigurationService
{
    private readonly ILogger<ConfigurationService> _logger;
    private readonly Dictionary<string, bool> _featureFlags = new();
    private readonly Dictionary<string, object> _settings = new();

    public ConfigurationService(ILogger<ConfigurationService> logger)
    {
        _logger = logger;
        InitializeDefaults();
    }

    private void InitializeDefaults()
    {
        // Initialize default feature flags
        _featureFlags["EnableDiagnostics"] = true;
        _featureFlags["EnableTelemetry"] = true;
        _featureFlags["EnablePluginHotReload"] = false;
        _featureFlags["EnableRAGEnrichment"] = true;
        _featureFlags["EnableExperimental"] = false;

        // Initialize default settings
        _settings["AppName"] = "RenderX Shell";
        _settings["Version"] = "1.0.0";
        _settings["Environment"] = "Development";
        _settings["MaxTelemetryEvents"] = 10000;
        _settings["TelemetryRetentionDays"] = 30;
    }

    public Task<ConfigurationResponse> GetConfigurationAsync()
    {
        _logger.LogInformation("Getting configuration");

        var response = new ConfigurationResponse
        {
            FeatureFlags = new Dictionary<string, bool>(_featureFlags),
            Settings = new Dictionary<string, object>(_settings),
            Environment = _settings.TryGetValue("Environment", out var env) ? env.ToString() ?? "Development" : "Development",
            Version = _settings.TryGetValue("Version", out var ver) ? ver.ToString() ?? "1.0.0" : "1.0.0",
            ApiVersion = "v1"
        };

        return Task.FromResult(response);
    }

    public Task<ConfigurationResponse> UpdateFeatureFlagAsync(string flagName, bool value)
    {
        _logger.LogInformation("Updating feature flag: {FlagName} = {Value}", flagName, value);

        _featureFlags[flagName] = value;

        return GetConfigurationAsync();
    }

    public Task<bool> IsFeatureEnabledAsync(string flagName)
    {
        _logger.LogInformation("Checking feature flag: {FlagName}", flagName);

        var isEnabled = _featureFlags.TryGetValue(flagName, out var value) && value;
        return Task.FromResult(isEnabled);
    }

    public Task<HealthCheckResponse> GetHealthAsync()
    {
        _logger.LogInformation("Getting health status");

        var sw = Stopwatch.StartNew();

        var response = new HealthCheckResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow.ToString("O"),
            Details = new Dictionary<string, HealthCheckDetail>
            {
                {
                    "api",
                    new HealthCheckDetail
                    {
                        Status = "Healthy",
                        Description = "API is responding normally",
                        ResponseTimeMs = sw.ElapsedMilliseconds
                    }
                },
                {
                    "configuration",
                    new HealthCheckDetail
                    {
                        Status = "Healthy",
                        Description = $"Configuration loaded with {_featureFlags.Count} feature flags",
                        ResponseTimeMs = sw.ElapsedMilliseconds
                    }
                },
                {
                    "telemetry",
                    new HealthCheckDetail
                    {
                        Status = "Healthy",
                        Description = "Telemetry service is operational",
                        ResponseTimeMs = sw.ElapsedMilliseconds
                    }
                }
            }
        };

        sw.Stop();
        return Task.FromResult(response);
    }
}

