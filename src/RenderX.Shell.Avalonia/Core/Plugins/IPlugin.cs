using Avalonia.Controls;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Core.Events;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Plugins;

/// <summary>
/// Base interface for all RenderX plugins
/// </summary>
public interface IPlugin
{
    /// <summary>
    /// Unique plugin identifier
    /// </summary>
    string PluginId { get; }

    /// <summary>
    /// Plugin version
    /// </summary>
    string Version { get; }

    /// <summary>
    /// Plugin display name
    /// </summary>
    string DisplayName { get; }

    /// <summary>
    /// Plugin description
    /// </summary>
    string Description { get; }

    /// <summary>
    /// Initialize the plugin with core services
    /// </summary>
    /// <param name="conductor">Conductor instance</param>
    /// <param name="eventRouter">Event router instance</param>
    /// <param name="services">Service provider</param>
    Task InitializeAsync(IConductor conductor, IEventRouter eventRouter, IServiceProvider services);

    /// <summary>
    /// Get all sequence handlers provided by this plugin
    /// </summary>
    IEnumerable<ISequenceHandler> GetSequenceHandlers();

    /// <summary>
    /// Create the UI component for this plugin (if applicable)
    /// </summary>
    /// <returns>UI control or null if plugin has no UI</returns>
    UserControl? CreateUI();

    /// <summary>
    /// Shutdown the plugin gracefully
    /// </summary>
    Task ShutdownAsync();
}

/// <summary>
/// Plugin metadata
/// </summary>
public record PluginMetadata
{
    public string Id { get; init; } = string.Empty;
    public string Version { get; init; } = string.Empty;
    public string DisplayName { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string AssemblyPath { get; init; } = string.Empty;
    public string[] Dependencies { get; init; } = Array.Empty<string>();
    public PluginUIDefinition? UI { get; init; }
    public PluginRuntimeDefinition? Runtime { get; init; }
}

/// <summary>
/// Plugin UI definition
/// </summary>
public record PluginUIDefinition
{
    public string Slot { get; init; } = string.Empty;
    public string Module { get; init; } = string.Empty;
    public string Export { get; init; } = string.Empty;
}

/// <summary>
/// Plugin runtime definition
/// </summary>
public record PluginRuntimeDefinition
{
    public string Module { get; init; } = string.Empty;
    public string Export { get; init; } = string.Empty;
}

/// <summary>
/// Plugin manager interface
/// </summary>
public interface IPluginManager
{
    /// <summary>
    /// Discover plugins in the configured directory
    /// </summary>
    Task<IEnumerable<PluginMetadata>> DiscoverPluginsAsync();

    /// <summary>
    /// Load a plugin from the specified path
    /// </summary>
    /// <param name="pluginPath">Path to plugin assembly</param>
    Task<IPlugin> LoadPluginAsync(string pluginPath);

    /// <summary>
    /// Register a plugin with the system
    /// </summary>
    /// <param name="plugin">Plugin instance</param>
    Task RegisterPluginAsync(IPlugin plugin);

    /// <summary>
    /// Unload a plugin (for hot-reloading)
    /// </summary>
    /// <param name="pluginId">Plugin identifier</param>
    Task UnloadPluginAsync(string pluginId);

    /// <summary>
    /// Get all loaded plugins
    /// </summary>
    IEnumerable<IPlugin> GetLoadedPlugins();

    /// <summary>
    /// Get a specific plugin by ID
    /// </summary>
    /// <param name="pluginId">Plugin identifier</param>
    IPlugin? GetPlugin(string pluginId);

    /// <summary>
    /// Get plugin for a specific UI slot
    /// </summary>
    /// <param name="slotName">Slot name</param>
    Task<IPlugin?> GetPluginForSlotAsync(string slotName);
}
