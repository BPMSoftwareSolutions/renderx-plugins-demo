using Microsoft.Extensions.Logging;
using Moq;
using MusicalConductor.Core;
using MusicalConductor.Core.Interfaces;
using Xunit;

namespace MusicalConductor.Core.Tests;

public class ExecutionQueueTests
{
    private readonly Mock<ILogger<ExecutionQueue>> _mockLogger;
    private readonly ExecutionQueue _queue;

    public ExecutionQueueTests()
    {
        _mockLogger = new Mock<ILogger<ExecutionQueue>>();
        _queue = new ExecutionQueue(_mockLogger.Object);
    }

    [Fact]
    public void Enqueue_AddsItemToQueue()
    {
        // Arrange
        var item = new ExecutionItem
        {
            Id = "test-1",
            PluginId = "plugin-1",
            SequenceId = "seq-1"
        };

        // Act
        _queue.Enqueue(item);

        // Assert
        Assert.Equal(1, _queue.GetQueueDepth());
    }

    [Fact]
    public void Enqueue_WithNullItem_ThrowsArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => _queue.Enqueue(null!));
    }

    [Fact]
    public void Dequeue_ReturnsItemInPriorityOrder()
    {
        // Arrange
        var lowPriorityItem = new ExecutionItem
        {
            Id = "low",
            PluginId = "plugin-1",
            SequenceId = "seq-1",
            Priority = SequencePriority.LOW
        };

        var highPriorityItem = new ExecutionItem
        {
            Id = "high",
            PluginId = "plugin-1",
            SequenceId = "seq-1",
            Priority = SequencePriority.HIGH
        };

        _queue.Enqueue(lowPriorityItem);
        _queue.Enqueue(highPriorityItem);

        // Act
        var first = _queue.Dequeue();
        var second = _queue.Dequeue();

        // Assert
        Assert.NotNull(first);
        Assert.Equal("high", first.Id);
        Assert.NotNull(second);
        Assert.Equal("low", second.Id);
    }

    [Fact]
    public void Dequeue_EmptyQueue_ReturnsNull()
    {
        // Act
        var item = _queue.Dequeue();

        // Assert
        Assert.Null(item);
    }

    [Fact]
    public void Dequeue_SetsStartedAtTimestamp()
    {
        // Arrange
        var item = new ExecutionItem
        {
            Id = "test-1",
            PluginId = "plugin-1",
            SequenceId = "seq-1"
        };
        _queue.Enqueue(item);

        // Act
        var dequeuedItem = _queue.Dequeue();

        // Assert
        Assert.NotNull(dequeuedItem);
        Assert.NotNull(dequeuedItem.StartedAt);
        Assert.True(dequeuedItem.StartedAt > dequeuedItem.EnqueuedAt);
    }

    [Fact]
    public void GetStatus_ReturnsCorrectQueueDepth()
    {
        // Arrange
        for (int i = 0; i < 5; i++)
        {
            _queue.Enqueue(new ExecutionItem
            {
                Id = $"item-{i}",
                PluginId = "plugin-1",
                SequenceId = "seq-1"
            });
        }

        // Act
        var status = _queue.GetStatus();

        // Assert
        Assert.Equal(5, status.QueueDepth);
    }

    [Fact]
    public void RecordSuccess_UpdatesStatistics()
    {
        // Arrange
        var item = new ExecutionItem
        {
            Id = "test-1",
            PluginId = "plugin-1",
            SequenceId = "seq-1"
        };
        _queue.Enqueue(item);
        var dequeuedItem = _queue.Dequeue();

        // Act
        _queue.RecordSuccess(dequeuedItem!, 100.5);
        var status = _queue.GetStatus();

        // Assert
        Assert.Equal(1, status.TotalProcessed);
        Assert.Equal(0, status.TotalFailed);
        Assert.Equal(100.5, status.AverageProcessingTimeMs);
    }

    [Fact]
    public void RecordFailure_UpdatesFailureCount()
    {
        // Arrange
        var item = new ExecutionItem
        {
            Id = "test-1",
            PluginId = "plugin-1",
            SequenceId = "seq-1"
        };
        _queue.Enqueue(item);
        var dequeuedItem = _queue.Dequeue();

        // Act
        _queue.RecordFailure(dequeuedItem!, "Test error");
        var status = _queue.GetStatus();

        // Assert
        Assert.Equal(1, status.TotalFailed);
        Assert.Equal(0, status.TotalProcessed);
    }

    [Fact]
    public void Clear_RemovesAllItems()
    {
        // Arrange
        for (int i = 0; i < 5; i++)
        {
            _queue.Enqueue(new ExecutionItem
            {
                Id = $"item-{i}",
                PluginId = "plugin-1",
                SequenceId = "seq-1"
            });
        }

        // Act
        _queue.Clear();

        // Assert
        Assert.Equal(0, _queue.GetQueueDepth());
    }

    [Fact]
    public void GetQueueDepth_ReturnsCorrectCount()
    {
        // Arrange
        var item1 = new ExecutionItem { Id = "1", PluginId = "p1", SequenceId = "s1" };
        var item2 = new ExecutionItem { Id = "2", PluginId = "p1", SequenceId = "s1" };

        // Act
        _queue.Enqueue(item1);
        var depth1 = _queue.GetQueueDepth();
        _queue.Enqueue(item2);
        var depth2 = _queue.GetQueueDepth();

        // Assert
        Assert.Equal(1, depth1);
        Assert.Equal(2, depth2);
    }

    [Fact]
    public void MultipleItems_MaintainsPriorityOrder()
    {
        // Arrange
        var items = new[]
        {
            new ExecutionItem { Id = "1", PluginId = "p", SequenceId = "s", Priority = SequencePriority.NORMAL },
            new ExecutionItem { Id = "2", PluginId = "p", SequenceId = "s", Priority = SequencePriority.HIGH },
            new ExecutionItem { Id = "3", PluginId = "p", SequenceId = "s", Priority = SequencePriority.LOW },
            new ExecutionItem { Id = "4", PluginId = "p", SequenceId = "s", Priority = SequencePriority.CHAINED }
        };

        foreach (var item in items)
        {
            _queue.Enqueue(item);
        }

        // Act
        var results = new List<string>();
        while (_queue.GetQueueDepth() > 0)
        {
            var item = _queue.Dequeue();
            if (item != null)
                results.Add(item.Id);
        }

        // Assert
        // Expected order: HIGH (2), NORMAL (1), CHAINED (4), LOW (3)
        Assert.Equal(new[] { "2", "1", "4", "3" }, results);
    }
}

