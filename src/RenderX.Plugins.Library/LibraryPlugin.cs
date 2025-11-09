using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.Library.Handlers;

namespace RenderX.Plugins.Library;

/// <summary>
/// Library handlers plugin for loading component templates.
/// </summary>
public class LibraryHandlersPlugin : IPlugin
{
    private readonly ILogger<LibraryHandlersPlugin> _logger;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventBus _eventBus;
    private readonly Dictionary<string, IHandler> _handlers = new();
    private readonly List<ISequence> _sequences = new();

    public LibraryHandlersPlugin(ILogger<LibraryHandlersPlugin> logger, ILoggerFactory loggerFactory, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    public PluginMetadata GetMetadata()
    {
        return new PluginMetadata
        {
            Id = "library",
            Name = "Library",
            Version = "1.0.0",
            Description = "Component library template loading",
            Author = "RenderX Team"
        };
    }

    public async Task Initialize(IConductor conductor)
    {
        _logger.LogInformation("📚 Initializing Library Plugin");
        
        // Create handler instance with proper logger type
        var handlers = new LibraryHandlers(_loggerFactory.CreateLogger<LibraryHandlers>(), _eventBus);

        // Register all 1 sequence using helper class
        LibrarySequenceRegistration.RegisterAllSequences(_sequences, handlers);

        _logger.LogInformation("✅ Library Plugin initialized with {Count} sequences", _sequences.Count);
        
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
        _logger.LogInformation("🧹 Cleaning up Library Plugin");
        _handlers.Clear();
        _sequences.Clear();
        await Task.CompletedTask;
    }
}
