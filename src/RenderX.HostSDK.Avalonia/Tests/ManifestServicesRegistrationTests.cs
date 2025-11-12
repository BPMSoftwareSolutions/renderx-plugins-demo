using Microsoft.Extensions.DependencyInjection;
using RenderX.HostSDK.Avalonia.Extensions;
using RenderX.HostSDK.Avalonia.Interfaces;

namespace RenderX.HostSDK.Avalonia.Tests;

public class ManifestServicesRegistrationTests
{
    [Fact]
    public void ManifestServices_AreRegistered_AsSingletons()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        var p1 = provider.GetRequiredService<IPluginManifestService>();
        var p2 = provider.GetRequiredService<IPluginManifestService>();
        Assert.Same(p1, p2);

        var i1 = provider.GetRequiredService<IInteractionManifestService>();
        var i2 = provider.GetRequiredService<IInteractionManifestService>();
        Assert.Same(i1, i2);

        var t1 = provider.GetRequiredService<ITopicsManifestService>();
        var t2 = provider.GetRequiredService<ITopicsManifestService>();
        Assert.Same(t1, t2);
    }
}

