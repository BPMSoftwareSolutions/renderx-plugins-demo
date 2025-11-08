using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core;
using MusicalConductor.Core.Interfaces;

namespace MusicalConductor.Core.Tests;

public class PluginManager_BasicTests
{
    private class TestPlugin : IPlugin
    {
        private readonly PluginMetadata _meta;
        private readonly Dictionary<string, IHandler> _handlers = new();
        public bool Initialized { get; private set; }
        public bool Cleaned { get; private set; }

        public TestPlugin(string id)
        {
            _meta = new PluginMetadata { Id = id, Name = id, Version = "1.0.0" };
        }

        public Task Cleanup()
        {
            Cleaned = true;
            return Task.CompletedTask;
        }

        public Dictionary<string, IHandler> GetHandlers() => _handlers;
        public PluginMetadata GetMetadata() => _meta;
        public IEnumerable<ISequence> GetSequences() => Array.Empty<ISequence>();

        public Task Initialize(IConductor conductor)
        {
            // Conductor may be null in current implementation
            Initialized = true;
            return Task.CompletedTask;
        }
    }

    [Fact]
    public async Task Register_StoresPlugin_AndCallsInitialize()
    {
        var logger = new Mock<ILogger<PluginManager>>();
        var mgr = new PluginManager(logger.Object);
        var plugin = new TestPlugin("p1");

        await mgr.Register(plugin);

        Assert.True(plugin.Initialized);
        Assert.True(mgr.Has("p1"));
        Assert.NotNull(mgr.Get("p1"));
    }

    [Fact]
    public async Task Unregister_RemovesPlugin_AndCallsCleanup()
    {
        var logger = new Mock<ILogger<PluginManager>>();
        var mgr = new PluginManager(logger.Object);
        var plugin = new TestPlugin("p1");

        await mgr.Register(plugin);
        await mgr.Unregister("p1");

        Assert.True(plugin.Cleaned);
        Assert.False(mgr.Has("p1"));
    }
}

