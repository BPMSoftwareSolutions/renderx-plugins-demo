using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core;

/// <summary>
/// Plugin manager for registering and managing plugins.
/// </summary>
public class PluginManager : IPluginManager
{
    private readonly Dictionary<string, IPlugin> _plugins = new();
    private readonly Dictionary<string, Dictionary<string, IHandler>> _handlers = new();
    private readonly ReaderWriterLockSlim _lock = new();
    private readonly ILogger<PluginManager> _logger;

    public PluginManager(ILogger<PluginManager> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Register(IPlugin plugin)
    {
        if (plugin == null)
            throw new ArgumentNullException(nameof(plugin));

        var metadata = plugin.GetMetadata();
        if (string.IsNullOrEmpty(metadata.Id))
            throw new ArgumentException("Plugin ID cannot be empty", nameof(plugin));

        _lock.EnterWriteLock();
        try
        {
            if (_plugins.ContainsKey(metadata.Id))
            {
                _logger.LogWarning("Plugin already registered: {PluginId}", metadata.Id);
                return;
            }

            _plugins[metadata.Id] = plugin;
            _handlers[metadata.Id] = plugin.GetHandlers();

            _logger.LogInformation("Plugin registered: {PluginId} v{Version}", metadata.Id, metadata.Version);
        }
        finally
        {
            _lock.ExitWriteLock();
        }

        // Initialize plugin
        try
        {
            await plugin.Initialize(null!); // TODO: Pass conductor instance
            _logger.LogInformation("Plugin initialized: {PluginId}", metadata.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing plugin: {PluginId}", metadata.Id);
            throw;
        }
    }

    public async Task Unregister(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        IPlugin? plugin = null;

        _lock.EnterWriteLock();
        try
        {
            if (_plugins.TryGetValue(pluginId, out var p))
            {
                plugin = p;
                _plugins.Remove(pluginId);
                _handlers.Remove(pluginId);
                _logger.LogInformation("Plugin unregistered: {PluginId}", pluginId);
            }
        }
        finally
        {
            _lock.ExitWriteLock();
        }

        if (plugin != null)
        {
            try
            {
                await plugin.Cleanup();
                _logger.LogInformation("Plugin cleaned up: {PluginId}", pluginId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up plugin: {PluginId}", pluginId);
            }
        }
    }

    public IPlugin? Get(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        _lock.EnterReadLock();
        try
        {
            return _plugins.TryGetValue(pluginId, out var plugin) ? plugin : null;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public bool Has(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        _lock.EnterReadLock();
        try
        {
            return _plugins.ContainsKey(pluginId);
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public IEnumerable<IPlugin> GetAll()
    {
        _lock.EnterReadLock();
        try
        {
            return _plugins.Values.ToList();
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    public IHandler? GetHandler(string pluginId, string handlerName)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));
        if (string.IsNullOrEmpty(handlerName))
            throw new ArgumentNullException(nameof(handlerName));

        _lock.EnterReadLock();
        try
        {
            if (_handlers.TryGetValue(pluginId, out var pluginHandlers))
            {
                return pluginHandlers.TryGetValue(handlerName, out var handler) ? handler : null;
            }

            return null;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}

