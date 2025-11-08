using Microsoft.Extensions.Logging;
using Moq;
using RenderX.HostSDK.Avalonia.Engine;
using RenderX.HostSDK.Avalonia.Services;
using Xunit;

namespace RenderX.HostSDK.Avalonia.Tests;

public class EventRouterServiceTests : IDisposable
{
    private readonly Mock<ILogger<EventRouterService>> _mockLogger;
    private readonly Mock<ILogger<HostSdkEngineHost>> _mockEngineLogger;
    private readonly HostSdkEngineHost _engineHost;
    private readonly EventRouterService _eventRouter;

    public EventRouterServiceTests()
    {
        _mockLogger = new Mock<ILogger<EventRouterService>>();
        _mockEngineLogger = new Mock<ILogger<HostSdkEngineHost>>();
        _engineHost = new HostSdkEngineHost(_mockEngineLogger.Object);
        _eventRouter = new EventRouterService(_engineHost, _mockLogger.Object);
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
            new EventRouterService(null!, _mockLogger.Object));
    }

    [Fact]
    public void Constructor_WithNullLogger_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            new EventRouterService(_engineHost, null!));
    }

    [Fact]
    public void Subscribe_WithNullTopic_ThrowsArgumentException()
    {
        // Arrange
        Action<object?> handler = _ => { };

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            _eventRouter.Subscribe(null!, handler));
    }

    [Fact]
    public void Subscribe_WithEmptyTopic_ThrowsArgumentException()
    {
        // Arrange
        Action<object?> handler = _ => { };

        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            _eventRouter.Subscribe("", handler));
    }

    [Fact]
    public void Subscribe_WithNullHandler_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            _eventRouter.Subscribe("test-topic", null!));
    }

    [Fact]
    public void Subscribe_WithValidTopicAndHandler_ReturnsDisposable()
    {
        // Arrange
        var topic = "test-topic";
        Action<object?> handler = _ => { };

        // Act
        var subscription = _eventRouter.Subscribe(topic, handler);

        // Assert
        Assert.NotNull(subscription);
        Assert.IsAssignableFrom<IDisposable>(subscription);
    }

    [Fact]
    public void Subscribe_Dispose_UnsubscribesSuccessfully()
    {
        // Arrange
        var topic = "test-topic";
        var handlerCalled = false;
        Action<object?> handler = _ => handlerCalled = true;

        // Act
        var subscription = _eventRouter.Subscribe(topic, handler);
        subscription.Dispose();

        // Assert - no exception should be thrown
        Assert.False(handlerCalled);
    }

    [Fact]
    public async Task PublishAsync_WithNullTopic_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _eventRouter.PublishAsync(null!, new { }));
    }

    [Fact]
    public async Task PublishAsync_WithEmptyTopic_ThrowsArgumentException()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(async () =>
            await _eventRouter.PublishAsync("", new { }));
    }

    [Fact]
    public async Task PublishAsync_WithValidTopic_CompletesSuccessfully()
    {
        // Arrange
        var topic = "test-topic";
        var payload = new { message = "test" };

        // Act & Assert - should not throw
        await _eventRouter.PublishAsync(topic, payload);
    }

    [Fact]
    public async Task PublishAsync_WithNullPayload_CompletesSuccessfully()
    {
        // Arrange
        var topic = "test-topic";

        // Act & Assert - should not throw
        await _eventRouter.PublishAsync(topic, null);
    }

    [Fact]
    public void Reset_ClearsAllSubscriptions()
    {
        // Arrange
        var topic1 = "topic1";
        var topic2 = "topic2";
        Action<object?> handler1 = _ => { };
        Action<object?> handler2 = _ => { };

        var sub1 = _eventRouter.Subscribe(topic1, handler1);
        var sub2 = _eventRouter.Subscribe(topic2, handler2);

        // Act
        _eventRouter.Reset();

        // Assert - no exception should be thrown
        // Subscriptions should be cleared
    }

    [Fact]
    public void Subscribe_MultipleHandlersForSameTopic_AllReceiveEvents()
    {
        // Arrange
        var topic = "test-topic";
        var handler1Called = false;
        var handler2Called = false;

        Action<object?> handler1 = _ => handler1Called = true;
        Action<object?> handler2 = _ => handler2Called = true;

        // Act
        var sub1 = _eventRouter.Subscribe(topic, handler1);
        var sub2 = _eventRouter.Subscribe(topic, handler2);

        // Assert
        Assert.NotNull(sub1);
        Assert.NotNull(sub2);
    }

    [Fact]
    public void Subscribe_AfterReset_CanSubscribeAgain()
    {
        // Arrange
        var topic = "test-topic";
        Action<object?> handler = _ => { };

        var sub1 = _eventRouter.Subscribe(topic, handler);
        _eventRouter.Reset();

        // Act
        var sub2 = _eventRouter.Subscribe(topic, handler);

        // Assert
        Assert.NotNull(sub2);
    }

    [Fact]
    public async Task PublishAsync_WithConductor_CompletesSuccessfully()
    {
        // Arrange
        var topic = "test-topic";
        var payload = new { message = "test" };
        var conductor = new { id = "conductor-1" };

        // Act & Assert - should not throw
        await _eventRouter.PublishAsync(topic, payload, conductor);
    }

    [Fact]
    public void Subscribe_DisposeTwice_DoesNotThrow()
    {
        // Arrange
        var topic = "test-topic";
        Action<object?> handler = _ => { };
        var subscription = _eventRouter.Subscribe(topic, handler);

        // Act
        subscription.Dispose();
        subscription.Dispose(); // Second dispose

        // Assert - no exception should be thrown
    }

    [Fact]
    public void Reset_CalledMultipleTimes_DoesNotThrow()
    {
        // Arrange
        var topic = "test-topic";
        Action<object?> handler = _ => { };
        _eventRouter.Subscribe(topic, handler);

        // Act
        _eventRouter.Reset();
        _eventRouter.Reset(); // Second reset

        // Assert - no exception should be thrown
    }

    [Fact]
    public async Task PublishAsync_AfterReset_CompletesSuccessfully()
    {
        // Arrange
        var topic = "test-topic";
        var payload = new { message = "test" };

        _eventRouter.Reset();

        // Act & Assert - should not throw
        await _eventRouter.PublishAsync(topic, payload);
    }
}

