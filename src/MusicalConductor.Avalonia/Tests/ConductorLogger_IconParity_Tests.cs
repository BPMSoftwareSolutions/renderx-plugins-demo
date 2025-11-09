using Xunit;
using Microsoft.Extensions.Logging;
using System.Text;
using MusicalConductor.Avalonia.Logging;
using MusicalConductor.Core.Interfaces;
using System.Dynamic;

namespace MusicalConductor.Avalonia.Tests;

/// <summary>
/// Tests to verify Musical Conductor log icons match the web version.
/// These tests verify that the desktop Avalonia version uses the same icons
/// as the web version for sequence/movement/beat/handler/plugin logging.
/// 
/// Web version reference: packages/musical-conductor/modules/communication/sequences/monitoring/ConductorLogger.ts
/// </summary>
public class ConductorLogger_IconParity_Tests
{
    private readonly StringBuilder _logOutput;
    private readonly ILogger<ConductorLogger> _conductorLoggerInstance;
    private readonly ConductorLogger _conductorLogger;
    private readonly TestEventBus _eventBus;

    public ConductorLogger_IconParity_Tests()
    {
        _logOutput = new StringBuilder();
        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddProvider(new TestLoggerProvider(_logOutput));
            builder.SetMinimumLevel(LogLevel.Debug);
        });
        _conductorLoggerInstance = loggerFactory.CreateLogger<ConductorLogger>();
        _conductorLogger = new ConductorLogger(_conductorLoggerInstance, enabled: true);
        _eventBus = new TestEventBus();
        _conductorLogger.SubscribeToEvents(_eventBus);
    }

    [Fact]
    public void SequenceStarted_ShouldLog_WithMusicalScoreIcon()
    {
        // Arrange
        var expectedIcon = "🎼";
        var sequenceName = "test-sequence";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.sequenceName = sequenceName;

        // Act
        _eventBus.Publish("sequence-started", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(sequenceName, logContent);

        // Expected format from web version: "🎼 test-sequence"
        Assert.Contains($"{expectedIcon} {sequenceName}", logContent);
    }

    [Fact]
    public void MovementStarted_ShouldLog_WithMusicalNoteIcon()
    {
        // Arrange
        var expectedIcon = "🎵";
        var movementName = "test-movement";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.movementName = movementName;

        // Act
        _eventBus.Publish("movement-started", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(movementName, logContent);

        // Expected format from web version: "🎵 test-movement"
        Assert.Contains($"{expectedIcon} {movementName}", logContent);
    }

    [Fact]
    public void BeatStarted_ShouldLog_WithDrumIcon()
    {
        // Arrange
        var expectedIcon = "🥁";
        var beatNumber = 1;
        var eventName = "test.event";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.beat = beatNumber;
        data.@event = eventName;

        // Act
        _eventBus.Publish("beat-started", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(beatNumber.ToString(), logContent);
        Assert.Contains(eventName, logContent);

        // Expected format from web version: "🥁 1: test.event"
        Assert.Contains($"{expectedIcon} {beatNumber}: {eventName}", logContent);
    }

    [Fact]
    public void HandlerExecution_ShouldLog_WithWrenchIcon()
    {
        // Arrange
        var expectedIcon = "🔧";
        var pluginId = "TestPlugin";
        var handlerName = "testHandler";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = pluginId;
        data.handlerName = handlerName;

        // Act
        _eventBus.Publish("plugin:handler:start", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(pluginId, logContent);
        Assert.Contains(handlerName, logContent);

        // Expected format from web version: "🔧 TestPlugin.testHandler"
        Assert.Contains($"{expectedIcon} {pluginId}.{handlerName}", logContent);
    }

    [Fact]
    public void PluginLogMessage_ShouldLog_WithPuzzlePieceIcon()
    {
        // Arrange
        var expectedIcon = "🧩";
        var pluginId = "TestPlugin";
        var handlerName = "testHandler";
        var message = "Test log message";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = pluginId;
        data.handlerName = handlerName;
        data.level = "log";
        data.message = message;

        // Act
        _eventBus.Publish("musical-conductor:log", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(pluginId, logContent);
        Assert.Contains(message, logContent);

        // Expected format from web version: "🧩 TestPlugin.testHandler"
        Assert.Contains($"{expectedIcon} {pluginId}.{handlerName}", logContent);
    }

    [Fact]
    public void StageCrewOperation_ShouldLog_WithTheaterMaskIcon()
    {
        // Arrange
        var expectedIcon = "🎭";
        var pluginId = "TestPlugin";
        var correlationId = "test-correlation-123";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = pluginId;
        data.correlationId = correlationId;
        data.operations = new[] { new { type = "publish", topic = "test.topic" } };

        // Act
        _eventBus.Publish("stage:cue", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(pluginId, logContent);
        Assert.Contains(correlationId, logContent);

        // Expected format from web version: "🎭 Stage Crew: TestPlugin (test-correlation-123)"
        Assert.Contains($"{expectedIcon} Stage Crew: {pluginId}", logContent);
        Assert.Contains($"({correlationId})", logContent);
    }

    [Fact]
    public void ConsoleLog_ShouldUse_MusicalScoreIcon_NotGenericIcon()
    {
        // Arrange
        var expectedIcon = "🎼";
        var message = "Test console log";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = null; // No plugin ID means it should use 🎼
        data.level = "log";
        data.message = message;

        // Act
        _eventBus.Publish("musical-conductor:log", data);

        // Assert
        var logContent = _logOutput.ToString();

        // Web version uses 🎼 for general conductor logs
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(message, logContent);
    }

    [Fact]
    public void ConsoleWarn_ShouldUse_WarningIcon()
    {
        // Arrange
        var expectedIcon = "⚠️";
        var message = "Test warning";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = null;
        data.level = "warn";
        data.message = message;

        // Act
        _eventBus.Publish("musical-conductor:log", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(message, logContent);
    }

    [Fact]
    public void ConsoleError_ShouldUse_ErrorIcon()
    {
        // Arrange
        var expectedIcon = "❌";
        var message = "Test error";
        dynamic data = new ExpandoObject();
        data.requestId = "test-request-1";
        data.pluginId = null;
        data.level = "error";
        data.message = message;

        // Act
        _eventBus.Publish("musical-conductor:log", data);

        // Assert
        var logContent = _logOutput.ToString();
        Assert.Contains(expectedIcon, logContent);
        Assert.Contains(message, logContent);
    }

    [Fact]
    public void LogMessages_ShouldHave_ProperIndentation()
    {
        // Arrange
        var sequenceName = "test-sequence";
        var movementName = "test-movement";
        var beatNumber = 1;
        var eventName = "test.event";
        var requestId = "test-request-1";

        // Act - Execute a full sequence with nested movement and beat
        dynamic seqData = new ExpandoObject();
        seqData.requestId = requestId;
        seqData.sequenceName = sequenceName;
        _eventBus.Publish("sequence-started", seqData);

        dynamic movData = new ExpandoObject();
        movData.requestId = requestId;
        movData.movementName = movementName;
        _eventBus.Publish("movement-started", movData);

        dynamic beatData = new ExpandoObject();
        beatData.requestId = requestId;
        beatData.beat = beatNumber;
        beatData.@event = eventName;
        _eventBus.Publish("beat-started", beatData);

        // Assert
        var logContent = _logOutput.ToString();
        var lines = logContent.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries);

        // Web version uses 2-space indentation per nesting level
        // Sequence should have no indent
        Assert.Contains(lines, line => line.Contains("🎼") && line.Contains(sequenceName));

        // Movement should have 2-space indent
        Assert.Contains(lines, line => line.Contains("  🎵") && line.Contains(movementName));

        // Beat should have 4-space indent
        Assert.Contains(lines, line => line.Contains("    🥁") && line.Contains($"{beatNumber}: {eventName}"));
    }
}

/// <summary>
/// Test logger provider that captures log output to a StringBuilder
/// </summary>
internal class TestLoggerProvider : ILoggerProvider
{
    private readonly StringBuilder _output;

    public TestLoggerProvider(StringBuilder output)
    {
        _output = output;
    }

    public Microsoft.Extensions.Logging.ILogger CreateLogger(string categoryName)
    {
        return new TestLogger(_output);
    }

    public void Dispose() { }
}

/// <summary>
/// Test EventBus implementation for testing
/// </summary>
internal class TestEventBus : IEventBus
{
    private readonly Dictionary<string, List<Delegate>> _subscribers = new();

    public ISubscription Subscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (!_subscribers.ContainsKey(eventName))
        {
            _subscribers[eventName] = new List<Delegate>();
        }
        _subscribers[eventName].Add(callback);
        return new TestSubscription(eventName, callback, () =>
        {
            if (_subscribers.ContainsKey(eventName))
            {
                _subscribers[eventName].Remove(callback);
            }
        });
    }

    public void Publish<T>(string eventName, T data)
    {
        if (_subscribers.ContainsKey(eventName))
        {
            foreach (var callback in _subscribers[eventName].ToList())
            {
                // Invoke the callback dynamically to handle type variance
                callback.DynamicInvoke(data);
            }
        }
    }

    public void Unsubscribe<T>(string eventName, EventCallback<T> callback)
    {
        if (_subscribers.ContainsKey(eventName))
        {
            _subscribers[eventName].Remove(callback);
        }
    }

    public Task Emit<T>(string eventName, T data)
    {
        Publish(eventName, data);
        return Task.CompletedTask;
    }

    public Task EmitAsync<T>(string eventName, T data)
    {
        return Emit(eventName, data);
    }

    public int GetSubscriberCount(string eventName)
    {
        return _subscribers.ContainsKey(eventName) ? _subscribers[eventName].Count : 0;
    }

    public IEnumerable<string> GetSubscribedEvents()
    {
        return _subscribers.Keys;
    }
}

/// <summary>
/// Test subscription implementation
/// </summary>
internal class TestSubscription : ISubscription
{
    private readonly Action _unsubscribe;

    public TestSubscription(string eventName, Delegate callback, Action unsubscribe)
    {
        EventName = eventName;
        Callback = callback;
        _unsubscribe = unsubscribe;
    }

    public string EventName { get; }
    public Delegate Callback { get; }

    public void Unsubscribe()
    {
        _unsubscribe();
    }

    public void Dispose()
    {
        Unsubscribe();
    }
}

/// <summary>
/// Test logger that captures log output to a StringBuilder
/// </summary>
internal class TestLogger : Microsoft.Extensions.Logging.ILogger
{
    private readonly StringBuilder _output;

    public TestLogger(StringBuilder output)
    {
        _output = output;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
    {
        var message = formatter(state, exception);
        _output.AppendLine($"[{logLevel}] {message}");
    }
}

