using System.Collections.Generic;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Models;

/// <summary>
/// Response model for configuration/feature flags endpoint
/// </summary>
public class ConfigurationResponse
{
    /// <summary>
    /// Feature flags and their current state
    /// </summary>
    public Dictionary<string, bool> FeatureFlags { get; set; } = new();

    /// <summary>
    /// Application settings
    /// </summary>
    public Dictionary<string, object> Settings { get; set; } = new();

    /// <summary>
    /// Current environment (Development, Staging, Production)
    /// </summary>
    public string Environment { get; set; } = "Development";

    /// <summary>
    /// Application version
    /// </summary>
    public string Version { get; set; } = "1.0.0";

    /// <summary>
    /// API version
    /// </summary>
    public string ApiVersion { get; set; } = "v1";
}

/// <summary>
/// Request model for updating feature flags
/// </summary>
public class UpdateFeatureFlagRequest
{
    /// <summary>
    /// Feature flag name
    /// </summary>
    public string FlagName { get; set; } = string.Empty;

    /// <summary>
    /// New flag value
    /// </summary>
    public bool Value { get; set; }
}

/// <summary>
/// Response model for health check endpoint
/// </summary>
public class HealthCheckResponse
{
    /// <summary>
    /// Overall health status (Healthy, Degraded, Unhealthy)
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Detailed health information
    /// </summary>
    public Dictionary<string, HealthCheckDetail> Details { get; set; } = new();

    /// <summary>
    /// Timestamp of the health check
    /// </summary>
    public string Timestamp { get; set; } = System.DateTime.UtcNow.ToString("O");
}

/// <summary>
/// Detail about a specific health check component
/// </summary>
public class HealthCheckDetail
{
    /// <summary>
    /// Component status
    /// </summary>
    public string Status { get; set; } = "Healthy";

    /// <summary>
    /// Description of the component status
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Response time in milliseconds
    /// </summary>
    public long ResponseTimeMs { get; set; }
}

