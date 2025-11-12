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
        _logger.LogInformation("🧩 PluginManager: Initialized");
    }

    public async Task Register(IPlugin plugin)
    {
        if (plugin == null)
            throw new ArgumentNullException(nameof(plugin));

        var metadata = plugin.GetMetadata();
        if (string.IsNullOrEmpty(metadata.Id))
            throw new ArgumentException("Plugin ID cannot be empty", nameof(plugin));

        _logger.LogDebug("🧩 PluginManager: Validating manifest for plugin {PluginId}", metadata.Id);

        _lock.EnterWriteLock();
        try
        {
            if (_plugins.ContainsKey(metadata.Id))
            {
                _logger.LogWarning("⚠️ PluginManager: Plugin already registered: {PluginId}", metadata.Id);
                return;
            }

            _plugins[metadata.Id] = plugin;
            _handlers[metadata.Id] = plugin.GetHandlers();

            _logger.LogInformation("🧩 PluginManager: Plugin registered: {PluginId} v{Version}", metadata.Id, metadata.Version);
        }
        finally
        {
            _lock.ExitWriteLock();
        }

        // Initialize plugin
        try
        {
            _logger.LogDebug("🧩 PluginManager: Starting lifecycle for plugin {PluginId}", metadata.Id);
            await plugin.Initialize(null!); // TODO: Pass conductor instance
            _logger.LogInformation("🧩 PluginManager: Plugin lifecycle started: {PluginId}", metadata.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ PluginManager: Error initializing plugin: {PluginId} (Reason={Reason})", metadata.Id, ex.Message);
            throw;
        }
    }

    public async Task Unregister(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        IPlugin? plugin = null;

        _logger.LogDebug("🧩 PluginManager: Stopping lifecycle for plugin {PluginId}", pluginId);

        _lock.EnterWriteLock();
        try
        {
            if (_plugins.TryGetValue(pluginId, out var p))
            {
                plugin = p;
                _plugins.Remove(pluginId);
                _handlers.Remove(pluginId);
                _logger.LogInformation("🧩 PluginManager: Plugin deregistered: {PluginId}", pluginId);
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
                _logger.LogInformation("🧩 PluginManager: Plugin lifecycle stopped: {PluginId}", pluginId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ PluginManager: Error stopping plugin: {PluginId} (Reason={Reason})", pluginId, ex.Message);
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
            var plugins = _plugins.Values.ToList();
            _logger.LogDebug("🧩 PluginManager: Retrieved {PluginCount} registered plugins", plugins.Count);

            if (_logger.IsEnabled(LogLevel.Trace))
            {
                var pluginNames = string.Join(", ", plugins.Select(p => p.Id));
                _logger.LogTrace("🧩 PluginManager: Plugin details - Names: {PluginNames}", pluginNames);
            }

            return plugins;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    /// <summary>
    /// Get a specific plugin by ID
    /// </summary>
    public IPlugin? Get(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        _lock.EnterReadLock();
        try
        {
            if (_plugins.TryGetValue(pluginId, out var plugin))
            {
                _logger.LogDebug("🧩 PluginManager: Retrieved plugin {PluginId}", pluginId);
                return plugin;
            }

            _logger.LogWarning("⚠️ PluginManager: Plugin not found: {PluginId}", pluginId);
            return null;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    /// <summary>
    /// Check if a plugin is registered
    /// </summary>
    public bool IsRegistered(string pluginId)
    {
        if (string.IsNullOrEmpty(pluginId))
            throw new ArgumentNullException(nameof(pluginId));

        _lock.EnterReadLock();
        try
        {
            var isRegistered = _plugins.ContainsKey(pluginId);
            _logger.LogDebug("🧩 PluginManager: Plugin {PluginId} registration status: {IsRegistered}", pluginId, isRegistered);
            return isRegistered;
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

