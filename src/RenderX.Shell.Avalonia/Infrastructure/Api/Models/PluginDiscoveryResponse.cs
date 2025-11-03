using System.Collections.Generic;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Models;

/// <summary>
/// Response model for plugin discovery endpoint.
/// Contains metadata about available plugins and their manifests.
/// </summary>
public class PluginDiscoveryResponse
{
    /// <summary>
    /// List of discovered plugins with their manifests
    /// </summary>
    public List<PluginInfo> Plugins { get; set; } = new();

    /// <summary>
    /// Total number of plugins discovered
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Timestamp when discovery was performed
    /// </summary>
    public string DiscoveredAt { get; set; } = System.DateTime.UtcNow.ToString("O");
}

/// <summary>
/// Information about a single plugin
/// </summary>
public class PluginInfo
{
    /// <summary>
    /// Unique plugin identifier
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Plugin display name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Plugin version
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// Plugin description
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Full plugin manifest as JSON object
    /// </summary>
    public object? Manifest { get; set; }

    /// <summary>
    /// Whether the plugin is currently enabled
    /// </summary>
    public bool IsEnabled { get; set; } = true;
}

