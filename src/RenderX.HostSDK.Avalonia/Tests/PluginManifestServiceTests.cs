using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Models;
using RenderX.HostSDK.Avalonia.Services;

namespace RenderX.HostSDK.Avalonia.Tests;

public class PluginManifestServiceTests
{
    private static ILogger<T> CreateLogger<T>() => NullLogger<T>.Instance;

    [Fact]
    public async Task GetPluginManifestAsync_ReturnsEmpty_WhenNoJsAndNoCache()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new PluginManifestService(engineHost, CreateLogger<PluginManifestService>());

        var manifest = await svc.GetPluginManifestAsync();

        Assert.NotNull(manifest);
        Assert.Empty(manifest.Plugins);
        Assert.NotNull(svc.GetCachedPluginManifest());
    }

    [Fact]
    public void SetPluginManifest_Caches_And_GetCachedReturns()
    {
        var engineHost = new HostSdkEngineHost(CreateLogger<HostSdkEngineHost>());
        var svc = new PluginManifestService(engineHost, CreateLogger<PluginManifestService>());

        var m = new HostPluginManifest
        {
            Plugins = new List<HostPluginManifestEntry>
            {
                new HostPluginManifestEntry { Id = "A", Title = "A", Description = "desc" }
            }
        };

        svc.SetPluginManifest(m);
        var cached = svc.GetCachedPluginManifest();

        Assert.NotNull(cached);
        Assert.Single(cached!.Plugins);
        Assert.Equal("A", cached.Plugins[0].Id);
    }
}

