using Xunit;
using Microsoft.Extensions.Logging;
using Moq;
using MusicalConductor.Core;

namespace MusicalConductor.Core.Tests;

public class EventBus_BasicTests
{
    private readonly EventBus _bus;

    public EventBus_BasicTests()
    {
        var logger = new Mock<ILogger<EventBus>>();
        _bus = new EventBus(logger.Object);
    }

    [Fact]
    public async Task Subscribe_ThenEmit_InvokesHandler()
    {
        // Arrange
        bool invoked = false;
        _bus.Subscribe<string>("evt:test", s => invoked = s == "ping");

        // Act
        await _bus.Emit("evt:test", "ping");

        // Assert
        Assert.True(invoked);
    }
}

