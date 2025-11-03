using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Service for managing application configuration and feature flags
/// </summary>
public interface IConfigurationService
{
    /// <summary>
    /// Get current configuration including feature flags and settings
    /// </summary>
    /// <returns>Current configuration</returns>
    Task<ConfigurationResponse> GetConfigurationAsync();

    /// <summary>
    /// Update a feature flag value
    /// </summary>
    /// <param name="flagName">Name of the feature flag</param>
    /// <param name="value">New value for the flag</param>
    /// <returns>Updated configuration</returns>
    Task<ConfigurationResponse> UpdateFeatureFlagAsync(string flagName, bool value);

    /// <summary>
    /// Check if a specific feature flag is enabled
    /// </summary>
    /// <param name="flagName">Name of the feature flag</param>
    /// <returns>True if enabled, false otherwise</returns>
    Task<bool> IsFeatureEnabledAsync(string flagName);

    /// <summary>
    /// Get health status of the application
    /// </summary>
    /// <returns>Health check response</returns>
    Task<HealthCheckResponse> GetHealthAsync();
}

