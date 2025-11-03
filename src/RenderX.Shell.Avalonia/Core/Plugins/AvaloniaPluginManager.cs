using Avalonia.Controls;
using Microsoft.Extensions.Logging;
using RenderX.Shell.Avalonia.Core.Conductor;
using RenderX.Shell.Avalonia.Core.Events;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading.Tasks;

namespace RenderX.Shell.Avalonia.Core.Plugins;

/// <summary>
/// Avalonia implementation of the Plugin Manager
/// </summary>
public class AvaloniaPluginManager : IPluginManager
{
    private readonly ILogger<AvaloniaPluginManager> _logger;
    private readonly ConcurrentDictionary<string, IPlugin> _loadedPlugins;
    private readonly ConcurrentDictionary<string, PluginLoadContext> _loadContexts;

    public AvaloniaPluginManager(ILogger<AvaloniaPluginManager> logger)
    {
        _logger = logger;
        _loadedPlugins = new ConcurrentDictionary<string, IPlugin>();
        _loadContexts = new ConcurrentDictionary<string, PluginLoadContext>();
    }

    public async Task<IEnumerable<PluginMetadata>> DiscoverPluginsAsync()
    {
        _logger.LogInformation("Discovering plugins...");
        
        // TODO: Implement plugin discovery from configured directory
        // This will be implemented in task 1.4
        
        // For now, return empty list
        return Enumerable.Empty<PluginMetadata>();
    }

    public async Task<IPlugin> LoadPluginAsync(string pluginPath)
    {
        _logger.LogInformation("Loading plugin from {PluginPath}", pluginPath);

        try
        {
            var loadContext = new PluginLoadContext(pluginPath);
            var assembly = loadContext.LoadFromAssemblyPath(pluginPath);

            // Find plugin entry point
            var pluginType = assembly.GetTypes()
                .FirstOrDefault(t => typeof(IPlugin).IsAssignableFrom(t) && !t.IsAbstract);

            if (pluginType == null)
                throw new InvalidOperationException($"No plugin implementation found in {pluginPath}");

            var plugin = (IPlugin)Activator.CreateInstance(pluginType)!;
            _loadContexts[plugin.PluginId] = loadContext;

            _logger.LogInformation("Successfully loaded plugin {PluginId} from {PluginPath}", 
                plugin.PluginId, pluginPath);

            return plugin;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load plugin from {PluginPath}", pluginPath);
            throw;
        }
    }

    public async Task RegisterPluginAsync(IPlugin plugin)
    {
        _logger.LogInformation("Registering plugin {PluginId}", plugin.PluginId);

        try
        {
            _loadedPlugins[plugin.PluginId] = plugin;
            
            // TODO: Initialize plugin with conductor and event router
            // This will be done when the plugin is actually registered with the system
            
            _logger.LogInformation("Successfully registered plugin {PluginId}", plugin.PluginId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register plugin {PluginId}", plugin.PluginId);
            throw;
        }
    }

    public async Task UnloadPluginAsync(string pluginId)
    {
        _logger.LogInformation("Unloading plugin {PluginId}", pluginId);

        try
        {
            if (_loadedPlugins.TryRemove(pluginId, out var plugin))
            {
                await plugin.ShutdownAsync();
            }

            if (_loadContexts.TryRemove(pluginId, out var context))
            {
                context.Unload();

                // Hint GC to collect unloaded context
                for (int i = 0; i < 2; i++)
                {
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                    await Task.Delay(50);
                }
            }

            _logger.LogInformation("Successfully unloaded plugin {PluginId}", pluginId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to unload plugin {PluginId}", pluginId);
            throw;
        }
    }

    public IEnumerable<IPlugin> GetLoadedPlugins()
    {
        return _loadedPlugins.Values.ToList();
    }

    public IPlugin? GetPlugin(string pluginId)
    {
        return _loadedPlugins.TryGetValue(pluginId, out var plugin) ? plugin : null;
    }

    public async Task<IPlugin?> GetPluginForSlotAsync(string slotName)
    {
        // TODO: Implement slot-to-plugin mapping based on manifest
        // This will be implemented when manifest loading is complete
        
        _logger.LogDebug("Looking for plugin for slot {SlotName}", slotName);
        return null;
    }
}

/// <summary>
/// Plugin load context for hot-reloading support
/// </summary>
public class PluginLoadContext : AssemblyLoadContext
{
    private readonly AssemblyDependencyResolver _resolver;

    public PluginLoadContext(string pluginPath) : base(isCollectible: true)
    {
        _resolver = new AssemblyDependencyResolver(pluginPath);
    }

    protected override Assembly? Load(AssemblyName assemblyName)
    {
        var assemblyPath = _resolver.ResolveAssemblyToPath(assemblyName);
        return assemblyPath != null ? LoadFromAssemblyPath(assemblyPath) : null;
    }

    protected override IntPtr LoadUnmanagedDll(string unmanagedDllName)
    {
        var libraryPath = _resolver.ResolveUnmanagedDllToPath(unmanagedDllName);
        return libraryPath != null ? LoadUnmanagedDllFromPath(libraryPath) : IntPtr.Zero;
    }
}
