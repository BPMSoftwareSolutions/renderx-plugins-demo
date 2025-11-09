using Xunit;
using Microsoft.Extensions.Logging;
using System.Text;

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
    private readonly ILogger<ConductorLogger_IconParity_Tests> _logger;

    public ConductorLogger_IconParity_Tests()
    {
        _logOutput = new StringBuilder();
        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddProvider(new TestLoggerProvider(_logOutput));
            builder.SetMinimumLevel(LogLevel.Debug);
        });
        _logger = loggerFactory.CreateLogger<ConductorLogger_IconParity_Tests>();
    }

    [Fact]
    public void SequenceStarted_ShouldLog_WithMusicalScoreIcon()
    {
        // Arrange
        var expectedIcon = "🎼";
        var sequenceName = "test-sequence";

        // Act
        // TODO: Trigger sequence started event and capture log output
        // This should come from the ConductorLogger when SEQUENCE_STARTED event is published

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

        // Act
        // TODO: Trigger movement started event and capture log output
        // This should come from the ConductorLogger when MOVEMENT_STARTED event is published

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

        // Act
        // TODO: Trigger beat started event and capture log output
        // This should come from the ConductorLogger when BEAT_STARTED event is published

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

        // Act
        // TODO: Trigger handler execution and capture log output
        // This should come from the ConductorLogger when plugin:handler:start event is published

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

        // Act
        // TODO: Trigger plugin log message and capture log output
        // This should come from the ConductorLogger when musical-conductor:log event is published

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

        // Act
        // TODO: Trigger stage crew operation and capture log output
        // This should come from the ConductorLogger when stage:cue event is published

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
        var notExpectedIcon = "ℹ️"; // Current desktop implementation uses this
        var message = "Test console log";

        // Act
        // TODO: Trigger console.log from JavaScript and capture log output
        // This should come from JintEngineHost console stub

        // Assert
        var logContent = _logOutput.ToString();
        
        // Web version uses 🎼 for general conductor logs
        Assert.Contains(expectedIcon, logContent);
        
        // Desktop version currently uses ℹ️ which is incorrect
        // This test will fail until we fix the icon
        Assert.DoesNotContain(notExpectedIcon, logContent);
    }

    [Fact]
    public void ConsoleWarn_ShouldUse_WarningIcon()
    {
        // Arrange
        var expectedIcon = "⚠️";
        var message = "Test warning";

        // Act
        // TODO: Trigger console.warn from JavaScript and capture log output

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

        // Act
        // TODO: Trigger console.error from JavaScript and capture log output

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

        // Act
        // TODO: Execute a full sequence with nested movement and beat
        // Capture all log output

        // Assert
        var logContent = _logOutput.ToString();
        var lines = logContent.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries);
        
        // Web version uses 2-space indentation per nesting level
        // Sequence should have no indent
        Assert.Contains(lines, line => line.StartsWith("🎼") && line.Contains(sequenceName));
        
        // Movement should have 2-space indent
        Assert.Contains(lines, line => line.StartsWith("  🎵") && line.Contains(movementName));
        
        // Beat should have 4-space indent
        Assert.Contains(lines, line => line.StartsWith("    🥁") && line.Contains($"{beatNumber}: {eventName}"));
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

    public ILogger CreateLogger(string categoryName)
    {
        return new TestLogger(_output);
    }

    public void Dispose() { }
}

/// <summary>
/// Test logger that captures log output to a StringBuilder
/// </summary>
internal class TestLogger : ILogger
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

