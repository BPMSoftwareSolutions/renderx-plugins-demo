using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;
using RenderX.Plugins.Header.Handlers;

namespace RenderX.Plugins.Header;

/// <summary>
/// Header plugin for theme management.
/// </summary>
public class HeaderPlugin : IPlugin
{
    private readonly ILogger<HeaderPlugin> _logger;
    private readonly ILoggerFactory _loggerFactory;
    private readonly IEventBus _eventBus;
    private readonly Dictionary<string, IHandler> _handlers = new();
    private readonly List<ISequence> _sequences = new();

    public HeaderPlugin(ILogger<HeaderPlugin> logger, ILoggerFactory loggerFactory, IEventBus eventBus)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    public PluginMetadata GetMetadata()
    {
        return new PluginMetadata
        {
            Id = "header",
            Name = "Header",
            Version = "1.0.0",
            Description = "Theme management for Header",
            Author = "RenderX Team"
        };
    }

    public async Task Initialize(IConductor conductor)
    {
        _logger.LogInformation("🎨 Initializing Header Plugin");
        
        // Create handler instance with proper logger type
        var handlers = new HeaderHandlers(_loggerFactory.CreateLogger<HeaderHandlers>(), _eventBus);

        // Register all 2 sequences using helper class
        HeaderSequenceRegistration.RegisterAllSequences(_sequences, handlers);

        _logger.LogInformation("✅ Header Plugin initialized with {Count} sequences", _sequences.Count);
        
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
        _logger.LogInformation("🧹 Cleaning up Header Plugin");
        _handlers.Clear();
        _sequences.Clear();
        await Task.CompletedTask;
    }
}
