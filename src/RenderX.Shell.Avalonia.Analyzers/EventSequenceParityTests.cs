using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using Xunit;

namespace RenderX.Shell.Avalonia.Analyzers;

/// <summary>
/// Tests to ensure desktop plugins have event/sequence orchestration parity with web version
/// </summary>
public class EventSequenceParityTests
{
    private const string PluginsPath = "../../../../../src";
    private const int MinimumPublishCalls = 15; // Minimum expected across all plugins
    private const int MinimumPlayCalls = 1; // Minimum expected across all plugins

    /// <summary>
    /// Test 1: Desktop plugins must have EventRouter.PublishAsync calls
    /// </summary>
    [Fact]
    public void DesktopPlugins_MustHaveEventRouterPublishCalls()
    {
        // Arrange
        var pluginDirs = new[]
        {
            "RenderX.Plugins.Canvas",
            "RenderX.Plugins.ControlPanel",
            "RenderX.Plugins.Library",
            "RenderX.Plugins.Header"
        };

        var publishPattern = new Regex(@"PublishAsync\s*\(", RegexOptions.Compiled);
        var totalPublishCalls = 0;
        var callsByPlugin = new Dictionary<string, int>();

        // Act
        foreach (var pluginDir in pluginDirs)
        {
            var pluginPath = Path.Combine(PluginsPath, pluginDir);
            if (!Directory.Exists(pluginPath))
            {
                throw new DirectoryNotFoundException($"Plugin directory not found: {pluginPath}");
            }

            var csFiles = Directory.GetFiles(pluginPath, "*.cs", SearchOption.AllDirectories);
            var pluginPublishCalls = 0;

            foreach (var file in csFiles)
            {
                var content = File.ReadAllText(file);
                var matches = publishPattern.Matches(content);
                pluginPublishCalls += matches.Count;
            }

            callsByPlugin[pluginDir] = pluginPublishCalls;
            totalPublishCalls += pluginPublishCalls;
        }

        // Assert
        Assert.True(totalPublishCalls >= MinimumPublishCalls,
            $"Expected at least {MinimumPublishCalls} PublishAsync calls across all plugins, but found {totalPublishCalls}. " +
            $"Breakdown: {string.Join(", ", callsByPlugin.Select(kvp => $"{kvp.Key}={kvp.Value}"))}");

        // Ensure each major plugin has at least some publish calls
        Assert.True(callsByPlugin["RenderX.Plugins.Canvas"] >= 5,
            $"Canvas plugin should have at least 5 PublishAsync calls, found {callsByPlugin["RenderX.Plugins.Canvas"]}");
        Assert.True(callsByPlugin["RenderX.Plugins.ControlPanel"] >= 3,
            $"ControlPanel plugin should have at least 3 PublishAsync calls, found {callsByPlugin["RenderX.Plugins.ControlPanel"]}");
        Assert.True(callsByPlugin["RenderX.Plugins.Library"] >= 2,
            $"Library plugin should have at least 2 PublishAsync calls, found {callsByPlugin["RenderX.Plugins.Library"]}");
    }

    /// <summary>
    /// Test 2: Desktop plugins must have Conductor.Play calls
    /// </summary>
    [Fact]
    public void DesktopPlugins_MustHaveConductorPlayCalls()
    {
        // Arrange
        var pluginDirs = new[]
        {
            "RenderX.Plugins.Canvas",
            "RenderX.Plugins.ControlPanel",
            "RenderX.Plugins.Library",
            "RenderX.Plugins.Header"
        };

        var playPattern = new Regex(@"\.Play\s*\(", RegexOptions.Compiled);
        var totalPlayCalls = 0;
        var callsByPlugin = new Dictionary<string, int>();

        // Act
        foreach (var pluginDir in pluginDirs)
        {
            var pluginPath = Path.Combine(PluginsPath, pluginDir);
            if (!Directory.Exists(pluginPath))
            {
                throw new DirectoryNotFoundException($"Plugin directory not found: {pluginPath}");
            }

            var csFiles = Directory.GetFiles(pluginPath, "*.cs", SearchOption.AllDirectories);
            var pluginPlayCalls = 0;

            foreach (var file in csFiles)
            {
                var content = File.ReadAllText(file);
                var matches = playPattern.Matches(content);
                pluginPlayCalls += matches.Count;
            }

            callsByPlugin[pluginDir] = pluginPlayCalls;
            totalPlayCalls += pluginPlayCalls;
        }

        // Assert
        Assert.True(totalPlayCalls >= MinimumPlayCalls,
            $"Expected at least {MinimumPlayCalls} Conductor.Play calls across all plugins, but found {totalPlayCalls}. " +
            $"Breakdown: {string.Join(", ", callsByPlugin.Select(kvp => $"{kvp.Key}={kvp.Value}"))}");
    }

