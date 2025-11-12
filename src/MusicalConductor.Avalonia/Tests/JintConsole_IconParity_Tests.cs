using System.Text;
using Microsoft.Extensions.Logging;
using MusicalConductor.Avalonia.Engine;
using Xunit;

namespace MusicalConductor.Avalonia.Tests;

public class JintConsole_IconParity_Tests
{
    [Fact]
    public void ConsoleLog_WithStyleToken_ShouldPreserve_EmojiIcon()
    {
        // Arrange: capture logs
        var output = new StringBuilder();
        var loggerFactory = LoggerFactory.Create(builder =>
        {
            builder.AddProvider(new TestLoggerProvider(output));
            builder.SetMinimumLevel(LogLevel.Debug);
        });
        var logger = loggerFactory.CreateLogger<JintEngineHost>();

        // Act: spin up host and emit a styled console log from JS
        using var host = new JintEngineHost(logger);
        host.Eval("console.log('%c✅ Completed operation','color: green')");

        // Assert: emoji preserved, no fallback [JS] prefix applied
        var logs = output.ToString();
        Assert.Contains("✅ Completed operation", logs);
        Assert.DoesNotContain("[JS] ✅ Completed operation", logs);
    }
}

