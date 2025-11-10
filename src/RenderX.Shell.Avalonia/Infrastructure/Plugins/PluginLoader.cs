using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using Avalonia.Controls;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Interfaces;
using MusicalConductor.Core.Interfaces;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.Shell.Avalonia.Core;

namespace RenderX.Shell.Avalonia.Infrastructure.Plugins
{
    /// <summary>
    /// Manifest-driven plugin loader that loads slot-to-control mappings from plugin-manifest.json.
    /// This enforces the single source of truth pattern for plugin configuration.
    /// </summary>
    public class PluginLoader : IPluginLoader
    {
        private readonly ILogger<PluginLoader> _logger;
        private readonly IReadOnlyDictionary<string, string> _slotTypeMap;
        private readonly HashSet<string> _loadedRuntimePlugins = new(StringComparer.OrdinalIgnoreCase);

        public PluginLoader(ILogger<PluginLoader> logger)
        {
            _logger = logger;
            // Load plugin mappings from manifest instead of hardcoding
            _slotTypeMap = LoadPluginMappingsFromManifest();
            // SHELL010: Validate manifest at startup
            ValidatePluginManifest();
        }

        /// <summary>
        /// Validates the plugin manifest structure and content at startup (SHELL010).
        /// </summary>
        private void ValidatePluginManifest()
        {
            var manifestPath = GetPluginManifestPath();

            try
            {
                if (!File.Exists(manifestPath))
                {
                    _logger.LogWarning("Plugin manifest not found at {ManifestPath}", manifestPath);
                    return;
                }

                var manifestContent = File.ReadAllText(manifestPath);
                using var doc = JsonDocument.Parse(manifestContent);

                // Validate root structure
                if (!doc.RootElement.TryGetProperty("version", out _))
                {
                    _logger.LogWarning("Plugin manifest missing 'version' property");
                }

                if (!doc.RootElement.TryGetProperty("plugins", out var plugins))
                {
                    _logger.LogWarning("Plugin manifest missing 'plugins' array");
                    return;
                }

                // Validate each plugin entry
                foreach (var plugin in plugins.EnumerateArray())
                {
                    if (!plugin.TryGetProperty("id", out var id))
                    {
                        _logger.LogWarning("Plugin entry missing 'id' property");
                        continue;
                    }

                    if (!plugin.TryGetProperty("ui", out var ui))
                    {
                        _logger.LogWarning("Plugin {PluginId} missing 'ui' configuration", id.GetString());
                        continue;
                    }

                    // Validate UI configuration
                    if (!ui.TryGetProperty("slot", out _) || !ui.TryGetProperty("module", out _) || !ui.TryGetProperty("export", out _))
                    {
                        _logger.LogWarning("Plugin {PluginId} has incomplete UI configuration", id.GetString());
                    }
                }

                _logger.LogInformation("Plugin manifest validation completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating plugin manifest at {ManifestPath}", manifestPath);
            }
        }

        /// <summary>
        /// Gets the plugin manifest path using AppContext.BaseDirectory for reliable resolution.
        /// </summary>
        private string GetPluginManifestPath()
        {
            // Try multiple locations in order of preference
            var candidates = new[]
            {
                // 1. Relative to AppContext.BaseDirectory (most reliable)
                Path.Combine(AppContext.BaseDirectory, "plugins", "plugin-manifest.json"),

                // 2. Relative to assembly location
                Path.Combine(
                    Path.GetDirectoryName(typeof(PluginLoader).Assembly.Location) ?? "",
                    "plugins", "plugin-manifest.json"),

                // 3. Fallback: look in bin/Debug or bin/Release
                Path.Combine(
                    AppContext.BaseDirectory, "..", "..", "..", "plugins", "plugin-manifest.json")
            };

            foreach (var candidate in candidates)
            {
                var fullPath = Path.GetFullPath(candidate);
                if (File.Exists(fullPath))
                {
                    _logger.LogDebug("Found plugin manifest at {ManifestPath}", fullPath);
                    return fullPath;
                }
            }

            // Return the first candidate even if it doesn't exist (for error reporting)
            return Path.GetFullPath(candidates[0]);
        }

