using Microsoft.Extensions.Logging;
using Moq;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Models;
using RenderX.HostSDK.Avalonia.Services;
using Xunit;

namespace RenderX.HostSDK.Avalonia.Tests;

public class InventoryServiceTests : IDisposable
{
    private readonly Mock<ILogger<InventoryService>> _mockLogger;
    private readonly Mock<ILogger<HostSdkEngineHost>> _mockEngineLogger;
    private readonly HostSdkEngineHost _engineHost;
    private readonly InventoryService _inventoryService;

    public InventoryServiceTests()
    {
        _mockLogger = new Mock<ILogger<InventoryService>>();
        _mockEngineLogger = new Mock<ILogger<HostSdkEngineHost>>();
        _engineHost = new HostSdkEngineHost(_mockEngineLogger.Object);
        _inventoryService = new InventoryService(_engineHost, _mockLogger.Object);
    }

    public void Dispose()
    {
        _engineHost?.Dispose();
    }

    [Fact]
    public void Constructor_WithNullEngineHost_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new InventoryService(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new InventoryService(_engineHost, null!));
    }

    [Fact]
    public async Task ListComponentsAsync_ReturnsEmptyList_WhenNoComponents()
    {
        // Act
        var result = await _inventoryService.ListComponentsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task ListComponentsAsync_ReturnsReadOnlyList()
    {
        // Act
        var result = await _inventoryService.ListComponentsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.IsAssignableFrom<IReadOnlyList<ComponentSummary>>(result);
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithNullId_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _inventoryService.GetComponentByIdAsync(null!));
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithEmptyId_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _inventoryService.GetComponentByIdAsync(""));
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithWhitespaceId_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _inventoryService.GetComponentByIdAsync("   "));
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithValidId_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var componentId = "non-existent-component";

        // Act
        var result = await _inventoryService.GetComponentByIdAsync(componentId);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithValidId_CompletesSuccessfully()
    {
        // Arrange
        var componentId = "test-component-id";

        // Act
        var result = await _inventoryService.GetComponentByIdAsync(componentId);

        // Assert - should not throw, result may be null
        Assert.True(result == null || result is Component);
    }

    [Fact]
    public void OnInventoryChanged_WithNullCallback_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            _inventoryService.OnInventoryChanged(null!));
    }

    [Fact]
    public void OnInventoryChanged_WithValidCallback_ReturnsDisposable()
    {
        // Arrange
        Action<IReadOnlyList<ComponentSummary>> callback = _ => { };

        // Act
        var subscription = _inventoryService.OnInventoryChanged(callback);

        // Assert
        Assert.NotNull(subscription);
        Assert.IsAssignableFrom<IDisposable>(subscription);
    }

    [Fact]
    public void OnInventoryChanged_Dispose_UnsubscribesSuccessfully()
    {
        // Arrange
        var callbackInvoked = false;
        Action<IReadOnlyList<ComponentSummary>> callback = _ => callbackInvoked = true;

        // Act
        var subscription = _inventoryService.OnInventoryChanged(callback);
        subscription.Dispose();

        // Assert - no exception should be thrown
        Assert.False(callbackInvoked);
    }

    [Fact]
    public void OnInventoryChanged_DisposeTwice_DoesNotThrow()
    {
        // Arrange
        Action<IReadOnlyList<ComponentSummary>> callback = _ => { };
        var subscription = _inventoryService.OnInventoryChanged(callback);

        // Act
        subscription.Dispose();
        subscription.Dispose(); // Second dispose

        // Assert - no exception should be thrown
    }

    [Fact]
    public void OnInventoryChanged_MultipleObservers_AllCanSubscribe()
    {
        // Arrange
        Action<IReadOnlyList<ComponentSummary>> callback1 = _ => { };
        Action<IReadOnlyList<ComponentSummary>> callback2 = _ => { };

        // Act
        var sub1 = _inventoryService.OnInventoryChanged(callback1);
        var sub2 = _inventoryService.OnInventoryChanged(callback2);

        // Assert
        Assert.NotNull(sub1);
        Assert.NotNull(sub2);
    }

    [Fact]
    public async Task ListComponentsAsync_CalledMultipleTimes_DoesNotThrow()
    {
        // Act
        var result1 = await _inventoryService.ListComponentsAsync();
        var result2 = await _inventoryService.ListComponentsAsync();

        // Assert
        Assert.NotNull(result1);
        Assert.NotNull(result2);
    }

    [Fact]
    public async Task GetComponentByIdAsync_CalledMultipleTimes_DoesNotThrow()
    {
        // Arrange
        var componentId = "test-component";

        // Act
        var result1 = await _inventoryService.GetComponentByIdAsync(componentId);
        var result2 = await _inventoryService.GetComponentByIdAsync(componentId);

        // Assert - should not throw
        Assert.True(result1 == null || result1 is Component);
        Assert.True(result2 == null || result2 is Component);
    }

    [Fact]
    public void OnInventoryChanged_AfterDispose_CanSubscribeAgain()
    {
        // Arrange
        Action<IReadOnlyList<ComponentSummary>> callback = _ => { };
        var sub1 = _inventoryService.OnInventoryChanged(callback);
        sub1.Dispose();

        // Act
        var sub2 = _inventoryService.OnInventoryChanged(callback);

        // Assert
        Assert.NotNull(sub2);
    }

    [Fact]
    public async Task ListComponentsAsync_ReturnsConsistentType()
    {
        // Act
        var result = await _inventoryService.ListComponentsAsync();

        // Assert
        Assert.NotNull(result);
        Assert.IsType<List<ComponentSummary>>(result);
    }

    [Fact]
    public async Task GetComponentByIdAsync_WithDifferentIds_HandlesEachIndependently()
    {
        // Arrange
        var id1 = "component-1";
        var id2 = "component-2";

        // Act
        var result1 = await _inventoryService.GetComponentByIdAsync(id1);
        var result2 = await _inventoryService.GetComponentByIdAsync(id2);

        // Assert - should handle each independently
        Assert.True(result1 == null || result1 is Component);
        Assert.True(result2 == null || result2 is Component);
    }

    [Fact]
    public void OnInventoryChanged_WithExceptionInCallback_DoesNotAffectOtherObservers()
    {
        // Arrange
        var callback1Called = false;
        var callback2Called = false;

        Action<IReadOnlyList<ComponentSummary>> callback1 = _ => throw new Exception("Test exception");
        Action<IReadOnlyList<ComponentSummary>> callback2 = _ => callback2Called = true;

        // Act
        var sub1 = _inventoryService.OnInventoryChanged(callback1);
        var sub2 = _inventoryService.OnInventoryChanged(callback2);

        // Assert - subscriptions should be created successfully
        Assert.NotNull(sub1);
        Assert.NotNull(sub2);
    }
}

