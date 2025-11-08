namespace MusicalConductor.Core.Interfaces;

/// <summary>
/// Plugin metadata.
/// </summary>
public class PluginMetadata
{
    /// <summary>
    /// Unique plugin identifier.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Plugin name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Plugin version.
    /// </summary>
    public required string Version { get; set; }

    /// <summary>
    /// Plugin description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Plugin author.
    /// </summary>
    public string? Author { get; set; }
}

/// <summary>
/// Represents a handler that can be called by beats.
/// </summary>
public interface IHandler
{
    /// <summary>
    /// Handler name.
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Execute the handler.
    /// </summary>
    /// <param name=\"context\">Handler context</param>
    /// <param name=\"data\">Beat data</param>
    Task Execute(IHandlerContext context, object? data);
}

/// <summary>
/// Plugin interface for CIA-compliant plugins.
/// </summary>
public interface IPlugin
{
    /// <summary>
    /// Get plugin metadata.
    /// </summary>
    PluginMetadata GetMetadata();

    /// <summary>
    /// Initialize the plugin.
    /// </summary>
    /// <param name=\"conductor\">Conductor instance</param>
    Task Initialize(IConductor conductor);

    /// <summary>
    /// Get all handlers provided by this plugin.
    /// </summary>
    /// <returns>Dictionary of handler name to handler</returns>
    Dictionary<string, IHandler> GetHandlers();

    /// <summary>
    /// Get all sequences provided by this plugin.
    /// </summary>
    /// <returns>Collection of sequences</returns>
    IEnumerable<ISequence> GetSequences();

    /// <summary>
    /// Cleanup the plugin.
    /// </summary>
    Task Cleanup();
}

/// <summary>
/// Plugin manager for registering and managing plugins.
/// </summary>
public interface IPluginManager
{
    /// <summary>
    /// Register a plugin.
    /// </summary>
    /// <param name=\"plugin\">Plugin to register</param>
    Task Register(IPlugin plugin);

    /// <summary>
    /// Unregister a plugin.
    /// </summary>
    /// <param name=\"pluginId\">ID of plugin to unregister</param>
    Task Unregister(string pluginId);

    /// <summary>
    /// Get a plugin by ID.
    /// </summary>
    /// <param name=\"pluginId\">ID of plugin</param>
    /// <returns>Plugin or null if not found</returns>
    IPlugin? Get(string pluginId);

    /// <summary>
    /// Check if a plugin is registered.
    /// </summary>
    /// <param name=\"pluginId\">ID of plugin</param>
    /// <returns>True if registered</returns>
    bool Has(string pluginId);

    /// <summary>
    /// Get all registered plugins.
    /// </summary>
    /// <returns>Collection of plugins</returns>
    IEnumerable<IPlugin> GetAll();

    /// <summary>
    /// Get a handler from a plugin.
    /// </summary>
    /// <param name=\"pluginId\">ID of plugin</param>
    /// <param name=\"handlerName\">Name of handler</param>
    /// <returns>Handler or null if not found</returns>
    IHandler? GetHandler(string pluginId, string handlerName);
}

