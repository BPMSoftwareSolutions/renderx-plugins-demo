using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.LibraryComponent.Handlers;

namespace RenderX.Plugins.LibraryComponent;

/// <summary>
/// LibraryComponent plugin for drag-and-drop from component library.
/// </summary>
public class LibraryComponentPlugin : IPlugin
{
    private readonly ILogger<LibraryComponentPlugin> _logger;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventBus _eventBus;
    private readonly Dictionary<string, IHandler> _handlers = new();
    private readonly List<ISequence> _sequences = new();

    public LibraryComponentPlugin(ILogger<LibraryComponentPlugin> logger, ILoggerFactory loggerFactory, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    public PluginMetadata GetMetadata()
    {
        return new PluginMetadata
        {
            Id = "library-component",
            Name = "Library Component",
            Version = "1.0.0",
            Description = "Drag-and-drop component creation from library",
            Author = "RenderX Team"
        };
    }

    public async Task Initialize(IConductor conductor)
    {
        _logger.LogInformation("🎪 Initializing Library Component Plugin");
        
        // Create handler instance with proper logger type
        var handlers = new LibraryComponentHandlers(_loggerFactory.CreateLogger<LibraryComponentHandlers>(), _eventBus);

        // Register all 3 sequences using helper class
        LibraryComponentSequenceRegistration.RegisterAllSequences(_sequences, handlers);

        _logger.LogInformation("✅ Library Component Plugin initialized with {Count} sequences", _sequences.Count);
        
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
        _logger.LogInformation("🧹 Cleaning up Library Component Plugin");
        _handlers.Clear();
        _sequences.Clear();
        await Task.CompletedTask;
    }
}
