using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Extensions;
using RenderX.HostSDK.Avalonia.Interfaces;
using Xunit;

namespace RenderX.HostSDK.Avalonia.Tests;

public class ServiceRegistrationTests
{
    [Fact]
    public void AddRenderXHostSdk_RegistersAllCoreServices()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        // Assert - Core services should be registered
        var engineHost = provider.GetService<HostSdkEngineHost>();
        Assert.NotNull(engineHost);

        var eventRouter = provider.GetService<IEventRouter>();
        Assert.NotNull(eventRouter);

        var inventory = provider.GetService<IInventoryAPI>();
        Assert.NotNull(inventory);

        var cssRegistry = provider.GetService<ICssRegistryAPI>();
        Assert.NotNull(cssRegistry);
    }

    [Fact]
    public void AddRenderXHostSdk_WithOptions_RegistersServicesWithOptions()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk(options =>
        {
            options.EnableDebugLogging = true;
            options.OperationTimeoutMs = 5000;
        });
        var provider = services.BuildServiceProvider();

        // Assert
        var hostSdkOptions = provider.GetService<HostSdkOptions>();
        Assert.NotNull(hostSdkOptions);
        Assert.True(hostSdkOptions.EnableDebugLogging);
        Assert.Equal(5000, hostSdkOptions.OperationTimeoutMs);
    }

    [Fact]
    public void AddRenderXHostSdk_RegistersServicesAsSingletons()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        // Assert - Services should be singletons
        var eventRouter1 = provider.GetService<IEventRouter>();
        var eventRouter2 = provider.GetService<IEventRouter>();
        Assert.Same(eventRouter1, eventRouter2);

        var inventory1 = provider.GetService<IInventoryAPI>();
        var inventory2 = provider.GetService<IInventoryAPI>();
        Assert.Same(inventory1, inventory2);

        var cssRegistry1 = provider.GetService<ICssRegistryAPI>();
        var cssRegistry2 = provider.GetService<ICssRegistryAPI>();
        Assert.Same(cssRegistry1, cssRegistry2);
    }

    [Fact]
    public void AddRenderXHostSdk_WithNullServices_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            ServiceCollectionExtensions.AddRenderXHostSdk(null!));
    }

    [Fact]
    public void AddRenderXHostSdk_WithNullConfigureAction_ThrowsArgumentNullException()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            services.AddRenderXHostSdk(null!));
    }

    [Fact]
    public void AddRenderXHostSdk_CanBeCalledMultipleTimes()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        services.AddRenderXHostSdk(); // Second call
        var provider = services.BuildServiceProvider();

        // Assert - Should not throw
        var eventRouter = provider.GetService<IEventRouter>();
        Assert.NotNull(eventRouter);
    }

    [Fact]
    public void AddRenderXHostSdk_RegistersEngineHostFirst()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        // Assert - Engine host should be available
        var engineHost = provider.GetService<HostSdkEngineHost>();
        Assert.NotNull(engineHost);
    }

    [Fact]
    public void AddRenderXHostSdk_ServicesCanBeResolved()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        // Assert - All services should be resolvable
        using var scope = provider.CreateScope();
        var eventRouter = scope.ServiceProvider.GetRequiredService<IEventRouter>();
        var inventory = scope.ServiceProvider.GetRequiredService<IInventoryAPI>();
        var cssRegistry = scope.ServiceProvider.GetRequiredService<ICssRegistryAPI>();

        Assert.NotNull(eventRouter);
        Assert.NotNull(inventory);
        Assert.NotNull(cssRegistry);
    }

    [Fact]
    public void AddRenderXHostSdk_WithDefaultOptions_UsesDefaultValues()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk();
        var provider = services.BuildServiceProvider();

        // Assert
        var options = provider.GetService<HostSdkOptions>();
        Assert.NotNull(options);
        // Default values should be set
        Assert.False(options.EnableDebugLogging);
        Assert.Equal(30000, options.OperationTimeoutMs);
    }

    [Fact]
    public void AddRenderXHostSdk_WithCustomOptions_OverridesDefaults()
    {
        // Arrange
        var services = new ServiceCollection();
        services.AddLogging();

        // Act
        services.AddRenderXHostSdk(options =>
        {
            options.EnableDebugLogging = true;
            options.OperationTimeoutMs = 10000;
        });
        var provider = services.BuildServiceProvider();

        // Assert
        var options = provider.GetService<HostSdkOptions>();
        Assert.NotNull(options);
        Assert.True(options.EnableDebugLogging);
        Assert.Equal(10000, options.OperationTimeoutMs);
    }

    [Fact]
    public void AddRenderXHostSdk_RequiresLogging()
    {
        // Arrange
        var services = new ServiceCollection();
        // Note: Not adding logging

        // Act
        services.AddRenderXHostSdk();

        // Assert - Should throw when trying to resolve services without logging
        var provider = services.BuildServiceProvider();
        Assert.Throws<InvalidOperationException>(() =>
            provider.GetRequiredService<IEventRouter>());
    }
}

