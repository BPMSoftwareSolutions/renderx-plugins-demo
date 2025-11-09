using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.ControlPanel.Handlers;

namespace RenderX.Plugins.ControlPanel;

/// <summary>
/// Control Panel plugin for managing CSS classes, field changes, and UI rendering.
/// </summary>
public class ControlPanelPlugin : IPlugin
{
    private readonly ILogger<ControlPanelPlugin> _logger;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventBus _eventBus;
    private readonly Dictionary<string, IHandler> _handlers = new();
    private readonly List<ISequence> _sequences = new();

    public ControlPanelPlugin(ILogger<ControlPanelPlugin> logger, ILoggerFactory loggerFactory, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    public PluginMetadata GetMetadata()
    {
        return new PluginMetadata
        {
            Id = "control-panel",
            Name = "Control Panel",
            Version = "1.0.0",
            Description = "CSS management, field changes, and UI rendering for Control Panel",
            Author = "RenderX Team"
        };
    }

    public async Task Initialize(IConductor conductor)
    {
        _logger.LogInformation("🎛️ Initializing Control Panel Plugin");
        
        // Create handler instance with proper logger type
        var handlers = new ControlPanelHandlers(_loggerFactory.CreateLogger<ControlPanelHandlers>(), _eventBus);

        // Register all 13 sequences using helper class
        ControlPanelSequenceRegistration.RegisterAllSequences(_sequences, handlers);

        _logger.LogInformation("✅ Control Panel Plugin initialized with {Count} sequences", _sequences.Count);
        
        await Task.CompletedTask;
    }

    public Dictionary<string, IHandler> GetHandlers()
    {
        return _handlers;
    }

    public IEnumerable<ISequence> GetSequences()
    {
        return _sequences;
    }

    public async Task Cleanup()
    {
        _logger.LogInformation("🧹 Cleaning up Control Panel Plugin");
        _handlers.Clear();
        _sequences.Clear();
        await Task.CompletedTask;
    }
}
