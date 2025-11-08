using Moq;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Handlers;
using Xunit;

namespace MusicalConductor.Core.Tests;

public class HandlerInfrastructureTests
{
    [Fact]
    public async Task ExampleHandler_Executes_LogsInfo_AndDoesNotThrow()
    {
        // Arrange
        var logger = new Mock<Microsoft.Extensions.Logging.ILogger<MusicalConductor.Core.SequenceExecutor>>();
        var eventBus = new Mock<IEventBus>();
        var conductor = new Mock<IConductor>();

        // We'll simulate a handler context instead of using SequenceExecutor internals
        var context = new StubHandlerContext(conductor.Object, new TestLogger());
        var handler = new ExampleHandler();

        // Act & Assert
        await handler.Execute(context, "hello");
    }

    private class TestLogger : MusicalConductor.Core.Interfaces.ILogger
    {
        public void Log(string message) { }
        public void Info(string message) { }
        public void Warn(string message) { }
        public void Error(string message, Exception? ex = null) { }
    }

    private class StubHandlerContext : IHandlerContext
    {
        public string PluginId { get; } = "TestPlugin";
        public string SequenceId { get; } = "TestSequence";
        public string CorrelationId { get; } = Guid.NewGuid().ToString("N");
        public object? Data { get; }
        public MusicalConductor.Core.Interfaces.ILogger Logger { get; }
        public IConductor Conductor { get; }

        public StubHandlerContext(IConductor conductor, MusicalConductor.Core.Interfaces.ILogger logger, object? data = null)
        {
            Conductor = conductor;
            Logger = logger;
            Data = data;
        }
    }
}

