using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.CanvasComponent.Handlers;

namespace RenderX.Plugins.CanvasComponent;

public class CanvasComponentPlugin : IPlugin
{
    private readonly ILogger<CanvasComponentPlugin> _logger;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventBus _eventBus;
    private readonly Dictionary<string, IHandler> _handlers = new();
    private readonly List<ISequence> _sequences = new();

    public CanvasComponentPlugin(ILogger<CanvasComponentPlugin> logger, ILoggerFactory loggerFactory, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    public PluginMetadata GetMetadata()
    {
        return new PluginMetadata
        {
            Id = "canvas-component",
            Name = "Canvas Component",
            Version = "1.0.0",
            Description = "High-frequency interaction & manipulation handlers for Canvas",
            Author = "RenderX Team"
        };
    }

    public async Task Initialize(IConductor conductor)
    {
        _logger.LogInformation("🎨 Initializing Canvas Component Plugin");
        
        // Create handler instances with proper logger types
        var copyPasteHandlers = new CopyPasteHandlers(_loggerFactory.CreateLogger<CopyPasteHandlers>(), _eventBus);
        var selectionHandlers = new SelectionHandlers(_loggerFactory.CreateLogger<SelectionHandlers>(), _eventBus);
        var dragHandlers = new DragHandlers(_loggerFactory.CreateLogger<DragHandlers>(), _eventBus);
        var resizeHandlers = new ResizeHandlers(_loggerFactory.CreateLogger<ResizeHandlers>(), _eventBus);
        var crudHandlers = new CrudHandlers(_loggerFactory.CreateLogger<CrudHandlers>(), _eventBus);
        var lineManipHandlers = new LineManipHandlers(_loggerFactory.CreateLogger<LineManipHandlers>(), _eventBus);
        var importExportHandlers = new ImportExportHandlers(_loggerFactory.CreateLogger<ImportExportHandlers>(), _eventBus);

        // Register all 30 sequences using helper class
        CanvasComponentSequenceRegistration.RegisterAllSequences(
            _sequences,
            copyPasteHandlers,
            selectionHandlers,
            dragHandlers,
            resizeHandlers,
            crudHandlers,
            lineManipHandlers,
            importExportHandlers
        );

        _logger.LogInformation("✅ Canvas Component Plugin initialized with {Count} sequences", _sequences.Count);
        
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
        _logger.LogInformation("🧹 Cleaning up Canvas Component Plugin");
        _handlers.Clear();
        _sequences.Clear();
        await Task.CompletedTask;
    }
}
