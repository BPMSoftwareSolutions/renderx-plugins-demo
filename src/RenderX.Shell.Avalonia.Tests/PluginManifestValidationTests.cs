using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using Xunit;

namespace RenderX.Shell.Avalonia.Tests;

/// <summary>
/// Unit tests for plugin manifest validation.
/// Ensures all plugin exports use fully-qualified type names (namespace.class).
/// This test catches architectural violations where plugins don't use proper namespacing.
/// </summary>
public class PluginManifestValidationTests
{
    private readonly string _manifestPath;

    public PluginManifestValidationTests()
    {
        // Resolve manifest path relative to project root
        var projectRoot = FindProjectRoot();
        _manifestPath = Path.Combine(projectRoot, "src", "RenderX.Shell.Avalonia", "plugins", "plugin-manifest.json");
    }

    [Fact]
    public void PluginManifest_Exists()
    {
        Assert.True(File.Exists(_manifestPath), $"Plugin manifest not found at {_manifestPath}");
    }

    [Fact]
    public void PluginManifest_IsValidJson()
    {
        var json = File.ReadAllText(_manifestPath);
        var ex = Record.Exception(() => JsonSerializer.Deserialize<PluginManifestDto>(json));
        Assert.Null(ex);
    }

    [Fact]
    public void PluginManifest_AllExportsAreFullyQualified()
    {
        var json = File.ReadAllText(_manifestPath);
        var manifest = JsonSerializer.Deserialize<PluginManifestDto>(json);

        Assert.NotNull(manifest);
        Assert.NotNull(manifest!.Plugins);
        Assert.NotEmpty(manifest.Plugins);

        var invalidExports = new List<string>();

        foreach (var plugin in manifest.Plugins)
        {
            // Check UI export if present
            if (plugin.Ui != null && !string.IsNullOrWhiteSpace(plugin.Ui.Export))
            {
                var uiExport = plugin.Ui.Export;
                if (!uiExport.Contains("."))
                {
                    invalidExports.Add($"Plugin '{plugin.Id}' UI export '{uiExport}' is not fully-qualified (missing namespace)");
                }
            }

            // Check runtime export if present
            if (plugin.Runtime != null && !string.IsNullOrWhiteSpace(plugin.Runtime.Export))
            {
                var runtimeExport = plugin.Runtime.Export;
                // Runtime exports should also be fully-qualified
                if (!runtimeExport.Contains("."))
                {
                    invalidExports.Add($"Plugin '{plugin.Id}' runtime export '{runtimeExport}' is not fully-qualified (missing namespace)");
                }
            }
        }

        Assert.Empty(invalidExports);
    }

    [Fact]
    public void PluginManifest_HasRequiredPlugins()
    {
        var json = File.ReadAllText(_manifestPath);
        var manifest = JsonSerializer.Deserialize<PluginManifestDto>(json);

        Assert.NotNull(manifest);
        Assert.NotNull(manifest!.Plugins);

        var requiredPlugins = new[]
        {
            "CanvasPlugin",
            "ControlPanelPlugin",
            "LibraryPlugin",
            "HeaderControlsPlugin",
            "HeaderThemePlugin",
            "HeaderTitlePlugin"
        };

        foreach (var required in requiredPlugins)
        {
            var found = manifest.Plugins.Any(p => p.Id == required);
            Assert.True(found, $"Required plugin '{required}' not found in manifest");
        }
    }

    private static string FindProjectRoot()
    {
        // Start from the test assembly location and walk up to find the repository root
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        int maxDepth = 15;
        int depth = 0;

        while (current != null && depth < maxDepth)
        {
            // Look for .git directory or renderx-plugins-demo directory (repo root markers)
            if (Directory.Exists(Path.Combine(current.FullName, ".git")) ||
                current.Name == "renderx-plugins-demo")
            {
                return current.FullName;
            }

            current = current.Parent;
            depth++;
        }

        throw new InvalidOperationException($"Could not find repository root. Started from: {AppContext.BaseDirectory}");
    }

    public class PluginManifestDto
    {
        [JsonPropertyName("version")]
        public string Version { get; set; } = string.Empty;

        [JsonPropertyName("plugins")]
        public PluginEntryDto[] Plugins { get; set; } = Array.Empty<PluginEntryDto>();
    }

    public class PluginEntryDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("ui")]
        public PluginExportDto? Ui { get; set; }

        [JsonPropertyName("runtime")]
        public PluginExportDto? Runtime { get; set; }
    }

    public class PluginExportDto
    {
        [JsonPropertyName("export")]
        public string Export { get; set; } = string.Empty;

        [JsonPropertyName("slot")]
        public string? Slot { get; set; }

        [JsonPropertyName("module")]
        public string? Module { get; set; }
    }
}

