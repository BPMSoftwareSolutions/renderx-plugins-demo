using RenderX.Shell.Avalonia.Infrastructure.Api.Models;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Infrastructure.Api.Services;

/// <summary>
/// Service for discovering and managing plugins
/// </summary>
public interface IPluginDiscoveryService
{
    /// <summary>
    /// Discover all available plugins
    /// </summary>
    /// <returns>Plugin discovery response with list of plugins</returns>
    Task<PluginDiscoveryResponse> DiscoverPluginsAsync();

    /// <summary>
    /// Get a specific plugin by ID
    /// </summary>
    /// <param name="pluginId">The plugin identifier</param>
    /// <returns>Plugin information or null if not found</returns>
    Task<PluginInfo?> GetPluginAsync(string pluginId);

    /// <summary>
    /// Enable or disable a plugin
    /// </summary>
    /// <param name="pluginId">The plugin identifier</param>
    /// <param name="enabled">Whether to enable or disable</param>
    /// <returns>Updated plugin information</returns>
    Task<PluginInfo?> SetPluginEnabledAsync(string pluginId, bool enabled);
}

