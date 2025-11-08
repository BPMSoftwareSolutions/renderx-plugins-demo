using Xunit;
using Moq;
using Microsoft.Extensions.Logging;
using MusicalConductor.Core;
using MusicalConductor.Core.Interfaces;
using MusicalConductor.Core.Models;

namespace MusicalConductor.Core.Tests;

public class Conductor_BasicTests
{
    [Fact]
    public void Play_WithMissingSequence_IncrementsFailed()
    {
        var mockBus = new Mock<IEventBus>();
        mockBus.Setup(b => b.Emit(It.IsAny<string>(), It.IsAny<object>()))
               .Returns(Task.CompletedTask);

        var mockRegistry = new Mock<ISequenceRegistry>();
        mockRegistry.Setup(r => r.Get(It.IsAny<string>())).Returns((ISequence?)null);

        var mockPlugins = new Mock<IPluginManager>();
        var mockQueue = new Mock<IExecutionQueue>();
        var mockExecutor = new Mock<SequenceExecutor>(new Mock<IEventBus>().Object, mockPlugins.Object, new Mock<ILogger<SequenceExecutor>>().Object);
        var mockLogger = new Mock<ILogger<Conductor>>();

        var conductor = new Conductor(mockBus.Object, mockRegistry.Object, mockPlugins.Object, mockQueue.Object, mockExecutor.Object, mockLogger.Object);

        var id = conductor.Play("plugin-1", "missing-seq");
        Assert.False(string.IsNullOrEmpty(id));

        var stats = conductor.GetStatistics();
        Assert.Equal(1, stats.FailedExecutions);
        Assert.Equal(0, stats.TotalExecutions);
    }

    [Fact]
    public async Task Play_WithSimpleSequence_EmitsCompletedAndUpdatesStats()
    {
        // Arrange
        var completedTcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var mockBus = new Mock<IEventBus>();
        mockBus.Setup(b => b.Emit(It.IsAny<string>(), It.IsAny<object>()))
               .Returns<string, object>((name, data) => {
                   if (name == "sequence:completed") completedTcs.TrySetResult(true);
                   return Task.CompletedTask;
               });

        var seq = new Sequence { Id = "seq-1", Name = "Test" };
        var movement = new Movement();
        movement.AddBeat(new Beat { Id = "b1", Event = "evt" });
        seq.AddMovement(movement);

        var mockRegistry = new Mock<ISequenceRegistry>();
        mockRegistry.Setup(r => r.Get("seq-1")).Returns(seq);
        mockRegistry.Setup(r => r.GetAll()).Returns(new[] { seq });

        var mockPlugins = new Mock<IPluginManager>();
        mockPlugins.Setup(p => p.GetAll()).Returns(Array.Empty<IPlugin>());

        var mockQueue = new Mock<IExecutionQueue>();
        var mockExecutor = new Mock<SequenceExecutor>(mockBus.Object, mockPlugins.Object, new Mock<ILogger<SequenceExecutor>>().Object);
        var mockLogger = new Mock<ILogger<Conductor>>();
        var conductor = new Conductor(mockBus.Object, mockRegistry.Object, mockPlugins.Object, mockQueue.Object, mockExecutor.Object, mockLogger.Object);

        // Act
        var id = conductor.Play("plugin-1", "seq-1");
        Assert.False(string.IsNullOrEmpty(id));

        // Wait for completion event
        var completed = await Task.WhenAny(completedTcs.Task, Task.Delay(TimeSpan.FromSeconds(2))) == completedTcs.Task;
        Assert.True(completed);

        var stats = conductor.GetStatistics();
        Assert.Equal(1, stats.TotalExecutions);
        Assert.Equal(1, stats.SuccessfulExecutions);
        Assert.Equal(0, stats.ActiveSequences);
        Assert.Equal(1, stats.TotalBeats);
    }
}

