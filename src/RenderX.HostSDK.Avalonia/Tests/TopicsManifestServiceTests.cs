using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.HostSDK.Avalonia.Tests;

public class TopicsManifestServiceTests
{
    private static ILogger<T> CreateLogger<T>() => NullLogger<T>.Instance;

    private sealed class Provider : ITopicsManifestProvider
    {
        private readonly Dictionary<string, TopicDefinition> _map = new();
        private bool _loaded;

        public Task InitAsync()
        {
            _map["topic.a"] = new TopicDefinition { Routes = new List<Route> { new Route { PluginId = "P", SequenceId = "S" } } };
            _map["topic.b"] = new TopicDefinition { Routes = new List<Route> { new Route { PluginId = "PB", SequenceId = "SB" } } };
            _loaded = true;
            return Task.CompletedTask;
        }

        public TopicDefinition? GetTopicDef(string key) => _map.TryGetValue(key, out var v) ? v : null;
        public Dictionary<string, TopicDefinition> GetTopicsMap() => new(_map);
        public (bool Loaded, int TopicCount) GetStats() => (_loaded, _map.Count);
    }

    [Fact]
    public async Task Init_NoProvider_LoadsEmptyAndSetsLoaded()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new TopicsManifestService(engineHost, CreateLogger<TopicsManifestService>());

        await svc.InitTopicsManifestAsync();
        var stats = svc.GetStats();

        Assert.True(stats.Loaded);
        Assert.Equal(0, stats.TopicCount);
        Assert.Empty(svc.GetTopicsMap());
    }

    [Fact]
    public async Task Provider_Flow_Works()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new TopicsManifestService(engineHost, CreateLogger<TopicsManifestService>());

        var provider = new Provider();
        svc.SetTopicsManifestProvider(provider);

        await svc.InitTopicsManifestAsync();
        var stats = svc.GetStats();

        Assert.True(stats.Loaded);
        Assert.Equal(2, stats.TopicCount);

        var def = svc.GetTopicDef("topic.a");
        Assert.NotNull(def);
        Assert.Single(def!.Routes);
        Assert.Equal("P", def.Routes[0].PluginId);
    }
}

