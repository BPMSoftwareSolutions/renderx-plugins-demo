using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Interfaces;
using RenderX.HostSDK.Avalonia.Models;
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.HostSDK.Avalonia.Tests;

public class InteractionManifestServiceTests
{
    private static ILogger<T> CreateLogger<T>() => NullLogger<T>.Instance;

    private sealed class TestProvider : IInteractionManifestProvider
    {
        public Route ResolveInteraction(string key)
        {
            return new Route { PluginId = "TestPlugin", SequenceId = key + "-sequence" };
        }
    }

    [Fact]
    public void ResolveInteraction_Throws_WhenNoProviderAndNoJs()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new InteractionManifestService(engineHost, CreateLogger<InteractionManifestService>());

        Assert.Throws<KeyNotFoundException>(() => svc.ResolveInteraction("missing.key"));
    }

    [Fact]
    public void ResolveInteraction_UsesProvider_WhenSet()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new InteractionManifestService(engineHost, CreateLogger<InteractionManifestService>());

        svc.SetInteractionManifestProvider(new TestProvider());
        var route = svc.ResolveInteraction("example.key");

        Assert.Equal("TestPlugin", route.PluginId);
        Assert.Equal("example.key-sequence", route.SequenceId);
    }
}

