using System;
using System.Collections.Generic;
using System.Reflection;
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
    /// Minimal, manifest-agnostic loader that maps slot names to control types
    /// and initializes them via reflection to satisfy SHELL002.
    /// </summary>
    public class PluginLoader : IPluginLoader
    {
        private readonly ILogger<PluginLoader> _logger;
        private readonly IReadOnlyDictionary<string, string> _slotTypeMap;

        public PluginLoader(ILogger<PluginLoader> logger)
        {
            _logger = logger;
            // Map slot name (case-insensitive) to fully-qualified type name
            _slotTypeMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "Canvas", "RenderX.Shell.Avalonia.UI.Views.CanvasControl, RenderX.Shell.Avalonia" },
                { "ControlPanel", "RenderX.Shell.Avalonia.UI.Views.ControlPanelControl, RenderX.Shell.Avalonia" },
            };
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

