using Microsoft.Extensions.DependencyInjection;
using MusicalConductor.AvaloniaV2;
using MusicalConductor.Core.Interfaces;
using Xunit;

namespace MusicalConductor.Avalonia.Tests;

public class AvaloniaV2ServiceRegistrationTests
{
    [Fact]
    public void AddMusicalConductorAvalonia_Registers_Core_And_Avalonia_Services()
    {
        var services = new ServiceCollection();
        services.AddLogging();

        services.AddMusicalConductorAvalonia(opts =>
        {
            opts.EnableDebugLogging = true;
            opts.MaxConcurrentSequences = 5;
        });

        var provider = services.BuildServiceProvider();

        // Core
        var conductorClient = provider.GetService<IConductorClient>();
        Assert.NotNull(conductorClient);

        // Avalonia
        var dispatcher = provider.GetService<IAvaloniaEventDispatcher>();
        Assert.NotNull(dispatcher);
    }
}

