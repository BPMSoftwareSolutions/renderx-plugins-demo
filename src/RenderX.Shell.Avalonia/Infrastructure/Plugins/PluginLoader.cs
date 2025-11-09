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

        public PluginLoader(ILogger<PluginLoader> logger)
        {
            _logger = logger;
            // Load plugin mappings from manifest instead of hardcoding
            _slotTypeMap = LoadPluginMappingsFromManifest();
        }

        /// <summary>
        /// Loads plugin mappings from plugin-manifest.json.
        /// Maps slot names to fully-qualified type names (namespace.class, assembly).
        /// </summary>
        private IReadOnlyDictionary<string, string> LoadPluginMappingsFromManifest()
        {
            var manifestPath = Path.Combine(
                Path.GetDirectoryName(typeof(PluginLoader).Assembly.Location) ?? "",
                "..", "..", "RenderX.Shell.Avalonia", "plugins", "plugin-manifest.json");

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

                // Resolve a typed logger matching the control type: ILogger<ControlType>
                var loggerGenericType = typeof(ILogger<>).MakeGenericType(controlType);
                var typedLogger = services.GetRequiredService(loggerGenericType);

                // Call Initialize(eventRouter, conductor, ILogger<TControl>) if present
                var initMethod = controlType.GetMethod(
                    name: "Initialize",
                    BindingFlags.Instance | BindingFlags.Public,
                    binder: null,
                    types: new[] { typeof(IEventRouter), typeof(IConductorClient), loggerGenericType },
                    modifiers: null);

                if (initMethod != null)
                {
                    initMethod.Invoke(instance, new object?[] { eventRouter, conductor, typedLogger });
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
                _logger.LogError(ex, "Error loading control for slot '{SlotName}'", slotName);
                return Task.FromResult<Control?>(null);
            }
        }
    }
}

