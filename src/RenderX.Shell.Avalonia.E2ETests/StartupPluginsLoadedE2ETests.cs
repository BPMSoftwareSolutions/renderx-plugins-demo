using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using FlaUI.Core;
using FlaUI.UIA3;
using Microsoft.Extensions.Logging;

namespace RenderX.Shell.Avalonia.E2ETests;

/// <summary>
/// E2E test equivalent to cypress/e2e/00-startup-plugins-loaded.cy.ts
/// Verifies all plugins listed in plugin-manifest.json are loaded successfully at startup
/// </summary>
public class StartupPluginsLoadedE2ETests : IAsyncLifetime
{
    private Application? _app;
    private UIA3Automation? _automation;
    private readonly List<string> _capturedLogs = new();

    public async Task InitializeAsync()
    {
        var exe = TestHelpers.ResolveAppExePath();
        _app = Application.Launch(exe);
        _automation = new UIA3Automation();

        // Wait for main window
        var main = _app.GetMainWindow(_automation, TimeSpan.FromSeconds(60));
        Assert.NotNull(main);

        await TestHelpers.WaitForHealthAsync(TimeSpan.FromSeconds(60));
    }

    public Task DisposeAsync()
    {
        try { _app?.Close(); } catch { /* ignore */ }
        _automation?.Dispose();
        return Task.CompletedTask;
    }

    [Fact]
    public async Task VerifiesAllManifestPluginIdsArePresentInStartupLogs()
    {
        // Fetch the plugin manifest to know expected plugin IDs
        var manifest = await TestHelpers.GetAsync<PluginManifest>("/plugins/plugin-manifest.json");
        Assert.NotNull(manifest);
        Assert.NotNull(manifest!.Plugins);
        Assert.True(manifest.Plugins.Length > 0, "manifest plugin count should be greater than 0");

        var pluginIds = manifest.Plugins
            .Select(p => p.Id)
            .Where(id => !string.IsNullOrEmpty(id))
            .ToArray();

        Assert.True(pluginIds.Length > 0, "should have at least one plugin ID");

        // Fetch startup logs from telemetry API
        var logs = await TestHelpers.GetAsync<TelemetryEventDto[]>("/api/telemetry/events?limit=1000");
        Assert.NotNull(logs);
        Assert.True(logs!.Length > 0, "should have captured startup logs");

        // Check for plugin loading evidence in logs
        var missingPlugins = new List<string>();
        foreach (var pluginId in pluginIds)
        {
            if (!PluginLoadedInLogs(pluginId, logs))
            {
                missingPlugins.Add(pluginId);
            }
        }

        // Assert no plugins are missing
        Assert.Empty(missingPlugins);

        // Verify no mount/resolve errors occurred during startup
        var mountErrors = logs.Any(log => 
            log.Message?.Contains("Failed to mount", StringComparison.OrdinalIgnoreCase) ?? false);
        var resolveErrors = logs.Any(log => 
            log.Message?.Contains("Failed to resolve", StringComparison.OrdinalIgnoreCase) ?? false);

        Assert.False(mountErrors, "no failed mounts detected in startup logs");
        Assert.False(resolveErrors, "no unresolved module specifiers detected in startup logs");

        // Write artifacts for debugging
        await TestHelpers.WriteArtifactAsync($"startup-plugins-{DateTime.Now:yyyyMMddHHmmss}.json",
            new { logs, manifestIds = pluginIds, captureCount = logs.Length });
    }

    private static bool PluginLoadedInLogs(string pluginId, TelemetryEventDto[] logs)
    {
        var haystack = string.Join("\n", logs.Select(l => l.Message ?? ""));

        // Look for registration evidence
        if (haystack.Contains($"Registered plugin runtime: {pluginId}")) return true;

        // Look for catalog loading evidence
        if (haystack.Contains("Loading catalog directory") && haystack.Contains($"for plugin {pluginId}")) return true;

        // Look for sequence mounting evidence
        if (haystack.Contains("Mounted sequence from catalog:") && haystack.Contains($"plugin: {pluginId}")) return true;

        // Look for plugin initialization evidence
        if (haystack.Contains($"Initialized control") && haystack.Contains(pluginId)) return true;

        return false;
    }

    public record PluginManifest
    {
        public string Version { get; init; } = string.Empty;
        public PluginEntry[] Plugins { get; init; } = Array.Empty<PluginEntry>();
    }

    public record PluginEntry
    {
        public string Id { get; init; } = string.Empty;
        public string DisplayName { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
    }

    public record TelemetryEventDto
    {
        public string EventType { get; init; } = string.Empty;
        public string? Level { get; init; }
        public string? Message { get; init; }
        public object? Data { get; init; }
        public string? Timestamp { get; init; }
        public string? Source { get; init; }
        public string? CorrelationId { get; init; }
    }
}