        /// <summary>
        /// Loads plugin mappings from plugin-manifest.json.
        /// Maps slot names to fully-qualified type names (namespace.class, assembly).
        /// </summary>
        private IReadOnlyDictionary<string, string> LoadPluginMappingsFromManifest()
        {
            var manifestPath = GetPluginManifestPath();
            var mappings = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            try
            {
                if (!File.Exists(manifestPath))
                {
                    _logger.LogWarning("Plugin manifest not found at {ManifestPath}. Using empty mappings.", manifestPath);
                    return mappings;
                }

                var manifestContent = File.ReadAllText(manifestPath);
                using var doc = JsonDocument.Parse(manifestContent);

                var plugins = doc.RootElement.GetProperty("plugins");
                foreach (var plugin in plugins.EnumerateArray())
                {
                    var id = plugin.GetProperty("id").GetString();
                    var ui = plugin.GetProperty("ui");
                    var slot = ui.GetProperty("slot").GetString();
                    var module = ui.GetProperty("module").GetString();
                    var export = ui.GetProperty("export").GetString();

                    if (string.IsNullOrEmpty(slot) || string.IsNullOrEmpty(module) || string.IsNullOrEmpty(export))
                    {
                        _logger.LogWarning("Plugin {PluginId} has incomplete UI configuration", id);
                        continue;
                    }

                    // Convert module name (e.g., "RenderX.Plugins.Canvas.dll") to assembly name
                    var assemblyName = Path.GetFileNameWithoutExtension(module);
                    var typeName = $"{export}, {assemblyName}";

                    mappings[slot] = typeName;
                    _logger.LogDebug("Loaded plugin mapping: slot '{Slot}' -> {TypeName}", slot, typeName);
                }

                _logger.LogInformation("Loaded {PluginCount} plugin mappings from manifest", mappings.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading plugin manifest from {ManifestPath}", manifestPath);
            }

            return mappings;
        }

        public Task<Control?> LoadControlForSlotAsync(string slotName, IServiceProvider services)
        {
            try
            {
                if (!_slotTypeMap.TryGetValue(slotName, out var typeName))
                {
                    _logger.LogDebug("No control mapped for slot '{SlotName}'", slotName);
                    return Task.FromResult<Control?>(null);
                }

                var controlType = Type.GetType(typeName, throwOnError: false);
                if (controlType == null)
                {
                    _logger.LogWarning("Control type not found for slot '{SlotName}': {TypeName}", slotName, typeName);
                    return Task.FromResult<Control?>(null);
                }

                var instance = Activator.CreateInstance(controlType) as Control;
                if (instance == null)
                {
                    _logger.LogWarning("Failed to create instance for slot '{SlotName}' of type {TypeName}", slotName, typeName);
                    return Task.FromResult<Control?>(null);
                }

                // Resolve SDK services via thin host layer
                var thinHost = services.GetRequiredService<IThinHostLayer>();
                var eventRouter = thinHost.EventRouter;
                var conductor = thinHost.Conductor;
                var eventBus = services.GetRequiredService<IEventBus>();

                // Resolve a typed logger matching the control type: ILogger<ControlType>
                var loggerGenericType = typeof(ILogger<>).MakeGenericType(controlType);
                var typedLogger = services.GetRequiredService(loggerGenericType);

                // Call Initialize(eventRouter, conductor, ILogger<TControl>, IEventBus) if present
                var initMethod = controlType.GetMethod(
                    name: "Initialize",
                    BindingFlags.Instance | BindingFlags.Public,
                    binder: null,
                    types: new[] { typeof(IEventRouter), typeof(MusicalConductor.Avalonia.Interfaces.IConductorClient), loggerGenericType, typeof(IEventBus) },
                    modifiers: null);

                if (initMethod != null)
                {
                    initMethod.Invoke(instance, new object?[] { eventRouter, conductor, typedLogger, eventBus });
                    _logger.LogInformation("Initialized control {ControlType} for slot '{SlotName}'", controlType.Name, slotName);
                }
                else
                {
                    _logger.LogDebug("No Initialize method found on control {ControlType}; skipping initialization", controlType.Name);
                }

                return Task.FromResult<Control?>(instance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading control for slot '{SlotName}': {ExceptionMessage}", slotName, ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError(ex.InnerException, "Inner exception: {InnerMessage}", ex.InnerException.Message);
                }
                return Task.FromResult<Control?>(null);
            }
        }

        /// <summary>
        /// Loads and registers runtime plugins (IPlugin) from plugin-manifest.json.
        /// This instantiates plugin classes via DI and registers them with the ConductorClient.
        /// </summary>
        public async Task<int> LoadRuntimePluginsAsync(IServiceProvider services)
        {
            var manifestPath = GetPluginManifestPath();
            var loaded = 0;
            try
            {
                if (!File.Exists(manifestPath))
                {
                    _logger.LogWarning("Plugin manifest not found at {ManifestPath}; skipping runtime plugin load", manifestPath);
                    return 0;
                }

                var manifestContent = File.ReadAllText(manifestPath);
                using var doc = JsonDocument.Parse(manifestContent);

                var plugins = doc.RootElement.GetProperty("plugins");
                foreach (var plugin in plugins.EnumerateArray())
                {
                    if (!plugin.TryGetProperty("runtime", out var runtime))
                        continue;

                    var module = runtime.GetProperty("module").GetString();
                    var export = runtime.GetProperty("export").GetString();

                    if (string.IsNullOrWhiteSpace(module) || string.IsNullOrWhiteSpace(export))
                        continue;

                    var assemblyName = Path.GetFileNameWithoutExtension(module);
                    var typeName = $"{export}, {assemblyName}";

                    if (_loadedRuntimePlugins.Contains(typeName))
                        continue; // already loaded

                    var pluginType = Type.GetType(typeName, throwOnError: false);
                    if (pluginType == null)
                    {
                        _logger.LogWarning("Runtime plugin type not found: {TypeName}", typeName);
                        continue;
                    }

                    try
                    {
                        // Create instance via DI to satisfy constructor deps
                        var instance = ActivatorUtilities.CreateInstance(services, pluginType) as IPlugin;
                        if (instance == null)
                        {
                            _logger.LogWarning("Failed to create runtime plugin instance for type {TypeName}", typeName);
                            continue;
                        }

                        // Prefer the Core Conductor client if available for direct plugin registration
                        var coreConductor = services.GetService<MusicalConductor.Core.Interfaces.IConductorClient>();
                        if (coreConductor != null)
                        {
                            await coreConductor.RegisterPlugin(instance);
                        }
                        else
                        {
                            _logger.LogWarning("Core IConductorClient not available; runtime plugin not registered: {TypeName}", typeName);
                            continue;
                        }

                        _loadedRuntimePlugins.Add(typeName);
                        loaded++;
                        _logger.LogInformation("Registered runtime plugin: {TypeName}", typeName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error registering runtime plugin {TypeName}", typeName);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading runtime plugins from manifest {ManifestPath}", manifestPath);
            }

            return loaded;
        }
    }
}