    /// <summary>
    /// Test 3: Canvas plugin must publish selection events
    /// </summary>
    [Fact]
    public void CanvasPlugin_MustPublishSelectionEvents()
    {
        // Arrange
        var canvasPath = Path.Combine(PluginsPath, "RenderX.Plugins.Canvas");
        var requiredEvents = new[]
        {
            "canvas.component.selection.changed",
            "canvas.component.selections.cleared"
        };

        // Act
        var csFiles = Directory.GetFiles(canvasPath, "*.cs", SearchOption.AllDirectories);
        var foundEvents = new HashSet<string>();

        foreach (var file in csFiles)
        {
            var content = File.ReadAllText(file);
            foreach (var eventName in requiredEvents)
            {
                if (content.Contains($"\"{eventName}\""))
                {
                    foundEvents.Add(eventName);
                }
            }
        }

        // Assert
        foreach (var eventName in requiredEvents)
        {
            Assert.True(foundEvents.Contains(eventName),
                $"Canvas plugin must publish '{eventName}' event");
        }
    }

    /// <summary>
    /// Test 4: ControlPanel plugin must publish update events
    /// </summary>
    [Fact]
    public void ControlPanelPlugin_MustPublishUpdateEvents()
    {
        // Arrange
        var controlPanelPath = Path.Combine(PluginsPath, "RenderX.Plugins.ControlPanel");
        var requiredEvents = new[]
        {
            "control.panel.update.requested",
            "control.panel.css.classes.applied"
        };

        // Act
        var csFiles = Directory.GetFiles(controlPanelPath, "*.cs", SearchOption.AllDirectories);
        var foundEvents = new HashSet<string>();

        foreach (var file in csFiles)
        {
            var content = File.ReadAllText(file);
            foreach (var eventName in requiredEvents)
            {
                if (content.Contains($"\"{eventName}\""))
                {
                    foundEvents.Add(eventName);
                }
            }
        }

        // Assert
        foreach (var eventName in requiredEvents)
        {
            Assert.True(foundEvents.Contains(eventName),
                $"ControlPanel plugin must publish '{eventName}' event");
        }
    }

    /// <summary>
    /// Test 5: Library plugin must publish drag events
    /// </summary>
    [Fact]
    public void LibraryPlugin_MustPublishDragEvents()
    {
        // Arrange
        var libraryPath = Path.Combine(PluginsPath, "RenderX.Plugins.Library");
        var requiredEvents = new[]
        {
            "library.component.drag.started",
            "library.component.add.requested"
        };

        // Act
        var csFiles = Directory.GetFiles(libraryPath, "*.cs", SearchOption.AllDirectories);
        var foundEvents = new HashSet<string>();

        foreach (var file in csFiles)
        {
            var content = File.ReadAllText(file);
            foreach (var eventName in requiredEvents)
            {
                if (content.Contains($"\"{eventName}\""))
                {
                    foundEvents.Add(eventName);
                }
            }
        }

        // Assert
        foreach (var eventName in requiredEvents)
        {
            Assert.True(foundEvents.Contains(eventName),
                $"Library plugin must publish '{eventName}' event");
        }
    }

    /// <summary>
    /// Test 6: Verify event publishing uses correct logging pattern
    /// </summary>
    [Fact]
    public void EventPublishing_MustUseCorrectLoggingPattern()
    {
        // Arrange
        var pluginDirs = new[]
        {
            "RenderX.Plugins.Canvas",
            "RenderX.Plugins.ControlPanel",
            "RenderX.Plugins.Library"
        };

        var loggingPattern = new Regex(@"_logger\.Log(Information|Debug)\(\""📡 EventRouter\.publish\(", RegexOptions.Compiled);
        var violations = new List<string>();

        // Act
        foreach (var pluginDir in pluginDirs)
        {
            var pluginPath = Path.Combine(PluginsPath, pluginDir);
            var csFiles = Directory.GetFiles(pluginPath, "*.cs", SearchOption.AllDirectories);

            foreach (var file in csFiles)
            {
                var content = File.ReadAllText(file);
                var publishMatches = Regex.Matches(content, @"PublishAsync\s*\(");
                var loggingMatches = loggingPattern.Matches(content);

                // We expect at least some logging for publish calls
                if (publishMatches.Count > 0 && loggingMatches.Count == 0)
                {
                    violations.Add($"{pluginDir}: {Path.GetFileName(file)} has {publishMatches.Count} PublishAsync calls but no event logging");
                }
            }
        }

        // Assert
        Assert.Empty(violations);
    }
}

