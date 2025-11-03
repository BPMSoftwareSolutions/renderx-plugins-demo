using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Implementation of plugin discovery service
/// </summary>
public class PluginDiscoveryService : IPluginDiscoveryService
{
    private readonly ILogger<PluginDiscoveryService> _logger;
    private readonly Dictionary<string, PluginInfo> _plugins = new();

    public PluginDiscoveryService(ILogger<PluginDiscoveryService> logger)
    {
        _logger = logger;
        InitializeDefaultPlugins();
    }

    /// <summary>
    /// Initialize with default plugins for demonstration
    /// </summary>
    private void InitializeDefaultPlugins()
    {
        _plugins["library"] = new PluginInfo
        {
            Id = "library",
            Name = "Library Plugin",
            Version = "1.0.0",
            Description = "Component library browser and manager",
            IsEnabled = true
        };

        _plugins["canvas-component"] = new PluginInfo
        {
            Id = "canvas-component",
            Name = "Canvas Component",
            Version = "1.0.0",
            Description = "Canvas drawing and manipulation",
            IsEnabled = true
        };

        _plugins["control-panel"] = new PluginInfo
        {
            Id = "control-panel",
            Name = "Control Panel",
            Version = "1.0.0",
            Description = "Property editing and control panel",
            IsEnabled = true
        };

        _plugins["header"] = new PluginInfo
        {
            Id = "header",
            Name = "Header Plugin",
            Version = "1.0.0",
            Description = "Application header and theme management",
            IsEnabled = true
        };
    }

    public Task<PluginDiscoveryResponse> DiscoverPluginsAsync()
    {
        _logger.LogInformation("Discovering plugins. Total: {Count}", _plugins.Count);

        var response = new PluginDiscoveryResponse
        {
            Plugins = _plugins.Values.ToList(),
            TotalCount = _plugins.Count,
            DiscoveredAt = DateTime.UtcNow.ToString("O")
        };

        return Task.FromResult(response);
    }

    public Task<PluginInfo?> GetPluginAsync(string pluginId)
    {
        _logger.LogInformation("Getting plugin: {PluginId}", pluginId);

        if (_plugins.TryGetValue(pluginId, out var plugin))
        {
            return Task.FromResult<PluginInfo?>(plugin);
        }

        _logger.LogWarning("Plugin not found: {PluginId}", pluginId);
        return Task.FromResult<PluginInfo?>(null);
    }

    public Task<PluginInfo?> SetPluginEnabledAsync(string pluginId, bool enabled)
    {
        _logger.LogInformation("Setting plugin {PluginId} enabled={Enabled}", pluginId, enabled);

        if (_plugins.TryGetValue(pluginId, out var plugin))
        {
            plugin.IsEnabled = enabled;
            return Task.FromResult<PluginInfo?>(plugin);
        }

        _logger.LogWarning("Plugin not found: {PluginId}", pluginId);
        return Task.FromResult<PluginInfo?>(null);
    }
}

